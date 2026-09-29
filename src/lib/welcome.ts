/**
 * Se la procedura di benvenuto è già stata fatta su questo telefono.
 *
 * Il segno resta qui e non nel database di proposito: è una cosa che riguarda
 * il primo avvio su un dispositivo, non la coppia. Così non serve aggiungere
 * una colonna, e soprattutto non c'è niente che possa andare storto il giorno
 * in cui l'app viene regalata.
 */
const KEY = 'noi-due:welcome'

/**
 * A chi tocca la presentazione.
 *
 * Non basta dire "la seconda persona": i due nomi si possono inserire
 * nell'ordine che si vuole, e chi riceve il regalo può benissimo stare nel
 * primo campo. Quindi lo si sceglie per nome dalle Impostazioni.
 *
 * Il valore vive dentro `settings.texts`, che è già una mappa condivisa fra i
 * due telefoni: serve che la scelta fatta su un telefono valga sull'altro, e
 * questo evita di aggiungere una colonna al database — cioè una migrazione da
 * ricordarsi proprio il giorno in cui l'app viene regalata.
 */
const TARGET_KEY = 'welcome.for'

export function welcomeTarget(texts: Record<string, string>): 'a' | 'b' {
  return texts[TARGET_KEY] === 'a' ? 'a' : 'b'
}

export function withWelcomeTarget(
  texts: Record<string, string>,
  person: 'a' | 'b',
): Record<string, string> {
  return { ...texts, [TARGET_KEY]: person }
}

export function welcomeSeen(person: string): boolean {
  try {
    return localStorage.getItem(`${KEY}:${person}`) === '1'
  } catch {
    // Navigazione privata: pazienza, la presentazione ricomparirà.
    return false
  }
}

export function markWelcomeSeen(person: string) {
  try {
    localStorage.setItem(`${KEY}:${person}`, '1')
  } catch {
    /* niente da fare */
  }
}

export function forgetWelcome(person: string) {
  try {
    localStorage.removeItem(`${KEY}:${person}`)
  } catch {
    /* niente da fare */
  }
}

/**
 * La presentazione parte da sola solo per lei. Questo è il modo di richiamarla
 * a mano — serve a rivederla, e soprattutto a provarla prima di regalare
 * l'app, senza dover fingere di essere l'altra persona.
 */
const FORCE = `${KEY}:force`

export function requestWelcome() {
  try {
    localStorage.setItem(FORCE, '1')
  } catch {
    /* niente da fare */
  }
}

export function takeWelcomeRequest(): boolean {
  try {
    if (localStorage.getItem(FORCE) !== '1') return false
    localStorage.removeItem(FORCE)
    return true
  } catch {
    return false
  }
}
