import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'

/**
 * Il pannello che sale dal basso: lo usiamo per tutti i form.
 * Su telefono è molto più comodo di una finestra al centro, perché
 * resta a portata di pollice.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  // Con il pannello aperto la pagina sotto non deve scorrere.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Chiudi"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            // Trascinare giù di slancio chiude il pannello, come nelle app native.
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) onClose()
            }}
            className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-[28px] bg-cream shadow-lift"
          >
            <div className="shrink-0 px-5 pb-2 pt-3">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-black/15" />
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Chiudi"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-lg leading-none text-muted active:scale-90"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">{children}</div>

            {footer && (
              <div
                className="shrink-0 border-t border-black/5 bg-cream/95 px-5 pt-3 backdrop-blur"
                style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/** Conferma distruttiva, con il testo giusto già dentro. */
export function ConfirmButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm(`${label}?\nQuesta azione non si può annullare.`)) onConfirm()
      }}
      className="btn w-full bg-red-50 text-red-700 border border-red-200"
    >
      🗑️ {label}
    </button>
  )
}
