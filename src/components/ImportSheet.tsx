import { useRef, useState } from 'react'
import { useApp } from '../store/AppStore'
import { randomId } from '../lib/image'
import { colorOf } from '../lib/colors'
import { copyFor } from '../lib/kinds'
import { parseTripFile, type ImportedTrip } from '../lib/wanderlog'
import type { Category, Item, Stop } from '../types'
import { Sheet } from './Sheet'
import { GeoMap } from './GeoMap'

/**
 * Importazione di un file esportato da Wanderlog.
 *
 * In una categoria viaggi il file diventa **un viaggio con le sue tappe**;
 * altrove diventa **una scheda per ogni posto**, che è quello che serve quando
 * si importa una lista di ristoranti.
 */
export function ImportSheet({
  open,
  onClose,
  category,
  onDone,
}: {
  open: boolean
  onClose: () => void
  category: Category
  onDone?: (itemId: string) => void
}) {
  const { saveItem, saveStop } = useApp()
  const input = useRef<HTMLInputElement>(null)
  const [parsed, setParsed] = useState<ImportedTrip | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const c = colorOf(category.color)
  const copy = copyFor(category.kind)
  const asTrip = category.kind === 'trips'
  const withCoords = parsed?.places.filter((p) => p.lat !== null && p.lng !== null) ?? []

  function reset() {
    setParsed(null)
    setError(null)
    if (input.current) input.current.value = ''
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    try {
      const trip = await parseTripFile(file)
      if (trip.places.length === 0) {
        setError('Il file è stato letto, ma non contiene nessun posto.')
        return
      }
      setParsed(trip)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Non sono riuscito a leggere il file.')
    }
  }

  async function confirm() {
    if (!parsed) return
    setBusy(true)
    try {
      if (asTrip) {
        const first = withCoords[0]
        const item: Item = {
          id: randomId(),
          categoryId: category.id,
          title: parsed.title,
          subtitle: '',
          status: 'wish',
          startDate: null,
          endDate: null,
          notes: `Importato da Wanderlog (${parsed.format}).`,
          ratingA: null,
          ratingB: null,
          meta: {},
          coverPhotoId: null,
          lat: first?.lat ?? null,
          lng: first?.lng ?? null,
          visits: 0,
          createdAt: new Date().toISOString(),
        }
        await saveItem(item)
        // In sequenza: ogni tappa genera le proprie schede giorno per giorno.
        for (let i = 0; i < parsed.places.length; i++) {
          const p = parsed.places[i]
          const stop: Stop = {
            id: randomId(),
            itemId: item.id,
            name: p.name,
            days: 1,
            notes: p.notes,
            position: i,
            lat: p.lat,
            lng: p.lng,
          }
          await saveStop(stop)
        }
        onDone?.(item.id)
      } else {
        for (const p of parsed.places) {
          await saveItem({
            id: randomId(),
            categoryId: category.id,
            title: p.name,
            subtitle: '',
            status: 'wish',
            startDate: null,
            endDate: null,
            notes: p.notes,
            ratingA: null,
            ratingB: null,
            meta: {},
            coverPhotoId: null,
            lat: p.lat,
            lng: p.lng,
            visits: 0,
            createdAt: new Date().toISOString(),
          })
        }
      }
      reset()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Importazione non riuscita.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Importa da Wanderlog"
      footer={
        parsed ? (
          <div className="flex gap-2">
            <button onClick={reset} className="btn-ghost flex-1">
              Cambia file
            </button>
            <button
              onClick={() => void confirm()}
              disabled={busy}
              className="btn flex-[2] shadow-lift"
              style={{ background: c.hex, color: c.on }}
            >
              {busy ? 'Importo…' : asTrip ? 'Crea il viaggio' : `Crea ${parsed.places.length} schede`}
            </button>
          </div>
        ) : undefined
      }
    >
      {!parsed && (
        <>
          <div className="card space-y-2 p-4 text-sm">
            <p className="font-semibold">Come si esporta da Wanderlog</p>
            <ol className="list-decimal space-y-1 pl-5 text-muted">
              <li>Apri il viaggio su Wanderlog <strong>da computer</strong>, non dall app.</li>
              <li>Menù in alto → <strong>Export</strong>.</li>
              <li>Scegli <strong>KML</strong> (o Google Maps). Se non c è, va bene anche <strong>CSV</strong>.</li>
              <li>Carica qui il file scaricato.</li>
            </ol>
            <p className="text-xs text-muted">
              Leggo file .kml, .kmz, .gpx e .csv. Il PDF no: non contiene le coordinate.
            </p>
          </div>

          <input
            ref={input}
            type="file"
            accept=".kml,.kmz,.gpx,.csv,.tsv,application/vnd.google-earth.kml+xml"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-black/10 bg-white/60 px-4 py-8 text-muted active:scale-[0.98]"
          >
            <span className="text-3xl" aria-hidden>
              🗺️
            </span>
            <span className="text-sm font-semibold">Scegli il file esportato</span>
          </button>
        </>
      )}

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      )}

      {parsed && (
        <>
          <div className="card p-4">
            <p className="font-display text-xl font-bold">{parsed.title}</p>
            <p className="text-sm text-muted">
              {parsed.format} · {parsed.places.length}{' '}
              {parsed.places.length === 1 ? 'posto' : 'posti'} · {withCoords.length} con posizione
            </p>
            <p className="mt-2 text-sm">
              {asTrip
                ? `Diventerà un viaggio con ${parsed.places.length} tappe.`
                : `Diventeranno ${parsed.places.length} schede nella categoria ${category.name}, una per ${copy.one}.`}
            </p>
          </div>

          {withCoords.length > 0 && (
            <GeoMap
              height={200}
              route={asTrip}
              points={withCoords.map((p, i) => ({
                id: String(i),
                lat: p.lat!,
                lng: p.lng!,
                label: p.name,
                color: c.hex,
                badge: asTrip ? String(i + 1) : category.emoji,
              }))}
            />
          )}

          <ul className="space-y-1.5">
            {parsed.places.map((p, i) => (
              <li key={i} className="flex items-start gap-2 rounded-2xl bg-white px-3 py-2 shadow-soft">
                <span className="mt-0.5 text-xs font-bold text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  {p.notes && <span className="block truncate text-xs text-muted">{p.notes}</span>}
                </span>
                {p.lat === null && (
                  <span className="shrink-0 text-xs text-muted" title="Senza coordinate">
                    📍❌
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </Sheet>
  )
}
