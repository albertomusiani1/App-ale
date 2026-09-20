import { useEffect, useState } from 'react'
import { useApp } from '../store/AppStore'
import { randomId } from '../lib/image'
import { COLOR_KEYS, colorOf } from '../lib/colors'
import { KIND_COPY } from '../lib/kinds'
import type { Category, CategoryKind } from '../types'
import { ConfirmButton, Sheet } from './Sheet'
import { Field, FieldGroup, Input } from './ui'

const EMOJI_CHOICES = ['🎡', '🎬', '🎁', '🏔️', '🎵', '🐾', '🍳', '📚', '🏖️', '🎮', '💐', '🧗', '🛍️', '🎯']

const blankCategory = (sort: number): Category => ({
  id: randomId(),
  name: '',
  emoji: '🎁',
  color: 'custom',
  kind: 'generic',
  builtin: false,
  sort,
})

/** Le categorie che aggiungete voi con il ＋ al centro della barra. */
export function CategorySheet({
  open,
  onClose,
  category,
}: {
  open: boolean
  onClose: () => void
  category?: Category | null
}) {
  const { data, saveCategory, deleteCategory } = useApp()
  const [draft, setDraft] = useState<Category>(() => category ?? blankCategory(data.categories.length))

  useEffect(() => {
    if (open) setDraft(category ?? blankCategory(data.categories.length))
  }, [open, category, data.categories.length])

  const set = <K extends keyof Category>(k: K, v: Category[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const canSave = draft.name.trim().length > 0
  // Il tipo decide la schermata: cambiarlo su una categoria piena confonderebbe.
  const kindLocked = Boolean(category)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={category ? 'Modifica categoria' : 'Nuova categoria'}
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">
            Annulla
          </button>
          <button
            onClick={() => {
              void saveCategory({ ...draft, name: draft.name.trim() })
              onClose()
            }}
            disabled={!canSave}
            className="btn flex-[2] text-white shadow-lift"
            style={{ background: colorOf(draft.color).hex }}
          >
            {category ? 'Salva' : 'Crea'}
          </button>
        </div>
      }
    >
      <Field label="Nome">
        <Input
          value={draft.name}
          autoFocus={!category}
          placeholder="Concerti, regali, ricette..."
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>

      <FieldGroup label="Icona">
        <div className="flex flex-wrap gap-2">
          {EMOJI_CHOICES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => set('emoji', e)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition active:scale-90"
              style={{
                background: draft.emoji === e ? colorOf(draft.color).soft : '#fff',
                border: `1px solid ${draft.emoji === e ? colorOf(draft.color).hex : 'rgba(0,0,0,0.08)'}`,
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Colore" hint="Serve a riconoscere la categoria al volo sul calendario.">
        <div className="flex flex-wrap gap-2">
          {COLOR_KEYS.map((key) => {
            const c = colorOf(key)
            return (
              <button
                key={key}
                type="button"
                aria-label={c.label}
                onClick={() => set('color', key)}
                className="h-10 w-10 rounded-full transition active:scale-90"
                style={{
                  background: c.hex,
                  outline: draft.color === key ? `3px solid ${c.hex}` : 'none',
                  outlineOffset: 3,
                }}
              />
            )
          })}
        </div>
      </FieldGroup>

      {!kindLocked && (
        <FieldGroup label="Come funziona" hint="Decide che schermata avrà la categoria.">
          <div className="space-y-2">
            {(Object.keys(KIND_COPY) as CategoryKind[])
              .filter((k) => k !== 'goals')
              .map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => set('kind', k)}
                  className="w-full rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98]"
                  style={{
                    borderColor: draft.kind === k ? colorOf(draft.color).hex : 'rgba(0,0,0,0.08)',
                    background: draft.kind === k ? colorOf(draft.color).soft : '#fff',
                  }}
                >
                  <span className="block text-sm font-bold">{KIND_LABEL[k]}</span>
                  <span className="block text-xs text-muted">{KIND_HINT[k]}</span>
                </button>
              ))}
          </div>
        </FieldGroup>
      )}

      {category && !category.builtin && (
        <ConfirmButton
          label="Elimina categoria e tutto il suo contenuto"
          onConfirm={() => {
            void deleteCategory(draft.id)
            onClose()
          }}
        />
      )}
      {category?.builtin && (
        <p className="text-center text-xs text-muted">
          Questa è una delle categorie di partenza: puoi cambiarle nome, icona e colore, ma non eliminarla.
        </p>
      )}
    </Sheet>
  )
}

const KIND_LABEL: Record<CategoryKind, string> = {
  trips: 'Come i viaggi',
  places: 'Come i ristoranti',
  screen: 'Come film e serie',
  generic: 'Lista semplice',
  goals: 'Achievement',
}

const KIND_HINT: Record<CategoryKind, string> = {
  trips: 'Con tappe, giorni e foto per ogni giornata.',
  places: 'Provati e da provare, con tipo di locale e voti.',
  screen: 'Da vedere e visti, con film o serie e voti.',
  generic: 'Da fare e fatte, con date, note, voti e foto.',
  goals: 'Traguardi da sbloccare.',
}
