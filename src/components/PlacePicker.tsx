import { useEffect, useRef, useState } from 'react'
import { searchPlaces, type GeoPlace, type GeoEsito } from '../lib/geo'
import { colorOf } from '../lib/colors'
import type { ColorKey } from '../types'
import { GeoMap } from './GeoMap'

/**
 * Cerca un posto e ne prende le coordinate, oppure le si sceglie toccando
 * direttamente la mappa. È il pezzo che alimenta tutte le mappe dell'app.
 *
 * Due regole se le porta dietro tutto il resto:
 *
 * - la ricerca dice sempre come è andata. Prima una lista vuota voleva dire
 *   sia "questo posto non esiste" sia "il telefono è offline", e dal di fuori
 *   sembrava semplicemente che non funzionasse niente;
 * - la posizione non se la inventa nessuno. L'app non geolocalizza di nascosto
 *   quello che scrivete nel titolo: finisce sulla mappa solo quello che avete
 *   scelto voi, da un risultato o col dito.
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
  const [esito, setEsito] = useState<GeoEsito>({ stato: 'corto' })
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const [aMano, setAMano] = useState(false)
  const c = colorOf(color)
  const abort = useRef<AbortController | null>(null)

  // Si cerca mezzo secondo dopo che si smette di digitare: Nominatim è
  // gratuito e chiede di non essere tempestato di richieste.
  useEffect(() => {
    if (query.trim().length < 3) {
      setEsito({ stato: 'corto' })
      setBusy(false)
      return
    }
    const timer = setTimeout(async () => {
      abort.current?.abort()
      const controller = new AbortController()
      abort.current = controller
      setBusy(true)
      const risposta = await searchPlaces(query, controller.signal)
      if (controller.signal.aborted) return
      setBusy(false)
      // Una ricerca annullata è stata sostituita da quella dopo: lasciamo in
      // piedi quello che c'è, senza far lampeggiare un messaggio.
      if (risposta.stato !== 'annullato') setEsito(risposta)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  const hasPoint = lat !== null && lng !== null
  const risultati: GeoPlace[] = esito.stato === 'ok' ? esito.luoghi : []
  const mostraMappa = hasPoint || aMano

  function scegli(r: GeoPlace) {
    onChange(r.lat, r.lng, r.name)
    setQuery(r.name)
    setEsito({ stato: 'corto' })
    setOpen(false)
    setAMano(false)
  }

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
              setAMano(false)
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

      <Segnale
        busy={busy}
        esito={esito}
        query={query}
        aperto={open}
        aMano={aMano}
        suMappa={() => {
          setAMano(true)
          setOpen(false)
        }}
      />

      {open && risultati.length > 0 && (
        <ul className="max-h-48 overflow-y-auto rounded-2xl bg-white shadow-soft">
          {risultati.map((r) => (
            <li key={`${r.lat},${r.lng}`}>
              <button
                type="button"
                onClick={() => scegli(r)}
                className="w-full border-b border-black/5 px-4 py-2.5 text-left last:border-0 active:bg-black/5"
              >
                <span className="block text-sm font-semibold">{r.name}</span>
                <span className="block truncate text-xs text-muted">{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {mostraMappa ? (
        <>
          <GeoMap
            height={180}
            points={
              hasPoint
                ? [{ id: 'scelto', lat, lng, label: query || 'Qui', color: c.hex, badge: '📍' }]
                : []
            }
            onPick={(newLat, newLng) => onChange(newLat, newLng)}
            zoom={hasPoint ? 12 : 5}
            fit={false}
          />
          <p className="text-xs text-muted">
            {hasPoint
              ? `Tocca la mappa per spostare il segnaposto. ${hint ?? ''}`
              : 'Avvicina la mappa e tocca il punto esatto: diventa la posizione.'}
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

/**
 * La riga sotto al campo di ricerca. Dice sempre qualcosa, anche — soprattutto
 * — quando non c'è niente da mostrare.
 */
function Segnale({
  busy,
  esito,
  query,
  aperto,
  aMano,
  suMappa,
}: {
  busy: boolean
  esito: GeoEsito
  query: string
  aperto: boolean
  aMano: boolean
  suMappa: () => void
}) {
  if (busy) return <p className="text-xs text-muted">Cerco…</p>
  if (!aperto) return null

  const scritto = query.trim()
  if (esito.stato === 'corto') {
    return scritto.length > 0 ? (
      <p className="text-xs text-muted">Ancora un paio di lettere e cerco.</p>
    ) : null
  }
  if (esito.stato === 'ok' || esito.stato === 'annullato') return null

  const testo =
    esito.stato === 'vuoto'
      ? `Non trovo «${scritto}». Prova col nome del comune, o mettilo sulla mappa a mano.`
      : esito.stato === 'offline'
        ? 'Non raggiungo il servizio delle mappe: forse è giù la rete. Puoi intanto scegliere il punto a mano.'
        : 'Il servizio delle mappe ha fatto i capricci. Riprova fra poco, o scegli il punto a mano.'

  return (
    <div className="rounded-2xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
      <p>{testo}</p>
      {!aMano && (
        <button type="button" onClick={suMappa} className="mt-1 font-semibold underline">
          Scelgo sulla mappa
        </button>
      )}
    </div>
  )
}
