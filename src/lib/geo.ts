/**
 * Ricerca di luoghi e coordinate, appoggiata a Nominatim di OpenStreetMap.
 *
 * È gratuito e non richiede nessuna chiave, ma chiede in cambio di non
 * martellarlo: una richiesta al secondo al massimo. Qui le mettiamo in coda e
 * teniamo in memoria i risultati già visti, così scrivendo in fretta nel campo
 * di ricerca non parte una richiesta per ogni lettera.
 */

export interface GeoPlace {
  label: string
  /** La parte breve del nome, da usare come titolo. */
  name: string
  lat: number
  lng: number
}

const ENDPOINT = 'https://nominatim.openstreetmap.org'
const MIN_GAP_MS = 1100

const cache = new Map<string, GeoPlace[]>()
let lastCall = 0

/** Aspetta quanto serve perché sia passato almeno un secondo dall'ultima chiamata. */
async function throttle() {
  const wait = MIN_GAP_MS - (Date.now() - lastCall)
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastCall = Date.now()
}

/** Cerca un posto per nome. Restituisce una lista vuota se non trova nulla. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  const q = query.trim()
  if (q.length < 3) return []
  const cached = cache.get(q.toLowerCase())
  if (cached) return cached

  await throttle()
  if (signal?.aborted) return []

  const url = `${ENDPOINT}/search?format=jsonv2&limit=6&accept-language=it&q=${encodeURIComponent(q)}`
  try {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return []
    const rows = (await res.json()) as { display_name: string; name?: string; lat: string; lon: string }[]
    const places = rows.map((r) => ({
      label: r.display_name,
      name: r.name || r.display_name.split(',')[0],
      lat: Number(r.lat),
      lng: Number(r.lon),
    }))
    cache.set(q.toLowerCase(), places)
    return places
  } catch {
    // Rete assente o richiesta annullata: per l'app è semplicemente "nessun risultato".
    return []
  }
}

/** Il contrario: da coordinate a nome, per quando si tocca un punto sulla mappa. */
export async function describePoint(lat: number, lng: number): Promise<string> {
  await throttle()
  const url = `${ENDPOINT}/reverse?format=jsonv2&accept-language=it&lat=${lat}&lon=${lng}`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return ''
    const row = (await res.json()) as { display_name?: string }
    return row.display_name ?? ''
  } catch {
    return ''
  }
}

/** Distanza in chilometri fra due punti (formula dell'emisenoverso). */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
