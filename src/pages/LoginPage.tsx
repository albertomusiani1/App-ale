import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../store/AuthContext'
import { isCloudConfigured } from '../lib/supabase'
import { FloatingHearts, Glitter, PulsingHeart } from '../components/Magic'

/**
 * La porta d'ingresso: una password sola, quella di coppia.
 * In modalità locale non c'è niente da proteggere sul server, quindi si entra
 * direttamente.
 */
export function LoginPage() {
  const { signIn } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Non è andata. Riprova.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <Glitter count={26} />
      <FloatingHearts count={12} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative w-full max-w-sm text-center"
      >
        <div className="mb-3 flex justify-center">
          <PulsingHeart size={72} />
        </div>
        <h1 className="font-display text-4xl font-bold">Noi Due</h1>
        <p className="mt-1 text-muted">Il diario della nostra storia</p>

        <form onSubmit={submit} className="card mt-8 space-y-3 p-5 text-left">
          <label className="label" htmlFor="password">
            {isCloudConfigured ? 'La nostra password' : 'Entra'}
          </label>
          {isCloudConfigured ? (
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="field text-center text-lg tracking-widest"
            />
          ) : (
            <p className="text-sm text-muted">
              Il cloud non è ancora collegato: i dati restano su questo dispositivo.
              Le istruzioni sono nel file SETUP.md.
            </p>
          )}

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy || (isCloudConfigured && password.length === 0)}
            className="btn-primary w-full"
          >
            {busy ? 'Un attimo...' : '💗 Entriamo'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

/** Alla prima apertura chiediamo chi dei due sta usando il telefono. */
export function WhoAreYou({ nameA, nameB }: { nameA: string; nameB: string }) {
  const { setMe } = useAuth()
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <Glitter count={20} />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm text-center"
      >
        <h1 className="font-display text-3xl font-bold">Chi sei?</h1>
        <p className="mt-1 text-muted">Serve solo per sapere di chi è ogni voto.</p>
        <div className="mt-8 space-y-3">
          {([
            ['a', nameA] as const,
            ['b', nameB] as const,
          ]).map(([key, name]) => (
            <button key={key} onClick={() => setMe(key)} className="btn-primary w-full text-lg">
              {name}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Si può cambiare dalle impostazioni.</p>
      </motion.div>
    </div>
  )
}
