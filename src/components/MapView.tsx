import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapPoint {
  id: string
  lat: number
  lng: number
  label: string
  /** Colore della categoria, in esadecimale. */
  color: string
  /** Numero della tappa o emoji della categoria. */
  badge?: string
  onClick?: () => void
}

export interface MapViewProps {
  points: MapPoint[]
  /** Collega i punti con una linea, nell'ordine in cui arrivano. */
  route?: boolean
  height?: number
  /** Se presente, toccando la mappa si sceglie una posizione. */
  onPick?: (lat: number, lng: number) => void
  center?: [number, number]
  zoom?: number
}

/**
 * La mappa vera e propria.
 *
 * Sta in un file a parte perché Leaflet pesa: viene caricato solo quando una
 * mappa compare davvero sullo schermo (vedi Map.tsx).
 *
 * I segnaposto sono disegnati con HTML invece che con le immagini di Leaflet:
 * così prendono il colore della loro categoria e possono contenere il numero
 * della tappa, e non dipendono da file che i bundler tendono a perdere.
 */
export default function MapView({
  points,
  route = false,
  height = 260,
  onPick,
  center,
  zoom,
}: MapViewProps) {
  const holder = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  /** Serve dentro il gestore del clic, che viene registrato una volta sola. */
  const pick = useRef(onPick)
  pick.current = onPick

  // Creazione della mappa: una volta sola per tutta la vita del componente.
  useEffect(() => {
    if (!holder.current || map.current) return
    const m = L.map(holder.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    }).setView(center ?? [41.9, 12.5], zoom ?? 4)

    // Sfondo CARTO: costruito sui dati OpenStreetMap, con colori tenui che non
    // rubano la scena ai segnaposto colorati delle categorie.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 19,
    }).addTo(m)

    m.on('click', (e: L.LeafletMouseEvent) => pick.current?.(e.latlng.lat, e.latlng.lng))
    layer.current = L.layerGroup().addTo(m)
    map.current = m

    // La mappa nasce spesso dentro un pannello che si sta ancora aprendo:
    // senza questo resta grigia perché ha misurato una dimensione sbagliata.
    const t = setTimeout(() => m.invalidateSize(), 180)
    return () => {
      clearTimeout(t)
      m.remove()
      map.current = null
      layer.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Segnaposto e percorso, ridisegnati quando cambiano i punti.
  useEffect(() => {
    const m = map.current
    const group = layer.current
    if (!m || !group) return
    group.clearLayers()

    points.forEach((p) => {
      const icon = L.divIcon({
        className: '',
        html: `<span style="
          display:flex;align-items:center;justify-content:center;
          width:28px;height:28px;border-radius:50% 50% 50% 4px;
          transform:rotate(-45deg);
          background:${p.color};color:#fff;
          font:700 12px/1 Inter,system-ui,sans-serif;
          box-shadow:0 3px 10px rgba(0,0,0,.35);border:2px solid #fff;
        "><span style="transform:rotate(45deg)">${p.badge ?? ''}</span></span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })
      const marker = L.marker([p.lat, p.lng], { icon, title: p.label }).addTo(group)
      marker.bindPopup(`<strong>${escapeHtml(p.label)}</strong>`)
      if (p.onClick) marker.on('click', p.onClick)
    })

    if (route && points.length > 1) {
      L.polyline(
        points.map((p) => [p.lat, p.lng] as [number, number]),
        { color: points[0].color, weight: 3, opacity: 0.65, dashArray: '6 8' },
      ).addTo(group)
    }

    if (points.length === 1) {
      m.setView([points[0].lat, points[0].lng], Math.max(zoom ?? 0, 11))
    } else if (points.length > 1) {
      m.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), {
        padding: [36, 36],
        maxZoom: 13,
      })
    }
  }, [points, route, zoom])

  return (
    <div
      ref={holder}
      style={{ height, borderRadius: 20, overflow: 'hidden', zIndex: 0 }}
      className="w-full bg-black/5"
      role="application"
      aria-label="Mappa"
    />
  )
}

/** I nomi dei posti arrivano da file esterni: non devono poter iniettare HTML. */
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  )
}
