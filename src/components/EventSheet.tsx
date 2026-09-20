import { useEffect, useState } from 'react'
import { useApp } from '../store/AppStore'
import { randomId } from '../lib/image'
import { COLOR_KEYS, colorOf } from '../lib/colors'
import { todayISO } from '../lib/dates'
import type { CalEvent } from '../types'
import { ConfirmButton, Sheet } from './Sheet'
import { Field, FieldGroup, Input, TextArea } from './ui'

const blankEvent = (date: string): CalEvent => ({
  id: randomId(),
  title: '',
  date,
  endDate: null,
  time: null,
  notes: '',
  color: 'agenda',
  createdAt: new Date().toISOString(),
})

/** Il form degli impegni scritti a mano sul calendario. */
export function EventSheet({
  open,
  onClose,
  event,
  defaultDate,
}: {
  open: boolean
  onClose: () => void
  event?: CalEvent | null
  defaultDate?: string
}) {
  const { saveEvent, deleteEvent } = useApp()
  const [draft, setDraft] = useState<CalEvent>(() => event ?? blankEvent(defaultDate ?? todayISO()))

  useEffect(() => {
    if (open) setDraft(event ?? blankEvent(defaultDate ?? todayISO()))
  }, [open, event, defaultDate])

  const set = <K extends keyof CalEvent>(k: K, v: CalEvent[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const canSave = draft.title.trim().length > 0 && Boolean(draft.date)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={event ? 'Modifica impegno' : 'Nuovo impegno'}
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">
            Annulla
          </button>
          <button
            onClick={() => {
              void saveEvent({ ...draft, title: draft.title.trim() })
              onClose()
            }}
            disabled={!canSave}
            className="btn-primary flex-[2]"
          >
            {event ? 'Salva' : 'Aggiungi'}
          </button>
        </div>
      }
    >
      <Field label="Cosa">
        <Input
          value={draft.title}
          autoFocus={!event}
          placeholder="Cena con i suoi, visita, compleanno..."
          onChange={(e) => set('title', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Quando">
          <Input type="date" value={draft.date} onChange={(e) => set('date', e.target.value)} />
        </Field>
        <Field label="Ora">
          <Input
            type="time"
            value={draft.time ?? ''}
            onChange={(e) => set('time', e.target.value || null)}
          />
        </Field>
      </div>

      <Field label="Fino a" hint="Lascialo vuoto se dura un giorno solo.">
        <Input
          type="date"
          value={draft.endDate ?? ''}
          min={draft.date}
          onChange={(e) => set('endDate', e.target.value || null)}
        />
      </Field>

      <FieldGroup label="Colore">
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

      <Field label="Note">
        <TextArea value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      {event && (
        <ConfirmButton
          label="Elimina impegno"
          onConfirm={() => {
            void deleteEvent(draft.id)
            onClose()
          }}
        />
      )}
    </Sheet>
  )
}
