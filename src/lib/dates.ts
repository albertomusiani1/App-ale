import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { it } from 'date-fns/locale'

export const ISO = 'yyyy-MM-dd'

export const toISO = (d: Date) => format(d, ISO)
export const fromISO = (s: string) => parseISO(s)
export const todayISO = () => toISO(new Date())

export const fmt = (d: Date | string, pattern: string) =>
  format(typeof d === 'string' ? parseISO(d) : d, pattern, { locale: it })

/** "12 marzo 2026" */
export const longDate = (iso: string) => fmt(iso, 'd MMMM yyyy')
/** "12 mar" */
export const shortDate = (iso: string) => fmt(iso, 'd MMM')
/** "marzo 2026" */
export const monthTitle = (d: Date) => fmt(d, 'MMMM yyyy')

/**
 * Le 6 righe da 7 giorni che compongono la griglia di un mese,
 * settimana che parte di lunedì come si usa qui.
 */
export function monthGrid(month: Date): Date[] {
  const first = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const last = endOfMonth(month)
  const cells: Date[] = []
  let cursor = first
  // Sempre 6 righe: così la griglia non "salta" cambiando mese.
  while (cells.length < 42 || cursor <= last) {
    cells.push(cursor)
    cursor = addDays(cursor, 1)
    if (cells.length >= 42) break
  }
  return cells
}

export const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

/** Tutti i giorni ISO coperti da un intervallo, estremi inclusi. */
export function datesBetween(startISO: string, endISO: string | null): string[] {
  const start = parseISO(startISO)
  const end = endISO ? parseISO(endISO) : start
  const span = Math.max(0, differenceInCalendarDays(end, start))
  // Un intervallo assurdo (una data sbagliata a mano) non deve bloccare l'app.
  if (span > 400) return [startISO]
  return Array.from({ length: span + 1 }, (_, i) => toISO(addDays(start, i)))
}

export const sameDay = isSameDay

/** Quanti anni compiuti dalla data di inizio relazione. */
export function yearsSince(isoDate: string | null, now = new Date()): number {
  if (!isoDate) return 0
  const start = parseISO(isoDate)
  if (Number.isNaN(start.getTime()) || start > now) return 0
  let years = now.getFullYear() - start.getFullYear()
  const anniversaryThisYear = new Date(now.getFullYear(), start.getMonth(), start.getDate())
  if (now < anniversaryThisYear) years -= 1
  return Math.max(0, years)
}

/** Giorni che mancano al prossimo anniversario (0 = è oggi). */
export function daysToAnniversary(isoDate: string | null, now = new Date()): number | null {
  if (!isoDate) return null
  const start = parseISO(isoDate)
  if (Number.isNaN(start.getTime())) return null
  const thisYear = new Date(now.getFullYear(), start.getMonth(), start.getDate())
  const target = thisYear >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
    ? thisYear
    : new Date(now.getFullYear() + 1, start.getMonth(), start.getDate())
  return differenceInCalendarDays(target, now)
}

/**
 * L'intervallo di un viaggio in forma leggibile.
 * L'anno si scrive una volta sola quando partenza e ritorno cadono nello
 * stesso anno, che è quasi sempre.
 */
export function rangeLabel(startISO: string, endISO: string | null): string {
  if (!endISO || endISO === startISO) return longDate(startISO)
  const sameYear = startISO.slice(0, 4) === endISO.slice(0, 4)
  const start = sameYear ? fmt(startISO, 'd MMMM') : longDate(startISO)
  return `${start} → ${longDate(endISO)}`
}

/** "3 giorni", "1 giorno" — per non scrivere plurali sbagliati in giro. */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
