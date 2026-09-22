import { useId, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppStore'
import { counters, progressOf } from '../lib/achievements'
import { LADDERS, ladderCounts, progressOfLadder } from '../lib/ladders'
import { colorOf } from '../lib/colors'
import { randomId } from '../lib/image'
import { longDate } from '../lib/dates'
import { Sheet, ConfirmButton } from '../components/Sheet'
import { Field, Input, PageTitle, Progress, TextArea } from '../components/ui'
import { Glitter } from '../components/Magic'
import type { Achievement, Category } from '../types'

/**
 * La bacheca dei traguardi, divisa in due.
 *
 * In alto le **scale**: quelle che non finiscono mai (anni insieme, viaggi,
 * posti, film, uscite, esami). Ognuna è un riquadro solo che dice a che punto
 * siamo e quanto manca al prossimo scalino, invece delle dieci schede separate
 * che c'erano prima.
 *
 * Sotto i traguardi **una tantum**: quelli che si sbloccano una volta e basta.
 */
export function AchievementsPage({ category }: { category: Category }) {
  const { data, saveAchievement, celebrate, t } = useApp()
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [creating, setCreating] = useState(false)

  const counts = useMemo(() => counters(data), [data])
  const lCounts = useMemo(() => ladderCounts(data), [data])
  const c = colorOf(category.color)

  const oneOff = useMemo(
    () =>
      [...data.achievements].sort((a, b) => {
        if (a.unlockedAt && b.unlockedAt) return b.unlockedAt.localeCompare(a.unlockedAt)
        if (a.unlockedAt) return -1
        if (b.unlockedAt) return 1
        return progressOf(b.key, b.target, counts) - progressOf(a.key, a.target, counts)
      }),
    [data.achievements, counts],
  )

  const unlocked = oneOff.filter((a) => a.unlockedAt).length
  const levels = LADDERS.reduce(
    (sum, l) => sum + (data.ladders.find((x) => x.id === l.key)?.level ?? 0),
    0,
  )
  const total = unlocked + levels

  /** I traguardi manuali si spuntano a mano, e festeggiano subito. */
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
        subtitle={`${total} ${total === 1 ? 'traguardo' : 'traguardi'} in tutto`}
        color={category.color}
      />

      <div
        className="relative mb-5 overflow-hidden rounded-3xl p-5 text-center shadow-soft"
        style={{ background: c.soft }}
      >
        <Glitter count={16} seed={5} />
        <div className="relative">
          <p className="font-display text-4xl font-bold" style={{ color: c.ink }}>
            {total}
          </p>
          <p className="text-sm font-semibold" style={{ color: c.ink }}>
            {total === 1 ? t('achievements.counterOne') : t('achievements.counter')}
          </p>
        </div>
      </div>

      {/* --- Le scale, quelle che crescono con noi --- */}
      <h2 className="mb-2 font-display text-xl font-bold">Le nostre scale</h2>
      <ul className="mb-6 space-y-2.5">
        {LADDERS.map((ladder) => {
          const p = progressOfLadder(ladder, lCounts[ladder.source] ?? 0)
          const lc = colorOf(ladder.color)
          const mancano = Math.max(0, p.next - p.count)
          return (
            <li key={ladder.key}>
              <div
                className="relative overflow-hidden rounded-3xl p-4 shadow-soft"
                style={{ background: p.level > 0 ? lc.soft : '#fff' }}
              >
                {p.level > 0 && <Glitter count={6} seed={ladder.key.length} />}
                <div className="relative flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: p.level > 0 ? '#fff' : lc.soft }}
                    aria-hidden
                  >
                    {ladder.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2">
                      <span className="font-display text-lg font-bold">{ladder.title}</span>
                      {p.level > 0 && (
                        <span
                          className="pill shrink-0"
                          style={{ background: lc.hex, color: lc.on }}
                        >
                          livello {p.level}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      {p.count} {ladder.unit} ·{' '}
                      {mancano === 0
                        ? 'scalino raggiunto!'
                        : `${mancano} al prossimo (${p.next})`}
                    </p>
                  </div>
                </div>
                <div className="relative mt-3">
                  <Progress value={p.ratio} color={ladder.color} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* --- I traguardi una tantum --- */}
      <h2 className="mb-2 font-display text-xl font-bold">Una volta sola</h2>
      <ul className="grid grid-cols-2 gap-3">
        {oneOff.map((a) => {
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
        className="btn mt-5 w-full shadow-lift"
        style={{ background: c.hex, color: c.on }}
      >
        {t('achievements.create')}
      </button>
      <p className="mt-2 text-center text-xs text-muted">{t('achievements.hint')}</p>

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
  const emojiLabel = useId()

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
            className="btn flex-[2] shadow-lift"
            style={{ background: colorOf('goals').hex, color: colorOf('goals').on }}
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

      <div role="group" aria-labelledby={emojiLabel}>
        <span id={emojiLabel} className="label">
          Icona
        </span>
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
      </div>

      {achievement?.kind === 'auto' && (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-muted shadow-soft">
          Questo traguardo si sblocca da solo: conta i nostri dati e arriva quando è il momento.
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
