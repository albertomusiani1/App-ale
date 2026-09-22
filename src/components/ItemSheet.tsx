import { useEffect, useState } from 'react'
import { useApp } from '../store/AppStore'
import { randomId } from '../lib/image'
import { copyFor } from '../lib/kinds'
import { colorOf } from '../lib/colors'
import type { Category, Item } from '../types'
import { Sheet, ConfirmButton } from './Sheet'
import { PlacePicker } from './PlacePicker'
import { Field, FieldGroup, Hearts, Input, StatusPicker, TextArea } from './ui'

const blankItem = (categoryId: string): Item => ({
  id: randomId(),
  categoryId,
  title: '',
  subtitle: '',
  status: 'wish',
  startDate: null,
  endDate: null,
  notes: '',
  ratingA: null,
  ratingB: null,
  meta: {},
  coverPhotoId: null,
  lat: null,
  lng: null,
  visits: 0,
  createdAt: new Date().toISOString(),
})

/**
 * Un unico form per viaggi, posti, uscite, film e categorie personalizzate:
 * cambiano solo le etichette (vedi lib/kinds.ts) e qualche campo extra.
 */
export function ItemSheet({
  open,
  onClose,
  category,
  item,
  onSaved,
  onDeleted,
}: {
  open: boolean
  onClose: () => void
  category: Category
  /** Se assente si sta creando un nuovo elemento. */
  item?: Item | null
  onSaved?: (item: Item) => void
  /** Chiamata dopo un'eliminazione: chi ci chiama decide dove tornare. */
  onDeleted?: () => void
}) {
  const { data, saveItem, deleteItem } = useApp()
  const copy = copyFor(category.kind)
  const c = colorOf(category.color)
  const [draft, setDraft] = useState<Item>(() => item ?? blankItem(category.id))

  // Riapre sempre pulito: senza questo il form resterebbe sull'elemento precedente.
  useEffect(() => {
    if (open) setDraft(item ?? blankItem(category.id))
  }, [open, item, category.id])

  const set = <K extends keyof Item>(key: K, value: Item[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const isNew = !item
  const canSave = draft.title.trim().length > 0

  async function handleSave() {
    if (!canSave) return
    const clean: Item = { ...draft, title: draft.title.trim(), subtitle: draft.subtitle.trim() }
    await saveItem(clean)
    onSaved?.(clean)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isNew ? `Nuovo ${copy.one}` : `Modifica ${copy.one}`}
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">
            Annulla
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={!canSave}
            className="btn flex-[2] shadow-lift"
            style={{ background: c.hex, color: c.on }}
          >
            {isNew ? 'Crea' : 'Salva'}
          </button>
        </div>
      }
    >
      <Field label={copy.titleLabel}>
        <Input
          value={draft.title}
          autoFocus={isNew}
          placeholder={copy.titlePlaceholder}
          onChange={(e) => set('title', e.target.value)}
        />
      </Field>

      {copy.subtitleLabel && (
        <Field label={copy.subtitleLabel}>
          <Input
            value={draft.subtitle}
            placeholder={copy.subtitlePlaceholder}
            onChange={(e) => set('subtitle', e.target.value)}
          />
        </Field>
      )}

      <PlacePicker
        lat={draft.lat}
        lng={draft.lng}
        color={category.color}
        hint={`Con una posizione, questo ${copy.one} compare sulla mappa.`}
        onChange={(lat, lng, name) =>
          setDraft((d) => ({
            // Il nome trovato dalla ricerca riempie il titolo solo se è ancora vuoto:
            // non deve sovrascrivere quello che avete scritto voi.
            ...d,
            lat,
            lng,
            title: d.title.trim() ? d.title : (name ?? d.title),
          }))
        }
      />

      {copy.types && (
        <FieldGroup label={copy.typeLabel ?? 'Tipo'}>
          <div className="flex flex-wrap gap-2">
            {copy.types.map((t) => {
              const active = (draft.meta.type ?? '') === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('meta', { ...draft.meta, type: active ? '' : t })}
                  className="rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95"
                  style={
                    active
                      ? { background: c.hex, color: c.on }
                      : { background: '#fff', color: c.ink, border: '1px solid rgba(0,0,0,0.08)' }
                  }
                >
                  {t}
                </button>
              )
            })}
          </div>
        </FieldGroup>
      )}

      {copy.cuisines && (
        <FieldGroup
          label="Che cucina"
          hint="Il primo giapponese provato sblocca un traguardo 🍣"
        >
          <div className="flex flex-wrap gap-2">
            {copy.cuisines.map((k) => {
              const active = (draft.meta.cuisine ?? '') === k
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => set('meta', { ...draft.meta, cuisine: active ? '' : k })}
                  className="rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95"
                  style={
                    active
                      ? { background: c.hex, color: c.on }
                      : { background: '#fff', color: c.ink, border: '1px solid rgba(0,0,0,0.08)' }
                  }
                >
                  {k}
                </button>
              )
            })}
          </div>
        </FieldGroup>
      )}

      <FieldGroup label="A che punto siamo">
        <StatusPicker value={draft.status} onChange={(s) => set('status', s)} color={category.color} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <Field label={category.kind === 'trips' ? 'Partenza' : 'Data'}>
          <Input
            type="date"
            value={draft.startDate ?? ''}
            onChange={(e) => set('startDate', e.target.value || null)}
          />
        </Field>
        <Field label={category.kind === 'trips' ? 'Ritorno' : 'Fine (se dura più giorni)'}>
          <Input
            type="date"
            value={draft.endDate ?? ''}
            min={draft.startDate ?? undefined}
            onChange={(e) => set('endDate', e.target.value || null)}
          />
        </Field>
      </div>
      <p className="-mt-1 text-xs text-muted">
        📅 Con una data compilata questo {copy.one} finisce da solo sul calendario.
      </p>

      <Field label={copy.notesLabel}>
        <TextArea
          value={draft.notes}
          placeholder={copy.notesPlaceholder}
          onChange={(e) => set('notes', e.target.value)}
        />
      </Field>

      {copy.rated && draft.status === 'done' && (
        <FieldGroup label="I vostri voti">
          <div className="space-y-2 rounded-2xl bg-white px-4 py-3 shadow-soft">
            <Hearts label={data.settings.nameA} value={draft.ratingA} onChange={(v) => set('ratingA', v)} />
            <Hearts label={data.settings.nameB} value={draft.ratingB} onChange={(v) => set('ratingB', v)} />
          </div>
        </FieldGroup>
      )}

      {!isNew && (
        <ConfirmButton
          label={`Elimina ${copy.one}`}
          onConfirm={() => {
            void deleteItem(draft.id)
            onClose()
            onDeleted?.()
          }}
        />
      )}
    </Sheet>
  )
}
