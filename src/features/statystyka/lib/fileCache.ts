import type { EncodingOption } from './types'

const DB_NAME = 'admissions-toolkit-statystyka'
const DB_VERSION = 1
const STORE = 'files'
const RECORD_ID = 'current'

/** TTL для збереженого CSV з ПДн — 12 годин від моменту збереження. */
export const FILE_CACHE_TTL_MS = 12 * 60 * 60 * 1000

export type CachedFileMeta = {
  fileName: string
  encoding: EncodingOption
  faculty: string
  savedAt: number
  expiresAt: number
}

export type CachedFileRecord = CachedFileMeta & {
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

export async function saveCachedFile(input: {
  file: File
  encoding: EncodingOption
  faculty: string
}): Promise<CachedFileMeta> {
  const buffer = await input.file.arrayBuffer()
  const savedAt = Date.now()
  const expiresAt = savedAt + FILE_CACHE_TTL_MS
  const record: CachedFileRecord = {
    id: RECORD_ID,
    fileName: input.file.name,
    encoding: input.encoding,
    faculty: input.faculty,
    savedAt,
    expiresAt,
    buffer,
    mimeType: input.file.type || 'text/csv',
  }

  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    await reqToPromise(tx.objectStore(STORE).put(record))
  } finally {
    db.close()
  }

  return {
    fileName: record.fileName,
    encoding: record.encoding,
    faculty: record.faculty,
    savedAt: record.savedAt,
    expiresAt: record.expiresAt,
  }
}

export async function loadCachedFile(): Promise<{
  file: File
  meta: CachedFileMeta
} | null> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readonly')
    const record = await reqToPromise(
      tx.objectStore(STORE).get(RECORD_ID),
    ) as CachedFileRecord | undefined

    if (!record) return null

    if (Date.now() > record.expiresAt) {
      await clearCachedFile()
      return null
    }

    const file = new File([record.buffer.slice(0)], record.fileName, {
      type: record.mimeType || 'text/csv',
    })

    return {
      file,
      meta: {
        fileName: record.fileName,
        encoding: record.encoding,
        faculty: record.faculty,
        savedAt: record.savedAt,
        expiresAt: record.expiresAt,
      },
    }
  } finally {
    db.close()
  }
}

export async function clearCachedFile(): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    await reqToPromise(tx.objectStore(STORE).delete(RECORD_ID))
  } finally {
    db.close()
  }
}

export async function updateCachedFaculty(faculty: string): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const record = (await reqToPromise(store.get(RECORD_ID))) as
      | CachedFileRecord
      | undefined
    if (!record) return
    if (Date.now() > record.expiresAt) {
      await reqToPromise(store.delete(RECORD_ID))
      return
    }
    record.faculty = faculty
    await reqToPromise(store.put(record))
  } finally {
    db.close()
  }
}

export function formatExpiresAt(expiresAt: number): string {
  return new Date(expiresAt).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
