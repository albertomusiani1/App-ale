import { unzipSync } from 'fflate'

/**
 * Lettura delle liste di posti esportate da un'altra app.
 *
 * Il caso che ci interessa è **Mapstr**, che manda per mail un CSV e un
 * GeoJSON con tutti i posti salvati. Ma i formati sono gli stessi che usano
 * Google My Maps, Maps.me, Komoot e mezzo mondo, quindi li leggiamo tutti:
 * meglio un lettore in più che scoprire a metà serata che il proprio file
 * non si apre.
 */

export interface ImportedPlace {
  name: string
  notes: string
  lat: number | null
  lng: number | null
}

export interface ImportedTrip {
  title: string
  places: ImportedPlace[]
  /** Che formato è stato riconosciuto, da mostrare nel riepilogo. */
  format: string
}

export async function parseTripFile(file: File): Promise<ImportedTrip> {
  const ext = file.name.toLowerCase().split('.').pop() ?? ''
  const fallbackTitle = file.name.replace(/\.[^.]+$/, '')

  if (ext === 'json' || ext === 'geojson') return parseGeoJson(await file.text(), fallbackTitle)
  if (ext === 'kmz') return parseKml(await readKmzEntry(file), fallbackTitle)
  if (ext === 'kml') return parseKml(await file.text(), fallbackTitle)
  if (ext === 'gpx') return parseGpx(await file.text(), fallbackTitle)
  if (ext === 'csv' || ext === 'tsv') return parseCsv(await file.text(), fallbackTitle)

  // Estensione sconosciuta: proviamo a capirlo dal contenuto.
  const text = await file.text()
  if (text.trimStart().startsWith('{') || text.trimStart().startsWith('['))
    return parseGeoJson(text, fallbackTitle)
  if (text.includes('<kml')) return parseKml(text, fallbackTitle)
  if (text.includes('<gpx')) return parseGpx(text, fallbackTitle)
  if (text.includes(',')) return parseCsv(text, fallbackTitle)
  throw new Error('Non riconosco questo file. Da Mapstr vanno bene il GeoJSON e il CSV.')
}

/**
 * GeoJSON, che è il formato buono di Mapstr: ogni posto è una "feature" con
 * le coordinate e un sacchetto di proprietà dal nome mai uguale fra un'app e
 * l'altra, quindi i nomi probabili li proviamo tutti.
 *
 * Le coordinate stanno in [longitudine, latitudine]: l'ordine è al contrario
 * di come si legge di solito, ed è l'errore che fa finire tutti i ristoranti
 * in mezzo al mare.
 */
function parseGeoJson(text: string, fallbackTitle: string): ImportedTrip {
  let root: unknown
  try {
    root = JSON.parse(text)
  } catch {
    throw new Error('Questo file non è un GeoJSON leggibile.')
  }

  const oggetto = root as { type?: string; name?: string; features?: unknown }
  const features = Array.isArray(oggetto?.features)
    ? (oggetto.features as Record<string, unknown>[])
    : Array.isArray(root)
      ? (root as Record<string, unknown>[])
      : null
  if (!features) throw new Error('Nel file non trovo la lista dei posti.')

  const places: ImportedPlace[] = []
  for (const feature of features) {
    const props = (feature?.properties as Record<string, unknown> | undefined) ?? feature ?? {}
    const geometry = feature?.geometry as { type?: string; coordinates?: unknown } | undefined

    const coppia = primaCoppia(geometry?.coordinates)
    // Qualche esportazione mette le coordinate fra le proprietà invece che
    // nella geometria: prima della geometria non vince, ma se manca serve.
    const lat = coppia ? coppia[1] : numero(props, 'lat', 'latitude', 'latitudine')
    const lng = coppia ? coppia[0] : numero(props, 'lng', 'lon', 'long', 'longitude', 'longitudine')

    const name = testo(props, 'name', 'nome', 'title', 'titolo', 'place', 'placename') || 'Senza nome'
    const note = testo(props, 'comment', 'comments', 'note', 'notes', 'description', 'descrizione')
    const indirizzo = testo(props, 'address', 'indirizzo', 'formatted_address', 'vicinity')
    // Le etichette di Mapstr ("pizza", "da provare") sono il motivo per cui
    // quella lista esiste: buttarle via sarebbe un peccato.
    const etichette = elenco(props, 'tags', 'tag', 'categories', 'category')

    if (name === 'Senza nome' && lat === null) continue
    places.push({
      name,
      notes: [note, indirizzo, etichette].filter(Boolean).join(' · '),
      lat,
      lng,
    })
  }

  const title = typeof oggetto?.name === 'string' && oggetto.name.trim() ? oggetto.name.trim() : fallbackTitle
  return { title, places, format: 'GeoJSON' }
}

