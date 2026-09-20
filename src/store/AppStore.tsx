import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { backend, emptyDataset, type Dataset, type TableName } from '../lib/db'
import { newlyUnlocked } from '../lib/achievements'
import { randomId } from '../lib/image'
import {
  CAT,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_CATEGORIES,
  DEFAULT_QUOTES,
} from '../lib/seed'
import type {
  Achievement,
  CalEvent,
  Category,
  ColorKey,
  Item,
  Photo,
  PhotoScope,
  Quote,
  Saying,
  Settings,
  Stop,
  StopDay,
} from '../types'

/** Il pop-up celebrativo che compare al centro dello schermo. */
export interface Celebration {
  title: string
  subtitle: string
  emoji: string
  color: ColorKey
  /** Una frase, se ce n'è una da mostrare. */
  quote?: Quote
  /** Foto caricata da voi nella galleria delle impostazioni. */
  photoUrl?: string
}

interface AppValue {
  data: Dataset
  loading: boolean
  error: string | null
  mode: 'cloud' | 'local'

  // scritture
  saveItem: (item: Item) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  saveStop: (stop: Stop) => Promise<void>
  deleteStop: (id: string) => Promise<void>
  saveStopDay: (day: StopDay) => Promise<void>
  saveEvent: (event: CalEvent) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  saveCategory: (category: Category) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  saveAchievement: (achievement: Achievement) => Promise<void>
  deleteAchievement: (id: string) => Promise<void>
  saveSaying: (saying: Saying) => Promise<void>
  deleteSaying: (id: string) => Promise<void>
  saveQuote: (quote: Quote) => Promise<void>
  deleteQuote: (id: string) => Promise<void>
  updateSettings: (patch: Partial<Settings>) => Promise<void>
  addPhoto: (file: File, scope: PhotoScope, refId: string) => Promise<Photo>
  deletePhoto: (photo: Photo) => Promise<void>

  // celebrazioni
  celebration: Celebration | null
  celebrate: (celebration: Celebration) => void
  dismissCelebration: () => void
  refresh: () => Promise<void>
}

