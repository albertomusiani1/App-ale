import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { Confetti, FloatingHearts, Glitter } from './Magic'

/**
 * Il pop-up delle grandi occasioni: anniversari, achievement sbloccati,
 * traguardi. Compare al centro con coriandoli, la frase del momento e,
 * se ne avete caricata una, una foto dalla galleria delle impostazioni.
 */
export function CelebrationOverlay() {
  const { celebration, dismissCelebration, data, t } = useApp()
  const reduced = data.settings.reducedMotion
  const c = celebration ? colorOf(celebration.color) : colorOf('goals')

  return (
    <AnimatePresence>
      {celebration && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-5">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissCelebration}
            aria-label="Chiudi"
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
          />

          {!reduced && <Confetti />}

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 18, stiffness: 240 }}
            className="relative z-[65] w-full max-w-sm overflow-hidden rounded-[32px] bg-cream p-6 text-center shadow-lift"
            role="dialog"
            aria-modal="true"
          >
            {!reduced && <Glitter count={18} />}
            {!reduced && <FloatingHearts count={10} />}

            <div className="relative">
              {celebration.photoUrl ? (
                <img
                  src={celebration.photoUrl}
                  alt=""
                  className="mx-auto mb-4 h-40 w-40 rounded-full object-cover shadow-lift ring-4 ring-white"
                />
              ) : (
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-3 text-7xl"
                  aria-hidden
                >
                  {celebration.emoji}
                </motion.div>
              )}

              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: c.hex }}>
                {t('celebration.eyebrow')}
              </p>
              <h2 className="font-display text-3xl font-bold leading-tight shimmer-text">
                {celebration.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{celebration.subtitle}</p>

              {celebration.quote && (
                <blockquote className="mt-5 rounded-2xl bg-white/80 px-4 py-4 shadow-soft">
                  <p className="font-display text-lg italic leading-snug">"{celebration.quote.text}"</p>
                  {(celebration.quote.song || celebration.quote.era) && (
                    <footer className="mt-2 text-xs font-semibold text-muted">
                      {[celebration.quote.song, celebration.quote.era].filter(Boolean).join(' · ')}
                    </footer>
                  )}
                </blockquote>
              )}

              <button onClick={dismissCelebration} className="btn-primary mt-6 w-full">
                {t('celebration.button')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
