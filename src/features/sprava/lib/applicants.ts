import {
  COL,
  type ApplicantFilters,
  type ApplicantRecord,
  type ApplicantRow,
} from '../types'
import { g, getFunding } from './helpers'

export function toApplicantRow(rec: ApplicantRecord): ApplicantRow {
  const { budget } = getFunding(rec.raw)
  return {
    id: rec.id,
    fullName: g(rec.raw, COL.pib),
    faculty: g(rec.raw, COL.faculty),
    specialty: g(rec.raw, COL.specialty),
    form: g(rec.raw, COL.studyForm),
    funding: budget ? 'budget' : 'contract',
    fileNum: g(rec.raw, COL.fileNum),
    level: g(rec.raw, COL.level),
    status: g(rec.raw, COL.status),
  }
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'uk'),
  )
}

/** Опції фільтрів з каскадом: факультет → спеціальність → форма. */
export function cascadeOptions(
  applicants: ApplicantRecord[],
  filters: ApplicantFilters,
) {
  const byFaculty = filters.faculty
    ? applicants.filter((a) => g(a.raw, COL.faculty) === filters.faculty)
    : applicants

  const specialtyOptions = uniqueSorted(
    byFaculty.map((a) => g(a.raw, COL.specialty)),
  )

  const bySpec =
    filters.specialty
      ? byFaculty.filter((a) => g(a.raw, COL.specialty) === filters.specialty)
      : byFaculty

  const formOptions = uniqueSorted(bySpec.map((a) => g(a.raw, COL.studyForm)))
  const facultyOptions = uniqueSorted(
    applicants.map((a) => g(a.raw, COL.faculty)),
  )

  return { facultyOptions, specialtyOptions, formOptions }
}

export function filterApplicants(
  applicants: ApplicantRecord[],
  filters: ApplicantFilters,
): ApplicantRecord[] {
  if (!filters.specialty) return []

  const q = filters.search.trim().toLowerCase()

  return applicants.filter((rec) => {
    const a = rec.raw
    if (filters.faculty && g(a, COL.faculty) !== filters.faculty) return false
    if (g(a, COL.specialty) !== filters.specialty) return false
    if (filters.form && g(a, COL.studyForm) !== filters.form) return false
    if (filters.funding) {
      const { budget } = getFunding(a)
      if (filters.funding === 'budget' && !budget) return false
      if (filters.funding === 'contract' && budget) return false
    }
    if (q && !g(a, COL.pib).toLowerCase().includes(q)) return false
    return true
  })
}
