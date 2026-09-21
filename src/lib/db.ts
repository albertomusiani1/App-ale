import type {
  Achievement,
  CalEvent,
  Category,
  Item,
  Photo,
  PhotoScope,
  Quote,
  Saying,
  Settings,
  Stop,
  StopDay,
} from '../types'
import { PHOTO_BUCKET, supabase } from './supabase'
import { blobStore } from './idb'
import { compressImage, randomId } from './image'
import { DEFAULT_SETTINGS } from './seed'

export interface Dataset {
  categories: Category[]
  items: Item[]
  stops: Stop[]
  stopDays: StopDay[]
  photos: Photo[]
  events: CalEvent[]
  achievements: Achievement[]
  sayings: Saying[]
  quotes: Quote[]
  settings: Settings
}

export type TableName = Exclude<keyof Dataset, 'settings'>

export const emptyDataset = (): Dataset => ({
  categories: [],
  items: [],
  stops: [],
  stopDays: [],
  photos: [],
  events: [],
  achievements: [],
  sayings: [],
  quotes: [],
  settings: { ...DEFAULT_SETTINGS },
})

export interface Backend {
  mode: 'cloud' | 'local'
  load(): Promise<Dataset>
  save<K extends TableName>(table: K, row: Dataset[K][number]): Promise<void>
  remove(table: TableName, id: string): Promise<void>
  saveSettings(settings: Settings): Promise<void>
  uploadPhoto(file: File, scope: PhotoScope, refId: string): Promise<Photo>
  removePhoto(photo: Photo): Promise<void>
  /** Avvisa quando i dati cambiano altrove (l'altro telefono, un'altra scheda). */
  subscribe(onChange: () => void): () => void
}

/* ------------------------------------------------------------------ *
 * Traduzione fra i nomi in camelCase dell'app e le colonne snake_case
 * del database. Tenerla in un posto solo evita sorprese.
 * ------------------------------------------------------------------ */

const TABLE_NAMES: Record<TableName, string> = {
  categories: 'categories',
  items: 'items',
  stops: 'stops',
  stopDays: 'stop_days',
  photos: 'photos',
  events: 'events',
  achievements: 'achievements',
  sayings: 'sayings',
  quotes: 'quotes',
}

type AnyRow = Record<string, unknown>

