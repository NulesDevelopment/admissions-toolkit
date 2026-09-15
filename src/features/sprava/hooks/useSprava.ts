import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import {
  cascadeOptions,
  filterApplicants,
  toApplicantRow,
} from '../lib/applicants'
import {
  clearSpravaCachedFile,
  formatSpravaExpiresAt,
  loadSpravaCachedFile,
  saveSpravaCachedFile,
} from '../lib/fileCache'
import { renderApplicantForms } from '../lib/forms'
import { generateApplicantDocx } from '../lib/generateDocx'
import { parseEdeboFile } from '../lib/parseExcel'
import { clearAllPhotos } from '../lib/photos'
import {
  ensureSpravaCacheRestored,
  getSpravaSession,
  patchSpravaSession,
  resetSpravaApplicants,
  subscribeSpravaSession,
} from '../lib/sessionStore'
import { saveOrderConfig, saveSpravaSettings } from '../lib/storage'
import {
  type ApplicantFilters,
  type OrderConfigRow,
  type SpravaSettings,
} from '../types'

function formatLoadStatus(
  count: number,
  skipped: number,
  totalRows: number,
  statusSamples: { status: string; count: number }[],
  expiresAt: number | null,
): string {
  let msg =
    `Завантажено: ${count} вступників зі статусом «До наказу»` +
    (skipped > 0 ? ` (пропущено ${skipped} із ${totalRows})` : '')
  if (count === 0 && statusSamples.length) {
    msg +=
      '. У файлі статуси: ' +
      statusSamples
        .map((s) => `«${s.status}» (${s.count})`)
        .join(', ')
  } else {
    msg += '. Оберіть спеціальність, щоб побачити список.'
  }
  if (expiresAt) {
    msg += ` Кеш до ${formatSpravaExpiresAt(expiresAt)}.`
  }
  return msg
}

export function useSprava() {
  const session = useSyncExternalStore(
    subscribeSpravaSession,
    getSpravaSession,
    getSpravaSession,
  )
  const patch = patchSpravaSession
  const restoredRef = useRef(false)

  const setSettings = useCallback(
    (settings: SpravaSettings) => {
      saveSpravaSettings(settings)
      patch({ settings })
    },
    [patch],
  )

  const setFilters = useCallback(
    (filters: ApplicantFilters) => {
      const next = { ...filters }
      // Скидаємо залежні фільтри при зміні батьківських
      if (filters.faculty !== session.filters.faculty) {
        next.specialty = ''
        next.form = ''
      } else if (filters.specialty !== session.filters.specialty) {
        next.form = ''
      }
      patch({ filters: next })
    },
    [patch, session.filters.faculty, session.filters.specialty],
  )

  const setOrderConfig = useCallback(
    (orderConfig: OrderConfigRow[]) => {
      saveOrderConfig(orderConfig)
      patch({ orderConfig })
    },
    [patch],
  )

  const applyParsedFile = useCallback(
    async (
      file: File,
      options?: { persist?: boolean; expiresAt?: number | null },
    ) => {
      patch({
        loading: true,
        restoring: false,
        status: `Читання «${file.name}»…`,
        statusTone: 'muted',
      })
      try {
        const result = await parseEdeboFile(file)
        let expiresAt = options?.expiresAt ?? null
        if (options?.persist !== false) {
          const meta = await saveSpravaCachedFile(file)
          expiresAt = meta.expiresAt
        }
        patch({
          applicants: result.applicants,
          fileName: file.name,
          filters: {
            search: '',
            faculty: '',
            specialty: '',
            form: '',
            funding: '',
          },
          totalRows: result.totalRows,
          skipped: result.skipped,
          loading: false,
          cacheExpiresAt: expiresAt,
          status: formatLoadStatus(
            result.applicants.length,
            result.skipped,
            result.totalRows,
            result.statusSamples,
            expiresAt,
          ),
          statusTone: result.applicants.length ? 'ok' : 'err',
        })
      } catch (err) {
        patch({
          loading: false,
          status:
            err instanceof Error ? err.message : 'Не вдалося прочитати файл.',
          statusTone: 'err',
        })
      }
    },
    [patch],
  )

  const loadFile = useCallback(
    (file: File) => applyParsedFile(file, { persist: true }),
    [applyParsedFile],
  )

  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    void ensureSpravaCacheRestored(async () => {
      if (getSpravaSession().fileName) return
      patch({ restoring: true, status: 'Відновлення збереженого файлу…', statusTone: 'muted' })
      try {
        const cached = await loadSpravaCachedFile()
        if (!cached) {
          patch({ restoring: false, status: null, statusTone: 'muted' })
          return
        }
        await applyParsedFile(cached.file, {
          persist: false,
          expiresAt: cached.meta.expiresAt,
        })
      } catch {
        patch({
          restoring: false,
          status: 'Не вдалося відновити кеш файлу.',
          statusTone: 'err',
        })
      }
    })
  }, [applyParsedFile, patch])

  const reset = useCallback(() => {
    clearAllPhotos()
    void clearSpravaCachedFile()
    resetSpravaApplicants()
  }, [])

  const { facultyOptions, specialtyOptions, formOptions } = useMemo(
    () => cascadeOptions(session.applicants, session.filters),
    [session.applicants, session.filters],
  )

  const filteredRecords = useMemo(
    () => filterApplicants(session.applicants, session.filters),
    [session.applicants, session.filters],
  )

  const filteredRows = useMemo(
    () => filteredRecords.map(toApplicantRow),
    [filteredRecords],
  )

  const findRecord = useCallback(
    (id: string) => session.applicants.find((a) => a.id === id) ?? null,
    [session.applicants],
  )

  const buildFormsHtml = useCallback(
    (ids?: string[]) => {
      const records = ids
        ? ids
            .map((id) => session.applicants.find((a) => a.id === id))
            .filter((a): a is NonNullable<typeof a> => Boolean(a))
        : filteredRecords
      return records
        .map((rec) =>
          renderApplicantForms(rec.raw, session.settings, session.orderConfig),
        )
        .join('')
    },
    [filteredRecords, session.applicants, session.orderConfig, session.settings],
  )

  const downloadDocx = useCallback(
    async (id: string) => {
      const rec = findRecord(id)
      if (!rec) return
      await generateApplicantDocx(rec.raw, session.settings, session.orderConfig)
    },
    [findRecord, session.orderConfig, session.settings],
  )

  return {
    ...session,
    setSettings,
    setFilters,
    setOrderConfig,
    loadFile,
    reset,
    facultyOptions,
    specialtyOptions,
    formOptions,
    filteredRecords,
    filteredRows,
    findRecord,
    buildFormsHtml,
    downloadDocx,
    totalLoaded: session.applicants.length,
    loading: session.loading || session.restoring,
  }
}
