import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { GeoMap, type MapPoint } from '../components/GeoMap'
import { Empty, PageTitle } from '../components/ui'

type Filter = 'all' | 'done' | 'wish'

/**
 * Tutti i posti della vostra storia su un'unica mappa: le tappe dei viaggi,
 * i locali, le uscite. Il colore dice la categoria, così si legge a colpo
 * d'occhio dove siete stati e cosa vi resta da fare.
 */
export function WorldMapPage() {
  const { data, t } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [only, setOnly] = useState<string | null>(null)

  const categories = useMemo(
    () => [...data.categories].sort((a, b) => a.sort - b.sort),
    [data.categories],
  )

  const points = useMemo<MapPoint[]>(() => {
    const byId = new Map(data.categories.map((c) => [c.id, c]))
    const out: MapPoint[] = []

    for (const item of data.items) {
      const category = byId.get(item.categoryId)
      if (!category) continue
      if (only && category.id !== only) continue
      if (filter === 'done' && item.status !== 'done') continue
      if (filter === 'wish' && item.status === 'done') continue

      const color = colorOf(category.color).hex
      const go = () => navigate(`/c/${category.id}/${item.id}`)

      if (item.lat !== null && item.lng !== null) {
        out.push({
          id: item.id,
          lat: item.lat,
          lng: item.lng,
          label: item.title,
          color,
          badge: category.emoji,
          onClick: go,
        })
      }

      // Le tappe di un viaggio sono posti a tutti gli effetti: sulla mappa
      // grande valgono quanto gli altri, altrimenti i viaggi sparirebbero
      // dietro un solo segnaposto.
      for (const stop of data.stops) {
        if (stop.itemId !== item.id || stop.lat === null || stop.lng === null) continue
        out.push({
          id: stop.id,
          lat: stop.lat,
          lng: stop.lng,
          label: `${stop.name} · ${item.title}`,
          color,
          badge: category.emoji,
          onClick: go,
        })
      }
    }
    return out
  }, [data.items, data.stops, data.categories, filter, only, navigate])

  const done = data.items.filter((i) => i.status === 'done' && i.lat !== null).length

  return (
    <div className="pb-4">
      <PageTitle
        emoji="🌍"
        title={t('nav.world')}
        subtitle={t('nav.worldSubtitle')}
        color="trips"
        action={
          <Link
            to="/tutte"
            aria-label="Indietro"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft active:scale-90"
          >
            ‹
          </Link>
        }
      />

      <div className="mb-3 flex gap-1 rounded-full bg-white p-1 shadow-soft">
        {(
          [
            ['all', 'Tutto'],
            ['done', 'Fatti'],
            ['wish', 'Da fare'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className="flex-1 rounded-full px-3 py-2 text-sm font-semibold transition"
            style={
              filter === value
                ? { background: colorOf('trips').soft, color: colorOf('trips').ink }
                : { color: '#7A6A72' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setOnly(null)}
          className="shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95"
          style={
            only === null
              ? { background: '#2B1F26', color: '#fff' }
              : { background: '#fff', color: '#7A6A72' }
          }
        >
          Tutte
        </button>
        {categories.map((category) => {
          const c = colorOf(category.color)
          const active = only === category.id
          return (
            <button
              key={category.id}
              onClick={() => setOnly(active ? null : category.id)}
              className="shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95"
              style={active ? { background: c.hex, color: '#fff' } : { background: c.soft, color: c.ink }}
            >
              {category.emoji} {category.name}
            </button>
          )
        })}
      </div>

      {points.length === 0 ? (
        <Empty emoji="🗺️" title="Mappa vuota" hint={t('empty.map')} />
      ) : (
        <>
          <GeoMap height={460} points={points} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl bg-white px-3 py-3 shadow-soft">
              <p className="font-display text-2xl font-bold">{points.length}</p>
              <p className="text-xs text-muted">segnaposto sulla mappa</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 shadow-soft">
              <p className="font-display text-2xl font-bold">{done}</p>
              <p className="text-xs text-muted">già spuntati</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
