import type { ColorKey } from '../types'
import type { Dataset } from './db'
import { datesBetween } from './dates'

/** Una riga colorata su un giorno del calendario. */
export interface DayEntry {
  id: string
  /** 'event' = impegno scritto a mano, 'item' = viaggio/uscita/cena con una data. */
  kind: 'event' | 'item'
  title: string
  subtitle: string
  color: ColorKey
  emoji: string
  time: string | null
  /** Per aprire la scheda giusta al tocco. */
  refId: string
  categoryId: string | null
  isStart: boolean
  isEnd: boolean
}

/**
 * Costruisce la mappa "giorno ISO -> cose che succedono".
 *
 * Gli elementi con una data (un viaggio, una cena prenotata, un'uscita)
 * finiscono sul calendario da soli: non c'è niente da duplicare a mano,
 * quindi non possono nemmeno andare fuori sincrono.
 */
export function buildCalendar(data: Dataset): Map<string, DayEntry[]> {
  const map = new Map<string, DayEntry[]>()

  const push = (date: string, entry: DayEntry) => {
    const list = map.get(date)
    if (list) list.push(entry)
    else map.set(date, [entry])
  }

  for (const event of data.events) {
    if (!event.date) continue
    const days = datesBetween(event.date, event.endDate)
    days.forEach((date, i) => {
      push(date, {
        id: `${event.id}:${date}`,
        kind: 'event',
        title: event.title,
        subtitle: event.notes,
        color: event.color,
        emoji: '📌',
        time: event.time,
        refId: event.id,
        categoryId: null,
        isStart: i === 0,
        isEnd: i === days.length - 1,
      })
    })
  }

  const categories = new Map(data.categories.map((c) => [c.id, c]))
  for (const item of data.items) {
    if (!item.startDate) continue
    const category = categories.get(item.categoryId)
    if (!category) continue
    const days = datesBetween(item.startDate, item.endDate)
    days.forEach((date, i) => {
      push(date, {
        id: `${item.id}:${date}`,
        kind: 'item',
        title: item.title,
        subtitle: item.subtitle,
        color: category.color,
        emoji: category.emoji,
        time: null,
        refId: item.id,
        categoryId: category.id,
        isStart: i === 0,
        isEnd: i === days.length - 1,
      })
    })
  }

  // Prima quelli con un orario, in ordine; poi il resto.
  for (const list of map.values()) {
    list.sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      return a.title.localeCompare(b.title)
    })
  }

  return map
}
