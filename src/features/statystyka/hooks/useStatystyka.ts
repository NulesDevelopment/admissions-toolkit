import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { normalizeThreshold } from '../lib/parsers'
import {
  clearCachedFile,
  formatExpiresAt,
  loadCachedFile,
  saveCachedFile,
  updateCachedFaculty,
} from '../lib/fileCache'
import {
  emptyTotals,
  ensureCachedFileRestored,
  getSharedWorkerClient,
  getStatystykaSession,
  patchStatystykaSession,
  resetStatystykaSession,
  subscribeStatystykaSession,
} from '../lib/sessionStore'
import {
  loadThresholds,
  saveLastFileName,
  saveSectionExpanded,
  saveThresholds,
  thresholdsMapToObject,
  thresholdsObjectToMap,
  type SectionId,
} from '../lib/storage'
import type {
  DetailKind,
  DetailState,
  EncodingOption,
  PriorityDetailState,
} from '../lib/types'

export type { DetailState, PriorityDetailState }

export function useStatystyka() {
  const session = useSyncExternalStore(
    subscribeStatystykaSession,
    getStatystykaSession,
    getStatystykaSession,
  )

  const thresholdsRef = useRef(thresholdsObjectToMap(loadThresholds()))
  const patch = patchStatystykaSession

  useEffect(() => {
    saveSectionExpanded(session.sections)
  }, [session.sections])

  const persistThresholds = useCallback(() => {
    saveThresholds(thresholdsMapToObject(thresholdsRef.current))
  }, [])

  const setSection = useCallback((id: SectionId, expanded: boolean) => {
    patch({
      sections: { ...getStatystykaSession().sections, [id]: expanded },
    })
  }, [patch])

  const setAllSections = useCallback(
    (expanded: boolean) => {
      patch({
        sections: {
          charts: expanded,
          table: expanded,
          priorities: expanded,
          categories: expanded,
          duplicates: expanded,
        },
      })
    },
    [patch],
  )

  const refreshSummary = useCallback(
    async (facultyName: string) => {
      if (!facultyName) return
      let map = thresholdsRef.current.get(facultyName)
      if (!map) {
        map = new Map()
        thresholdsRef.current.set(facultyName, map)
      }

      const thresholds: Record<string, number> = Object.create(null)
      for (const [specialty, value] of map) thresholds[specialty] = value

      const result = await getSharedWorkerClient().summarize(
        facultyName,
        thresholds,
      )
      for (const row of result.summary) {
        map.set(row.specialty, row.threshold)
      }
      persistThresholds()

      patch({
        summary: result.summary,
        duplicates: result.duplicates,
        categories: result.categories,
        totals: result.totals,
      })
    },
    [patch, persistThresholds],
  )

  const loadFile = useCallback(
    async (
      file: File,
      options?: { faculty?: string; persist?: boolean; encoding?: EncodingOption },
    ) => {
      const encoding = options?.encoding ?? getStatystykaSession().encoding
      patch({
        loading: true,
        status: `Читання «${file.name}»…`,
        statusTone: 'muted',
        detail: null,
        priorityDetail: null,
      })

      try {
        const result = await getSharedWorkerClient().loadFile(
          file,
          encoding,
          (rows) => {
            patch({
              status: `Оброблено рядків: ${rows.toLocaleString('uk-UA')}…`,
            })
          },
        )

        if (!result.faculties.length) {
          throw new Error(
            'Файл прочитано, але не знайдено жодного факультету / підрозділу. Перевірте колонки CSV.',
          )
        }

        const preferredFaculty =
          options?.faculty && result.faculties.includes(options.faculty)
            ? options.faculty
            : (result.faculties[0] ?? '')

        let cacheExpiresAt: number | null = getStatystykaSession().cacheExpiresAt
        if (options?.persist !== false) {
          try {
            const meta = await saveCachedFile({
              file,
              encoding,
              faculty: preferredFaculty,
            })
            cacheExpiresAt = meta.expiresAt
          } catch {
            // Quota / private mode — continue without disk cache
            cacheExpiresAt = null
          }
        }

        saveLastFileName(file.name)
        const m = result.meta
        const expiryNote = cacheExpiresAt
          ? ` Збережено локально до ${formatExpiresAt(cacheExpiresAt)}.`
          : ''

        patch({
          fileName: file.name,
          faculties: result.faculties,
          meta: m,
          ready: true,
          faculty: preferredFaculty,
          encoding,
          cacheExpiresAt,
          status:
            `Готово. Кодування: ${m.encoding}. Рядків: ${m.totalRows}; чинних: ${m.validRows}; скасовано: ${m.cancelled}.${expiryNote}`,
          statusTone: 'ok',
          loading: false,
          restoring: false,
        })

        if (preferredFaculty) await refreshSummary(preferredFaculty)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        patch({
          ready: false,
          faculties: [],
          faculty: '',
          summary: [],
          duplicates: [],
          categories: [],
          totals: emptyTotals,
          loading: false,
          restoring: false,
          status:
            message.includes('відсутні') || message.includes('CSV')
              ? message
              : `Не вдалося обробити файл: ${message}`,
          statusTone: 'err',
        })
      }
    },
    [patch, refreshSummary],
  )

  useEffect(() => {
    void ensureCachedFileRestored(async () => {
      if (getStatystykaSession().ready) return

      patch({
        restoring: true,
        status: 'Відновлення збереженого файлу…',
        statusTone: 'muted',
      })

      try {
        const cached = await loadCachedFile()
        if (getStatystykaSession().ready) return

        if (!cached) {
          patch({
            restoring: false,
            loading: false,
            status: 'Завантажте CSV-файл із ЄДЕБО.',
            statusTone: 'muted',
          })
          return
        }

        patch({
          encoding: cached.meta.encoding,
          cacheExpiresAt: cached.meta.expiresAt,
        })

        await loadFile(cached.file, {
          faculty: cached.meta.faculty,
          encoding: cached.meta.encoding,
          persist: false,
        })
      } catch {
        patch({
          restoring: false,
          loading: false,
          status:
            'Не вдалося відновити збережений файл. Завантажте CSV знову.',
          statusTone: 'err',
        })
      }
    })
  }, [loadFile, patch])

  const changeFaculty = useCallback(
    (next: string) => {
      patch({ faculty: next, detail: null, priorityDetail: null })
      void refreshSummary(next)
      void updateCachedFaculty(next).catch(() => undefined)
    },
    [patch, refreshSummary],
  )

  const changeThreshold = useCallback(
    (specialty: string, value: number) => {
      const faculty = getStatystykaSession().faculty
      if (!faculty) return
      let map = thresholdsRef.current.get(faculty)
      if (!map) {
        map = new Map()
        thresholdsRef.current.set(faculty, map)
      }
      map.set(specialty, normalizeThreshold(value))
      persistThresholds()
      void refreshSummary(faculty)
    },
    [persistThresholds, refreshSummary],
  )

  const openDetail = useCallback(
    async (
      specialty: string,
      kind: DetailKind,
      threshold: number,
      label: string,
    ) => {
      const faculty = getStatystykaSession().faculty
      if (!faculty) return
      const result = await getSharedWorkerClient().detail(
        faculty,
        specialty,
        kind,
        threshold,
      )
      patch({
        priorityDetail: null,
        detail: {
          specialty,
          kind,
          threshold,
          label,
          rows: result.rows,
          persons: result.persons,
          apps: result.apps,
        },
      })
      window.setTimeout(() => {
        document.getElementById('stat-detail')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 50)
    },
    [patch],
  )

  const openPriorityDetail = useCallback(
    async (specialty: string, priority: number) => {
      const faculty = getStatystykaSession().faculty
      if (!faculty) return
      const result = await getSharedWorkerClient().priorityDetail(
        faculty,
        specialty,
        priority,
      )
      patch({
        detail: null,
        priorityDetail: {
          specialty,
          priority,
          rows: result.rows,
          applications: result.applications,
        },
      })
      window.setTimeout(() => {
        document.getElementById('stat-priority-detail')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 50)
    },
    [patch],
  )

  const clearSavedData = useCallback(async () => {
    await clearCachedFile()
    resetStatystykaSession(
      'Збережені дані очищено (памʼять і диск). Завантажте CSV знову.',
    )
  }, [])

  const setEncoding = useCallback(
    (encoding: EncodingOption) => {
      patch({ encoding })
      const ready = getStatystykaSession().ready
      if (!ready) return
      void (async () => {
        const cached = await loadCachedFile()
        if (!cached) return
        await loadFile(cached.file, {
          encoding,
          persist: true,
          faculty: getStatystykaSession().faculty || cached.meta.faculty,
        })
      })()
    },
    [loadFile, patch],
  )

  const hasData = session.ready && Boolean(session.faculty)

  return useMemo(
    () => ({
      encoding: session.encoding,
      setEncoding,
      printMode: session.printMode,
      setPrintMode: (printMode: 'mono' | 'color') => patch({ printMode }),
      fileName: session.fileName,
      status: session.status,
      statusTone: session.statusTone,
      loading: session.loading || session.restoring,
      restoring: session.restoring,
      ready: session.ready,
      hasData,
      faculties: session.faculties,
      faculty: session.faculty,
      meta: session.meta,
      summary: session.summary,
      duplicates: session.duplicates,
      categories: session.categories,
      totals: session.totals,
      detail: session.detail,
      priorityDetail: session.priorityDetail,
      sections: session.sections,
      cacheExpiresAt: session.cacheExpiresAt,
      setSection,
      setAllSections,
      loadFile: (file: File) => loadFile(file),
      changeFaculty,
      changeThreshold,
      openDetail,
      openPriorityDetail,
      clearSavedData,
      closeDetail: () => patch({ detail: null }),
      closePriorityDetail: () => patch({ priorityDetail: null }),
    }),
    [
      session,
      hasData,
      patch,
      setSection,
      setAllSections,
      loadFile,
      changeFaculty,
      changeThreshold,
      openDetail,
      openPriorityDetail,
      clearSavedData,
      setEncoding,
    ],
  )
}
