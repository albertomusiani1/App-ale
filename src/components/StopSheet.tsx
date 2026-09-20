import { useEffect, useState } from 'react'
import { useApp } from '../store/AppStore'
import { randomId } from '../lib/image'
import { colorOf } from '../lib/colors'
import type { ColorKey, Stop } from '../types'
import { ConfirmButton, Sheet } from './Sheet'
import { Field, Input, TextArea } from './ui'

const blankStop = (itemId: string, position: number): Stop => ({
  id: randomId(),
  itemId,
  name: '',
  days: 2,
  notes: '',
  position,
})

/**
 * Il form di una tappa. Il numero di giorni non è solo un'informazione:
 * genera (o rimuove) le schede giorno per giorno della tappa.
 */
export function StopSheet({
  open,
  onClose,
  itemId,
  stop,
  position,
  color,
}: {
  open: boolean
  onClose: () => void
  itemId: string
  stop?: Stop | null
  position: number
  color: ColorKey
}) {
  const { saveStop, deleteStop } = useApp()
  const [draft, setDraft] = useState<Stop>(() => stop ?? blankStop(itemId, position))
  const c = colorOf(color)

  useEffect(() => {
    if (open) setDraft(stop ?? blankStop(itemId, position))
  }, [open, stop, itemId, position])

  const set = <K extends keyof Stop>(k: K, v: Stop[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const canSave = draft.name.trim().length > 0

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={stop ? 'Modifica tappa' : 'Nuova tappa'}
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">
            Annulla
          </button>
          <button
            onClick={() => {
              void saveStop({ ...draft, name: draft.name.trim() })
              onClose()
            }}
            disabled={!canSave}
            className="btn flex-[2] text-white shadow-lift"
            style={{ background: c.hex }}
          >
            {stop ? 'Salva' : 'Aggiungi'}
          </button>
        </div>
      }
    >
      <Field label="Dove">
        <Input
          value={draft.name}
          autoFocus={!stop}
          placeholder="Kyoto, Lisbona, Tromsø..."
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>

      <Field label="Quanti giorni ci stiamo" hint="Per ogni giorno avrai una scheda da riempire.">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Un giorno in meno"
            onClick={() => set('days', Math.max(1, draft.days - 1))}
            className="h-12 w-12 rounded-2xl bg-white text-2xl shadow-soft active:scale-90"
          >
            −
          </button>
          <span className="flex-1 text-center font-display text-2xl font-bold">
            {draft.days} {draft.days === 1 ? 'giorno' : 'giorni'}
          </span>
          <button
            type="button"
            aria-label="Un giorno in più"
            onClick={() => set('days', Math.min(60, draft.days + 1))}
            className="h-12 w-12 rounded-2xl bg-white text-2xl shadow-soft active:scale-90"
          >
            +
          </button>
        </div>
      </Field>

      <Field label="Note sulla tappa">
        <TextArea
          value={draft.notes}
          placeholder="Dove dormiamo, come ci arriviamo, cosa non perdersi..."
          onChange={(e) => set('notes', e.target.value)}
        />
      </Field>

      {stop && (
        <ConfirmButton
          label="Elimina tappa"
          onConfirm={() => {
            void deleteStop(draft.id)
            onClose()
          }}
        />
      )}
    </Sheet>
  )
}
