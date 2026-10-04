import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import { randomId } from '../lib/image'
import { copyFor } from '../lib/kinds'
import { describePoint } from '../lib/geo'
import { sfondoConChiave } from '../lib/tiles'
import { GeoMap, type MapPoint } from '../components/GeoMap'
import { Sheet } from '../components/Sheet'
import { Field, Input, PageTitle } from '../components/ui'
import type { Category, Item } from '../types'

type Filter = 'all' | 'done' | 'wish'

/**
 * Tutti i posti della nostra storia su un'unica mappa: le tappe dei viaggi,
 * i locali, le uscite. Il colore dice la categoria, così si legge a colpo
 * d'occhio dove siamo stati e cosa ci resta da fare.
 *
 * È *la* mappa condivisa: non ce n'è una per sezione. Tutto quello che ha una
 * posizione, da qualunque categoria arrivi, finisce qui. E da qui si può
 * anche aggiungere: si tocca il punto, si sceglie dove metterlo, e da quel
 * momento è un elemento come gli altri.
 */
export function WorldMapPage() {
  const { data, t, saveItem } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [only, setOnly] = useState<string | null>(null)
  const [nuovo, setNuovo] = useState<{ lat: number; lng: number } | null>(null)
  const [inAscolto, setInAscolto] = useState(false)

  const categories = useMemo(
    () => [...data.categories].sort((a, b) => a.sort - b.sort),
    [data.categories],
  )

  const points = useMemo<MapPoint[]>(() => {
    const byId = new Map(data.categories.map((c) => [c.id, c]))
    const out: MapPoint[] = []

    for (const item of data.items) {
      const category = byId.get(item.categoryId)
      if (!category) continue
      if (only && category.id !== only) continue
      if (filter === 'done' && item.status !== 'done') continue
      if (filter === 'wish' && item.status === 'done') continue

      const color = colorOf(category.color).hex
      const go = () => navigate(`/c/${category.id}/${item.id}`)

      if (item.lat !== null && item.lng !== null) {
        out.push({
          id: item.id,
          lat: item.lat,
          lng: item.lng,
          label: item.title,
          color,
          badge: category.emoji,
          onClick: go,
        })
      }

      // Le tappe di un viaggio sono posti a tutti gli effetti: sulla mappa
      // grande valgono quanto gli altri, altrimenti i viaggi sparirebbero
      // dietro un solo segnaposto.
      for (const stop of data.stops) {
        if (stop.itemId !== item.id || stop.lat === null || stop.lng === null) continue
        out.push({
          id: stop.id,
          lat: stop.lat,
          lng: stop.lng,
          label: `${stop.name} · ${item.title}`,
          color,
          badge: category.emoji,
          onClick: go,
        })
      }
    }
    return out
  }, [data.items, data.stops, data.categories, filter, only, navigate])

  const done = data.items.filter((i) => i.status === 'done' && i.lat !== null).length

  // Il segnaposto che si sta posando si vede subito, ma non è ancora salvato:
  // esiste solo finché il pannello resta aperto.
  const daMostrare = nuovo
    ? [...points, { id: 'nuovo', lat: nuovo.lat, lng: nuovo.lng, label: 'Nuovo posto', color: '#2B1F26', badge: '📍' }]
    : points

  return (
    <div className="pb-4">
      <PageTitle
        emoji="🌍"
        title={t('nav.world')}
        subtitle={t('nav.worldSubtitle')}
        color="trips"
        action={
          <Link
            to="/tutte"
            aria-label="Indietro"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft active:scale-90"
          >
            ‹
          </Link>
        }
      />

      <div className="mb-3 flex gap-1 rounded-full bg-white p-1 shadow-soft">
        {(
          [
            ['all', 'Tutto'],
            ['done', 'Fatti'],
            ['wish', 'Da fare'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className="flex-1 rounded-full px-3 py-2 text-sm font-semibold transition"
            style={
              filter === value
                ? { background: colorOf('trips').soft, color: colorOf('trips').ink }
                : { color: '#7A6A72' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setOnly(null)}
          className="shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95"
          style={
            only === null
              ? { background: '#2B1F26', color: '#FFFFFF' }
              : { background: '#fff', color: '#7A6A72' }
          }
        >
          Tutte
        </button>
        {categories.map((category) => {
          const c = colorOf(category.color)
          const active = only === category.id
          return (
            <button
              key={category.id}
              onClick={() => setOnly(active ? null : category.id)}
              className="shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95"
              style={active ? { background: c.hex, color: c.on } : { background: c.soft, color: c.ink }}
            >
              {category.emoji} {category.name}
            </button>
          )
        })}
      </div>

      {/*
        La mappa c'è sempre, anche quando non abbiamo ancora segnato niente.
        Prima al suo posto compariva un riquadro "Mappa vuota", e da lì non si
        poteva fare nulla: la mappa sembrava rotta invece che vuota.
      */}
      <GeoMap
        height={400}
        points={daMostrare}
        fit={!inAscolto && !nuovo}
        onPick={inAscolto ? (lat, lng) => setNuovo({ lat, lng }) : undefined}
      />

      <button
        type="button"
        onClick={() => setInAscolto((v) => !v)}
        aria-pressed={inAscolto}
        className="btn mt-3 w-full shadow-lift"
        style={
          inAscolto
            ? { background: '#2B1F26', color: '#FFFFFF' }
            : { background: colorOf('trips').hex, color: colorOf('trips').on }
        }
      >
        {inAscolto ? '✋ Aspetto il tocco — annulla' : '📍 Segna un posto nuovo'}
      </button>

      {inAscolto && !nuovo && (
        <p className="mt-2 text-center text-xs text-muted">
          Avvicina la mappa fin dove vedi la via, poi tocca il punto esatto.
        </p>
      )}

      {points.length === 0 && !inAscolto && (
        <p className="mt-2 text-center text-xs text-muted">{t('empty.map')}</p>
      )}

      {!sfondoConChiave && (
        <p className="mt-2 text-center text-xs text-muted">
          Sfondo OpenStreetMap. Con la chiave CARTO fra le variabili torna lo stile tenue.
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-white px-3 py-3 shadow-soft">
          <p className="font-display text-2xl font-bold">{points.length}</p>
          <p className="text-xs text-muted">segnaposto sulla mappa</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-3 shadow-soft">
          <p className="font-display text-2xl font-bold">{done}</p>
          <p className="text-xs text-muted">già spuntati</p>
        </div>
      </div>

      <PostoNuovoSheet
        punto={nuovo}
        categories={categories}
        preferita={only}
        onClose={() => setNuovo(null)}
        onSalva={async (item) => {
          await saveItem(item)
          setNuovo(null)
          setInAscolto(false)
          navigate(`/c/${item.categoryId}/${item.id}`)
        }}
      />
    </div>
  )
}

/**
 * Il pannello che si apre dopo il tocco: nome e categoria, nient'altro.
 *
 * Il nome del posto lo proponiamo chiedendolo a OpenStreetMap, ma resta una
 * proposta scritta nel campo: le coordinate sono e restano quelle che ha
 * scelto il dito, non quelle che indovina l'app.
 */
function PostoNuovoSheet({
  punto,
  categories,
  preferita,
  onClose,
  onSalva,
}: {
  punto: { lat: number; lng: number } | null
  categories: Category[]
  /** La categoria filtrata sulla mappa, se ce n'è una: è quasi sempre quella giusta. */
  preferita: string | null
  onClose: () => void
  onSalva: (item: Item) => Promise<void>
}) {
  // Un segnaposto non ha senso ovunque: i traguardi non stanno su una mappa,
  // e "Cinema & Serie" tiene i film visti, non le sale. Restano i viaggi, i
  // posti e le categorie libere, che sono poi quelle dove un indirizzo serve.
  const adatte = useMemo(() => {
    const buone = categories.filter((c) => c.kind !== 'goals' && c.kind !== 'screen')
    return buone.length ? buone : categories
  }, [categories])

  // Chi tocca la mappa quasi sempre sta segnando un posto, non un viaggio.
  const prima = useMemo(
    () => (adatte.find((c) => c.kind === 'places') ?? adatte[0])?.id ?? null,
    [adatte],
  )
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<string | null>(null)
  const [suggerito, setSuggerito] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Ogni tocco è un posto diverso: il pannello riparte pulito, e intanto va a
  // chiedere come si chiama quell'angolo di mondo.
  const lat = punto?.lat ?? null
  const lng = punto?.lng ?? null
  useEffect(() => {
    if (lat === null || lng === null) return
    setNome('')
    setSuggerito(null)
    // Il filtro acceso sulla mappa è un indizio migliore di qualunque default.
    const indizio = adatte.some((c) => c.id === preferita) ? preferita : null
    setCategoria(indizio ?? prima ?? null)
    let vivo = true
    void describePoint(lat, lng).then((testo) => {
      if (vivo && testo) setSuggerito(testo.split(',').slice(0, 2).join(',').trim())
    })
    return () => {
      vivo = false
    }
  }, [lat, lng, preferita, prima, adatte])

  const scelta = adatte.find((c) => c.id === categoria) ?? null
  const c = colorOf(scelta?.color ?? 'trips')
  const canSave = nome.trim().length > 0 && scelta !== null && punto !== null

  async function salva() {
    if (!canSave || !punto || !scelta) return
    setBusy(true)
    try {
      await onSalva({
        id: randomId(),
        categoryId: scelta.id,
        title: nome.trim(),
        subtitle: '',
        status: 'wish',
        startDate: null,
        endDate: null,
        notes: '',
        ratingA: null,
        ratingB: null,
        meta: {},
        coverPhotoId: null,
        lat: punto.lat,
        lng: punto.lng,
        visits: 0,
        createdAt: new Date().toISOString(),
      })
      setNome('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      open={punto !== null}
      onClose={onClose}
      title="Un posto nuovo qui"
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">
            Annulla
          </button>
          <button
            onClick={() => void salva()}
            disabled={!canSave || busy}
            className="btn flex-[2] shadow-lift"
            style={{ background: c.hex, color: c.on }}
          >
            {busy ? 'Salvo…' : 'Segnalo'}
          </button>
        </div>
      }
    >
      <Field label="Come si chiama">
        <Input
          value={nome}
          placeholder="Il nome che gli diamo noi"
          onChange={(e) => setNome(e.target.value)}
        />
      </Field>

      {suggerito && nome.trim() === '' && (
        <button
          type="button"
          onClick={() => setNome(suggerito)}
          className="-mt-1 text-left text-xs font-semibold text-muted underline"
        >
          Qui c'è «{suggerito}» — usa questo nome
        </button>
      )}

      <div role="group" aria-labelledby="posto-nuovo-categoria" className="space-y-2">
        <span id="posto-nuovo-categoria" className="label mb-0">
          In che sezione lo mettiamo
        </span>
        <div className="flex flex-wrap gap-2">
          {adatte.map((category) => {
            const cc = colorOf(category.color)
            const active = categoria === category.id
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoria(category.id)}
                className="rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95"
                style={active ? { background: cc.hex, color: cc.on } : { background: cc.soft, color: cc.ink }}
              >
                {category.emoji} {category.name}
              </button>
            )
          })}
        </div>
      </div>

      {punto && (
        <p className="text-xs text-muted">
          Lo segniamo a {punto.lat.toFixed(4)}, {punto.lng.toFixed(4)} come{' '}
          {scelta ? copyFor(scelta.kind).one : 'posto'} da provare. Il resto — foto, date, voti —
          si aggiunge dopo dalla sua scheda.
        </p>
      )}
    </Sheet>
  )
}
