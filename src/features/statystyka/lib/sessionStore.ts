import { StatystykaWorkerClient } from './workerClient'
import type {
  CategoryGroup,
  DetailState,
  DuplicateRow,
  EncodingOption,
  LoadMeta,
  PriorityDetailState,
  SpecialtySummary,
  SummaryTotals,
} from './types'
import type { SectionId } from './storage'
import { loadSectionExpanded } from './storage'

export type StatystykaSession = {
  encoding: EncodingOption
  printMode: 'mono' | 'color'
  fileName: string | null
  status: string
  statusTone: 'muted' | 'ok' | 'err'
  loading: boolean
  restoring: boolean
  ready: boolean
  faculties: string[]
  faculty: string
  meta: LoadMeta | null
  summary: SpecialtySummary[]
  duplicates: DuplicateRow[]
  categories: CategoryGroup[]
  totals: SummaryTotals
  detail: DetailState
  priorityDetail: PriorityDetailState
  sections: Record<SectionId, boolean>
  cacheExpiresAt: number | null
}

const emptyTotals: SummaryTotals = {
  specialties: 0,
  persons: 0,
  apps: 0,
  duplicateCodes: 0,
}

const defaultSections: Record<SectionId, boolean> = {
  charts: true,
  table: true,
  priorities: true,
  categories: true,
  duplicates: true,
}

function createInitialSession(): StatystykaSession {
  return {
    encoding: 'auto',
    printMode: 'mono',
    fileName: null,
    status: 'Завантажте CSV-файл із ЄДЕБО.',
    statusTone: 'muted',
    loading: false,
    restoring: false,
    ready: false,
    faculties: [],
    faculty: '',
    meta: null,
    summary: [],
    duplicates: [],
    categories: [],
    totals: emptyTotals,
    detail: null,
    priorityDetail: null,
    sections: { ...defaultSections, ...loadSectionExpanded() },
    cacheExpiresAt: null,
  }
}

let session = createInitialSession()
const listeners = new Set<() => void>()
let worker: StatystykaWorkerClient | null = null
let restorePromise: Promise<void> | null = null

export function getStatystykaSession(): StatystykaSession {
  return session
}

export function subscribeStatystykaSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function patchStatystykaSession(patch: Partial<StatystykaSession>) {
  session = { ...session, ...patch }
  for (const listener of listeners) listener()
}

export function resetStatystykaSession(statusMessage?: string) {
  const sections = session.sections
  restorePromise = null
  session = {
    ...createInitialSession(),
    sections,
    status:
      statusMessage ??
      'Збережені дані очищено. Завантажте CSV-файл із ЄДЕБО.',
    statusTone: 'muted',
  }
  for (const listener of listeners) listener()
}

export function getSharedWorkerClient(): StatystykaWorkerClient {
  if (!worker) worker = new StatystykaWorkerClient()
  return worker
}

/** Один спільний restore — без зависання в React Strict Mode. */
export function ensureCachedFileRestored(
  restore: () => Promise<void>,
): Promise<void> {
  if (session.ready) return Promise.resolve()
  if (restorePromise) return restorePromise

  restorePromise = (async () => {
    try {
      await restore()
    } finally {
      if (!getStatystykaSession().ready) {
        restorePromise = null
      }
    }
  })()

  return restorePromise
}

export { emptyTotals, defaultSections }
