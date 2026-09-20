import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * L'indirizzo email dell'unico account Supabase che condividete in due.
 * La "password di coppia" che inserite all'avvio è la password di questo account:
 * è quello che rende i dati davvero protetti, perché senza login le regole
 * del database (RLS) non lasciano leggere niente a nessuno.
 */
export const coupleEmail = (import.meta.env.VITE_COUPLE_EMAIL as string | undefined) ?? ''

/**
 * Il client esiste solo se avete configurato le variabili d'ambiente.
 * Senza, l'app parte comunque in modalità locale (dati solo su questo
 * dispositivo, niente sincronizzazione): vedi SETUP.md per collegare il cloud.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'noi-due-auth' },
      })
    : null

export const isCloudConfigured = Boolean(supabase && coupleEmail)

/** Bucket dello storage dove finiscono tutte le foto. */
export const PHOTO_BUCKET = 'photos'
