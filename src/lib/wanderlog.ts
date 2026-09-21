import { unzipSync } from 'fflate'

/**
 * Lettura dei file esportati da Wanderlog (e, con gli stessi formati, da
 * Google My Maps, Maps.me, Komoot e compagnia).
 *
 * Wanderlog esporta in KML/KMZ, GPX e CSV a seconda della versione e
 * dell'abbonamento, quindi li leggiamo tutti: meglio un lettore in più che
 * scoprire a metà viaggio che il proprio file non si apre.
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

  if (ext === 'kmz') return parseKml(await readKmzEntry(file), fallbackTitle)
  if (ext === 'kml') return parseKml(await file.text(), fallbackTitle)
  if (ext === 'gpx') return parseGpx(await file.text(), fallbackTitle)
  if (ext === 'csv' || ext === 'tsv') return parseCsv(await file.text(), fallbackTitle)

  // Estensione sconosciuta: proviamo a capirlo dal contenuto.
  const text = await file.text()
  if (text.includes('<kml')) return parseKml(text, fallbackTitle)
  if (text.includes('<gpx')) return parseGpx(text, fallbackTitle)
  if (text.includes(',')) return parseCsv(text, fallbackTitle)
  throw new Error('Non riconosco questo file. Esporta da Wanderlog in KML, GPX o CSV.')
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

  const places: ImportedPlace[] = []
  rows.slice(1).forEach((cells) => {
    if (cells.every((c) => !c.trim())) return
    const name = (iName >= 0 ? cells[iName] : cells[0])?.trim() || 'Senza nome'
    const lat = iLat >= 0 ? Number(cells[iLat]) : NaN
    const lng = iLng >= 0 ? Number(cells[iLng]) : NaN
    // Senza coordinate teniamo l'indirizzo fra le note: servirà per ritrovarlo
    // con la ricerca, invece di perdere la riga.
    const notes = [iNotes >= 0 ? cells[iNotes] : '', iAddr >= 0 ? cells[iAddr] : '']
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

/** Le descrizioni di Wanderlog arrivano spesso piene di tag HTML. */
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
