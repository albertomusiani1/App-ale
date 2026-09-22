import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { todayISO } from '../lib/dates'
import { EventSheet } from '../components/EventSheet'
import { Empty, PageTitle } from '../components/ui'
import type { CalEvent } from '../types'

/**
 * Gli impegni di tutti e due in un elenco solo.
 *
 * Il calendario li mostra giorno per giorno; qui si vede la fila, con chi li
 * ha scritti e a che ora — che è la domanda vera quando si incastrano due
 * settimane.
 */
export function PlansPage() {
  const { data, t } = useApp()
  const [editing, setEditing] = useState<CalEvent | null>(null)
  const [adding, setAdding] = useState(false)

  const today = todayISO()
  const { next, past } = useMemo(() => {
    const sorted = [...data.events].sort((a, b) => a.date.localeCompare(b.date))
    return {
      next: sorted.filter((e) => (e.endDate ?? e.date) >= today),
      // I più recenti per primi: di quelli vecchi interessa l'ultimo, non il primo.
      past: sorted.filter((e) => (e.endDate ?? e.date) < today).reverse(),
    }
  }, [data.events, today])

  const who = (e: CalEvent) =>
    e.author === 'a' ? data.settings.nameA : e.author === 'b' ? data.settings.nameB : null

  const row = (e: CalEvent) => {
    const c = colorOf(e.color)
    const isExam = /esame/i.test(e.title)
    const author = who(e)
    return (
      <li key={e.id}>
        <button
          onClick={() => setEditing(e)}
          className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-soft transition active:scale-[0.98]"
          style={{ borderLeft: `5px solid ${c.hex}` }}
        >
          <span className="shrink-0 text-center">
            <span className="block font-display text-lg font-bold leading-none">
              {e.date.slice(8, 10)}
            </span>
            <span className="block text-[10px] uppercase text-muted">{monthShort(e.date)}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">
              {isExam && '🎓 '}
              {e.title}
            </span>
            <span className="block truncate text-sm text-muted">
              {e.time && <>🕐 {e.time} · </>}
              {author ? `scritto da ${author}` : 'senza firma'}
            </span>
          </span>
          {isExam && e.examOutcome && (
            <span
              className="pill shrink-0"
              style={
                e.examOutcome === 'passed'
                  ? { background: colorOf('outings').soft, color: colorOf('outings').ink }
                  : { background: '#F1EFEF', color: '#7A6A72' }
              }
            >
              {e.examOutcome === 'passed' ? 'passato' : 'ritentiamo'}
            </span>
          )}
        </button>
      </li>
    )
  }

  return (
    <div className="pb-4">
      <PageTitle
        emoji="📌"
        title={t('nav.plans')}
        subtitle={t('nav.plansSubtitle')}
        color="agenda"
        action={
          <Link
            to="/tutte"
            aria-label="Indietro"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft active:scale-90"
          >
            ‹
          </Link>
        }
      />

      {next.length === 0 && past.length === 0 ? (
        <Empty emoji="📌" title="Agenda libera" hint={t('empty.plans')} />
      ) : (
        <>
          {next.length > 0 && (
            <section className="mb-5">
              <h2 className="mb-2 font-display text-lg font-bold">In arrivo</h2>
              <ul className="space-y-2">{next.map(row)}</ul>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-2 font-display text-lg font-bold">Già passati</h2>
              <ul className="space-y-2 opacity-75">{past.slice(0, 30).map(row)}</ul>
            </section>
          )}
        </>
      )}

      <button
        onClick={() => setAdding(true)}
        className="btn mt-5 w-full shadow-lift"
        style={{ background: colorOf('agenda').hex, color: colorOf('agenda').on }}
      >
        ＋ Nuovo impegno
      </button>

      <EventSheet open={adding} onClose={() => setAdding(false)} defaultDate={todayISO()} />
      <EventSheet open={Boolean(editing)} onClose={() => setEditing(null)} event={editing} />
    </div>
  )
}

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const monthShort = (iso: string) => MESI[Number(iso.slice(5, 7)) - 1] ?? ''