const mappers: { [K in TableName]: { to: (v: Dataset[K][number]) => AnyRow; from: (r: AnyRow) => Dataset[K][number] } } = {
  categories: {
    to: (c) => ({ id: c.id, name: c.name, emoji: c.emoji, color: c.color, kind: c.kind, builtin: c.builtin, sort: c.sort }),
    from: (r) => ({
      id: r.id as string,
      name: r.name as string,
      emoji: r.emoji as string,
      color: r.color as Category['color'],
      kind: r.kind as Category['kind'],
      builtin: Boolean(r.builtin),
      sort: Number(r.sort ?? 0),
    }),
  },
  items: {
    to: (i) => ({
      id: i.id,
      category_id: i.categoryId,
      title: i.title,
      subtitle: i.subtitle,
      status: i.status,
      start_date: i.startDate,
      end_date: i.endDate,
      notes: i.notes,
      rating_a: i.ratingA,
      rating_b: i.ratingB,
      meta: i.meta,
      cover_photo_id: i.coverPhotoId,
      lat: i.lat,
      lng: i.lng,
      created_at: i.createdAt,
    }),
    from: (r) => ({
      id: r.id as string,
      categoryId: r.category_id as string,
      title: (r.title as string) ?? '',
      subtitle: (r.subtitle as string) ?? '',
      status: (r.status as Item['status']) ?? 'wish',
      startDate: (r.start_date as string) ?? null,
      endDate: (r.end_date as string) ?? null,
      notes: (r.notes as string) ?? '',
      ratingA: (r.rating_a as number) ?? null,
      ratingB: (r.rating_b as number) ?? null,
      meta: (r.meta as Record<string, string>) ?? {},
      coverPhotoId: (r.cover_photo_id as string) ?? null,
      lat: (r.lat as number) ?? null,
      lng: (r.lng as number) ?? null,
      createdAt: (r.created_at as string) ?? new Date().toISOString(),
    }),
  },
  stops: {
    to: (s) => ({
      id: s.id,
      item_id: s.itemId,
      name: s.name,
      days: s.days,
      notes: s.notes,
      position: s.position,
      lat: s.lat,
      lng: s.lng,
    }),
    from: (r) => ({
      id: r.id as string,
      itemId: r.item_id as string,
      name: (r.name as string) ?? '',
      days: Number(r.days ?? 1),
      notes: (r.notes as string) ?? '',
      position: Number(r.position ?? 0),
      lat: (r.lat as number) ?? null,
      lng: (r.lng as number) ?? null,
    }),
  },
  stopDays: {
    to: (d) => ({ id: d.id, stop_id: d.stopId, position: d.position, title: d.title, notes: d.notes }),
    from: (r) => ({
      id: r.id as string,
      stopId: r.stop_id as string,
      position: Number(r.position ?? 0),
      title: (r.title as string) ?? '',
      notes: (r.notes as string) ?? '',
    }),
  },
  photos: {
    // `url` non si salva: nel cloud è un indirizzo firmato che scade,
    // in locale è un object URL valido solo per la sessione corrente.
    to: (p) => ({ id: p.id, scope: p.scope, ref_id: p.refId, path: p.path, caption: p.caption, created_at: p.createdAt }),
    from: (r) => ({
      id: r.id as string,
      scope: r.scope as PhotoScope,
      refId: r.ref_id as string,
      path: (r.path as string) ?? '',
      url: '',
      caption: (r.caption as string) ?? '',
      createdAt: (r.created_at as string) ?? new Date().toISOString(),
    }),
  },
  events: {
    to: (e) => ({ id: e.id, title: e.title, date: e.date, end_date: e.endDate, time: e.time, notes: e.notes, color: e.color, created_at: e.createdAt }),
    from: (r) => ({
      id: r.id as string,
      title: (r.title as string) ?? '',
      date: r.date as string,
      endDate: (r.end_date as string) ?? null,
      time: (r.time as string) ?? null,
      notes: (r.notes as string) ?? '',
      color: (r.color as CalEvent['color']) ?? 'agenda',
      createdAt: (r.created_at as string) ?? new Date().toISOString(),
    }),
  },
  achievements: {
    to: (a) => ({
      id: a.id,
      key: a.key,
      title: a.title,
      description: a.description,
      emoji: a.emoji,
      kind: a.kind,
      target: a.target,
      unlocked_at: a.unlockedAt,
      custom: a.custom,
    }),
    from: (r) => ({
      id: r.id as string,
      key: (r.key as string) ?? 'manual',
      title: (r.title as string) ?? '',
      description: (r.description as string) ?? '',
      emoji: (r.emoji as string) ?? '🏆',
      kind: (r.kind as Achievement['kind']) ?? 'manual',
      target: Number(r.target ?? 1),
      unlockedAt: (r.unlocked_at as string) ?? null,
      custom: Boolean(r.custom),
    }),
  },
  sayings: {
    to: (s) => ({ id: s.id, text: s.text, author: s.author, meaning: s.meaning, created_at: s.createdAt }),
    from: (r) => ({
      id: r.id as string,
      text: (r.text as string) ?? '',
      author: (r.author as Saying['author']) ?? 'both',
      meaning: (r.meaning as string) ?? '',
      createdAt: (r.created_at as string) ?? new Date().toISOString(),
    }),
  },
  quotes: {
    to: (q) => ({ id: q.id, text: q.text, song: q.song, era: q.era, created_at: q.createdAt }),
    from: (r) => ({
      id: r.id as string,
      text: (r.text as string) ?? '',
      song: (r.song as string) ?? '',
      era: (r.era as string) ?? '',
      createdAt: (r.created_at as string) ?? new Date().toISOString(),
    }),
  },
}

const settingsTo = (s: Settings): AnyRow => ({
  id: 1,
  app_name: s.appName,
  texts: s.texts,
  name_a: s.nameA,
  name_b: s.nameB,
  anniversary: s.anniversary,
  saying_frequency: s.sayingFrequency,
  reduced_motion: s.reducedMotion,
})

const settingsFrom = (r: AnyRow): Settings => ({
  appName: (r.app_name as string) || DEFAULT_SETTINGS.appName,
  texts: (r.texts as Record<string, string>) ?? {},
  nameA: (r.name_a as string) ?? DEFAULT_SETTINGS.nameA,
  nameB: (r.name_b as string) ?? DEFAULT_SETTINGS.nameB,
  anniversary: (r.anniversary as string) ?? null,
  sayingFrequency: Number(r.saying_frequency ?? DEFAULT_SETTINGS.sayingFrequency),
  reducedMotion: Boolean(r.reduced_motion),
})

/* ------------------------------------------------------------------ *
 * Backend cloud (Supabase)
 * ------------------------------------------------------------------ */

