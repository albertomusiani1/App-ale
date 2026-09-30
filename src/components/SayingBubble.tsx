import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useApp } from '../store/AppStore'

/**
 * L'evento con cui le Impostazioni possono far comparire una bollicina
 * all'istante, senza aspettare il timer: serve a verificare che funzioni.
 */
export const MOSTRA_MODO_DI_DIRE = 'lovidovi:modo-di-dire'

/**
 * Ogni tanto spunta in basso uno dei nostri modi di dire, così non finiscono
 * dimenticati. La frequenza si regola dalle Impostazioni (0 = mai).
 */
export function SayingBubble() {
  const { data, t } = useApp()
  const [index, setIndex] = useState<number | null>(null)
  const { sayings, settings } = data

  useEffect(() => {
    if (sayings.length === 0) {
      setIndex(null)
      return
    }

    let attesa = 0
    let ripetizione = 0
    let sparizione = 0

    const mostra = () => {
      setIndex(Math.floor(Math.random() * sayings.length))
      // Resta a galla qualche secondo e poi se ne va da sola.
      window.clearTimeout(sparizione)
      sparizione = window.setTimeout(() => setIndex(null), 7000)
    }

    /**
     * Fa ripartire il conto alla rovescia dall'inizio.
     *
     * Il primo arriva fra i 25 e i 30 secondi: abbastanza per non
     * sovrapporsi al caricamento, abbastanza poco da farsi notare. Da lì in
     * poi comanda il tempo scelto nelle impostazioni.
     */
    const riparti = () => {
      window.clearTimeout(attesa)
      window.clearInterval(ripetizione)
      if (settings.sayingFrequency <= 0) return
      attesa = window.setTimeout(
        () => {
          mostra()
          ripetizione = window.setInterval(mostra, settings.sayingFrequency * 60_000)
        },
        25_000 + Math.random() * 5_000,
      )
    }

    riparti()

    /**
     * Sul telefono i timer si fermano appena l'app finisce in secondo piano,
     * e chi apre l'app per venti secondi e poi blocca lo schermo non vedrebbe
     * mai niente. Quindi il conto riparte ogni volta che l'app torna davanti:
     * "venticinque secondi dall'apertura" diventa vero sul serio.
     */
    const alRitorno = () => {
      if (document.visibilityState === 'visible') riparti()
    }
    document.addEventListener('visibilitychange', alRitorno)
    window.addEventListener('focus', alRitorno)
    window.addEventListener(MOSTRA_MODO_DI_DIRE, mostra)

    return () => {
      window.clearTimeout(attesa)
      window.clearInterval(ripetizione)
      window.clearTimeout(sparizione)
      document.removeEventListener('visibilitychange', alRitorno)
      window.removeEventListener('focus', alRitorno)
      window.removeEventListener(MOSTRA_MODO_DI_DIRE, mostra)
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
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-[#7A5600]">
            {t('saying.eyebrow')}
          </span>
          <p className="font-display text-lg font-semibold leading-snug">"{saying.text}"</p>
          {saying.meaning && <p className="mt-1 text-sm text-muted">{saying.meaning}</p>}
          <p className="mt-1.5 text-xs font-semibold text-muted">— {who}</p>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
