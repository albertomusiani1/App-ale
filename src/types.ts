/** Chi dei due ha scritto / votato. */
export type Person = 'a' | 'b'

/** Le palette disponibili, una per categoria. Vedi tailwind.config.js -> colors.cat */
export type ColorKey =
  | 'agenda'
  | 'trips'
  | 'places'
  | 'goals'
  | 'outings'
  | 'screen'
  | 'custom'

/**
 * Il "tipo" di una categoria decide che schermata usa.
 * - trips  -> lista + dettaglio con tappe e giorno per giorno
 * - places -> posti provati / da provare, con voto doppio
 * - screen -> watchlist film e serie
 * - generic-> uscite, avventure e qualsiasi categoria creata da noi
 * - goals  -> achievement
 */
export type CategoryKind = 'trips' | 'places' | 'screen' | 'generic' | 'goals'

export interface Category {
  id: string
  name: string
  emoji: string
  color: ColorKey
  kind: CategoryKind
  /** Le 5 categorie di partenza non si possono eliminare. */
  builtin: boolean
  sort: number
}

/** Da fare / in programma / fatto. Il filo conduttore di tutta l'app. */
export type ItemStatus = 'wish' | 'planned' | 'done'

/**
 * Un elemento generico: un viaggio, un ristorante, un'uscita, un film.
 * Tenere un'unica forma rende gratis le categorie personalizzate.
 */
export interface Item {
  id: string
  categoryId: string
  title: string
  /** Luogo, stato, indirizzo, regista... dipende dalla categoria. */
  subtitle: string
  status: ItemStatus
  startDate: string | null // YYYY-MM-DD
  endDate: string | null // YYYY-MM-DD
  notes: string
  ratingA: number | null // voto 1-5 di persona A
  ratingB: number | null // voto 1-5 di persona B
  /** Campi extra specifici della categoria (es. kind: 'film' | 'serie'). */
  meta: Record<string, string>
  coverPhotoId: string | null
  /** Coordinate del posto, se lo abbiamo messo sulla mappa. */
  lat: number | null
  lng: number | null
  /** Quante volte ci siamo tornati: sale con il pulsante nella scheda. */
  visits: number
  createdAt: string
}

/** Una tappa di un viaggio. */
export interface Stop {
  id: string
  itemId: string
  name: string
  /** Quanti giorni ci si ferma: genera automaticamente i giorni qui sotto. */
  days: number
  notes: string
  position: number
  /** Dove si trova la tappa, per disegnarla sulla mappa del viaggio. */
  lat: number | null
  lng: number | null
}

/** Il singolo giorno di una tappa. */
export interface StopDay {
  id: string
  stopId: string
  position: number // 0 = primo giorno
  title: string
  notes: string
}

export type PhotoScope = 'item' | 'stop' | 'stopDay' | 'taylor'

export interface Photo {
  id: string
  scope: PhotoScope
  /** id dell'item / stop / stopDay a cui appartiene ('taylor' per la galleria). */
  refId: string
  /** Percorso nello storage Supabase, serve per cancellarla. */
  path: string
  /** URL pubblico o data URL in modalità locale. */
  url: string
  caption: string
  createdAt: string
}

/** Com'è andato un esame. `null` = non lo sappiamo ancora. */
export type ExamOutcome = 'passed' | 'failed' | null

/** Un impegno scritto a mano sul calendario, non legato a nessun item. */
export interface CalEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  endDate: string | null
  time: string | null // HH:mm
  notes: string
  color: ColorKey
  /** Chi dei due lo ha messo in calendario. */
  author: Person | null
  /**
   * Gli impegni che hanno "esame" nel titolo diventano esami: passata la
   * data, l'app chiede com'è andata.
   */
  examOutcome: ExamOutcome
  /** Se rimandiamo la domanda, non ritorna prima di questa data. */
  examAskAfter: string | null
  createdAt: string
}

/**
 * Un achievement. Quelli automatici si sbloccano da soli contando i dati,
 * quelli manuali li spuntiamo noi.
 */
export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  emoji: string
  /** 'auto' = calcolato dai dati, 'manual' = lo spuntiamo noi. */
  kind: 'auto' | 'manual'
  /** Quante cose servono per sbloccarlo (per quelli automatici). */
  target: number
  unlockedAt: string | null
  /** true per quelli che abbiamo creato noi. */
  custom: boolean
}

/** Un nostro modo di dire, da non dimenticare. */
export interface Saying {
  id: string
  text: string
  /** Chi lo dice: lui, lei o entrambi. */
  author: Person | 'both'
  /** Quando è nato / cosa significa. */
  meaning: string
  createdAt: string
}

/** Una frase di Taylor Swift da mostrare nei pop-up. */
export interface Quote {
  id: string
  text: string
  song: string
  era: string
  createdAt: string
}

/**
 * A che livello siamo su un traguardo che si ripete (vedi lib/ladders.ts).
 * Conservare il livello, e non solo il conteggio, serve a sapere quali
 * scalini abbiamo già festeggiato.
 */
export interface LadderState {
  /** Coincide con la chiave della scala definita in lib/ladders.ts. */
  id: string
  level: number
  unlockedAt: string | null
}

export interface Settings {
  /** Come si chiama l'app dentro l'app: lo decidiamo noi. */
  appName: string
  /**
   * Le frasi riscritte da noi, per chiave (vedi lib/copy.ts).
   * Quelle non presenti restano quelle di partenza.
   */
  texts: Record<string, string>
  nameA: string
  nameB: string
  /** Data di inizio relazione: alimenta gli achievement anniversario. */
  anniversary: string | null
  /** Ogni quanto far comparire un modo di dire (in minuti, 0 = mai). */
  sayingFrequency: number
  /** Animazioni ridotte per chi soffre il movimento. */
  reducedMotion: boolean
}