/** La prima coppia longitudine/latitudine, da qualunque profondità arrivi. */
function primaCoppia(coords: unknown): [number, number] | null {
  if (!Array.isArray(coords)) return null
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    const [lng, lat] = coords as number[]
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : null
  }
  for (const figlio of coords) {
    const trovata = primaCoppia(figlio)
    if (trovata) return trovata
  }
  return null
}

/** Legge una proprietà di testo provando più nomi, senza badare a maiuscole. */
function testo(props: Record<string, unknown>, ...nomi: string[]): string {
  for (const chiave of Object.keys(props)) {
    if (!nomi.includes(chiave.toLowerCase())) continue
    const valore = props[chiave]
    if (typeof valore === 'string' && valore.trim()) return stripHtml(valore)
    if (typeof valore === 'number') return String(valore)
  }
  return ''
}

function numero(props: Record<string, unknown>, ...nomi: string[]): number | null {
  for (const chiave of Object.keys(props)) {
    if (!nomi.includes(chiave.toLowerCase())) continue
    const valore = Number(props[chiave])
    if (Number.isFinite(valore) && valore !== 0) return valore
  }
  return null
}

/** Le etichette arrivano come lista o come stringa separata da virgole. */
function elenco(props: Record<string, unknown>, ...nomi: string[]): string {
  for (const chiave of Object.keys(props)) {
    if (!nomi.includes(chiave.toLowerCase())) continue
    const valore = props[chiave]
    if (Array.isArray(valore)) {
      const voci = valore.map((v) => String(v).trim()).filter(Boolean)
      if (voci.length) return voci.join(', ')
    }
    if (typeof valore === 'string' && valore.trim()) return valore.trim()
  }
  return ''
}

/** Un KMZ è uno zip con dentro un KML. */
async function readKmzEntry(file: File): Promise<string> {
  const files = unzipSync(new Uint8Array(await file.arrayBuffer()))
  const name = Object.keys(files).find((n) => n.toLowerCase().endsWith('.kml'))
  if (!name) throw new Error('Questo KMZ non contiene nessun file KML.')
  return new TextDecoder().decode(files[name])
}

function xml(text: string, root: string): Document {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  if (doc.querySelector('parsererror') || !doc.querySelector(root)) {
    throw new Error(`Il file non sembra un ${root.toUpperCase()} valido.`)
  }
  return doc
}

function parseKml(text: string, fallbackTitle: string): ImportedTrip {
  const doc = xml(text, 'kml')
  const title = doc.querySelector('Document > name')?.textContent?.trim() || fallbackTitle

  const places: ImportedPlace[] = []
  doc.querySelectorAll('Placemark').forEach((node) => {
    const name = node.querySelector('name')?.textContent?.trim() ?? ''
    const notes = stripHtml(node.querySelector('description')?.textContent ?? '')
    // Un Placemark può contenere un punto, una linea o un poligono: a noi
    // interessa la prima coppia di coordinate, che è dove sta il posto.
    const raw = node.querySelector('coordinates')?.textContent?.trim() ?? ''
    const first = raw.split(/\s+/)[0] ?? ''
    // In KML l'ordine è longitudine, latitudine, quota: non è quello abituale.
    const [lng, lat] = first.split(',').map(Number)
    if (!name && !Number.isFinite(lat)) return
    places.push({
      name: name || 'Senza nome',
      notes,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    })
  })

  return { title, places, format: 'KML' }
}

