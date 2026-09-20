import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppStore'
import { counters, progressOf } from '../lib/achievements'
import { colorOf } from '../lib/colors'
import { randomId } from '../lib/image'
import { longDate } from '../lib/dates'
import { Sheet, ConfirmButton } from '../components/Sheet'
import { Field, FieldGroup, Input, PageTitle, Progress, TextArea } from '../components/ui'
import { Glitter } from '../components/Magic'
import type { Achievement, Category } from '../types'

/** La bacheca dei traguardi: quelli sbloccati brillano, gli altri mostrano quanto manca. */
export function AchievementsPage({ category }: { category: Category }) {
  const { data, saveAchievement, celebrate } = useApp()
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [creating, setCreating] = useState(false)

  const counts = useMemo(() => counters(data), [data])
  const c = colorOf(category.color)

  const sorted = useMemo(() => {
    return [...data.achievements].sort((a, b) => {
      // Sbloccati in cima (più recenti prima), poi i più vicini al traguardo.
      if (a.unlockedAt && b.unlockedAt) return b.unlockedAt.localeCompare(a.unlockedAt)
      if (a.unlockedAt) return -1
      if (b.unlockedAt) return 1
      return progressOf(b.key, b.target, counts) - progressOf(a.key, a.target, counts)
    })
  }, [data.achievements, counts])

  const unlocked = sorted.filter((a) => a.unlockedAt).length

  /** Gli achievement manuali si spuntano a mano, e festeggiano subito. */
  function toggleManual(a: Achievement) {
    if (a.unlockedAt) {
      void saveAchievement({ ...a, unlockedAt: null })
      return
    }
    void saveAchievement({ ...a, unlockedAt: new Date().toISOString() })
    const gallery = data.photos.filter((p) => p.scope === 'taylor')
    celebrate({
      title: a.title,
      subtitle: a.description,
      emoji: a.emoji,
      color: 'goals',
      quote: data.quotes.length ? data.quotes[Math.floor(Math.random() * data.quotes.length)] : undefined,
      photoUrl: gallery.length ? gallery[Math.floor(Math.random() * gallery.length)].url : undefined,
    })
  }

  return (
    <div className="pb-4">
      <PageTitle
        emoji={category.emoji}
        title={category.name}
        subtitle={`${unlocked} ${unlocked === 1 ? 'sbloccato' : 'sbloccati'} su ${data.achievements.length}`}
        color={category.color}
      />

      <div
        className="relative mb-5 overflow-hidden rounded-3xl p-5 text-center shadow-soft"
        style={{ background: c.soft }}
      >
        <Glitter count={16} seed={5} />
        <div className="relative">
          <p className="font-display text-4xl font-bold" style={{ color: c.ink }}>
            {unlocked}
          </p>
          <p className="text-sm font-semibold" style={{ color: c.ink }}>
            {unlocked === 1 ? 'traguardo conquistato' : 'traguardi conquistati'} insieme
          </p>
          <div className="mx-auto mt-3 max-w-xs">
            <Progress
              value={data.achievements.length ? unlocked / data.achievements.length : 0}
              color={category.color}
            />
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3">
        {sorted.map((a) => {
          const done = Boolean(a.unlockedAt)
          const progress = progressOf(a.key, a.target, counts)
          const current = Math.min(counts[a.key] ?? 0, a.target)
          return (
            <li key={a.id}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => (a.kind === 'manual' ? toggleManual(a) : setEditing(a))}
                onDoubleClick={() => setEditing(a)}
                className="relative h-full w-full overflow-hidden rounded-3xl p-4 text-left shadow-soft"
                style={{
                  background: done ? c.soft : '#fff',
                  border: done ? `2px solid ${c.hex}` : '1px solid rgba(0,0,0,0.05)',
                }}
              >
                {done && <Glitter count={8} seed={a.id.length} />}
                <div className="relative">
                  <span
                    className="block text-3xl"
                    style={{ filter: done ? 'none' : 'grayscale(1)', opacity: done ? 1 : 0.35 }}
                    aria-hidden
                  >
                    {a.emoji}
                  </span>
                  <span className="mt-1.5 block font-display text-base font-bold leading-tight">
                    {a.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">{a.description}</span>

                  {done ? (
                    <span className="mt-2 block text-[11px] font-bold" style={{ color: c.ink }}>
                      ✓ {longDate(a.unlockedAt!.slice(0, 10))}
                    </span>
                  ) : a.kind === 'auto' ? (
                    <span className="mt-2 block">
                      <Progress value={progress} color={category.color} />
                      <span className="mt-1 block text-[11px] font-semibold text-muted">
                        {current} / {a.target}
                      </span>
                    </span>
                  ) : (
                    <span className="mt-2 block text-[11px] font-semibold text-muted">
                      Tocca quando succede
                    </span>
                  )}
                </div>
              </motion.button>
            </li>
          )
        })}
      </ul>

      <button
        onClick={() => setCreating(true)}
        className="btn mt-5 w-full text-white shadow-lift"
        style={{ background: c.hex }}
      >
        ＋ Inventane uno vostro
      </button>
      <p className="mt-2 text-center text-xs text-muted">
        Tocca un traguardo da spuntare a mano per sbloccarlo. Doppio tocco per modificarlo.
      </p>

      <AchievementSheet
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        achievement={editing}
      />
    </div>
  )
}

