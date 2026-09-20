import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { coupleEmail, isCloudConfigured, supabase } from '../lib/supabase'
import type { Person } from '../types'

interface AuthValue {
  /** Se siamo dentro: in cloud significa sessione Supabase valida. */
  signedIn: boolean
  /** Chi dei due sta usando il telefono adesso (serve per voti e avatar). */
  me: Person | null
  /** Ancora in fase di controllo della sessione salvata. */
  loading: boolean
  signIn: (password: string) => Promise<void>
  signOut: () => Promise<void>
  setMe: (person: Person) => void
}

const AuthContext = createContext<AuthValue | null>(null)
const ME_KEY = 'noi-due:me'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(!isCloudConfigured)
  const [loading, setLoading] = useState(isCloudConfigured)
  const [me, setMeState] = useState<Person | null>(
    () => (localStorage.getItem(ME_KEY) as Person | null) ?? null,
  )

  useEffect(() => {
    if (!supabase || !isCloudConfigured) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSignedIn(Boolean(data.session))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session))
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (password: string) => {
    if (!supabase || !isCloudConfigured) {
      // In locale non c'è niente da proteggere sul server: si entra e basta.
      setSignedIn(true)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email: coupleEmail, password })
    if (error) throw new Error('Password sbagliata. Riprova.')
    setSignedIn(true)
  }, [])

  const signOut = useCallback(async () => {
    if (supabase && isCloudConfigured) await supabase.auth.signOut()
    setSignedIn(!isCloudConfigured)
  }, [])

  const setMe = useCallback((person: Person) => {
    localStorage.setItem(ME_KEY, person)
    setMeState(person)
  }, [])

  const value = useMemo(
    () => ({ signedIn, me, loading, signIn, signOut, setMe }),
    [signedIn, me, loading, signIn, signOut, setMe],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth va usato dentro <AuthProvider>')
  return ctx
}