/** Quanto resta valido un indirizzo firmato: una settimana. */
const SIGNED_URL_TTL = 60 * 60 * 24 * 7
/** Quando manca meno di un giorno alla scadenza lo rifirmiamo. */
const RESIGN_WHEN_LEFT = 60 * 60 * 24
const SIGNED_CACHE_KEY = 'noi-due:signed'

interface SignedEntry {
  url: string
  /** Scadenza in secondi epoch. */
  exp: number
}

/**
 * Gli indirizzi firmati vengono ricordati fra un avvio e l'altro.
 *
 * Non è un dettaglio: firmare di nuovo ogni foto a ogni apertura cambia la
 * query string, il browser non riconosce più l'immagine che ha già in cache
 * e la riscarica. Riusando lo stesso indirizzo finché è valido, le foto
 * viste ieri non ripassano dalla rete — che è ciò che tiene i consumi dentro
 * i 5 GB al mese del piano gratuito di Supabase.
 */
function readSignedCache(): Record<string, SignedEntry> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SIGNED_CACHE_KEY) ?? '{}')
    // Un valore rimasto lì da una versione precedente non deve far esplodere l'avvio.
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, SignedEntry>
  } catch {
    return {}
  }
}

function writeSignedCache(cache: Record<string, SignedEntry>) {
  try {
    localStorage.setItem(SIGNED_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Spazio esaurito o navigazione privata: pazienza, si rifirma ogni volta.
  }
}

function rememberSigned(path: string, url: string) {
  const cache = readSignedCache()
  cache[path] = { url, exp: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL }
  writeSignedCache(cache)
}

/**
 * Il bucket delle foto è privato: senza login nessuno le vede, nemmeno
 * conoscendo l'indirizzo. Qui firmiamo solo le foto che non hanno già un
 * indirizzo valido in cache, in blocchi per non fare centinaia di chiamate.
 */
async function signPhotos(client: NonNullable<typeof supabase>, photos: Photo[]): Promise<Photo[]> {
  const withPath = photos.filter((p) => p.path)
  if (withPath.length === 0) return photos

  const cache = readSignedCache()
  const now = Math.floor(Date.now() / 1000)
  const isFresh = (path: string) => {
    const entry = cache[path]
    return Boolean(entry && entry.exp - now > RESIGN_WHEN_LEFT)
  }

  const daFirmare = withPath.filter((p) => !isFresh(p.path)).map((p) => p.path)
  const CHUNK = 100
  for (let i = 0; i < daFirmare.length; i += CHUNK) {
    const chunk = daFirmare.slice(i, i + CHUNK)
    const { data, error } = await client.storage
      .from(PHOTO_BUCKET)
      .createSignedUrls(chunk, SIGNED_URL_TTL)
    // Una foto che non si firma non deve far fallire tutto il caricamento.
    if (error || !data) continue
    data.forEach((entry) => {
      if (entry.signedUrl && entry.path) {
        cache[entry.path] = { url: entry.signedUrl, exp: now + SIGNED_URL_TTL }
      }
    })
  }

  // Le foto cancellate non devono restare in cache per sempre.
  const vive = new Set(withPath.map((p) => p.path))
  for (const path of Object.keys(cache)) {
    if (!vive.has(path)) delete cache[path]
  }
  writeSignedCache(cache)

  return photos.map((p) => ({ ...p, url: cache[p.path]?.url ?? p.url }))
}

function cloudBackend(client: NonNullable<typeof supabase>): Backend {
  return {
    mode: 'cloud',

    async load() {
      const names = Object.keys(TABLE_NAMES) as TableName[]
      const results = await Promise.all(names.map((n) => client.from(TABLE_NAMES[n]).select('*')))
      const data = emptyDataset()
      names.forEach((name, i) => {
        const { data: rows, error } = results[i]
        if (error) throw new Error(`Lettura di ${name} fallita: ${error.message}`)
        // Il cast è necessario perché TypeScript non collega l'indice al tipo della tabella.
        ;(data[name] as unknown[]) = (rows ?? []).map((r) => mappers[name].from(r as AnyRow))
      })
      const { data: settingsRow } = await client.from('settings').select('*').eq('id', 1).maybeSingle()
      if (settingsRow) data.settings = settingsFrom(settingsRow as AnyRow)
      data.photos = await signPhotos(client, data.photos)
      return data
    },

    async save(table, row) {
      const payload = mappers[table].to(row as never)
      const { error } = await client.from(TABLE_NAMES[table]).upsert(payload)
      if (error) throw new Error(`Salvataggio in ${table} fallito: ${error.message}`)
    },

    async remove(table, id) {
      const { error } = await client.from(TABLE_NAMES[table]).delete().eq('id', id)
      if (error) throw new Error(`Cancellazione da ${table} fallita: ${error.message}`)
    },

    async saveSettings(settings) {
      const { error } = await client.from('settings').upsert(settingsTo(settings))
      if (error) throw new Error(`Salvataggio impostazioni fallito: ${error.message}`)
    },

    async uploadPhoto(file, scope, refId) {
      const blob = await compressImage(file)
      const id = randomId()
      const path = `${scope}/${refId}/${id}.jpg`
      const { error } = await client.storage
        .from(PHOTO_BUCKET)
        .upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: true })
      if (error) throw new Error(`Caricamento foto fallito: ${error.message}`)
      const { data: signed } = await client.storage.from(PHOTO_BUCKET).createSignedUrl(path, SIGNED_URL_TTL)
      if (signed?.signedUrl) rememberSigned(path, signed.signedUrl)
      const photo: Photo = {
        id,
        scope,
        refId,
        path,
        url: signed?.signedUrl ?? '',
        caption: '',
        createdAt: new Date().toISOString(),
      }
      await this.save('photos', photo)
      return photo
    },

    async removePhoto(photo) {
      // Prima il file, poi la riga: se il file resta orfano non si vede niente di rotto.
      if (photo.path) await client.storage.from(PHOTO_BUCKET).remove([photo.path])
      await this.remove('photos', photo.id)
    },

    subscribe(onChange) {
      const channel = client.channel('noi-due-sync')
      Object.values(TABLE_NAMES).forEach((table) => {
        channel.on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
      })
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, onChange)
      channel.subscribe()
      return () => {
        void client.removeChannel(channel)
      }
    },
  }
}

