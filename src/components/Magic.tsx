import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PALETTE } from '../lib/colors'

/** Numeri pseudo-casuali ma stabili fra un render e l'altro. */
function useRandoms(count: number, seed = 0) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Piccolo generatore deterministico: evita che ogni render "salti".
        const x = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453
        return x - Math.floor(x)
      }),
    [count, seed],
  )
}

const HEART_CHARS = ['💗', '💖', '💕', '💞', '✨', '⭐️', '🌟', '💫']

/**
 * Strato di cuori e stelline che salgono e svaniscono.
 * Decorativo e basta: non intercetta i tocchi.
 */
export function FloatingHearts({ count = 14, seed = 0 }: { count?: number; seed?: number }) {
  const r = useRandoms(count * 3, seed)
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute bottom-0 animate-float-up select-none"
          style={{
            left: `${r[i] * 100}%`,
            fontSize: `${12 + r[i + count] * 18}px`,
            animationDelay: `${r[i + count * 2] * 3}s`,
            animationDuration: `${2.6 + r[i] * 2.4}s`,
          }}
        >
          {HEART_CHARS[Math.floor(r[i + count] * HEART_CHARS.length)]}
        </span>
      ))}
    </div>
  )
}

/** Puntini luminosi che pulsano, come glitter sparso sulla pagina. */
export function Glitter({ count = 22, seed = 3 }: { count?: number; seed?: number }) {
  const r = useRandoms(count * 3, seed)
  const colors = [PALETTE.goals.hex, PALETTE.agenda.hex, '#FFFFFF', PALETTE.screen.hex]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-twinkle rounded-full"
          style={{
            left: `${r[i] * 100}%`,
            top: `${r[i + count] * 100}%`,
            width: `${2 + r[i + count * 2] * 4}px`,
            height: `${2 + r[i + count * 2] * 4}px`,
            background: colors[i % colors.length],
            animationDelay: `${r[i] * 2.4}s`,
            boxShadow: `0 0 6px ${colors[i % colors.length]}`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Coriandoli che cadono dall'alto. Si spengono da soli dopo qualche secondo,
 * così non restano a girare a vuoto consumando batteria.
 */
export function Confetti({ pieces = 70, duration = 4200 }: { pieces?: number; duration?: number }) {
  const [alive, setAlive] = useState(true)
  const r = useRandoms(pieces * 4, 7)
  const colors = [
    PALETTE.agenda.hex,
    PALETTE.goals.hex,
    PALETTE.screen.hex,
    PALETTE.trips.hex,
    PALETTE.outings.hex,
    '#FFFFFF',
  ]

  useEffect(() => {
    const t = setTimeout(() => setAlive(false), duration)
    return () => clearTimeout(t)
  }, [duration])

  if (!alive) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {Array.from({ length: pieces }).map((_, i) => {
        const isHeart = r[i + pieces * 3] > 0.78
        return (
          <motion.span
            key={i}
            initial={{ y: -40, x: 0, rotate: 0, opacity: 1 }}
            animate={{
              y: '110vh',
              x: (r[i + pieces] - 0.5) * 180,
              rotate: (r[i] - 0.5) * 1080,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 2.4 + r[i + pieces * 2] * 2,
              delay: r[i] * 1.2,
              ease: 'easeIn',
            }}
            className="absolute top-0 select-none"
            style={{ left: `${r[i] * 100}%`, fontSize: isHeart ? 18 : undefined }}
          >
            {isHeart ? (
              '💗'
            ) : (
              <span
                className="block"
                style={{
                  width: 8,
                  height: 12,
                  borderRadius: 2,
                  background: colors[i % colors.length],
                }}
              />
            )}
          </motion.span>
        )
      })}
    </div>
  )
}

/** Un cuore che pulsa, usato come decorazione di appoggio. */
export function PulsingHeart({ size = 64 }: { size?: number }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.12, 1] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ fontSize: size, lineHeight: 1 }}
      aria-hidden
    >
      💗
    </motion.div>
  )
}
