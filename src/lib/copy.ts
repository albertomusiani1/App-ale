/**
 * Tutte le frasi "con personalità" dell'app in un posto solo.
 *
 * Ognuna ha una chiave; quello che riscrivete dalle Impostazioni finisce in
 * `settings.texts` e vince su quella di partenza. I pulsanti e le etichette
 * dei campi non stanno qui di proposito: cambiarli non rende l'app più vostra,
 * rende solo più difficile capirla.
 *
 * Alcune frasi contengono segnaposto fra graffe, tipo {giorni}: vanno lasciati
 * dove sono, l'app ci mette dentro il valore giusto.
 */

export interface CopyField {
  key: string
  /** Come viene presentata nelle Impostazioni. */
  label: string
  group: string
  /** Frase lunga: nelle Impostazioni diventa un riquadro invece di una riga. */
  long?: boolean
  /** I segnaposto ammessi, mostrati come aiuto. */
  slots?: string[]
}

export const COPY_FIELDS: CopyField[] = [
  // --- Accesso
  { key: 'login.tagline', label: 'Sottotitolo nella schermata di accesso', group: 'Accesso' },
  { key: 'login.password', label: 'Etichetta del campo password', group: 'Accesso' },
  { key: 'login.enter', label: 'Pulsante per entrare', group: 'Accesso' },
  { key: 'login.who', label: 'Domanda "chi sei"', group: 'Accesso' },
  { key: 'login.whyWho', label: 'Spiegazione sotto "chi sei"', group: 'Accesso' },

  // --- Calendario
  { key: 'home.eyebrow', label: 'Scritta piccola sopra i vostri nomi', group: 'Calendario' },
  { key: 'home.together', label: 'Quanto state insieme', group: 'Calendario', slots: ['{anni}'] },
  { key: 'home.countdown', label: 'Conto alla rovescia per l anniversario', group: 'Calendario', slots: ['{giorni}'] },
  { key: 'home.anniversaryToday', label: 'Il giorno dell anniversario', group: 'Calendario' },
  { key: 'home.noDate', label: 'Quando manca la data di inizio', group: 'Calendario' },
  { key: 'home.today', label: 'Pulsante per tornare a oggi', group: 'Calendario' },
  { key: 'home.emptyDay', label: 'Giorno senza impegni', group: 'Calendario', long: true },
  { key: 'home.starts', label: 'Primo giorno di qualcosa che dura', group: 'Calendario' },
  { key: 'home.ends', label: 'Ultimo giorno', group: 'Calendario' },
  { key: 'home.ongoing', label: 'Giorno in mezzo', group: 'Calendario' },

  // --- Celebrazioni e sorprese
  { key: 'celebration.eyebrow', label: 'Scritta sopra il titolo del pop-up', group: 'Celebrazioni' },
  { key: 'celebration.button', label: 'Pulsante per chiudere il pop-up', group: 'Celebrazioni' },
  { key: 'saying.eyebrow', label: 'Scritta sopra i modi di dire', group: 'Celebrazioni' },
  { key: 'achievements.counter', label: 'Sotto il numero dei traguardi', group: 'Celebrazioni' },
  { key: 'achievements.counterOne', label: 'Lo stesso, quando è uno solo', group: 'Celebrazioni' },
  { key: 'achievements.create', label: 'Pulsante per inventare un traguardo', group: 'Celebrazioni' },
  { key: 'achievements.hint', label: 'Istruzioni sotto i traguardi', group: 'Celebrazioni', long: true },

  // --- Liste vuote
  { key: 'empty.item', label: 'Categoria ancora vuota', group: 'Quando non c è niente', slots: ['{cosa}'] },
  { key: 'empty.itemHint', label: 'Suggerimento sotto', group: 'Quando non c è niente', long: true },
  { key: 'empty.search', label: 'Ricerca senza risultati', group: 'Quando non c è niente' },
  { key: 'empty.searchHint', label: 'Suggerimento sotto la ricerca', group: 'Quando non c è niente' },
  { key: 'empty.stops', label: 'Viaggio senza tappe', group: 'Quando non c è niente', long: true },
  { key: 'empty.photos', label: 'Invito a caricare le foto', group: 'Quando non c è niente' },
  { key: 'empty.sayings', label: 'Nessun modo di dire', group: 'Quando non c è niente' },
  { key: 'empty.map', label: 'Mappa senza posti', group: 'Quando non c è niente', long: true },

  // --- Titoli delle schermate
  { key: 'nav.all', label: 'Titolo della griglia categorie', group: 'Titoli' },
  { key: 'nav.allSubtitle', label: 'Sottotitolo della griglia', group: 'Titoli' },
  { key: 'nav.world', label: 'Titolo della mappa mondo', group: 'Titoli' },
  { key: 'nav.worldSubtitle', label: 'Sottotitolo della mappa mondo', group: 'Titoli' },
  { key: 'settings.title', label: 'Titolo delle impostazioni', group: 'Titoli' },
  { key: 'settings.subtitle', label: 'Sottotitolo delle impostazioni', group: 'Titoli' },
  { key: 'settings.us', label: 'Titolo della sezione su di voi', group: 'Titoli' },
  { key: 'settings.sayings', label: 'Titolo dei modi di dire', group: 'Titoli' },
  { key: 'settings.sayingsHint', label: 'Spiegazione dei modi di dire', group: 'Titoli', long: true },
  { key: 'settings.quotes', label: 'Titolo delle frasi dei pop-up', group: 'Titoli' },
  { key: 'settings.quotesHint', label: 'Spiegazione delle frasi', group: 'Titoli', long: true },
  { key: 'settings.gallery', label: 'Titolo delle foto dei pop-up', group: 'Titoli' },
  { key: 'settings.galleryHint', label: 'Spiegazione delle foto', group: 'Titoli', long: true },
  { key: 'add.title', label: 'Titolo del menù del ＋', group: 'Titoli' },
  { key: 'add.event', label: 'Voce "un impegno"', group: 'Titoli' },
  { key: 'add.eventHint', label: 'Spiegazione di "un impegno"', group: 'Titoli' },
]

