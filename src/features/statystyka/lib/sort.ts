export type SortDir = 1 | -1

export type SortState<K extends string = string> = {
  key: K | null
  dir: SortDir
}

export function clickSort<K extends string>(
  state: SortState<K>,
  key: K,
): SortState<K> {
  if (state.key === key) {
    return { key, dir: state.dir === 1 ? -1 : 1 }
  }
  return { key, dir: 1 }
}

function comparable(value: unknown): string | number {
  if (value == null) return ''
  if (typeof value === 'number') return Number.isFinite(value) ? value : ''
  if (typeof value === 'boolean') return value ? 1 : 0
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

export function compareByKey<T>(
  a: T,
  b: T,
  key: keyof T,
  dir: SortDir,
): number {
  const av = comparable(a[key] as unknown)
  const bv = comparable(b[key] as unknown)

  let cmp = 0
  if (typeof av === 'number' && typeof bv === 'number') {
    cmp = av - bv
  } else {
    cmp = String(av).localeCompare(String(bv), 'uk', {
      numeric: true,
      sensitivity: 'base',
    })
  }

  if (cmp === 0) return 0
  return dir === 1 ? cmp : -cmp
}

export function sortRows<T>(
  rows: T[],
  state: SortState,
  defaultCompare?: (a: T, b: T) => number,
): T[] {
  if (!state.key) {
    return defaultCompare ? [...rows].sort(defaultCompare) : rows
  }

  const key = state.key as keyof T
  return [...rows].sort((a, b) => compareByKey(a, b, key, state.dir))
}

export function matchesSearch(
  query: string,
  ...fields: Array<string | number | null | undefined>
): boolean {
  const q = query.trim().toLocaleLowerCase('uk')
  if (!q) return true
  return fields.some((f) =>
    String(f ?? '')
      .toLocaleLowerCase('uk')
      .includes(q),
  )
}
