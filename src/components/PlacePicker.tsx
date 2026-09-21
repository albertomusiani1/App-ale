import { useEffect, useRef, useState } from 'react'
import { searchPlaces, type GeoPlace } from '../lib/geo'
import { colorOf } from '../lib/colors'
import type { ColorKey } from '../types'
import { GeoMap } from './GeoMap'

/**
 * Cerca un posto e ne prende le coordinate, oppure le si sceglie toccando
 * direttamente la mappa. È il pezzo che alimenta tutte le mappe dell'app.
 */
export function PlacePicker({
  lat,
  lng,
  color,
  onChange,
  hint,
}: {
  lat: number | null
  lng: number | null
  color: ColorKey
  /** `name` arriva solo dalla ricerca, non dal tocco sulla mappa. */
  onChange: (lat: number | null, lng: number | null, name?: string) => void
  hint?: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoPlace[]>([])
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const c = colorOf(color)
  const abort = useRef<AbortController | null>(null)

  // Si cerca mezzo secondo dopo che si smette di digitare: Nominatim è
  // gratuito e chiede di non essere tempestato di richieste.
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      abort.current?.abort()
      const controller = new AbortController()
      abort.current = controller
      setBusy(true)
      const found = await searchPlaces(query, controller.signal)
      if (!controller.signal.aborted) {
        setResults(found)
        setBusy(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  const hasPoint = lat !== null && lng !== null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="label mb-0">Posizione sulla mappa</span>
        {hasPoint && (
          <button
            type="button"
            onClick={() => {
              onChange(null, null)
              setQuery('')
              setOpen(false)
            }}
            className="text-xs font-semibold text-muted underline"
          >
            togli
          </button>
        )}
      </div>

      <input
        type="search"
        className="field"
        value={query}
        placeholder="Cerca una città, un indirizzo, un locale..."
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
      />

      {busy && <p className="text-xs text-muted">Cerco…</p>}

      {open && results.length > 0 && (
        <ul className="max-h-48 overflow-y-auto rounded-2xl bg-white shadow-soft">
          {results.map((r) => (
            <li key={`${r.lat},${r.lng}`}>
              <button
                type="button"
                onClick={() => {
                  onChange(r.lat, r.lng, r.name)
                  setQuery(r.name)
                  setResults([])
                  setOpen(false)
                }}
                className="w-full border-b border-black/5 px-4 py-2.5 text-left last:border-0 active:bg-black/5"
              >
                <span className="block text-sm font-semibold">{r.name}</span>
                <span className="block truncate text-xs text-muted">{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasPoint ? (
        <>
          <GeoMap
            height={180}
            points={[{ id: 'scelto', lat, lng, label: query || 'Qui', color: c.hex, badge: '📍' }]}
            onPick={(newLat, newLng) => onChange(newLat, newLng)}
            zoom={12}
          />
          <p className="text-xs text-muted">
            Tocca la mappa per spostare il segnaposto. {hint}
          </p>
        </>
      ) : (
        <p className="text-xs text-muted">
          {hint ?? 'Senza posizione questo posto non comparirà sulle mappe.'}
        </p>
      )}
    </div>
  )
}