const blankAchievement = (): Achievement => ({
  id: randomId(),
  key: 'manual',
  title: '',
  description: '',
  emoji: '🏅',
  kind: 'manual',
  target: 1,
  unlockedAt: null,
  custom: true,
})

const EMOJI = ['🏅', '💍', '🏡', '🐶', '🎂', '🚗', '🌈', '🥂', '🎓', '🧳', '🎪', '🫶']

function AchievementSheet({
  open,
  onClose,
  achievement,
}: {
  open: boolean
  onClose: () => void
  achievement?: Achievement | null
}) {
  const { saveAchievement, deleteAchievement } = useApp()
  const [draft, setDraft] = useState<Achievement>(() => achievement ?? blankAchievement())

  // Ricarica il contenuto giusto ogni volta che il pannello si apre.
  const key = `${open}-${achievement?.id ?? 'new'}`
  const [lastKey, setLastKey] = useState(key)
  if (key !== lastKey) {
    setLastKey(key)
    setDraft(achievement ?? blankAchievement())
  }

  const set = <K extends keyof Achievement>(k: K, v: Achievement[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={achievement ? 'Modifica traguardo' : 'Nuovo traguardo'}
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">
            Annulla
          </button>
          <button
            onClick={() => {
              void saveAchievement({ ...draft, title: draft.title.trim() })
              onClose()
            }}
            disabled={!draft.title.trim()}
            className="btn flex-[2] text-white shadow-lift"
            style={{ background: colorOf('goals').hex }}
          >
            Salva
          </button>
        </div>
      }
    >
      <Field label="Titolo">
        <Input
          value={draft.title}
          autoFocus={!achievement}
          placeholder="Primo weekend da soli"
          onChange={(e) => set('title', e.target.value)}
        />
      </Field>

      <Field label="Descrizione">
        <TextArea value={draft.description} onChange={(e) => set('description', e.target.value)} />
      </Field>

      <FieldGroup label="Icona">
        <div className="flex flex-wrap gap-2">
          {EMOJI.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => set('emoji', e)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl active:scale-90"
              style={{
                background: draft.emoji === e ? colorOf('goals').soft : '#fff',
                border: `1px solid ${draft.emoji === e ? colorOf('goals').hex : 'rgba(0,0,0,0.08)'}`,
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </FieldGroup>

      {achievement?.kind === 'auto' && (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-muted shadow-soft">
          Questo traguardo si sblocca da solo: conta i vostri dati e arriva quando è il momento.
        </p>
      )}

      {achievement && (
        <ConfirmButton
          label="Elimina traguardo"
          onConfirm={() => {
            void deleteAchievement(draft.id)
            onClose()
          }}
        />
      )}
    </Sheet>
  )
}
