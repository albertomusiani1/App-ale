/**
 * Le foto che arrivano dal telefono pesano 3-5 MB l'una: caricarle così
 * com'è riempirebbe lo spazio gratuito in un paio di viaggi. Qui le
 * ridimensioniamo e ricomprimiamo prima di spedirle, restando sui ~200-400 KB
 * senza differenze visibili su schermo.
 */
const MAX_SIDE = 1600
const QUALITY = 0.82

export async function compressImage(file: File): Promise<Blob> {
  // I formati che il canvas non sa disegnare (HEIC su browser vecchi) passano intatti.
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', QUALITY))
    // Se per qualche motivo la compressione peggiora le cose, teniamo l'originale.
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

export function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
