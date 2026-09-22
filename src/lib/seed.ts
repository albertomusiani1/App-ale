import type { Achievement, Category, Quote, Settings } from '../types'

/**
 * Le 5 categorie di partenza. Vengono create la prima volta che apriamo l'app
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
 * I traguardi "una tantum" di partenza.
 *
 * Quelli che si ripetono — anni insieme, viaggi, posti, film, uscite, esami —
 * non sono qui: sono scale a livelli, definite in lib/ladders.ts, e crescono
 * da sole senza bisogno di una riga per ogni scalino.
 */
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // --- Si sbloccano da soli
  {
    id: 'ach-sushi',
    key: 'sushi',
    title: 'Primo sushi',
    description: 'Il primo giapponese da quando esiste l app.',
    emoji: '🍣',
    kind: 'auto',
    target: 1,
    custom: false,
  },
  {
    id: 'ach-say-10',
    key: 'sayings',
    title: 'Dizionario di coppia',
    description: '10 modi di dire salvati per sempre.',
    emoji: '📖',
    kind: 'auto',
    target: 10,
    custom: false,
  },
  {
    id: 'ach-photo-50',
    key: 'photos',
    title: 'Archivio ricordi',
    description: '50 foto caricate nell app.',
    emoji: '📸',
    kind: 'auto',
    target: 50,
    custom: false,
  },

  // --- Da spuntare a mano
  {
    id: 'ach-m-finalmente',
    key: 'manual',
    title: 'Finalmente',
    description: 'Alessia ha cagato con la porta chiusa.',
    emoji: '🚪',
    kind: 'manual',
    target: 1,
    custom: false,
  },
  {
    id: 'ach-m-bisu',
    key: 'manual',
    title: 'Bisu',
    description: 'Alessia ha dato 10 baci ad Albi.',
    emoji: '😘',
    kind: 'manual',
    target: 1,
    custom: false,
  },
  {
    id: 'ach-m-chonky',
    key: 'manual',
    title: 'Chonky Chonky',
    description: 'Albi ha toccato la panciotta almeno 10 volte.',
    emoji: '🐻',
    kind: 'manual',
    target: 1,
    custom: false,
  },
  {
    id: 'ach-m-keys',
    key: 'manual',
    title: 'Le chiavi di casa',
    description: 'Il giorno in cui ci siamo scambiati le chiavi.',
    emoji: '🔑',
    kind: 'manual',
    target: 1,
    custom: false,
  },
  {
    id: 'ach-m-eras',
    key: 'manual',
    title: 'The Eras Tour',
    description: 'Visto un concerto insieme.',
    emoji: '🎤',
    kind: 'manual',
    target: 1,
    custom: false,
  },
]

/**
 * Qualche frase per far partire i pop-up fin da subito.
 * Le nostre preferite le aggiungiamo (e le togliamo) dalle Impostazioni.
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
