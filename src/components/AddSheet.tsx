import { useState } from 'react'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { copyFor } from '../lib/kinds'
import type { Category } from '../types'
import { Sheet } from './Sheet'
import { EventSheet } from './EventSheet'
import { ItemSheet } from './ItemSheet'
import { CategorySheet } from './CategorySheet'

/**
 * Il menù del ＋ al centro della barra: da qui si aggiunge qualsiasi cosa,
 * compresa una categoria nuova di zecca.
 */
export function AddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, t } = useApp()
  const [eventOpen, setEventOpen] = useState(false)
  const [newCategoryOpen, setNewCategoryOpen] = useState(false)
  const [target, setTarget] = useState<Category | null>(null)

  const categories = [...data.categories].sort((a, b) => a.sort - b.sort)

  return (
    <>
      <Sheet open={open} onClose={onClose} title={t('add.title')}>
        <button
          onClick={() => {
            onClose()
            setEventOpen(true)
          }}
          className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left shadow-soft transition active:scale-[0.98]"
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
            style={{ background: colorOf('agenda').soft }}
            aria-hidden
          >
            📅
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">{t('add.event')}</span>
            <span className="block text-sm text-muted">{t('add.eventHint')}</span>
          </span>
          <span className="text-muted" aria-hidden>
            ›
          </span>
        </button>

        <div className="pt-1">
          <p className="label">Nelle vostre categorie</p>
          <div className="space-y-2">
            {categories.map((category) => {
              const c = colorOf(category.color)
              const copy = copyFor(category.kind)
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    onClose()
                    setTarget(category)
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-soft transition active:scale-[0.98]"
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                    style={{ background: c.soft }}
                    aria-hidden
                  >
                    {category.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{category.name}</span>
                    <span className="block text-sm text-muted">
                      Aggiungi un {copy.one}
                    </span>
                  </span>
                  <span className="text-muted" aria-hidden>
                    ›
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => {
            onClose()
            setNewCategoryOpen(true)
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/10 px-4 py-4 font-semibold text-muted transition active:scale-[0.98]"
        >
          ＋ Crea una nuova categoria
        </button>
      </Sheet>

      <EventSheet open={eventOpen} onClose={() => setEventOpen(false)} />
      <CategorySheet open={newCategoryOpen} onClose={() => setNewCategoryOpen(false)} />
      {target && (
        <ItemSheet
          open={Boolean(target)}
          onClose={() => setTarget(null)}
          category={target}
        />
      )}
    </>
  )
}
