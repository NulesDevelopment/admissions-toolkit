import {
  defaultFilters,
  type ApplicantFilters,
  type ApplicantRecord,
  type OrderConfigRow,
  type SpravaSettings,
} from '../types'
import { loadOrderConfig, loadSpravaSettings } from './storage'

export type SpravaStatusTone = 'muted' | 'ok' | 'err'

export type SpravaSession = {
  settings: SpravaSettings
  filters: ApplicantFilters
  orderConfig: OrderConfigRow[]
  applicants: ApplicantRecord[]
  fileName: string | null
  status: string | null
  statusTone: SpravaStatusTone
  loading: boolean
  restoring: boolean
  totalRows: number
  skipped: number
  cacheExpiresAt: number | null
}

function createInitialSession(): SpravaSession {
  return {
    settings: loadSpravaSettings(),
    filters: { ...defaultFilters },
    orderConfig: loadOrderConfig(),
    applicants: [],
    fileName: null,
    status: null,
    statusTone: 'muted',
    loading: false,
    restoring: false,
    totalRows: 0,
    skipped: 0,
    cacheExpiresAt: null,
  }
}

let session = createInitialSession()
const listeners = new Set<() => void>()
let restorePromise: Promise<void> | null = null

export function getSpravaSession(): SpravaSession {
  return session
}

export function subscribeSpravaSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function patchSpravaSession(patch: Partial<SpravaSession>) {
  session = { ...session, ...patch }
  for (const listener of listeners) listener()
}

export function resetSpravaApplicants() {
  restorePromise = null
  patchSpravaSession({
    applicants: [],
    fileName: null,
    filters: { ...defaultFilters },
    status: null,
    statusTone: 'muted',
    loading: false,
    restoring: false,
    totalRows: 0,
    skipped: 0,
    cacheExpiresAt: null,
  })
}

/** Один спільний restore — без зависання в React Strict Mode. */
export function ensureSpravaCacheRestored(
  restore: () => Promise<void>,
): Promise<void> {
  if (session.fileName) return Promise.resolve()
  if (restorePromise) return restorePromise
  restorePromise = (async () => {
    try {
      await restore()
    } finally {
      if (!getSpravaSession().fileName) restorePromise = null
    }
  })()
  return restorePromise
}
