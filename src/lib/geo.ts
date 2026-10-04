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

/**
 * Com'è andata la ricerca. Non basta la lista dei risultati: una lista vuota
 * perché il posto non esiste e una lista vuota perché il telefono è offline
 * vanno dette in due modi diversi, altrimenti sembra che l'app sia rotta.
 */
export type GeoEsito =
  | { stato: 'ok'; luoghi: GeoPlace[] }
  | { stato: 'vuoto' }
  | { stato: 'corto' }
  | { stato: 'offline' }
  | { stato: 'errore' }
  | { stato: 'annullato' }

const cache = new Map<string, GeoPlace[]>()
let lastCall = 0

/** Aspetta quanto serve perché sia passato almeno un secondo dall'ultima chiamata. */
async function throttle() {
  const wait = MIN_GAP_MS - (Date.now() - lastCall)
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastCall = Date.now()
}

/** Cerca un posto per nome, dicendo anche *perché* non ha trovato niente. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoEsito> {
  const q = query.trim()
  if (q.length < 3) return { stato: 'corto' }
  const cached = cache.get(q.toLowerCase())
  if (cached) return cached.length ? { stato: 'ok', luoghi: cached } : { stato: 'vuoto' }

  await throttle()
  if (signal?.aborted) return { stato: 'annullato' }

  const url = `${ENDPOINT}/search?format=jsonv2&limit=6&accept-language=it&q=${encodeURIComponent(q)}`
  try {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    // Nominatim risponde 429 a chi insiste e 5xx quando è sotto sforzo: in
    // entrambi i casi il posto magari esiste, siamo noi che non lo sappiamo.
    if (!res.ok) return { stato: 'errore' }
    const rows = (await res.json()) as { display_name: string; name?: string; lat: string; lon: string }[]
    const places = rows.map((r) => ({
      label: r.display_name,
      name: r.name || r.display_name.split(',')[0],
      lat: Number(r.lat),
      lng: Number(r.lon),
    }))
    cache.set(q.toLowerCase(), places)
    return places.length ? { stato: 'ok', luoghi: places } : { stato: 'vuoto' }
  } catch {
    // `fetch` fallisce allo stesso modo se la richiesta è stata annullata o se
    // la rete non c'è: il segnale dice quale dei due è successo.
    if (signal?.aborted) return { stato: 'annullato' }
    return { stato: 'offline' }
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
