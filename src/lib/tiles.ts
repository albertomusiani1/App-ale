/**
 * Lo sfondo delle mappe: quali tessere scaricare e a chi vanno i crediti.
 *
 * Sta in un file suo, e non dentro MapView, perché le pagine devono poter
 * chiedere "c'è la chiave?" senza tirarsi dietro Leaflet, che pesa e viene
 * caricato solo quando una mappa compare davvero.
 *
 * Da fine agosto 2026 CARTO vuole una chiave anche per l'uso gratuito: le
 * richieste anonime rispondono, ma le tessere arrivano con sopra stampato
 * "API KEY REQUIRED". La chiave si prende in mezzo minuto e senza account su
 * https://carto.com/basemaps/apikey e si mette fra le variabili di
 * compilazione come VITE_CARTO_KEY.
 *
 * Finché non c'è usiamo le tessere di OpenStreetMap: più cariche di colore
 * dello stile Voyager, ma leggibili e senza chiave. Così l'app funziona
 * comunque, prima e dopo.
 */

const chiave = (import.meta.env.VITE_CARTO_KEY as string | undefined)?.trim()

export const sfondoConChiave = Boolean(chiave)

export const sfondoMappa = chiave
  ? {
      url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(chiave)}`,
      attribution: '© OpenStreetMap, © CARTO',
      subdomains: 'abcd',
    }
  : {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap',
      subdomains: 'abc',
    }
