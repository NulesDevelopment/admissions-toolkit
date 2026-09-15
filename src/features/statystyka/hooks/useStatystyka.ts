import { useCallback, useMemo, useRef, useState } from 'react'
import { normalizeThreshold } from '../lib/parsers'
import { StatystykaStore } from '../lib/store'
import type {
  CategoryGroup,
  DetailKind,
  DuplicateRow,
  EncodingOption,
  LoadMeta,
  PriorityDetailRow,
  PublicAppRecord,
  SpecialtySummary,
  SummaryTotals,
} from '../lib/types'

export type DetailState = {
  specialty: string
  kind: DetailKind
  threshold: number
  label: string
  rows: PublicAppRecord[]
  persons: number
  apps: number
} | null

export type PriorityDetailState = {
  specialty: string
  priority: number
  rows: PriorityDetailRow[]
  applications: number
} | null

const emptyTotals: SummaryTotals = {
  specialties: 0,
  persons: 0,
  apps: 0,
  duplicateCodes: 0,
}

export function useStatystyka() {
  const storeRef = useRef(new StatystykaStore())
  const thresholdsRef = useRef(new Map<string, Map<string, number>>())

  const [encoding, setEncoding] = useState<EncodingOption>('auto')
  const [printMode, setPrintMode] = useState<'mono' | 'color'>('mono')
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState('Завантажте CSV-файл із ЄДЕБО.')
  const [statusTone, setStatusTone] = useState<'muted' | 'ok' | 'err'>('muted')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [faculties, setFaculties] = useState<string[]>([])
  const [faculty, setFaculty] = useState('')
  const [meta, setMeta] = useState<LoadMeta | null>(null)

  const [summary, setSummary] = useState<SpecialtySummary[]>([])
  const [duplicates, setDuplicates] = useState<DuplicateRow[]>([])
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [totals, setTotals] = useState<SummaryTotals>(emptyTotals)

  const [detail, setDetail] = useState<DetailState>(null)
  const [priorityDetail, setPriorityDetail] =
    useState<PriorityDetailState>(null)

  const refreshSummary = useCallback((facultyName: string) => {
    if (!facultyName) return
    let map = thresholdsRef.current.get(facultyName)
    if (!map) {
      map = new Map()
      thresholdsRef.current.set(facultyName, map)
    }

    const thresholds: Record<string, number> = Object.create(null)
    for (const [specialty, value] of map) thresholds[specialty] = value

    const result = storeRef.current.summarize(facultyName, thresholds)
    setSummary(result.summary)
    setDuplicates(result.duplicates)
    setCategories(result.categories)
    setTotals(result.totals)

    // Sync thresholds from result (defaults applied)
    for (const row of result.summary) {
      map.set(row.specialty, row.threshold)
    }
  }, [])

  const loadFile = useCallback(
    async (file: File) => {
      setLoading(true)
      setStatus(`Читання «${file.name}»…`)
      setStatusTone('muted')
      setDetail(null)
      setPriorityDetail(null)

      try {
        const result = await storeRef.current.loadFile(
          file,
          encoding,
          (rows) => {
            setStatus(`Оброблено рядків: ${rows.toLocaleString('uk-UA')}…`)
          },
        )

        setFileName(file.name)
        setFaculties(result.faculties)
        setMeta(result.meta)
        setReady(true)
        thresholdsRef.current = new Map()

        const firstFaculty = result.faculties[0] ?? ''
        setFaculty(firstFaculty)

        const m = result.meta
        setStatus(
          `Готово. Кодування: ${m.encoding}. Рядків: ${m.totalRows}; чинних: ${m.validRows}; скасовано: ${m.cancelled}.`,
        )
        setStatusTone('ok')

        if (firstFaculty) refreshSummary(firstFaculty)
      } catch (err) {
        setReady(false)
        setFaculties([])
        setFaculty('')
        setSummary([])
        setDuplicates([])
        setCategories([])
        setTotals(emptyTotals)
        setStatus(err instanceof Error ? err.message : String(err))
        setStatusTone('err')
      } finally {
        setLoading(false)
      }
    },
    [encoding, refreshSummary],
  )

  const changeFaculty = useCallback(
    (next: string) => {
      setFaculty(next)
      setDetail(null)
      setPriorityDetail(null)
      refreshSummary(next)
    },
    [refreshSummary],
  )

  const changeThreshold = useCallback(
    (specialty: string, value: number) => {
      if (!faculty) return
      let map = thresholdsRef.current.get(faculty)
      if (!map) {
        map = new Map()
        thresholdsRef.current.set(faculty, map)
      }
      map.set(specialty, normalizeThreshold(value))
      refreshSummary(faculty)
    },
    [faculty, refreshSummary],
  )

  const openDetail = useCallback(
    (specialty: string, kind: DetailKind, threshold: number, label: string) => {
      if (!faculty) return
      const result = storeRef.current.detail(
        faculty,
        specialty,
        kind,
        threshold,
      )
      setPriorityDetail(null)
      setDetail({
        specialty,
        kind,
        threshold,
        label,
        rows: result.rows,
        persons: result.persons,
        apps: result.apps,
      })
    },
    [faculty],
  )

  const openPriorityDetail = useCallback(
    (specialty: string, priority: number) => {
      if (!faculty) return
      const result = storeRef.current.priorityDetail(
        faculty,
        specialty,
        priority,
      )
      setDetail(null)
      setPriorityDetail({
        specialty,
        priority,
        rows: result.rows,
        applications: result.applications,
      })
    },
    [faculty],
  )

  const hasData = ready && Boolean(faculty)

  return useMemo(
    () => ({
      encoding,
      setEncoding,
      printMode,
      setPrintMode,
      fileName,
      status,
      statusTone,
      loading,
      ready,
      hasData,
      faculties,
      faculty,
      meta,
      summary,
      duplicates,
      categories,
      totals,
      detail,
      priorityDetail,
      loadFile,
      changeFaculty,
      changeThreshold,
      openDetail,
      openPriorityDetail,
      closeDetail: () => setDetail(null),
      closePriorityDetail: () => setPriorityDetail(null),
    }),
    [
      encoding,
      printMode,
      fileName,
      status,
      statusTone,
      loading,
      ready,
      hasData,
      faculties,
      faculty,
      meta,
      summary,
      duplicates,
      categories,
      totals,
      detail,
      priorityDetail,
      loadFile,
      changeFaculty,
      changeThreshold,
      openDetail,
      openPriorityDetail,
    ],
  )
}
