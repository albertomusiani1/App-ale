import type { Person, Settings, Whose } from '../types'

/**
 * I nomi dei due, e di chi è un impegno.
 *
 * I nomi si cambiano dalle Impostazioni, quindi non vanno mai scritti a mano
 * nei componenti: si chiedono qui.
 */

export function nomeDi(person: Person | null, settings: Settings): string | null {
  if (person === 'a') return settings.nameA
  if (person === 'b') return settings.nameB
  return null
}

/** Come si legge "di chi è": un nome, oppure tutti e due. */
export function nomeWhose(whose: Whose | null, settings: Settings): string | null {
  if (whose === 'both') return `${settings.nameA} e ${settings.nameB}`
  return nomeDi(whose ?? null, settings)
}

/** La versione corta da mettere in una pastiglia, dove lo spazio è poco. */
export function siglaWhose(whose: Whose | null, settings: Settings): string | null {
  if (whose === 'both') return 'Noi due'
  return nomeDi(whose ?? null, settings)
}

/** Le tre scelte del selettore, nell'ordine in cui compaiono. */
export function scelteWhose(settings: Settings): { value: Whose; label: string }[] {
  return [
    { value: 'a', label: settings.nameA },
    { value: 'b', label: settings.nameB },
    { value: 'both', label: 'Tutti e due' },
  ]
}
