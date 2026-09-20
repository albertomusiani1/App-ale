/**
 * Mini wrapper su IndexedDB, usato solo in modalità locale per tenere le foto.
 * Le foto sono troppo pesanti per localStorage (quota ~5MB), quindi i file
 * veri vivono qui e nel dataset resta solo il riferimento.
 */
const DB_NAME = 'noi-due'
const STORE = 'photos'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = run(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
        t.oncomplete = () => db.close()
      }),
  )
}

export const blobStore = {
  put: (key: string, blob: Blob) => tx('readwrite', (s) => s.put(blob, key)).then(() => undefined),
  get: (key: string) => tx<Blob | undefined>('readonly', (s) => s.get(key)),
  remove: (key: string) => tx('readwrite', (s) => s.delete(key)).then(() => undefined),
  keys: () => tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys()),
}
