import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { useAuth } from '../store/AuthContext'
import { randomId } from '../lib/image'
import { colorOf } from '../lib/colors'
import { plural, yearsSince } from '../lib/dates'
import { PhotoGrid } from '../components/Photos'
import { Sheet } from '../components/Sheet'
import { COPY_FIELDS, COPY_GROUPS, DEFAULT_COPY } from '../lib/copy'
import { Field, FieldGroup, Input, PageTitle, TextArea } from '../components/ui'
import type { Quote, Saying } from '../types'

/** Impostazioni: i vostri dati, i modi di dire, le frasi e le foto dei pop-up. */
export function SettingsPage() {
  const { data, updateSettings, mode, t } = useApp()
  const { me, setMe, signOut } = useAuth()
  const { settings } = data
  const years = yearsSince(settings.anniversary)

  return (
    <div className="space-y-5 pb-6">
      <PageTitle
        emoji="⚙️"
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        color="agenda"
        action={
          <Link
            to="/tutte"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft active:scale-90"
            aria-label="Indietro"
          >
            ‹
          </Link>
        }
      />

      {/* --- Noi due --- */}
      <section className="card space-y-4 p-5">
        <h2 className="font-display text-xl font-bold">{t('settings.us')}</h2>

        <Field
          label="Come si chiama la nostra app"
          hint="Compare nella schermata di accesso. Il nome sotto l icona sulla home del telefono si cambia solo ripubblicando."
        >
          <Input
            value={settings.appName}
            placeholder="LoviDovi"
            onChange={(e) => void updateSettings({ appName: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome 1">
            <Input value={settings.nameA} onChange={(e) => void updateSettings({ nameA: e.target.value })} />
          </Field>
          <Field label="Nome 2">
            <Input value={settings.nameB} onChange={(e) => void updateSettings({ nameB: e.target.value })} />
          </Field>
        </div>

        <Field
          label="Da quando state insieme"
          hint={
            settings.anniversary
              ? `${plural(years, 'anno', 'anni')} insieme: gli achievement anniversario si sbloccano da qui.`
              : 'Serve per gli achievement e per il contatore in cima al calendario.'
          }
        >
          <Input
            type="date"
            value={settings.anniversary ?? ''}
            onChange={(e) => void updateSettings({ anniversary: e.target.value || null })}
          />
        </Field>

        <FieldGroup label="Chi sta usando questo telefono" hint="Serve solo a capire di chi è ogni voto.">
          <div className="flex gap-2">
            {(['a', 'b'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setMe(p)}
                className="flex-1 rounded-2xl border px-3 py-3 font-semibold transition active:scale-95"
                style={
                  me === p
                    ? { background: colorOf('agenda').hex, color: '#fff', borderColor: colorOf('agenda').hex }
                    : { background: '#fff', borderColor: 'rgba(0,0,0,0.08)' }
                }
              >
                {p === 'a' ? settings.nameA : settings.nameB}
              </button>
            ))}
          </div>
        </FieldGroup>
      </section>

      <SayingsSection />
      <QuotesSection />
      <WordsSection />

      {/* --- Galleria per i pop-up --- */}
      <section className="card space-y-3 p-5">
        <div>
          <h2 className="font-display text-xl font-bold">{t('settings.gallery')}</h2>
          <p className="text-sm text-muted">{t('settings.galleryHint')}</p>
        </div>
        <PhotoGrid scope="taylor" refId="gallery" label="Galleria" />
      </section>

      {/* --- Animazioni --- */}
      <section className="card space-y-4 p-5">
        <h2 className="font-display text-xl font-bold">Animazioni</h2>

        <Field
          label="Ogni quanto esce un modo di dire"
          hint={settings.sayingFrequency === 0 ? 'Disattivato.' : `Circa ogni ${settings.sayingFrequency} minuti.`}
        >
          <input
            type="range"
            min={0}
            max={120}
            step={5}
            value={settings.sayingFrequency}
            onChange={(e) => void updateSettings({ sayingFrequency: Number(e.target.value) })}
            className="w-full accent-cat-agenda"
          />
        </Field>

        <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft">
          <span>
            <span className="block font-semibold">Riduci gli effetti</span>
            <span className="block text-sm text-muted">Niente coriandoli né glitter nei pop-up.</span>
          </span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => void updateSettings({ reducedMotion: e.target.checked })}
            className="h-6 w-6 shrink-0 accent-cat-agenda"
          />
        </label>
      </section>

      {/* --- Stato dei dati --- */}
      <section className="card space-y-3 p-5">
        <h2 className="font-display text-xl font-bold">I vostri dati</h2>
        <p className="text-sm text-muted">
          {mode === 'cloud' ? (
            <>
              ☁️ <strong>Sincronizzati nel cloud.</strong> Quello che scrivi lo vede anche l'altro
              telefono, foto comprese.
            </>
          ) : (
            <>
              📱 <strong>Solo su questo dispositivo.</strong> Per vedere le stesse cose in due,
              collega Supabase seguendo il file SETUP.md.
            </>
          )}
        </p>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Elementi', data.items.length],
            ['Foto', data.photos.length],
            ['Impegni', data.events.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-white px-2 py-3 shadow-soft">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-display text-xl font-bold">{value}</dd>
            </div>
          ))}
        </dl>
        {mode === 'cloud' && (
          <button onClick={() => void signOut()} className="btn-ghost w-full">
            Esci
          </button>
        )}
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */

const blankSaying = (): Saying => ({
  id: randomId(),
  text: '',
  author: 'both',
  meaning: '',
  createdAt: new Date().toISOString(),
})

/** I vostri modi di dire: quelli che ogni tanto ricompaiono da soli. */
function SayingsSection() {
  const { data, saveSaying, deleteSaying, t } = useApp()
  const [editing, setEditing] = useState<Saying | null>(null)
  const [open, setOpen] = useState(false)

  const start = (saying: Saying | null) => {
    setEditing(saying ?? blankSaying())
    setOpen(true)
  }

  const who = (s: Saying) =>
    s.author === 'a' ? data.settings.nameA : s.author === 'b' ? data.settings.nameB : 'Noi due'

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">{t('settings.sayings')}</h2>
          <p className="text-sm text-muted">{t('settings.sayingsHint')}</p>
        </div>
        <button
          onClick={() => start(null)}
          className="shrink-0 rounded-full bg-cat-agenda/10 px-3 py-1.5 text-sm font-semibold text-cat-agenda active:scale-95"
        >
          ＋
        </button>
      </div>

      {data.sayings.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-muted shadow-soft">
          {t('empty.sayings')}
        </p>
      ) : (
        <ul className="space-y-2">
          {data.sayings.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => start(s)}
                className="w-full rounded-2xl bg-white px-4 py-3 text-left shadow-soft active:scale-[0.98]"
              >
                <p className="font-display text-base font-semibold">"{s.text}"</p>
                {s.meaning && <p className="text-sm text-muted">{s.meaning}</p>}
                <p className="mt-0.5 text-xs font-semibold text-muted">— {who(s)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing && data.sayings.some((s) => s.id === editing.id) ? 'Modifica' : 'Nuovo modo di dire'}
        footer={
          <div className="flex gap-2">
            {editing && data.sayings.some((s) => s.id === editing.id) && (
              <button
                onClick={() => {
                  void deleteSaying(editing.id)
                  setOpen(false)
                }}
                className="btn bg-red-50 px-4 text-red-700"
                aria-label="Elimina"
              >
                🗑️
              </button>
            )}
            <button
              onClick={() => {
                if (editing?.text.trim()) void saveSaying({ ...editing, text: editing.text.trim() })
                setOpen(false)
              }}
              disabled={!editing?.text.trim()}
              className="btn-primary flex-1"
            >
              Salva
            </button>
          </div>
        }
      >
        {editing && (
          <>
            <Field label="La frase">
              <Input
                value={editing.text}
                autoFocus
                placeholder="Ci vediamo alle cinque meno un quarto di secondo"
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              />
            </Field>
            <Field label="Cosa vuol dire / com'è nata">
              <TextArea
                value={editing.meaning}
                onChange={(e) => setEditing({ ...editing, meaning: e.target.value })}
              />
            </Field>
            <FieldGroup label="Chi lo dice">
              <div className="flex gap-2">
                {(['a', 'b', 'both'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setEditing({ ...editing, author: a })}
                    className="flex-1 rounded-2xl border px-2 py-2.5 text-sm font-semibold active:scale-95"
                    style={
                      editing.author === a
                        ? { background: colorOf('agenda').hex, color: '#fff', borderColor: colorOf('agenda').hex }
                        : { background: '#fff', borderColor: 'rgba(0,0,0,0.08)' }
                    }
                  >
                    {a === 'a' ? data.settings.nameA : a === 'b' ? data.settings.nameB : 'Tutti e due'}
                  </button>
                ))}
              </div>
            </FieldGroup>
          </>
        )}
      </Sheet>
    </section>
  )
}

