import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { addMonths, isSameMonth, isToday, subMonths } from 'date-fns'
import { useApp } from '../store/AppStore'
import { buildCalendar, type DayEntry } from '../lib/calendar'
import { colorOf } from '../lib/colors'
import {
  WEEKDAYS,
  daysToAnniversary,
  longDate,
  monthGrid,
  monthTitle,
  plural,
  todayISO,
  toISO,
  yearsSince,
} from '../lib/dates'
import { EventSheet } from '../components/EventSheet'
import { Glitter } from '../components/Magic'
import type { CalEvent } from '../types'

/**
 * La schermata principale: il mese a colpo d'occhio, con un puntino colorato
 * per categoria su ogni giorno, e sotto il dettaglio del giorno scelto.
 */
export function CalendarPage() {
  const { data, t } = useApp()
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => new Date())
  const [selected, setSelected] = useState<string>(() => todayISO())
  const [editing, setEditing] = useState<CalEvent | null>(null)
  const [adding, setAdding] = useState(false)
  /** -1 indietro, 1 avanti: serve solo a far scorrere la griglia nel verso giusto. */
  const [direction, setDirection] = useState(0)

  const calendar = useMemo(() => buildCalendar(data), [data])
  const cells = useMemo(() => monthGrid(month), [month])
  const selectedEntries = calendar.get(selected) ?? []

  const years = yearsSince(data.settings.anniversary)
  const toAnniversary = daysToAnniversary(data.settings.anniversary)

  const go = (delta: number) => {
    setDirection(delta)
    setMonth((m) => (delta > 0 ? addMonths(m, 1) : subMonths(m, 1)))
  }

  function openEntry(entry: DayEntry) {
    if (entry.kind === 'item' && entry.categoryId) {
      navigate(`/c/${entry.categoryId}/${entry.refId}`)
      return
    }
    const event = data.events.find((e) => e.id === entry.refId)
    if (event) setEditing(event)
  }

  return (
    <div className="pb-4">
      {/* Intestazione con il contatore della relazione */}
      <div className="relative mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-cat-agenda to-[#C14C77] px-5 py-4 text-white shadow-lift">
        <Glitter count={14} seed={11} />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">{t('home.eyebrow')}</p>
          <p className="font-display text-2xl font-bold leading-tight">
            {data.settings.nameA} &amp; {data.settings.nameB}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {data.settings.anniversary ? (
              <>
                {years > 0 && <>{t('home.together', { anni: plural(years, 'anno', 'anni') })} · </>}
                {toAnniversary === 0
                  ? t('home.anniversaryToday')
                  : t('home.countdown', {
                      giorni: plural(toAnniversary ?? 0, 'giorno', 'giorni'),
                    })}
              </>
            ) : (
              <>{t('home.noDate')}</>
            )}
          </p>
        </div>
      </div>

      {/* Barra del mese */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          aria-label="Mese precedente"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft active:scale-90"
        >
          ‹
        </button>
        <div className="text-center">
          <h1 className="font-display text-xl font-bold first-letter:uppercase">{monthTitle(month)}</h1>
          <button
            onClick={() => {
              setDirection(0)
              setMonth(new Date())
              setSelected(todayISO())
            }}
            className="text-xs font-semibold text-cat-agenda"
          >
            {t('home.today')}
          </button>
        </div>
        <button
          onClick={() => go(1)}
          aria-label="Mese successivo"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft active:scale-90"
        >
          ›
        </button>
      </div>

      {/* Griglia del mese */}
      <div className="card overflow-hidden p-3">
        <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wide text-muted">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={monthTitle(month)}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-7 gap-0.5"
          >
            {cells.map((day) => {
              const iso = toISO(day)
              const entries = calendar.get(iso) ?? []
              const outside = !isSameMonth(day, month)
              const isSelected = iso === selected
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  className="flex aspect-square flex-col items-center justify-start gap-1 rounded-xl pt-1.5 transition active:scale-90"
                  style={{
                    background: isSelected ? colorOf('agenda').soft : undefined,
                    opacity: outside ? 0.32 : 1,
                  }}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                      isToday(day) ? 'bg-cat-agenda font-bold text-white' : isSelected ? 'font-bold' : ''
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {/* Massimo 3 puntini: oltre, il giorno diventa illeggibile. */}
                  <span className="flex h-1.5 items-center gap-0.5">
                    {entries.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: colorOf(e.color).hex }}
                      />
                    ))}
                    {entries.length > 3 && (
                      <span className="text-[8px] font-bold leading-none text-muted">+</span>
                    )}
                  </span>
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dettaglio del giorno selezionato */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{longDate(selected)}</h2>
          <button
            onClick={() => setAdding(true)}
            className="rounded-full bg-cat-agenda/10 px-3 py-1.5 text-sm font-semibold text-cat-agenda active:scale-95"
          >
            ＋ Impegno
          </button>
        </div>

        {selectedEntries.length === 0 ? (
          <p className="card px-5 py-8 text-center text-sm text-muted">{t('home.emptyDay')}</p>
        ) : (
          <ul className="space-y-2">
            {selectedEntries.map((entry) => {
              const c = colorOf(entry.color)
              return (
                <li key={entry.id}>
                  <button
                    onClick={() => openEntry(entry)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-soft transition active:scale-[0.98]"
                    style={{ borderLeft: `5px solid ${c.hex}` }}
                  >
                    <span className="text-xl" aria-hidden>
                      {entry.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{entry.title}</span>
                      <span className="block truncate text-sm text-muted">
                        {entry.time && <>{entry.time} · </>}
                        {entry.subtitle ||
                          (entry.isStart && !entry.isEnd
                            ? t('home.starts')
                            : entry.isEnd && !entry.isStart
                              ? t('home.ends')
                              : !entry.isStart
                                ? t('home.ongoing')
                                : '')}
                      </span>
                    </span>
                    <span className="text-muted" aria-hidden>
                      ›
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <EventSheet open={adding} onClose={() => setAdding(false)} defaultDate={selected} />
      <EventSheet open={Boolean(editing)} onClose={() => setEditing(null)} event={editing} />
    </div>
  )
}
