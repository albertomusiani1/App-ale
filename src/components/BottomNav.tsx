import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { colorOf } from '../lib/colors'
import { CAT } from '../lib/seed'
import type { ColorKey } from '../types'

interface Tab {
  to: string
  label: string
  emoji: string
  color: ColorKey
}

/**
 * Quattro voci fisse più il ＋ al centro.
 * "Tutte" apre la griglia con ogni categoria, comprese quelle che create voi:
 * così la barra resta leggibile anche quando le categorie diventano dieci.
 */
const TABS: Tab[] = [
  { to: '/', label: 'Calendario', emoji: '📅', color: 'agenda' },
  { to: `/c/${CAT.trips}`, label: 'Viaggi', emoji: '✈️', color: 'trips' },
  { to: `/c/${CAT.places}`, label: 'Ristoranti', emoji: '🍝', color: 'places' },
  { to: '/tutte', label: 'Tutte', emoji: '🗂️', color: 'custom' },
]

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-cream/90 backdrop-blur-xl"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      aria-label="Navigazione principale"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end px-2 pb-1 pt-2">
        {TABS.slice(0, 2).map((tab) => (
          <TabButton key={tab.to} tab={tab} active={isActive(pathname, tab.to)} />
        ))}

        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onAdd}
            aria-label="Aggiungi qualcosa"
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-cat-agenda text-3xl font-light text-white shadow-lift ring-4 ring-cream"
          >
            <span className="-mt-0.5" aria-hidden>
              +
            </span>
          </motion.button>
        </div>

        {TABS.slice(2).map((tab) => (
          <TabButton key={tab.to} tab={tab} active={isActive(pathname, tab.to)} />
        ))}
      </div>
    </nav>
  )
}

/** Il calendario è attivo solo sulla radice; le altre voci anche sulle sottopagine. */
function isActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname.startsWith(to)
}

function TabButton({ tab, active }: { tab: Tab; active: boolean }) {
  const c = colorOf(tab.color)
  return (
    <NavLink
      to={tab.to}
      className="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 transition active:scale-90"
      style={{ color: active ? c.ink : undefined }}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-xl text-lg transition"
        style={{ background: active ? c.soft : 'transparent' }}
        aria-hidden
      >
        {tab.emoji}
      </span>
      <span className={`text-[10px] font-semibold ${active ? '' : 'text-muted'}`}>{tab.label}</span>
    </NavLink>
  )
}
