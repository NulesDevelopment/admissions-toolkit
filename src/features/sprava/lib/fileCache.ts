const DB_NAME = 'admissions-toolkit-sprava'
const DB_VERSION = 1
const STORE = 'files'
const RECORD_ID = 'current'

/** TTL для збереженого Excel/CSV з ПДн — 12 годин. */
export const SPRAVA_FILE_CACHE_TTL_MS = 12 * 60 * 60 * 1000

export type SpravaCachedMeta = {
  fileName: string
  savedAt: number
  expiresAt: number
}

type SpravaCachedRecord = SpravaCachedMeta & {
  id: typeof RECORD_ID
  buffer: ArrayBuffer
  mimeType: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
  })
}

export async function saveSpravaCachedFile(file: File): Promise<SpravaCachedMeta> {
  const buffer = await file.arrayBuffer()
  const savedAt = Date.now()
  const expiresAt = savedAt + SPRAVA_FILE_CACHE_TTL_MS
  const record: SpravaCachedRecord = {
    id: RECORD_ID,
    fileName: file.name,
    savedAt,
    expiresAt,
    buffer,
    mimeType: file.type || 'application/octet-stream',
  }
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    await reqToPromise(tx.objectStore(STORE).put(record))
  } finally {
    db.close()
  }
  return { fileName: record.fileName, savedAt, expiresAt }
}

export async function loadSpravaCachedFile(): Promise<{
  file: File
  meta: SpravaCachedMeta
} | null> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readonly')
    const record = (await reqToPromise(
      tx.objectStore(STORE).get(RECORD_ID),
    )) as SpravaCachedRecord | undefined
    if (!record) return null
    if (Date.now() > record.expiresAt) {
      await clearSpravaCachedFile()
      return null
    }
    const file = new File([record.buffer.slice(0)], record.fileName, {
      type: record.mimeType,
    })
    return {
      file,
      meta: {
        fileName: record.fileName,
        savedAt: record.savedAt,
        expiresAt: record.expiresAt,
      },
    }
  } finally {
    db.close()
  }
}

export async function clearSpravaCachedFile(): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    await reqToPromise(tx.objectStore(STORE).delete(RECORD_ID))
  } finally {
    db.close()
  }
}

export function formatSpravaExpiresAt(expiresAt: number): string {
  return new Date(expiresAt).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
