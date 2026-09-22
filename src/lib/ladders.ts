import type { ColorKey } from '../types'
import { phraseForLevel, type Translate } from './copy'
import type { Dataset } from './db'
import { CAT } from './seed'
import { yearsSince } from './dates'

/**
 * I traguardi che si ripetono all'infinito — anni insieme, viaggi, posti,
 * film, uscite, esami — non sono più venticinque schede separate.
 *
 * Ognuno è una "scala": un solo riquadro che mostra a che punto siamo e
 * quanto manca al prossimo scalino. Le soglie iniziali sono scritte a mano
 * perché le prime volte contano più delle successive (il primo viaggio vale
 * più del dodicesimo); dopo si sale a passo fisso, per sempre.
 */
export interface Ladder {
  key: string
  title: string
  emoji: string
  color: ColorKey
  /** Come si chiama quello che si conta: "viaggi", "anni"... */
  unit: string
  /** Le prime soglie, in ordine. */
  steps: number[]
  /** Finite quelle, si sale di tanto in tanto. */
  then: number
  /** Chiave del contatore, vedi counters() in achievements.ts. */
  source: string
  /** Chiave delle frasi personalizzabili in lib/copy.ts. */
  phrases: string
}

export const LADDERS: Ladder[] = [
  {
    key: 'anniversary',
    title: 'Anni insieme',
    emoji: '💗',
    color: 'goals',
    unit: 'anni',
    steps: [1],
    then: 1,
    source: 'anniversary',
    phrases: 'ladder.anniversary',
  },
  {
    key: 'trips',
    title: 'Viaggi fatti',
    emoji: '✈️',
    color: 'trips',
    unit: 'viaggi',
    steps: [1, 3, 5, 10],
    then: 5,
    source: 'tripsDone',
    phrases: 'ladder.trips',
  },
  {
    key: 'places',
    title: 'Posti provati',
    emoji: '🍝',
    color: 'places',
    unit: 'posti',
    steps: [1, 5, 10, 25],
    then: 25,
    source: 'placesDone',
    phrases: 'ladder.places',
  },
  {
    key: 'screen',
    title: 'Film e serie finiti',
    emoji: '🎬',
    color: 'screen',
    unit: 'titoli',
    steps: [1, 5, 10, 25],
    then: 25,
    source: 'screenDone',
    phrases: 'ladder.screen',
  },
  {
    key: 'outings',
    title: 'Uscite fatte',
    emoji: '🎡',
    color: 'outings',
    unit: 'uscite',
    steps: [1, 5, 15],
    then: 10,
    source: 'outingsDone',
    phrases: 'ladder.outings',
  },
  {
    key: 'exams',
    title: 'Genietto',
    emoji: '🎓',
    color: 'agenda',
    unit: 'esami',
    steps: [1],
    then: 1,
    source: 'exams',
    phrases: 'ladder.exams',
  },
]

/**
 * La soglia del livello richiesto (1 = primo traguardo).
 * Dopo le soglie scritte a mano si continua a passo fisso senza fine.
 */
export function thresholdFor(ladder: Ladder, level: number): number {
  if (level <= 0) return ladder.steps[0] ?? ladder.then
  if (level <= ladder.steps.length) return ladder.steps[level - 1]
  const last = ladder.steps[ladder.steps.length - 1] ?? 0
  return last + ladder.then * (level - ladder.steps.length)
}

/** Quanti scalini sono già stati superati con questo conteggio. */
export function levelFromCount(ladder: Ladder, count: number): number {
  let level = 0
  // Le scale sono infinite: ci si ferma appena la soglia supera il conteggio.
  while (count >= thresholdFor(ladder, level + 1)) level++
  return level
}

export interface LadderProgress {
  ladder: Ladder
  count: number
  /** Livello raggiunto secondo i dati. */
  level: number
  /** Quanto serve per il prossimo scalino. */
  next: number
  /** Da 0 a 1 fra lo scalino precedente e il prossimo. */
  ratio: number
}

export function progressOfLadder(ladder: Ladder, count: number): LadderProgress {
  const level = levelFromCount(ladder, count)
  const previous = level === 0 ? 0 : thresholdFor(ladder, level)
  const next = thresholdFor(ladder, level + 1)
  const span = Math.max(1, next - previous)
  return {
    ladder,
    count,
    level,
    next,
    ratio: Math.min(1, Math.max(0, (count - previous) / span)),
  }
}

/** Il contatore di ogni scala, ricavato dai dati. */
export function ladderCounts(data: Dataset, now = new Date()): Record<string, number> {
  const done = (categoryId: string) =>
    data.items.filter((i) => i.categoryId === categoryId && i.status === 'done').length
  return {
    anniversary: yearsSince(data.settings.anniversary, now),
    tripsDone: done(CAT.trips),
    placesDone: done(CAT.places),
    screenDone: done(CAT.screen),
    outingsDone: done(CAT.outings),
    exams: data.events.filter((e) => e.examOutcome === 'passed').length,
  }
}

/**
 * La frase da mostrare quando una scala sale di livello.
 *
 * I segnaposto disponibili sono tre: `{n}` vale ovunque, `{livello}` è lo
 * scalino, e poi c'è quello con il nome dell'unità della scala — `{anni}`
 * per gli anni insieme, `{viaggi}` per i viaggi e così via — che è quello
 * che viene naturale scrivere.
 */
export function ladderPhrase(
  t: Translate,
  ladder: Ladder,
  level: number,
  count: number,
): string {
  return phraseForLevel(t, ladder.phrases, level, {
    n: count,
    livello: level,
    [ladder.unit]: count,
  })
}
