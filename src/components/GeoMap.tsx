import { Suspense, lazy } from 'react'
import type { MapViewProps } from './MapView'

/**
 * Involucro che carica Leaflet solo quando una mappa serve davvero.
 *
 * Si chiama GeoMap e non Map di proposito: `Map` è un tipo predefinito di
 * JavaScript, e importarlo con quel nome lo rende inutilizzabile nel file.
 * Senza questo, il peso della libreria finirebbe addosso anche a chi apre
 * l'app solo per guardare il calendario.
 */
const MapView = lazy(() => import('./MapView'))

export type { MapPoint } from './MapView'

export function GeoMap(props: MapViewProps) {
  return (
    <Suspense
      fallback={
        <div
          className="flex w-full items-center justify-center rounded-[20px] bg-black/5 text-sm text-muted"
          style={{ height: props.height ?? 260 }}
        >
          🗺️ Carico la mappa…
        </div>
      }
    >
      <MapView {...props} />
    </Suspense>
  )
}