export const DEFAULT_COPY: Record<string, string> = {
  'login.tagline': 'Il diario della nostra storia',
  'login.password': 'La nostra password',
  'login.enter': '💗 Entriamo',
  'login.who': 'Chi sei?',
  'login.whyWho': 'Serve solo per sapere di chi è ogni voto.',

  'home.eyebrow': 'Noi due',
  'home.together': '💗 {anni} insieme',
  'home.countdown': 'mancano {giorni} al prossimo anniversario',
  'home.anniversaryToday': '🎉 Buon anniversario, oggi!',
  'home.noDate': 'Metti la vostra data nelle impostazioni ⚙️',
  'home.today': 'Vai a oggi',
  'home.emptyDay': 'Niente in programma. Un giorno tutto per voi 💗',
  'home.starts': 'Si comincia',
  'home.ends': 'Ultimo giorno',
  'home.ongoing': 'In corso',

  'celebration.eyebrow': 'Traguardo sbloccato',
  'celebration.button': '💗 Evviva noi',
  'saying.eyebrow': '🗯️ Come diciamo noi',
  'achievements.counter': 'traguardi conquistati insieme',
  'achievements.counterOne': 'traguardo conquistato insieme',
  'achievements.create': '＋ Inventane uno vostro',
  'achievements.hint': 'Tocca un traguardo da spuntare a mano per sbloccarlo. Doppio tocco per modificarlo.',

  'empty.item': 'Ancora nessun {cosa}',
  'empty.itemHint': 'Tocca il pulsante qui sotto per aggiungerne uno.',
  'empty.search': 'Nessun risultato',
  'empty.searchHint': 'Prova con un altra parola.',
  'empty.stops': 'Nessuna tappa. Aggiungi la prima città e i giorni che ci passate.',
  'empty.photos': 'Carica le foto dal telefono',
  'empty.sayings': 'Nessun modo di dire. Aggiungi il primo 🗯️',
  'empty.map': 'Ancora nessun posto sulla mappa. Metti una posizione a un viaggio o a un locale e comparirà qui.',

  'nav.all': 'Tutte le categorie',
  'nav.allSubtitle': 'Tutto quello che collezioniamo',
  'nav.world': 'La nostra mappa',
  'nav.worldSubtitle': 'Ogni posto che ci siamo presi',
  'settings.title': 'Impostazioni',
  'settings.subtitle': 'Le cose che rendono questa app vostra',
  'settings.us': 'Noi due',
  'settings.sayings': 'I nostri modi di dire',
  'settings.sayingsHint': 'Così non ce li dimentichiamo: ogni tanto ricompaiono da soli sullo schermo.',
  'settings.quotes': 'Frasi per i pop-up',
  'settings.quotesHint': 'Versi di Taylor Swift, battute vostre, dediche: escono quando sbloccate un traguardo.',
  'settings.gallery': 'Foto dei pop-up',
  'settings.galleryHint': 'Le foto che carichi qui compaiono a sorpresa nelle celebrazioni: Taylor Swift, voi due, quello che vi va.',
  'add.title': 'Cosa aggiungiamo?',
  'add.event': 'Un impegno',
  'add.eventHint': 'Una data sul calendario, senza categoria',
}

/** I gruppi nell'ordine in cui compaiono nelle Impostazioni. */
export const COPY_GROUPS = Array.from(new Set(COPY_FIELDS.map((f) => f.group)))

export type Translate = (key: string, slots?: Record<string, string | number>) => string

/**
 * Costruisce la funzione che l'app usa per leggere una frase.
 * Se la chiave non esiste restituisce la chiave stessa: un testo strano a
 * schermo è più facile da notare (e da correggere) di uno spazio vuoto.
 */
export function makeTranslate(texts: Record<string, string>): Translate {
  return (key, slots) => {
    const raw = texts[key]?.trim() || DEFAULT_COPY[key] || key
    if (!slots) return raw
    return Object.entries(slots).reduce(
      (out, [name, value]) => out.replaceAll(`{${name}}`, String(value)),
      raw,
    )
  }
}
