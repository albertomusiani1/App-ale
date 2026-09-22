/**
 * Tutte le frasi "con personalità" dell'app in un posto solo.
 *
 * Ognuna ha una chiave; quello che riscriviamo dalle Impostazioni finisce in
 * `settings.texts` e vince su quella di partenza. I pulsanti e le etichette dei
 * campi non stanno qui di proposito: cambiarli non rende l'app più nostra,
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
  /** Aiuto in più sotto il campo. */
  hint?: string
}

const LADDER_HINT =
  'Una frase per riga: la prima vale per il primo scalino, la seconda per il secondo e così via. Finite le righe entra in gioco la frase sempre valida qui sotto.'

const LADDER_STD_HINT =
  'Usata per tutti gli scalini che non hanno una riga dedicata qui sopra. Svuota l elenco sopra per usare sempre e solo questa.'

export const COPY_FIELDS: CopyField[] = [
  // --- Accesso
  { key: 'login.tagline', label: 'Sottotitolo nella schermata di accesso', group: 'Accesso' },
  { key: 'login.password', label: 'Etichetta del campo password', group: 'Accesso' },
  { key: 'login.enter', label: 'Pulsante per entrare', group: 'Accesso' },
  { key: 'login.who', label: 'Domanda "chi sei"', group: 'Accesso' },
  { key: 'login.whyWho', label: 'Spiegazione sotto "chi sei"', group: 'Accesso' },

  // --- Calendario
  { key: 'home.eyebrow', label: 'Scritta piccola sopra i nostri nomi', group: 'Calendario' },
  { key: 'home.together', label: 'Da quanto stiamo insieme', group: 'Calendario', slots: ['{anni}'] },
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

  // --- Le frasi dei traguardi a livelli
  { key: 'ladder.anniversary', label: 'Anni insieme · una per scalino', group: 'Frasi dei traguardi', long: true, hint: LADDER_HINT, slots: ['{anni}'] },
  { key: 'ladder.anniversary.default', label: 'Anni insieme · frase sempre valida', group: 'Frasi dei traguardi', hint: LADDER_STD_HINT, slots: ['{anni}'] },
  { key: 'ladder.trips', label: 'Viaggi fatti · una per scalino', group: 'Frasi dei traguardi', long: true, hint: LADDER_HINT, slots: ['{viaggi}'] },
  { key: 'ladder.trips.default', label: 'Viaggi fatti · frase sempre valida', group: 'Frasi dei traguardi', hint: LADDER_STD_HINT, slots: ['{viaggi}'] },
  { key: 'ladder.places', label: 'Posti provati · una per scalino', group: 'Frasi dei traguardi', long: true, hint: LADDER_HINT, slots: ['{posti}'] },
  { key: 'ladder.places.default', label: 'Posti provati · frase sempre valida', group: 'Frasi dei traguardi', hint: LADDER_STD_HINT, slots: ['{posti}'] },
  { key: 'ladder.screen', label: 'Film e serie · una per scalino', group: 'Frasi dei traguardi', long: true, hint: LADDER_HINT, slots: ['{titoli}'] },
  { key: 'ladder.screen.default', label: 'Film e serie · frase sempre valida', group: 'Frasi dei traguardi', hint: LADDER_STD_HINT, slots: ['{titoli}'] },
  { key: 'ladder.outings', label: 'Uscite fatte · una per scalino', group: 'Frasi dei traguardi', long: true, hint: LADDER_HINT, slots: ['{uscite}'] },
  { key: 'ladder.outings.default', label: 'Uscite fatte · frase sempre valida', group: 'Frasi dei traguardi', hint: LADDER_STD_HINT, slots: ['{uscite}'] },
  { key: 'ladder.exams', label: 'Esami passati · una per scalino', group: 'Frasi dei traguardi', long: true, hint: LADDER_HINT, slots: ['{esami}'] },
  { key: 'ladder.exams.default', label: 'Esami passati · frase sempre valida', group: 'Frasi dei traguardi', hint: LADDER_STD_HINT, slots: ['{esami}'] },
  { key: 'achievement.sushi', label: 'Frase del primo sushi', group: 'Frasi dei traguardi' },

  // --- Esami
  { key: 'exam.question', label: 'Domanda dopo un esame', group: 'Esami' },
  { key: 'exam.yes', label: 'Risposta "passato"', group: 'Esami' },
  { key: 'exam.no', label: 'Risposta "non passato"', group: 'Esami' },
  { key: 'exam.later', label: 'Rimanda di tre giorni', group: 'Esami' },
  { key: 'exam.passed', label: 'Festeggiamento quando è passato', group: 'Esami', long: true },

  // --- Liste vuote
  { key: 'empty.item', label: 'Categoria ancora vuota', group: 'Quando non c è niente', slots: ['{cosa}'] },
  { key: 'empty.itemHint', label: 'Suggerimento sotto', group: 'Quando non c è niente', long: true },
  { key: 'empty.search', label: 'Ricerca senza risultati', group: 'Quando non c è niente' },
  { key: 'empty.searchHint', label: 'Suggerimento sotto la ricerca', group: 'Quando non c è niente' },
  { key: 'empty.stops', label: 'Viaggio senza tappe', group: 'Quando non c è niente', long: true },
  { key: 'empty.photos', label: 'Invito a caricare le foto', group: 'Quando non c è niente' },
  { key: 'empty.sayings', label: 'Nessun modo di dire', group: 'Quando non c è niente' },
  { key: 'empty.map', label: 'Mappa senza posti', group: 'Quando non c è niente', long: true },
  { key: 'empty.plans', label: 'Nessun impegno in programma', group: 'Quando non c è niente', long: true },

  // --- Titoli delle schermate
  { key: 'nav.all', label: 'Titolo della griglia categorie', group: 'Titoli' },
  { key: 'nav.allSubtitle', label: 'Sottotitolo della griglia', group: 'Titoli' },
  { key: 'nav.world', label: 'Titolo della mappa mondo', group: 'Titoli' },
  { key: 'nav.worldSubtitle', label: 'Sottotitolo della mappa mondo', group: 'Titoli' },
  { key: 'nav.plans', label: 'Titolo degli impegni', group: 'Titoli' },
  { key: 'nav.plansSubtitle', label: 'Sottotitolo degli impegni', group: 'Titoli' },
  { key: 'settings.title', label: 'Titolo delle impostazioni', group: 'Titoli' },
  { key: 'settings.subtitle', label: 'Sottotitolo delle impostazioni', group: 'Titoli' },
  { key: 'settings.us', label: 'Titolo della sezione su di noi', group: 'Titoli' },
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
  'login.who': 'Chi sono?',
  'login.whyWho': 'Serve solo per sapere di chi è ogni voto.',

  'home.eyebrow': 'Noi due',
  'home.together': '💗 {anni} insieme',
  'home.countdown': 'mancano {giorni} al nostro anniversario',
  'home.anniversaryToday': '🎉 Buon anniversario, oggi!',
  'home.noDate': 'Mettiamo la nostra data nelle impostazioni ⚙️',
  'home.today': 'Vai a oggi',
  'home.emptyDay': 'Niente in programma. Un giorno tutto nostro 💗',
  'home.starts': 'Si comincia',
  'home.ends': 'Ultimo giorno',
  'home.ongoing': 'In corso',

  'celebration.eyebrow': 'Traguardo sbloccato',
  'celebration.button': '💗 Evviva noi',
  'saying.eyebrow': '🗯️ Come diciamo noi',
  'achievements.counter': 'traguardi conquistati insieme',
  'achievements.counterOne': 'traguardo conquistato insieme',
  'achievements.create': '＋ Inventiamone uno nostro',
  'achievements.hint': 'Tocchiamo un traguardo da spuntare a mano per sbloccarlo. Doppio tocco per modificarlo.',

  'ladder.anniversary': 'Un anno di noi, e non ci siamo ancora stufati.\nDue anni: ormai è ufficiale.\nTre anni, tipo un ciclo di laurea ma più divertente.\nQuattro anni e ancora litighiamo per la coperta.\nCinque anni, mezzo decennio di ordini sbagliati al ristorante.\nSei anni. Chi l avrebbe detto.',
  'ladder.trips': 'Primo viaggio, prima valigia fatta male.\nStiamo diventando bravi a perdere treni insieme.\nA questo punto tanto vale trasferirsi.',
  'ladder.places': 'Primo posto provato, primo conto diviso male.\nDiventiamo pericolosi per il conto in banca.\nCi conoscono tutti i camerieri della città.',
  'ladder.screen': 'Finita la prima serie, ne servono altre venti.\nUna maratona tira l altra.\nAbbiamo visto tutto, ricominciamo da capo.',
  'ladder.outings': 'Prima uscita di quelle vere.\nNon stiamo mai fermi.\nSiamo ufficialmente instancabili.',
  'ladder.exams': 'Primo esame passato, si brinda.\nUn altro giù, ne mancano sempre meno.\nA questo punto la laurea è una formalità.',
  'ladder.anniversary.default': 'Minchia, siamo stati insieme {anni} anni.',
  'ladder.trips.default': 'Siamo a {viaggi} viaggi insieme. Prossima valigia?',
  'ladder.places.default': '{posti} posti provati. Il conto in banca piange.',
  'ladder.screen.default': '{titoli} fra film e serie. Il divano ci ringrazia.',
  'ladder.outings.default': '{uscite} uscite e non ci fermiamo più.',
  'ladder.exams.default': '{esami} esami passati. Genietto vero.',
  'achievement.sushi': 'Tanto paga sempre Albi',

  'exam.question': 'Com è andato l esame?',
  'exam.yes': '😎 Passato',
  'exam.no': '🙃 Andrà meglio',
  'exam.later': 'Ne parliamo fra tre giorni',
  'exam.passed': 'Un esame in meno. Si festeggia.',

  'empty.item': 'Ancora nessun {cosa}',
  'empty.itemHint': 'Tocchiamo il pulsante qui sotto per aggiungerne uno.',
  'empty.search': 'Nessun risultato',
  'empty.searchHint': 'Proviamo con un altra parola.',
  'empty.stops': 'Nessuna tappa. Aggiungiamo la prima città e i giorni che ci passiamo.',
  'empty.photos': 'Carichiamo le foto dal telefono',
  'empty.sayings': 'Nessun modo di dire. Aggiungiamo il primo 🗯️',
  'empty.map': 'Ancora nessun posto sulla mappa. Mettiamo una posizione a un viaggio o a un locale e comparirà qui.',
  'empty.plans': 'Nessun impegno in programma. Il calendario è tutto nostro.',

  'nav.all': 'Tutte le categorie',
  'nav.allSubtitle': 'Tutto quello che collezioniamo',
  'nav.world': 'La nostra mappa',
  'nav.worldSubtitle': 'Ogni posto che ci siamo presi',
  'nav.plans': 'Impegni',
  'nav.plansSubtitle': 'Quello che ci aspetta, e chi l ha scritto',
  'settings.title': 'Impostazioni',
  'settings.subtitle': 'Le cose che rendono questa app nostra',
  'settings.us': 'Noi due',
  'settings.sayings': 'I nostri modi di dire',
  'settings.sayingsHint': 'Così non ce li dimentichiamo: ogni tanto ricompaiono da soli sullo schermo.',
  'settings.quotes': 'Frasi per i pop-up',
  'settings.quotesHint': 'Versi di Taylor Swift, battute nostre, dediche: escono quando sblocchiamo un traguardo.',
  'settings.gallery': 'Foto dei pop-up',
  'settings.galleryHint': 'Le foto che carichiamo qui compaiono a sorpresa nelle celebrazioni: Taylor Swift, noi due, quello che ci va.',
  'add.title': 'Cosa aggiungiamo?',
  'add.event': 'Un impegno',
  'add.eventHint': 'Una data sul calendario, che vede anche l altro',
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

/**
 * La frase da mostrare quando si sale di uno scalino.
 *
 * L'ordine è: la riga scritta apposta per quello scalino, se c'è; altrimenti
 * la frase sempre valida, quella con il numero dentro ({anni}, {viaggi}...).
 * Così si possono scrivere due o tre battute per i primi traguardi e lasciare
 * che dal quarto in poi ci pensi una frase sola, senza doverle inventare
 * all'infinito.
 */
export function phraseForLevel(
  t: Translate,
  key: string,
  level: number,
  slots?: Record<string, string | number>,
): string {
  const lines = t(key)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const specific = lines[Math.max(1, level) - 1]
  if (specific) return fill(specific, slots)

  const standard = t(`${key}.default`)
  // `t` restituisce la chiave stessa quando non trova niente: in quel caso
  // non c'è davvero una frase sempre valida, e si torna a ciclare le righe.
  if (standard && standard !== `${key}.default`) return fill(standard, slots)

  return lines.length ? fill(lines[(Math.max(1, level) - 1) % lines.length], slots) : ''
}

function fill(text: string, slots?: Record<string, string | number>): string {
  if (!slots) return text
  return Object.entries(slots).reduce(
    (out, [name, value]) => out.replaceAll(`{${name}}`, String(value)),
    text,
  )
}
