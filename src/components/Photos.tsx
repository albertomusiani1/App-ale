import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useApp } from '../store/AppStore'
import { colorOf } from '../lib/colors'
import type { ColorKey, Photo, PhotoScope } from '../types'

/**
 * Griglia di foto con caricamento dal telefono.
 * `capture` non è impostato di proposito: così il telefono propone sia la
 * fotocamera sia la galleria, invece di aprire direttamente la fotocamera.
 */
export function PhotoGrid({
  scope,
  refId,
  label = 'Foto',
  color = 'agenda',
  coverId,
  onSetCover,
}: {
  scope: PhotoScope
  refId: string
  label?: string
  /** Tinta della categoria ospite, così i pulsanti non stonano. */
  color?: ColorKey
  /** Se passato, si può eleggere una foto a copertina. */
  coverId?: string | null
  onSetCover?: (photoId: string | null) => void
}) {
  const { data, addPhoto, deletePhoto } = useApp()
  const c = colorOf(color)
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(0)
  const [failed, setFailed] = useState<string | null>(null)
  const [preview, setPreview] = useState<Photo | null>(null)

  const photos = data.photos
    .filter((p) => p.scope === scope && p.refId === refId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setFailed(null)
    const list = Array.from(files)
    setBusy(list.length)
    for (const file of list) {
      try {
        await addPhoto(file, scope, refId)
      } catch (e) {
        setFailed(e instanceof Error ? e.message : 'Caricamento non riuscito.')
      } finally {
        setBusy((n) => n - 1)
      }
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <span className="label mb-0">
          {label} {photos.length > 0 && <span className="font-normal">({photos.length})</span>}
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full px-3 py-1.5 text-sm font-semibold active:scale-95"
          style={{ background: c.soft, color: c.ink }}
        >
          ＋ Aggiungi
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {failed && <p className="mb-2 text-sm text-red-600">{failed}</p>}

      {photos.length === 0 && busy === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-black/10 bg-white/60 px-4 py-7 text-muted active:scale-[0.98]"
        >
          <span className="text-3xl" aria-hidden>
            📷
          </span>
          <span className="text-sm font-semibold">Carica le foto dal telefono</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setPreview(photo)}
              className="relative aspect-square overflow-hidden rounded-2xl bg-black/5 active:scale-95"
            >
              <img src={photo.url} alt={photo.caption} loading="lazy" className="h-full w-full object-cover" />
              {coverId === photo.id && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold">
                  ⭐ copertina
                </span>
              )}
            </button>
          ))}
          {Array.from({ length: busy }).map((_, i) => (
            <div
              key={`busy-${i}`}
              className="flex aspect-square animate-pulse items-center justify-center rounded-2xl bg-black/5 text-xl"
              aria-label="Caricamento in corso"
            >
              ⏳
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-ink/90 p-4"
            onClick={() => setPreview(null)}
          >
            <img
              src={preview.url}
              alt={preview.caption}
              className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain"
            />
            <div
              className="mt-4 flex w-full max-w-sm gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {onSetCover && (
                <button
                  type="button"
                  onClick={() => {
                    onSetCover(coverId === preview.id ? null : preview.id)
                    setPreview(null)
                  }}
                  className="btn-ghost flex-1"
                >
                  {coverId === preview.id ? '☆ Togli copertina' : '⭐ Copertina'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm('Eliminare questa foto?')) return
                  void deletePhoto(preview)
                  setPreview(null)
                }}
                className="btn bg-red-50 text-red-700"
              >
                🗑️
              </button>
              <button type="button" onClick={() => setPreview(null)} className="btn-ghost">
                Chiudi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
