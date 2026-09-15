import {
  defaultSpravaSettings,
  type OrderConfigRow,
  type SpravaSettings,
} from '../types'

const SETTINGS_KEY = 'admissions-toolkit.sprava.settings'
const ORDERS_KEY = 'admissions-toolkit.sprava.orderConfig'

export function loadSpravaSettings(): SpravaSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...defaultSpravaSettings }
    const parsed = JSON.parse(raw) as Partial<SpravaSettings>
    return { ...defaultSpravaSettings, ...parsed }
  } catch {
    return { ...defaultSpravaSettings }
  }
}

export function saveSpravaSettings(settings: SpravaSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export function loadOrderConfig(): OrderConfigRow[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as OrderConfigRow[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveOrderConfig(rows: OrderConfigRow[]) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(rows))
  } catch {
    // ignore
  }
}
