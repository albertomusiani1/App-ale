import type { Dataset } from './db'
import { CAT } from './seed'
import { yearsSince } from './dates'

/**
 * Quanto siete avanti su ogni "famiglia" di achievement.
 * La chiave corrisponde al campo `key` dell'achievement: più achievement
 * possono condividere la stessa chiave con target diversi (1, 5, 10 viaggi...).
 */
export function counters(data: Dataset, now = new Date()): Record<string, number> {
  const done = (categoryId: string) =>
    data.items.filter((i) => i.categoryId === categoryId && i.status === 'done').length

  const doneTripIds = new Set(
    data.items.filter((i) => i.categoryId === CAT.trips && i.status === 'done').map((i) => i.id),
  )

  return {
    anniversary: yearsSince(data.settings.anniversary, now),
    tripsDone: done(CAT.trips),
    stopsDone: data.stops.filter((s) => doneTripIds.has(s.itemId)).length,
    placesDone: done(CAT.places),
    outingsDone: done(CAT.outings),
    screenDone: done(CAT.screen),
    sayings: data.sayings.length,
    photos: data.photos.filter((p) => p.scope !== 'taylor').length,
    // Gli achievement manuali non hanno un contatore: li spuntate voi.
    manual: 0,
  }
}

/** Progresso 0-1 di un singolo achievement, per la barra nella lista. */
export function progressOf(key: string, target: number, counts: Record<string, number>): number {
  if (key === 'manual' || target <= 0) return 0
  return Math.min(1, (counts[key] ?? 0) / target)
}

/**
 * Gli achievement automatici che hanno raggiunto il traguardo
 * ma non sono ancora stati sbloccati: sono quelli da festeggiare.
 *
 * Sono ordinati dal più impegnativo al più facile, perché quando se ne
 * sbloccano diversi in una volta (mettendo la data dell'anniversario, per
 * esempio) il pop-up deve mostrare "6 anni insieme", non "1 anno insieme".
 */
export function newlyUnlocked(data: Dataset, now = new Date()): string[] {
  const counts = counters(data, now)
  return data.achievements
    .filter((a) => a.kind === 'auto' && !a.unlockedAt && (counts[a.key] ?? 0) >= a.target)
    .sort((a, b) => b.target - a.target)
    .map((a) => a.id)
}
