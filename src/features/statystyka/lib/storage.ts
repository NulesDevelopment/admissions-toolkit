const THRESHOLDS_KEY = 'admissions-toolkit.statystyka.thresholds'
const LAST_FILE_KEY = 'admissions-toolkit.statystyka.lastFileName'
const SECTIONS_KEY = 'admissions-toolkit.statystyka.sections'

export type ThresholdsByFaculty = Record<string, Record<string, number>>

export function loadThresholds(): ThresholdsByFaculty {
  try {
    const raw = localStorage.getItem(THRESHOLDS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ThresholdsByFaculty
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveThresholds(value: ThresholdsByFaculty) {
  try {
    localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function loadLastFileName(): string | null {
  try {
    return sessionStorage.getItem(LAST_FILE_KEY)
  } catch {
    return null
  }
}

export function saveLastFileName(name: string) {
  try {
    sessionStorage.setItem(LAST_FILE_KEY, name)
  } catch {
    // ignore
  }
}

export type SectionId =
  | 'charts'
  | 'table'
  | 'priorities'
  | 'categories'
  | 'duplicates'

export function loadSectionExpanded(): Partial<Record<SectionId, boolean>> {
  try {
    const raw = localStorage.getItem(SECTIONS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<Record<SectionId, boolean>>
  } catch {
    return {}
  }
}

export function saveSectionExpanded(value: Partial<Record<SectionId, boolean>>) {
  try {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function thresholdsMapToObject(
  map: Map<string, Map<string, number>>,
): ThresholdsByFaculty {
  const out: ThresholdsByFaculty = {}
  for (const [faculty, inner] of map) {
    out[faculty] = Object.fromEntries(inner)
  }
  return out
}

export function thresholdsObjectToMap(
  obj: ThresholdsByFaculty,
): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>()
  for (const [faculty, inner] of Object.entries(obj)) {
    map.set(faculty, new Map(Object.entries(inner)))
  }
  return map
}
