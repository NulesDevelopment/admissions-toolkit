import { useCallback, useMemo, useSyncExternalStore } from 'react'
import {
  filterApplicants,
  toApplicantRow,
  uniqueSorted,
} from '../lib/applicants'
import { renderApplicantForms } from '../lib/forms'
import { parseEdeboFile } from '../lib/parseExcel'
import {
  getSpravaSession,
  patchSpravaSession,
  resetSpravaApplicants,
  subscribeSpravaSession,
} from '../lib/sessionStore'
import { clearAllPhotos } from '../lib/photos'
import { saveOrderConfig, saveSpravaSettings } from '../lib/storage'
import {
  COL,
  type ApplicantFilters,
  type OrderConfigRow,
  type SpravaSettings,
} from '../types'
import { g } from '../lib/helpers'

export function useSprava() {
  const session = useSyncExternalStore(
    subscribeSpravaSession,
    getSpravaSession,
    getSpravaSession,
  )

  const patch = patchSpravaSession

  const setSettings = useCallback(
    (settings: SpravaSettings) => {
      saveSpravaSettings(settings)
      patch({ settings })
    },
    [patch],
  )

  const setFilters = useCallback(
    (filters: ApplicantFilters) => {
      patch({ filters })
    },
    [patch],
  )

  const setOrderConfig = useCallback(
    (orderConfig: OrderConfigRow[]) => {
      saveOrderConfig(orderConfig)
      patch({ orderConfig })
    },
    [patch],
  )

  const loadFile = useCallback(
    async (file: File) => {
      patch({
        loading: true,
        status: `Читання «${file.name}»…`,
        statusTone: 'muted',
      })
      try {
        const result = await parseEdeboFile(file)
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
          status:
            `Завантажено: ${result.applicants.length} вступників зі статусом «До наказу»` +
            (result.skipped > 0
              ? ` (пропущено ${result.skipped} із ${result.totalRows})`
              : '') +
            '. Оберіть спеціальність, щоб побачити список.',
          statusTone: 'ok',
        })
      } catch (err) {
        patch({
          loading: false,
          status:
            err instanceof Error
              ? err.message
              : 'Не вдалося прочитати файл.',
          statusTone: 'err',
        })
      }
    },
    [patch],
  )

  const reset = useCallback(() => {
    clearAllPhotos()
    resetSpravaApplicants()
  }, [])

  const facultyOptions = useMemo(
    () =>
      uniqueSorted(session.applicants.map((a) => g(a.raw, COL.faculty))),
    [session.applicants],
  )
  const specialtyOptions = useMemo(
    () =>
      uniqueSorted(session.applicants.map((a) => g(a.raw, COL.specialty))),
    [session.applicants],
  )
  const formOptions = useMemo(
    () =>
      uniqueSorted(session.applicants.map((a) => g(a.raw, COL.studyForm))),
    [session.applicants],
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
    [
      filteredRecords,
      session.applicants,
      session.orderConfig,
      session.settings,
    ],
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
    totalLoaded: session.applicants.length,
  }
}
