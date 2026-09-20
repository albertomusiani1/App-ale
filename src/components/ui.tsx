import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { colorOf } from '../lib/colors'
import type { ColorKey, ItemStatus } from '../types'

/**
 * Etichetta + campo. Da usare quando dentro c'è UN solo controllo di modulo:
 * il <label> lo avvolge, così toccando la scritta si apre il campo.
 */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

/**
 * La stessa cosa, ma per un gruppo di pulsanti (colori, emoji, stato, voti).
 *
 * Un <label> che avvolge più pulsanti si "attacca" al primo: chi usa un lettore
 * di schermo si sente leggere "Che posto è Pizzeria Bar Gelateria..." al posto
 * di "Ristorante". Qui usiamo un gruppo dichiarato come si deve.
 */
export function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={id} className="block">
      <span id={id} className="label">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`field min-h-[96px] resize-y ${props.className ?? ''}`} />
}

/** Il titolo grande in cima a ogni schermata, colorato come la sua categoria. */
export function PageTitle({
  emoji,
  title,
  subtitle,
  color,
  action,
}: {
  emoji: string
  title: string
  subtitle?: string
  color: ColorKey
  action?: ReactNode
}) {
  const c = colorOf(color)
  return (
    <header className="mb-5 flex items-start gap-3">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-soft"
        style={{ background: c.soft }}
        aria-hidden
      >
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold leading-tight" style={{ color: c.ink }}>
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export const STATUS_LABEL: Record<ItemStatus, string> = {
  wish: 'Da fare',
  planned: 'In programma',
  done: 'Fatto',
}

export function StatusPill({ status, color }: { status: ItemStatus; color: ColorKey }) {
  const c = colorOf(color)
  const filled = status === 'done'
  return (
    <span
      className="pill"
      style={
        filled
          ? { background: c.hex, color: '#fff' }
          : { background: c.soft, color: c.ink, opacity: status === 'wish' ? 0.85 : 1 }
      }
    >
      {status === 'done' ? '✓' : status === 'planned' ? '📌' : '✨'} {STATUS_LABEL[status]}
    </span>
  )
}

/** Selettore a tre stati: da fare / in programma / fatto. */
export function StatusPicker({
  value,
  onChange,
  color,
}: {
  value: ItemStatus
  onChange: (s: ItemStatus) => void
  color: ColorKey
}) {
  const c = colorOf(color)
  const options: ItemStatus[] = ['wish', 'planned', 'done']
  return (
    <div className="flex gap-2">
      {options.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="flex-1 rounded-2xl border px-2 py-2.5 text-sm font-semibold transition active:scale-95"
          style={
            value === s
              ? { background: c.hex, color: '#fff', borderColor: c.hex }
              : { background: '#fff', color: c.ink, borderColor: 'rgba(0,0,0,0.08)' }
          }
        >
          {STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  )
}

/** Voto da 1 a 5 cuori. `readOnly` per mostrarlo senza poterlo cambiare. */
export function Hearts({
  value,
  onChange,
  label,
}: {
  value: number | null
  onChange?: (v: number | null) => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-1">
      {label && <span className="mr-1 text-xs font-semibold text-muted">{label}</span>}
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          aria-label={`${n} cuori`}
          // Ritoccare lo stesso voto lo azzera: comodo per correggersi.
          onClick={() => onChange?.(value === n ? null : n)}
          className={`text-lg leading-none transition ${onChange ? 'active:scale-125' : ''}`}
          style={{ opacity: value !== null && n <= value ? 1 : 0.22 }}
        >
          ❤️
        </button>
      ))}
    </div>
  )
}

export function Empty({ emoji, title, hint }: { emoji: string; title: string; hint?: string }) {
  return (
    <div className="card mt-6 px-6 py-12 text-center">
      <div className="mb-3 text-5xl" aria-hidden>
        {emoji}
      </div>
      <p className="font-display text-lg font-bold">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{hint}</p>}
    </div>
  )
}

/** Barra di avanzamento colorata, usata dagli achievement. */
export function Progress({ value, color }: { value: number; color: ColorKey }) {
  const c = colorOf(color)
  return (
    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: c.soft }}>
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, background: c.hex }}
      />
    </div>
  )
}
