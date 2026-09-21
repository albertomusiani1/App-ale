import { DEFAULT_COPY } from './copy'

/**
 * Nome e frasi della schermata di accesso.
 *
 * Lì il database non è ancora raggiungibile — è proprio il login che lo
 * sblocca — quindi non possiamo leggere le impostazioni. Teniamo allora una
 * copia locale delle poche cose che servono prima di entrare, aggiornata a
 * ogni avvio riuscito: dalla seconda volta in poi la schermata di accesso
 * parla già con le vostre parole.
 *
 * Il nome sotto l'icona nella home del telefono è un'altra cosa ancora:
 * quello lo decide `vite.config.ts` al momento della pubblicazione.
 */
const KEY = 'noi-due:brand'

export const FALLBACK_APP_NAME = 'LoviDovi'

interface Brand {
  appName: string
  tagline: string
  password: string
  enter: string
}

const defaults: Brand = {
  appName: FALLBACK_APP_NAME,
  tagline: DEFAULT_COPY['login.tagline'],
  password: DEFAULT_COPY['login.password'],
  enter: DEFAULT_COPY['login.enter'],
}

export function readBrand(): Brand {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<Brand>
    return {
      appName: parsed.appName?.trim() || defaults.appName,
      tagline: parsed.tagline?.trim() || defaults.tagline,
      password: parsed.password?.trim() || defaults.password,
      enter: parsed.enter?.trim() || defaults.enter,
    }
  } catch {
    return defaults
  }
}

export function rememberBrand(brand: Brand) {
  try {
    localStorage.setItem(KEY, JSON.stringify(brand))
  } catch {
    // Navigazione privata o spazio esaurito: si resta ai testi di partenza.
  }
}