function parseGpx(text: string, fallbackTitle: string): ImportedTrip {
  const doc = xml(text, 'gpx')
  const title = doc.querySelector('metadata > name, trk > name')?.textContent?.trim() || fallbackTitle

  const places: ImportedPlace[] = []
  // I punti di interesse sono i waypoint; i punti della traccia sono migliaia
  // e non hanno un nome, quindi non diventano tappe.
  doc.querySelectorAll('wpt').forEach((node) => {
    const lat = Number(node.getAttribute('lat'))
    const lng = Number(node.getAttribute('lon'))
    places.push({
      name: node.querySelector('name')?.textContent?.trim() || 'Senza nome',
      notes: stripHtml(node.querySelector('desc, cmt')?.textContent ?? ''),
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    })
  })

  if (places.length === 0) {
    doc.querySelectorAll('trk > name, rte > name').forEach((node) => {
      places.push({ name: node.textContent?.trim() || 'Tappa', notes: '', lat: null, lng: null })
    })
  }

  return { title, places, format: 'GPX' }
}

function parseCsv(text: string, fallbackTitle: string): ImportedTrip {
  const rows = splitCsv(text)
  if (rows.length < 2) throw new Error('Il CSV è vuoto o ha solo l intestazione.')

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const find = (...names: string[]) => header.findIndex((h) => names.some((n) => h === n || h.includes(n)))

  const iName = find('name', 'title', 'nome', 'place', 'luogo')
  const iLat = find('latitude', 'lat')
  const iLng = find('longitude', 'lng', 'lon')
  const iNotes = find('note', 'description', 'descrizione', 'comment')
  const iAddr = find('address', 'indirizzo', 'formatted')
  // Mapstr esporta le sue etichette in una colonna "tags": sono il modo in
  // cui quella lista è organizzata, e vanno tenute.
  const iTags = find('tag', 'categor', 'etichett')

  const places: ImportedPlace[] = []
  rows.slice(1).forEach((cells) => {
    if (cells.every((c) => !c.trim())) return
    const name = (iName >= 0 ? cells[iName] : cells[0])?.trim() || 'Senza nome'
    const lat = iLat >= 0 ? Number(cells[iLat]) : NaN
    const lng = iLng >= 0 ? Number(cells[iLng]) : NaN
    // Senza coordinate teniamo l'indirizzo fra le note: servirà per ritrovarlo
    // con la ricerca, invece di perdere la riga.
    const notes = [
      iNotes >= 0 ? cells[iNotes] : '',
      iAddr >= 0 ? cells[iAddr] : '',
      iTags >= 0 ? cells[iTags] : '',
    ]
      .map((v) => (v ?? '').trim())
      .filter(Boolean)
      .join(' · ')
    places.push({
      name,
      notes,
      lat: Number.isFinite(lat) && lat !== 0 ? lat : null,
      lng: Number.isFinite(lng) && lng !== 0 ? lng : null,
    })
  })

  return { title: fallbackTitle, places, format: 'CSV' }
}

/**
 * Divisore CSV che rispetta le virgolette: i nomi dei posti contengono virgole
 * (“Roma, Italia”) molto più spesso di quanto si creda.
 */
function splitCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += ch
      continue
    }
    if (ch === '"') quoted = true
    else if (ch === ',' || ch === '\t') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (ch !== '\r') cell += ch
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.length > 0)
}

/** Le descrizioni esportate arrivano spesso piene di tag HTML. */
function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}
