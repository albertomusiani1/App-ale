import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { longDate } from '../lib/dates'
import { Glitter } from './Magic'

/**
 * Quando un impegno con "esame" nel titolo è passato, l'app chiede com'è
 * andata: da lì nasce il traguardo Genietto.
 *
 * Si può sempre rimandare di tre giorni — capita di non avere ancora il voto,
 * e non deve diventare un pop-up che tormenta.
 */
export function ExamPrompt() {
  const { pendingExam, answerExam, snoozeExam, celebration, t } = useApp()
  const c = colorOf('agenda')

  // Una celebrazione in corso ha la precedenza: non le ci mettiamo davanti.
  const show = pendingExam && !celebration

  return (
    <AnimatePresence>
      {show && pendingExam && (
        <div className="fixed inset-0 z-[52] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.86, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 240 }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-cream p-6 text-center shadow-lift"
          >
            <Glitter count={10} seed={3} />
            <div className="relative">
              <div className="mb-2 text-6xl" aria-hidden>
                🎓
              </div>
              <h2 className="font-display text-2xl font-bold leading-tight">
                {t('exam.question')}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {pendingExam.title} · {longDate(pendingExam.date)}
              </p>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => void answerExam(pendingExam.id, 'passed')}
                  className="btn w-full shadow-lift"
                  style={{ background: c.hex, color: c.on }}
                >
                  {t('exam.yes')}
                </button>
                <button
                  onClick={() => void answerExam(pendingExam.id, 'failed')}
                  className="btn-ghost w-full"
                >
                  {t('exam.no')}
                </button>
                <button
                  onClick={() => void snoozeExam(pendingExam.id)}
                  className="w-full py-2 text-sm font-semibold text-muted underline"
                >
                  {t('exam.later')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
