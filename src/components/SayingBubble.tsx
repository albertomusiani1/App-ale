import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useApp } from '../store/AppStore'

/**
 * Ogni tanto spunta in basso uno dei vostri modi di dire, così non finiscono
 * dimenticati. La frequenza si regola dalle Impostazioni (0 = mai).
 */
export function SayingBubble() {
  const { data } = useApp()
  const [index, setIndex] = useState<number | null>(null)
  const { sayings, settings } = data

  useEffect(() => {
    if (settings.sayingFrequency <= 0 || sayings.length === 0) {
      setIndex(null)
      return
    }
    const everyMs = settings.sayingFrequency * 60_000
    const show = () => {
      setIndex(Math.floor(Math.random() * sayings.length))
      // Resta a galla qualche secondo e poi se ne va da sola.
      window.setTimeout(() => setIndex(null), 7000)
    }
    // Il primo passa dopo un minuto, per non aggredire chi ha appena aperto l'app.
    const first = window.setTimeout(show, Math.min(60_000, everyMs))
    const timer = window.setInterval(show, everyMs)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [settings.sayingFrequency, sayings.length])

  const saying = index !== null ? sayings[index] : null
  const who =
    saying?.author === 'a' ? settings.nameA : saying?.author === 'b' ? settings.nameB : 'Noi due'

  return (
    <AnimatePresence>
      {saying && (
        <motion.button
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          onClick={() => setIndex(null)}
          className="fixed inset-x-4 z-40 mx-auto max-w-sm rounded-3xl bg-white px-5 py-4 text-left shadow-lift ring-1 ring-black/5"
          style={{ bottom: 'calc(96px + var(--safe-bottom))' }}
        >
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-cat-agenda">
            🗯️ Come diciamo noi
          </span>
          <p className="font-display text-lg font-semibold leading-snug">"{saying.text}"</p>
          {saying.meaning && <p className="mt-1 text-sm text-muted">{saying.meaning}</p>}
          <p className="mt-1.5 text-xs font-semibold text-muted">— {who}</p>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