const AppContext = createContext<AppValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset>(emptyDataset)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  /** Evita che un salvataggio appena fatto da noi scateni un ricarico inutile. */
  const writingRef = useRef(0)

  const load = useCallback(async () => {
    try {
      const loaded = await backend.load()
      const seeded = await seedIfNeeded(loaded)
      setData(seeded)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Qualcosa è andato storto nel caricamento.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Quando l'altra persona salva qualcosa, ricarichiamo.
  useEffect(() => {
    return backend.subscribe(() => {
      if (Date.now() - writingRef.current < 1500) return
      void load()
    })
  }, [load])

  /** Aggiorna subito lo schermo e poi scrive: l'app non deve mai "aspettare". */
  const write = useCallback(
    async <K extends TableName>(table: K, row: Dataset[K][number], apply: (d: Dataset) => Dataset) => {
      writingRef.current = Date.now()
      setData(apply)
      try {
        await backend.save(table, row)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Salvataggio non riuscito.')
        await load()
      }
    },
    [load],
  )

  const erase = useCallback(
    async (table: TableName, id: string, apply: (d: Dataset) => Dataset) => {
      writingRef.current = Date.now()
      setData(apply)
      try {
        await backend.remove(table, id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Cancellazione non riuscita.')
        await load()
      }
    },
    [load],
  )

  const upsertIn = <T extends { id: string }>(list: T[], row: T): T[] => {
    const i = list.findIndex((r) => r.id === row.id)
    if (i < 0) return [...list, row]
    const next = [...list]
    next[i] = row
    return next
  }

  /* ---------------- item ---------------- */

  const saveItem = useCallback(
    (item: Item) => write('items', item, (d) => ({ ...d, items: upsertIn(d.items, item) })),
    [write],
  )

  const deleteItem = useCallback(
    async (id: string) => {
      // Un item si porta dietro tappe, giorni e foto: vanno tolti anche quelli.
      const stops = data.stops.filter((s) => s.itemId === id)
      const stopIds = new Set(stops.map((s) => s.id))
      const days = data.stopDays.filter((d) => stopIds.has(d.stopId))
      const dayIds = new Set(days.map((d) => d.id))
      const photos = data.photos.filter(
        (p) =>
          (p.scope === 'item' && p.refId === id) ||
          (p.scope === 'stop' && stopIds.has(p.refId)) ||
          (p.scope === 'stopDay' && dayIds.has(p.refId)),
      )
      writingRef.current = Date.now()
      setData((d) => ({
        ...d,
        items: d.items.filter((i) => i.id !== id),
        stops: d.stops.filter((s) => s.itemId !== id),
        stopDays: d.stopDays.filter((sd) => !stopIds.has(sd.stopId)),
        photos: d.photos.filter((p) => !photos.some((x) => x.id === p.id)),
      }))
      try {
        await Promise.all(photos.map((p) => backend.removePhoto(p)))
        await Promise.all(days.map((x) => backend.remove('stopDays', x.id)))
        await Promise.all(stops.map((x) => backend.remove('stops', x.id)))
        await backend.remove('items', id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Cancellazione non riuscita.')
        await load()
      }
    },
    [data.stops, data.stopDays, data.photos, load],
  )

  /* ---------------- tappe e giorni ---------------- */

  const saveStop = useCallback(
    async (stop: Stop) => {
      // Il numero di giorni comanda: qui allineiamo le schede giorno per giorno.
      const existing = data.stopDays.filter((d) => d.stopId === stop.id).sort((a, b) => a.position - b.position)
      const wanted = Math.max(1, Math.min(60, Math.round(stop.days) || 1))
      const toAdd: StopDay[] = []
      for (let i = existing.length; i < wanted; i++) {
        toAdd.push({ id: randomId(), stopId: stop.id, position: i, title: '', notes: '' })
      }
      const toRemove = existing.slice(wanted)

      writingRef.current = Date.now()
      setData((d) => ({
        ...d,
        stops: upsertIn(d.stops, { ...stop, days: wanted }),
        stopDays: [...d.stopDays.filter((x) => !toRemove.some((r) => r.id === x.id)), ...toAdd],
      }))
      try {
        await backend.save('stops', { ...stop, days: wanted })
        await Promise.all(toAdd.map((x) => backend.save('stopDays', x)))
        await Promise.all(toRemove.map((x) => backend.remove('stopDays', x.id)))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Salvataggio della tappa non riuscito.')
        await load()
      }
    },
    [data.stopDays, load],
  )

  const deleteStop = useCallback(
    async (id: string) => {
      const days = data.stopDays.filter((d) => d.stopId === id)
      const dayIds = new Set(days.map((d) => d.id))
      const photos = data.photos.filter(
        (p) => (p.scope === 'stop' && p.refId === id) || (p.scope === 'stopDay' && dayIds.has(p.refId)),
      )
      writingRef.current = Date.now()
      setData((d) => ({
        ...d,
        stops: d.stops.filter((s) => s.id !== id),
        stopDays: d.stopDays.filter((sd) => sd.stopId !== id),
        photos: d.photos.filter((p) => !photos.some((x) => x.id === p.id)),
      }))
      try {
        await Promise.all(photos.map((p) => backend.removePhoto(p)))
        await Promise.all(days.map((x) => backend.remove('stopDays', x.id)))
        await backend.remove('stops', id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Cancellazione non riuscita.')
        await load()
      }
    },
    [data.stopDays, data.photos, load],
  )

  const saveStopDay = useCallback(
    (day: StopDay) => write('stopDays', day, (d) => ({ ...d, stopDays: upsertIn(d.stopDays, day) })),
    [write],
  )

  /* ---------------- calendario ---------------- */

  const saveEvent = useCallback(
    (event: CalEvent) => write('events', event, (d) => ({ ...d, events: upsertIn(d.events, event) })),
    [write],
  )
  const deleteEvent = useCallback(
    (id: string) => erase('events', id, (d) => ({ ...d, events: d.events.filter((e) => e.id !== id) })),
    [erase],
  )

  /* ---------------- categorie ---------------- */

  const saveCategory = useCallback(
    (category: Category) =>
      write('categories', category, (d) => ({ ...d, categories: upsertIn(d.categories, category) })),
    [write],
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      const category = data.categories.find((c) => c.id === id)
      if (!category || category.builtin) return
      const items = data.items.filter((i) => i.categoryId === id)
      setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }))
      await Promise.all(items.map((i) => deleteItem(i.id)))
      await backend.remove('categories', id).catch(() => undefined)
    },
    [data.categories, data.items, deleteItem],
  )

  /* ---------------- achievement, modi di dire, frasi ---------------- */

  const saveAchievement = useCallback(
    (a: Achievement) =>
      write('achievements', a, (d) => ({ ...d, achievements: upsertIn(d.achievements, a) })),
    [write],
  )
  const deleteAchievement = useCallback(
    (id: string) =>
      erase('achievements', id, (d) => ({ ...d, achievements: d.achievements.filter((a) => a.id !== id) })),
    [erase],
  )
  const saveSaying = useCallback(
    (s: Saying) => write('sayings', s, (d) => ({ ...d, sayings: upsertIn(d.sayings, s) })),
    [write],
  )
  const deleteSaying = useCallback(
    (id: string) => erase('sayings', id, (d) => ({ ...d, sayings: d.sayings.filter((s) => s.id !== id) })),
    [erase],
  )
  const saveQuote = useCallback(
    (q: Quote) => write('quotes', q, (d) => ({ ...d, quotes: upsertIn(d.quotes, q) })),
    [write],
  )
  const deleteQuote = useCallback(
    (id: string) => erase('quotes', id, (d) => ({ ...d, quotes: d.quotes.filter((q) => q.id !== id) })),
    [erase],
  )

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...data.settings, ...patch }
      writingRef.current = Date.now()
      setData((d) => ({ ...d, settings: next }))
      try {
        await backend.saveSettings(next)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Impostazioni non salvate.')
      }
    },
    [data.settings],
  )

  /* ---------------- foto ---------------- */

  const addPhoto = useCallback(async (file: File, scope: PhotoScope, refId: string) => {
    writingRef.current = Date.now()
    const photo = await backend.uploadPhoto(file, scope, refId)
    setData((d) => ({ ...d, photos: [...d.photos, photo] }))
    return photo
  }, [])

  const deletePhoto = useCallback(async (photo: Photo) => {
    writingRef.current = Date.now()
    setData((d) => ({
      ...d,
      photos: d.photos.filter((p) => p.id !== photo.id),
      // Se era la copertina di qualcosa, quella copertina non esiste più.
      items: d.items.map((i) => (i.coverPhotoId === photo.id ? { ...i, coverPhotoId: null } : i)),
    }))
    await backend.removePhoto(photo).catch(() => undefined)
  }, [])

  /* ---------------- celebrazioni automatiche ---------------- */

  const celebrate = useCallback((c: Celebration) => setCelebration(c), [])
  const dismissCelebration = useCallback(() => setCelebration(null), [])

  useEffect(() => {
    if (loading) return
    const ids = newlyUnlocked(data)
    if (ids.length === 0) return
    const first = data.achievements.find((a) => a.id === ids[0])
    if (!first) return
    const now = new Date().toISOString()
    // Sblocchiamo tutti quelli maturati, ma ne festeggiamo uno per volta.
    ids.forEach((id) => {
      const a = data.achievements.find((x) => x.id === id)
      if (a) void saveAchievement({ ...a, unlockedAt: now })
    })
    const gallery = data.photos.filter((p) => p.scope === 'taylor')
    setCelebration({
      title: first.title,
      subtitle: first.description,
      emoji: first.emoji,
      color: 'goals',
      quote: data.quotes.length ? data.quotes[Math.floor(Math.random() * data.quotes.length)] : undefined,
      photoUrl: gallery.length ? gallery[Math.floor(Math.random() * gallery.length)].url : undefined,
    })
  }, [data, loading, saveAchievement])

  const value = useMemo<AppValue>(
    () => ({
      data,
      loading,
      error,
      mode: backend.mode,
      saveItem,
      deleteItem,
      saveStop,
      deleteStop,
      saveStopDay,
      saveEvent,
      deleteEvent,
      saveCategory,
      deleteCategory,
      saveAchievement,
      deleteAchievement,
      saveSaying,
      deleteSaying,
      saveQuote,
      deleteQuote,
      updateSettings,
      addPhoto,
      deletePhoto,
      celebration,
      celebrate,
      dismissCelebration,
      refresh: load,
    }),
    [
      data, loading, error, saveItem, deleteItem, saveStop, deleteStop, saveStopDay,
      saveEvent, deleteEvent, saveCategory, deleteCategory, saveAchievement, deleteAchievement,
      saveSaying, deleteSaying, saveQuote, deleteQuote, updateSettings, addPhoto, deletePhoto,
      celebration, celebrate, dismissCelebration, load,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/**
 * Alla primissima apertura il database è vuoto: ci mettiamo dentro categorie,
 * achievement e qualche frase, così l'app non parte da una schermata deserta.
 */
async function seedIfNeeded(data: Dataset): Promise<Dataset> {
  const next = { ...data }
  if (data.categories.length === 0) {
    next.categories = DEFAULT_CATEGORIES
    await Promise.all(DEFAULT_CATEGORIES.map((c) => backend.save('categories', c)))
  }
  if (data.achievements.length === 0) {
    next.achievements = DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a, unlockedAt: null }))
    await Promise.all(next.achievements.map((a) => backend.save('achievements', a)))
  }
  if (data.quotes.length === 0) {
    next.quotes = DEFAULT_QUOTES.map((q) => ({ ...q, id: randomId(), createdAt: new Date().toISOString() }))
    await Promise.all(next.quotes.map((q) => backend.save('quotes', q)))
  }
  return next
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp va usato dentro <AppProvider>')
  return ctx
}

/** Scorciatoie usate un po' ovunque. */
export function useCategory(id: string) {
  const { data } = useApp()
  return data.categories.find((c) => c.id === id)
}

export { CAT }
