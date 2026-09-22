import type { Dataset } from './db'
import { CAT } from './seed'

/**
 * I contatori dei traguardi "una tantum", quelli che si sbloccano una volta
 * sola e poi restano lì.
 *
 * Quelli che si ripetono all'infinito — anni insieme, viaggi, posti, film,
 * uscite, esami — non passano più da qui: sono scale a livelli, e stanno in
 * lib/ladders.ts.
 */
export function counters(data: Dataset): Record<string, number> {
  return {
    // Il primo sushi dell'era-app: un posto provato con cucina giapponese.
    sushi: data.items.filter(
      (i) =>
        i.categoryId === CAT.places &&
        i.status === 'done' &&
        (i.meta.cuisine ?? '').toLowerCase() === 'giapponese',
    ).length,
    sayings: data.sayings.length,
    photos: data.photos.filter((p) => p.scope !== 'taylor').length,
    // Quelli manuali non hanno un contatore: li spuntiamo noi.
    manual: 0,
  }
}

/** Progresso 0-1 di un traguardo una tantum, per la barra nella lista. */
export function progressOf(key: string, target: number, counts: Record<string, number>): number {
  if (key === 'manual' || target <= 0) return 0
  return Math.min(1, (counts[key] ?? 0) / target)
}

/**
 * I traguardi automatici che hanno raggiunto la soglia ma non sono ancora
 * stati sbloccati: sono quelli da festeggiare.
 */
export function newlyUnlocked(data: Dataset): string[] {
  const counts = counters(data)
  return data.achievements
    .filter((a) => a.kind === 'auto' && !a.unlockedAt && (counts[a.key] ?? 0) >= a.target)
    .sort((a, b) => b.target - a.target)
    .map((a) => a.id)
}
