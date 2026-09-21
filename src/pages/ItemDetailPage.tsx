import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { copyFor } from '../lib/kinds'
import { plural, rangeLabel } from '../lib/dates'
import { ItemSheet } from '../components/ItemSheet'
import { StopSheet } from '../components/StopSheet'
import { PhotoGrid } from '../components/Photos'
import { GeoMap } from '../components/GeoMap'
import { distanceKm } from '../lib/geo'
import { Empty, Hearts, StatusPill } from '../components/ui'
import type { Stop, StopDay } from '../types'

/** La scheda completa di un viaggio, un posto, un'uscita o un film. */
export function ItemDetailPage() {
  const { categoryId = '', itemId = '' } = useParams()
  const { data, saveItem, t } = useApp()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [stopSheet, setStopSheet] = useState<{ stop: Stop | null } | null>(null)

  const category = data.categories.find((c) => c.id === categoryId)
  const item = data.items.find((i) => i.id === itemId)

  const stops = useMemo(
    () => data.stops.filter((s) => s.itemId === itemId).sort((a, b) => a.position - b.position),
    [data.stops, itemId],
  )

  if (!category || !item) {
    return <Empty emoji="🤔" title="Non trovato" hint="Forse è stato eliminato dall'altro telefono." />
  }

  const copy = copyFor(category.kind)
  const c = colorOf(category.color)
  const cover = item.coverPhotoId ? data.photos.find((p) => p.id === item.coverPhotoId) : undefined
  const totalDays = stops.reduce((sum, s) => sum + s.days, 0)
  const isTrip = category.kind === 'trips'

  // In un viaggio la mappa mostra le tappe in ordine; altrove il posto stesso.
  const located = stops.filter((s) => s.lat !== null && s.lng !== null)
  const mapPoints = isTrip
    ? located.map((s, i) => ({
        id: s.id,
        lat: s.lat!,
        lng: s.lng!,
        label: s.name,
        color: c.hex,
        badge: String(i + 1),
      }))
    : item.lat !== null && item.lng !== null
      ? [{ id: item.id, lat: item.lat, lng: item.lng, label: item.title, color: c.hex, badge: category.emoji }]
      : []

  // Somma delle distanze fra tappe consecutive: dà l'idea di quanto si gira.
  const totalKm = located.reduce(
    (sum, s, i) =>
      i === 0 ? 0 : sum + distanceKm([located[i - 1].lat!, located[i - 1].lng!], [s.lat!, s.lng!]),
    0,
  )

  return (
    <div className="pb-6">
      <div className="mb-3 flex items-center justify-between">
        <Link
          to={`/c/${category.id}`}
          className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-semibold shadow-soft active:scale-95"
        >
          ‹ {category.name}
        </Link>
        <button
          onClick={() => setEditing(true)}
          className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-soft active:scale-95"
          style={{ background: c.hex }}
        >
          ✏️ Modifica
        </button>
      </div>

      <header className="card overflow-hidden">
        {cover && <img src={cover.url} alt="" className="h-48 w-full object-cover" />}
        <div className="p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusPill status={item.status} color={category.color} />
            {item.meta.type && (
              <span className="pill" style={{ background: c.soft, color: c.ink }}>
                {item.meta.type}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight">{item.title}</h1>
          {item.subtitle && <p className="mt-0.5 text-muted">{item.subtitle}</p>}

          {item.startDate && (
            <p className="mt-3 text-sm font-semibold" style={{ color: c.ink }}>
              📅 {rangeLabel(item.startDate, item.endDate)}
            </p>
          )}

          {stops.length > 0 && (
            <p className="mt-1 text-sm text-muted">
              📍 {plural(stops.length, 'tappa', 'tappe')} · {plural(totalDays, 'giorno', 'giorni')}
            </p>
          )}

          {copy.rated && item.status === 'done' && (
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-black/5 pt-3">
              <Hearts label={data.settings.nameA} value={item.ratingA} onChange={(v) => void saveItem({ ...item, ratingA: v })} />
              <Hearts label={data.settings.nameB} value={item.ratingB} onChange={(v) => void saveItem({ ...item, ratingB: v })} />
            </div>
          )}
        </div>
      </header>

      {mapPoints.length > 0 && (
        <section className="mt-4">
          <GeoMap height={240} route={isTrip} points={mapPoints} />
          {isTrip && totalKm > 0 && (
            <p className="mt-2 text-center text-xs text-muted">
              🧭 Circa {Math.round(totalKm)} km fra la prima e l ultima tappa, in linea d aria.
            </p>
          )}
        </section>
      )}

      {item.notes && (
        <section className="card mt-4 p-5">
          <h2 className="label">{copy.notesLabel}</h2>
          <p className="whitespace-pre-wrap leading-relaxed">{item.notes}</p>
        </section>
      )}

      {/* Le tappe esistono solo nei viaggi */}
      {category.kind === 'trips' && (
        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Tappe</h2>
            <button
              onClick={() => setStopSheet({ stop: null })}
              className="rounded-full px-3 py-1.5 text-sm font-bold text-white active:scale-95"
              style={{ background: c.hex }}
            >
              ＋ Tappa
            </button>
          </div>

          {stops.length === 0 ? (
            <p className="card px-5 py-8 text-center text-sm text-muted">{t('empty.stops')}</p>
          ) : (
            <ol className="space-y-3">
              {stops.map((stop, i) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  index={i}
                  color={category.color}
                  onEdit={() => setStopSheet({ stop })}
                />
              ))}
            </ol>
          )}
        </section>
      )}

      <section className="card mt-5 p-5">
        <PhotoGrid
          scope="item"
          refId={item.id}
          color={category.color}
          label={category.kind === 'trips' ? 'Foto del viaggio' : 'Foto'}
          coverId={item.coverPhotoId}
          onSetCover={(photoId) => void saveItem({ ...item, coverPhotoId: photoId })}
        />
      </section>

      <ItemSheet
        open={editing}
        onClose={() => setEditing(false)}
        category={category}
        item={item}
        onDeleted={() => navigate(`/c/${category.id}`, { replace: true })}
      />

      {stopSheet && (
        <StopSheet
          open
          onClose={() => setStopSheet(null)}
          itemId={item.id}
          stop={stopSheet.stop}
          position={stopSheet.stop?.position ?? stops.length}
          color={category.color}
        />
      )}
    </div>
  )
}

/** Una tappa, con le sue giornate che si aprono a fisarmonica. */
function StopCard({
  stop,
  index,
  color,
  onEdit,
}: {
  stop: Stop
  index: number
  color: Parameters<typeof colorOf>[0]
  onEdit: () => void
}) {
  const { data } = useApp()
  const [open, setOpen] = useState(false)
  const c = colorOf(color)
  const days = data.stopDays
    .filter((d) => d.stopId === stop.id)
    .sort((a, b) => a.position - b.position)
  const photoCount = data.photos.filter(
    (p) => (p.scope === 'stop' && p.refId === stop.id) || (p.scope === 'stopDay' && days.some((d) => d.id === p.refId)),
  ).length

  return (
    <li className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-bold text-white"
          style={{ background: c.hex }}
        >
          {index + 1}
        </span>
        <button onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-left">
          <span className="block truncate font-display text-lg font-bold">{stop.name}</span>
          <span className="block text-sm text-muted">
            {plural(stop.days, 'giorno', 'giorni')}
            {photoCount > 0 && ` · 📷 ${photoCount}`}
          </span>
        </button>
        <button
          onClick={onEdit}
          aria-label="Modifica tappa"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 active:scale-90"
        >
          ✏️
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Chiudi giorni' : 'Apri giorni'}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 active:scale-90"
        >
          <motion.span animate={{ rotate: open ? 180 : 0 }} aria-hidden>
            ⌄
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-black/5 px-4 pb-5 pt-4">
              {stop.notes && (
                <p className="rounded-2xl px-4 py-3 text-sm leading-relaxed" style={{ background: c.soft }}>
                  {stop.notes}
                </p>
              )}

              <PhotoGrid scope="stop" refId={stop.id} color={color} label="Foto della tappa" />

              <div>
                <p className="label">Giorno per giorno</p>
                <div className="space-y-3">
                  {days.map((day) => (
                    <DayCard key={day.id} day={day} color={color} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

/** Una giornata della tappa: si salva da sola quando esci dal campo. */
function DayCard({ day, color }: { day: StopDay; color: Parameters<typeof colorOf>[0] }) {
  const { saveStopDay } = useApp()
  const [title, setTitle] = useState(day.title)
  const [notes, setNotes] = useState(day.notes)
  const [showPhotos, setShowPhotos] = useState(false)
  const c = colorOf(color)

  const commit = () => {
    if (title === day.title && notes === day.notes) return
    void saveStopDay({ ...day, title, notes })
  }

  return (
    <div className="rounded-2xl bg-white p-3 shadow-soft">
      <div className="mb-2 flex items-center gap-2">
        <span className="pill shrink-0" style={{ background: c.soft, color: c.ink }}>
          Giorno {day.position + 1}
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commit}
          placeholder="Titolo della giornata"
          className="min-w-0 flex-1 bg-transparent font-display text-base font-bold outline-none placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted/60"
        />
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={commit}
        placeholder="Cosa facciamo, dove mangiamo, cosa ci è piaciuto..."
        className="min-h-[64px] w-full resize-y rounded-xl bg-black/[0.03] px-3 py-2 text-sm outline-none placeholder:text-muted/60"
      />
      {showPhotos ? (
        <div className="mt-3">
          <PhotoGrid
            scope="stopDay"
            refId={day.id}
            color={color}
            label={`Foto del giorno ${day.position + 1}`}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowPhotos(true)}
          className="mt-2 text-xs font-semibold"
          style={{ color: c.ink }}
        >
          📷 Foto di questa giornata
        </button>
      )}
    </div>
  )
}
