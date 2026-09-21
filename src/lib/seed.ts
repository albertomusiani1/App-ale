import type { Achievement, Category, Quote, Settings } from '../types'

/**
 * Le 5 categorie di partenza. Vengono create la prima volta che aprite l'app
 * e non si possono cancellare (ma nome, emoji e colore sì).
 * Gli id sono fissi così il seed è idempotente: riaprire l'app non li duplica.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-trips', name: 'Viaggi', emoji: '✈️', color: 'trips', kind: 'trips', builtin: true, sort: 0 },
  { id: 'cat-places', name: 'Ristoranti & Bar', emoji: '🍝', color: 'places', kind: 'places', builtin: true, sort: 1 },
  { id: 'cat-goals', name: 'Achievement', emoji: '🏆', color: 'goals', kind: 'goals', builtin: true, sort: 2 },
  { id: 'cat-outings', name: 'Uscite & Avventure', emoji: '🎡', color: 'outings', kind: 'generic', builtin: true, sort: 3 },
  { id: 'cat-screen', name: 'Cinema & Serie', emoji: '🎬', color: 'screen', kind: 'screen', builtin: true, sort: 4 },
]

export const CAT = {
  trips: 'cat-trips',
  places: 'cat-places',
  goals: 'cat-goals',
  outings: 'cat-outings',
  screen: 'cat-screen',
} as const

/**
 * Gli achievement di partenza.
 * `kind: 'auto'` = si sbloccano da soli contando i dati (vedi achievements.ts),
 * `kind: 'manual'` = li spuntate voi quando succedono.
 */
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // --- Anniversari: contano gli anni dalla data che metti nelle impostazioni
  { id: 'ach-anniv-1', key: 'anniversary', title: '1 anno insieme', description: 'Il primo giro completo attorno al sole.', emoji: '💗', kind: 'auto', target: 1, custom: false },
  { id: 'ach-anniv-2', key: 'anniversary', title: '2 anni insieme', description: 'Due anni di noi.', emoji: '💞', kind: 'auto', target: 2, custom: false },
  { id: 'ach-anniv-3', key: 'anniversary', title: '3 anni insieme', description: 'Tre candeline.', emoji: '💖', kind: 'auto', target: 3, custom: false },
  { id: 'ach-anniv-4', key: 'anniversary', title: '4 anni insieme', description: 'Quattro anni e non sentirli.', emoji: '💘', kind: 'auto', target: 4, custom: false },
  { id: 'ach-anniv-5', key: 'anniversary', title: '5 anni insieme', description: 'Mezzo decennio di storie.', emoji: '🌟', kind: 'auto', target: 5, custom: false },
  { id: 'ach-anniv-6', key: 'anniversary', title: '6 anni insieme', description: 'Sei anni. Buon anniversario!', emoji: '👑', kind: 'auto', target: 6, custom: false },
  { id: 'ach-anniv-7', key: 'anniversary', title: '7 anni insieme', description: 'Sette anni, zero rimpianti.', emoji: '🍀', kind: 'auto', target: 7, custom: false },
  { id: 'ach-anniv-8', key: 'anniversary', title: '8 anni insieme', description: 'Otto anni di squadra.', emoji: '🎆', kind: 'auto', target: 8, custom: false },
  { id: 'ach-anniv-9', key: 'anniversary', title: '9 anni insieme', description: 'Nove anni insieme.', emoji: '🕯️', kind: 'auto', target: 9, custom: false },
  { id: 'ach-anniv-10', key: 'anniversary', title: '10 anni insieme', description: 'Dieci anni. Una vita.', emoji: '💎', kind: 'auto', target: 10, custom: false },

  // --- Viaggi
  { id: 'ach-trip-1', key: 'tripsDone', title: 'Primo viaggio', description: 'Il primo viaggio insieme è andato.', emoji: '🧳', kind: 'auto', target: 1, custom: false },
  { id: 'ach-trip-5', key: 'tripsDone', title: 'Viaggiatori seriali', description: '5 viaggi fatti insieme.', emoji: '🗺️', kind: 'auto', target: 5, custom: false },
  { id: 'ach-trip-10', key: 'tripsDone', title: 'Giro del mondo', description: '10 viaggi nel carniere.', emoji: '🌍', kind: 'auto', target: 10, custom: false },
  { id: 'ach-stops-20', key: 'stopsDone', title: 'Venti tappe', description: '20 tappe percorse in giro per il mondo.', emoji: '📍', kind: 'auto', target: 20, custom: false },

  // --- Ristoranti e bar
  { id: 'ach-place-1', key: 'placesDone', title: 'Prima cena', description: 'Il primo posto provato insieme.', emoji: '🍷', kind: 'auto', target: 1, custom: false },
  { id: 'ach-place-10', key: 'placesDone', title: 'Buone forchette', description: '10 posti provati.', emoji: '🍕', kind: 'auto', target: 10, custom: false },
  { id: 'ach-place-25', key: 'placesDone', title: 'Critici gastronomici', description: '25 posti provati e recensiti.', emoji: '⭐', kind: 'auto', target: 25, custom: false },

  // --- Uscite e schermo
  { id: 'ach-out-5', key: 'outingsDone', title: 'Cinque avventure', description: '5 uscite fatte insieme.', emoji: '🎠', kind: 'auto', target: 5, custom: false },
  { id: 'ach-out-15', key: 'outingsDone', title: 'Mai fermi', description: '15 avventure all-inclusive.', emoji: '🎢', kind: 'auto', target: 15, custom: false },
  { id: 'ach-screen-10', key: 'screenDone', title: 'Maratona', description: '10 film o serie finiti insieme.', emoji: '🍿', kind: 'auto', target: 10, custom: false },

  // --- Noi due
  { id: 'ach-say-10', key: 'sayings', title: 'Dizionario di coppia', description: '10 modi di dire salvati per sempre.', emoji: '📖', kind: 'auto', target: 10, custom: false },
  { id: 'ach-photo-50', key: 'photos', title: 'Archivio ricordi', description: '50 foto caricate nell app.', emoji: '📸', kind: 'auto', target: 50, custom: false },

  // --- Da spuntare a mano
  { id: 'ach-m-keys', key: 'manual', title: 'Le chiavi di casa', description: 'Il giorno in cui vi siete scambiati le chiavi.', emoji: '🔑', kind: 'manual', target: 1, custom: false },
  { id: 'ach-m-eras', key: 'manual', title: 'The Eras Tour', description: 'Visto un concerto insieme.', emoji: '🎤', kind: 'manual', target: 1, custom: false },
  { id: 'ach-m-plant', key: 'manual', title: 'Genitori di una pianta', description: 'Tenuta viva una pianta per un anno.', emoji: '🪴', kind: 'manual', target: 1, custom: false },
]

/**
 * Qualche frase per far partire i pop-up fin da subito.
 * Le tue preferite le aggiungi (e le togli) dalle Impostazioni.
 */
export const DEFAULT_QUOTES: Omit<Quote, 'id' | 'createdAt'>[] = [
  { text: 'Tutto è cominciato quando ci siamo guardati.', song: '', era: 'Noi' },
  { text: 'Il tempo passa, noi restiamo.', song: '', era: 'Noi' },
  { text: 'Casa non è un posto, sei tu.', song: '', era: 'Noi' },
]

export const DEFAULT_SETTINGS: Settings = {
  appName: 'LoviDovi',
  texts: {},
  nameA: 'Lui',
  nameB: 'Lei',
  anniversary: null,
  sayingFrequency: 20,
  reducedMotion: false,
}
