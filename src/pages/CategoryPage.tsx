import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { copyFor } from '../lib/kinds'
import { shortDate } from '../lib/dates'
import { ItemSheet } from '../components/ItemSheet'
import { CategorySheet } from '../components/CategorySheet'
import { ImportSheet } from '../components/ImportSheet'
import { GeoMap } from '../components/GeoMap'
import { Empty, Hearts, PageTitle } from '../components/ui'
import { AchievementsPage } from './AchievementsPage'
import type { Item, ItemStatus } from '../types'

type Tab = 'wish' | 'done'

/** La lista di una categoria: "da fare" e "fatti", con ricerca e schede. */
export function CategoryPage() {
  const { categoryId = '' } = useParams()
  const { data, t } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('wish')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [editingCategory, setEditingCategory] = useState(false)
  const [view, setView] = useState<'list' | 'map'>('list')

  const category = data.categories.find((c) => c.id === categoryId)

  const items = useMemo(() => {
    if (!category) return []
    const q = query.trim().toLowerCase()
    return data.items
      .filter((i) => i.categoryId === category.id)
      .filter((i) => (tab === 'done' ? i.status === 'done' : i.status !== 'done'))
      .filter((i) => !q || `${i.title} ${i.subtitle} ${i.notes}`.toLowerCase().includes(q))
      .sort(byDateThenTitle)
  }, [data.items, category, tab, query])

  if (!category) {
    return (
      <Empty emoji="🤔" title="Categoria non trovata" hint="Forse è stata eliminata da un altro telefono." />
    )
  }

  // Gli achievement hanno una schermata tutta loro.
  if (category.kind === 'goals') return <AchievementsPage category={category} />

  const copy = copyFor(category.kind)
  const c = colorOf(category.color)
  const onMap = items.filter((i) => i.lat !== null && i.lng !== null)
  const counts = {
    wish: data.items.filter((i) => i.categoryId === category.id && i.status !== 'done').length,
    done: data.items.filter((i) => i.categoryId === category.id && i.status === 'done').length,
  }

  return (
    <div className="pb-4">
      <PageTitle
        emoji={category.emoji}
        title={category.name}
        subtitle={`${counts.wish} ${copy.wishTab.toLowerCase()} · ${counts.done} ${copy.doneTab.toLowerCase()}`}
        color={category.color}
        action={
          <button
            onClick={() => setEditingCategory(true)}
            aria-label="Modifica categoria"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft active:scale-90"
          >
            ⚙️
          </button>
        }
      />

      {/* Da fare / Fatti.
          L'indicatore scorre con una translazione calcolata, non con `layoutId`:
          un'animazione condivisa dentro una pagina che sta uscendo blocca la
          transizione fra le schermate e lascia lo schermo vuoto. */}
      <div className="relative mb-3 flex gap-2 rounded-2xl bg-white p-1 shadow-soft">
        <motion.span
          aria-hidden
          className="absolute bottom-1 top-1 rounded-xl"
          style={{ background: c.hex, width: 'calc(50% - 0.25rem)', left: '0.25rem' }}
          animate={{ x: tab === 'wish' ? 0 : 'calc(100% + 0.5rem)' }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        />
        {(['wish', 'done'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
            style={{ color: tab === t ? '#fff' : c.ink }}
          >
            {t === 'wish' ? copy.wishTab : copy.doneTab} ({counts[t]})
          </button>
        ))}
      </div>

      {onMap.length > 0 && (
        <div className="mb-3 flex justify-center gap-1 rounded-full bg-white p-1 shadow-soft">
          {(['list', 'map'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 rounded-full px-4 py-2 text-sm font-semibold transition"
              style={view === v ? { background: c.soft, color: c.ink } : { color: '#7A6A72' }}
            >
              {v === 'list' ? '☰ Lista' : '🗺️ Mappa'}
            </button>
          ))}
        </div>
      )}

      {view === 'list' && counts.wish + counts.done > 6 && (
        <input
          className="field mb-3"
          type="search"
          value={query}
          placeholder={`Cerca fra i ${copy.many}...`}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {items.length === 0 ? (
        <Empty
          emoji={category.emoji}
          title={query ? t('empty.search') : t('empty.item', { cosa: copy.one })}
          hint={query ? t('empty.searchHint') : t('empty.itemHint')}
        />
      ) : view === 'map' ? (
        <div className="space-y-3">
          <GeoMap
            height={420}
            points={onMap.map((i) => ({
              id: i.id,
              lat: i.lat!,
              lng: i.lng!,
              label: i.title,
              color: c.hex,
              badge: category.emoji,
              onClick: () => navigate(`/c/${category.id}/${i.id}`),
            }))}
          />
          <p className="text-center text-xs text-muted">
            {onMap.length} di {items.length} su questa mappa. Gli altri non hanno ancora una posizione.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} to={`/c/${category.id}/${item.id}`} color={category.color} />
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setCreating(true)}
        className="btn mt-5 w-full text-white shadow-lift"
        style={{ background: c.hex }}
      >
        ＋ Aggiungi un {copy.one}
      </button>

      <button onClick={() => setImporting(true)} className="btn-ghost mt-2 w-full">
        🗺️ Importa da Wanderlog
      </button>

      <ItemSheet
        open={creating}
        onClose={() => setCreating(false)}
        category={category}
        onSaved={(item) => navigate(`/c/${category.id}/${item.id}`)}
      />
      <CategorySheet
        open={editingCategory}
        onClose={() => setEditingCategory(false)}
        category={category}
      />
      <ImportSheet
        open={importing}
        onClose={() => setImporting(false)}
        category={category}
        onDone={(itemId) => navigate(`/c/${category.id}/${itemId}`)}
      />
    </div>
  )
}

/** Prima le cose con una data vicina, poi le altre in ordine alfabetico. */
function byDateThenTitle(a: Item, b: Item) {
  if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate)
  if (a.startDate) return -1
  if (b.startDate) return 1
  return a.title.localeCompare(b.title)
}

export function ItemCard({
  item,
  to,
  color,
}: {
  item: Item
  to: string
  color: Parameters<typeof colorOf>[0]
}) {
  const { data } = useApp()
  const c = colorOf(color)
  const cover = item.coverPhotoId ? data.photos.find((p) => p.id === item.coverPhotoId) : undefined
  const photoCount = data.photos.filter((p) => p.scope === 'item' && p.refId === item.id).length
  const stops = data.stops.filter((s) => s.itemId === item.id)

  return (
    <Link
      to={to}
      className="flex items-stretch gap-3 overflow-hidden rounded-3xl bg-white shadow-soft transition active:scale-[0.98]"
      style={{ borderLeft: `6px solid ${c.hex}` }}
    >
      {cover ? (
        <img src={cover.url} alt="" className="h-24 w-24 shrink-0 object-cover" loading="lazy" />
      ) : (
        <span
          className="flex h-24 w-24 shrink-0 items-center justify-center text-3xl"
          style={{ background: c.soft }}
          aria-hidden
        >
          {statusEmoji(item.status)}
        </span>
      )}

      <div className="min-w-0 flex-1 py-3 pr-3">
        <p className="truncate font-display text-lg font-bold leading-tight">{item.title}</p>
        {item.subtitle && <p className="truncate text-sm text-muted">{item.subtitle}</p>}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {item.startDate && (
            <span style={{ color: c.ink }} className="font-semibold">
              📅 {shortDate(item.startDate)}
              {item.endDate && item.endDate !== item.startDate && ` – ${shortDate(item.endDate)}`}
            </span>
          )}
          {stops.length > 0 && <span>📍 {stops.length} tappe</span>}
          {photoCount > 0 && <span>📷 {photoCount}</span>}
          {item.meta.type && <span>{item.meta.type}</span>}
        </div>

        {item.status === 'done' && (item.ratingA || item.ratingB) && (
          <div className="mt-1.5 flex items-center gap-3">
            <Hearts value={item.ratingA} label={data.settings.nameA.slice(0, 3)} />
            <Hearts value={item.ratingB} label={data.settings.nameB.slice(0, 3)} />
          </div>
        )}
      </div>
    </Link>
  )
}

const statusEmoji = (s: ItemStatus) => (s === 'done' ? '✅' : s === 'planned' ? '📌' : '✨')