/* ------------------------------------------------------------------ */

const blankQuote = (): Quote => ({
  id: randomId(),
  text: '',
  song: '',
  era: '',
  createdAt: new Date().toISOString(),
})

/** Le frasi che compaiono nei pop-up delle celebrazioni. */
function QuotesSection() {
  const { data, saveQuote, deleteQuote, t } = useApp()
  const [editing, setEditing] = useState<Quote | null>(null)
  const [open, setOpen] = useState(false)

  const start = (quote: Quote | null) => {
    setEditing(quote ?? blankQuote())
    setOpen(true)
  }

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">{t('settings.quotes')}</h2>
          <p className="text-sm text-muted">{t('settings.quotesHint')}</p>
        </div>
        <button
          onClick={() => start(null)}
          className="shrink-0 rounded-full bg-cat-screen/10 px-3 py-1.5 text-sm font-semibold text-cat-screen active:scale-95"
        >
          ＋
        </button>
      </div>

      <ul className="space-y-2">
        {data.quotes.map((q) => (
          <li key={q.id}>
            <button
              onClick={() => start(q)}
              className="w-full rounded-2xl bg-white px-4 py-3 text-left shadow-soft active:scale-[0.98]"
            >
              <p className="font-display text-base italic">"{q.text}"</p>
              {(q.song || q.era) && (
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  {[q.song, q.era].filter(Boolean).join(' · ')}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing && data.quotes.some((q) => q.id === editing.id) ? 'Modifica frase' : 'Nuova frase'}
        footer={
          <div className="flex gap-2">
            {editing && data.quotes.some((q) => q.id === editing.id) && (
              <button
                onClick={() => {
                  void deleteQuote(editing.id)
                  setOpen(false)
                }}
                className="btn bg-red-50 px-4 text-red-700"
                aria-label="Elimina"
              >
                🗑️
              </button>
            )}
            <button
              onClick={() => {
                if (editing?.text.trim()) void saveQuote({ ...editing, text: editing.text.trim() })
                setOpen(false)
              }}
              disabled={!editing?.text.trim()}
              className="btn-primary flex-1"
            >
              Salva
            </button>
          </div>
        }
      >
        {editing && (
          <>
            <Field label="La frase">
              <TextArea
                value={editing.text}
                autoFocus
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Canzone">
                <Input
                  value={editing.song}
                  placeholder="Lover"
                  onChange={(e) => setEditing({ ...editing, song: e.target.value })}
                />
              </Field>
              <Field label="Era / album">
                <Input
                  value={editing.era}
                  placeholder="Lover"
                  onChange={(e) => setEditing({ ...editing, era: e.target.value })}
                />
              </Field>
            </div>
          </>
        )}
      </Sheet>
    </section>
  )
}

/* ------------------------------------------------------------------ */

/**
 * Tutte le frasi "con personalità" dell'app, riscrivibili una per una.
 *
 * I gruppi sono chiusi di partenza: aperti tutti insieme sarebbero un muro di
 * quaranta campi. Una frase lasciata vuota torna a quella di partenza, così
 * non si può rompere l'app cancellando tutto.
 */
function WordsSection() {
  const { data, updateSettings } = useApp()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const texts = data.settings.texts

  const changed = COPY_FIELDS.filter((f) => (texts[f.key] ?? '').trim()).length

  const write = (key: string, value: string) => {
    const next = { ...texts }
    if (value.trim()) next[key] = value
    else delete next[key]
    void updateSettings({ texts: next })
  }

  return (
    <section className="card space-y-3 p-5">
      <div>
        <h2 className="font-display text-xl font-bold">Le nostre parole</h2>
        <p className="text-sm text-muted">
          Ogni frase che l app vi dice, riscritta come la direste voi. Svuota un campo per
          tornare a quella di partenza.
        </p>
        {changed > 0 && (
          <p className="mt-1 text-xs font-semibold text-cat-agenda">
            {changed} {changed === 1 ? 'frase riscritta' : 'frasi riscritte'}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {COPY_GROUPS.map((group) => {
          const fields = COPY_FIELDS.filter((f) => f.group === group)
          const isOpen = openGroup === group
          const touched = fields.filter((f) => (texts[f.key] ?? '').trim()).length
          return (
            <div key={group} className="overflow-hidden rounded-2xl bg-white shadow-soft">
              <button
                onClick={() => setOpenGroup(isOpen ? null : group)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left"
              >
                <span className="flex-1 font-semibold">{group}</span>
                <span className="text-xs text-muted">
                  {touched > 0 ? `${touched}/${fields.length}` : fields.length}
                </span>
                <span aria-hidden className={isOpen ? 'rotate-180' : ''}>
                  ⌄
                </span>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-black/5 px-4 pb-4 pt-3">
                  {fields.map((field) => (
                    <WordField
                      key={field.key}
                      field={field}
                      value={(texts[field.key] ?? '').trim()}
                      onWrite={write}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/**
 * Una singola frase riscrivibile.
 *
 * Il "ripristina" è un pulsante accanto all'etichetta, quindi l'etichetta non
 * può essere un <label> che li avvolge entrambi: si attaccherebbe al pulsante
 * invece che al campo, e chi usa un lettore di schermo si sentirebbe leggere
 * il nome sbagliato. Qui il collegamento è esplicito, con htmlFor.
 */
function WordField({
  field,
  value,
  onWrite,
}: {
  field: (typeof COPY_FIELDS)[number]
  value: string
  onWrite: (key: string, value: string) => void
}) {
  const id = useId()
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-muted">
          {field.label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onWrite(field.key, '')}
            className="shrink-0 text-xs text-muted underline"
          >
            ripristina
          </button>
        )}
      </div>
      {field.long ? (
        <TextArea
          id={id}
          value={value}
          placeholder={DEFAULT_COPY[field.key]}
          onChange={(e) => onWrite(field.key, e.target.value)}
        />
      ) : (
        <Input
          id={id}
          value={value}
          placeholder={DEFAULT_COPY[field.key]}
          onChange={(e) => onWrite(field.key, e.target.value)}
        />
      )}
      {field.slots && (
        <p className="mt-1 text-xs text-muted">
          Lascia {field.slots.join(' e ')} dove sono: l app ci mette dentro il valore giusto.
        </p>
      )}
    </div>
  )
}