/* ------------------------------------------------------------------ *
 * Backend locale (solo questo dispositivo)
 * ------------------------------------------------------------------ */

const LS_KEY = 'noi-due:data'

function readLocal(): Dataset {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return emptyDataset()
    return { ...emptyDataset(), ...(JSON.parse(raw) as Partial<Dataset>) }
  } catch {
    return emptyDataset()
  }
}

function writeLocal(data: Dataset) {
  // Gli URL delle foto sono object URL temporanei: non ha senso salvarli.
  const toStore: Dataset = { ...data, photos: data.photos.map((p) => ({ ...p, url: '' })) }
  localStorage.setItem(LS_KEY, JSON.stringify(toStore))
}

function localBackend(): Backend {
  return {
    mode: 'local',

    async load() {
      const data = readLocal()
      // Le foto vivono in IndexedDB: qui le ricolleghiamo a un URL utilizzabile.
      data.photos = (
        await Promise.all(
          data.photos.map(async (p) => {
            const blob = await blobStore.get(p.path).catch(() => undefined)
            return blob ? { ...p, url: URL.createObjectURL(blob) } : null
          }),
        )
      ).filter((p): p is Photo => p !== null)
      return data
    },

    async save(table, row) {
      const data = readLocal()
      const list = data[table] as { id: string }[]
      const i = list.findIndex((r) => r.id === row.id)
      if (i >= 0) list[i] = row
      else list.push(row)
      writeLocal(data)
    },

    async remove(table, id) {
      const data = readLocal()
      ;(data[table] as unknown as { id: string }[]) = (data[table] as { id: string }[]).filter((r) => r.id !== id)
      writeLocal(data)
    },

    async saveSettings(settings) {
      const data = readLocal()
      data.settings = settings
      writeLocal(data)
    },

    async uploadPhoto(file, scope, refId) {
      const blob = await compressImage(file)
      const id = randomId()
      await blobStore.put(id, blob)
      const photo: Photo = {
        id,
        scope,
        refId,
        path: id,
        url: URL.createObjectURL(blob),
        caption: '',
        createdAt: new Date().toISOString(),
      }
      await this.save('photos', photo)
      return photo
    },

    async removePhoto(photo) {
      await blobStore.remove(photo.path).catch(() => undefined)
      await this.remove('photos', photo.id)
    },

    subscribe(onChange) {
      // Almeno le schede aperte sullo stesso telefono restano allineate.
      const handler = (e: StorageEvent) => {
        if (e.key === LS_KEY) onChange()
      }
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    },
  }
}

/** Sceglie il cloud se configurato, altrimenti resta in locale. */
export const backend: Backend = supabase ? cloudBackend(supabase) : localBackend()
