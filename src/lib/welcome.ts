/**
 * Se la procedura di benvenuto è già stata fatta su questo telefono.
 *
 * Il segno resta qui e non nel database di proposito: è una cosa che riguarda
 * il primo avvio su un dispositivo, non la coppia. Così non serve aggiungere
 * una colonna, e soprattutto non c'è niente che possa andare storto il giorno
 * in cui l'app viene regalata.
 */
const KEY = 'noi-due:welcome'

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
