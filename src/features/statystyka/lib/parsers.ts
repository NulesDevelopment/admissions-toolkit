export function clean(v: unknown): string {
  return (v == null ? '' : String(v)).replace(/\uFEFF/g, '').trim()
}

export function parseScore(v: unknown): number | null {
  const s = clean(v).replace(/\u00A0/g, '').replace(/\s/g, '').replace(',', '.')
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function parseBoolean(v: unknown): boolean | null {
  const s = clean(v).toLocaleLowerCase('uk-UA')
  if (!s) return null
  if (s === 'так' || s === 'true' || s === '1' || s === 'yes' || s === '+') {
    return true
  }
  if (s === 'ні' || s === 'false' || s === '0' || s === 'no' || s === '-') {
    return false
  }
  return null
}

export function parsePriority(v: unknown): number | null {
  const n = Number(clean(v).replace(',', '.'))
  if (!Number.isInteger(n) || n < 1 || n > 10) return null
  return n
}

export function parseCategoryCodes(v: unknown): string[] {
  const matches = clean(v).match(/\d{3,4}/g) || []
  return [...new Set(matches)]
}

export function parseDate(v: unknown): [number | null, string] {
  const text = clean(v)
  if (!text) return [null, '']

  let m = text.match(
    /^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  )
  if (m) {
    const ms = new Date(
      Number(m[3]),
      Number(m[2]) - 1,
      Number(m[1]),
      Number(m[4] || 0),
      Number(m[5] || 0),
      Number(m[6] || 0),
    ).getTime()
    return [Number.isFinite(ms) ? ms : null, text]
  }

  m = text.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  )
  if (m) {
    const ms = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4] || 0),
      Number(m[5] || 0),
      Number(m[6] || 0),
    ).getTime()
    return [Number.isFinite(ms) ? ms : null, text]
  }

  const parsed = Date.parse(text)
  return [Number.isFinite(parsed) ? parsed : null, text]
}

export function normalizeThreshold(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 145
  return Math.max(101, Math.min(199, Math.round(n)))
}

export function compareDateDesc(
  a: { dateMs: number | null; personName?: string },
  b: { dateMs: number | null; personName?: string },
): number {
  const av = a.dateMs == null ? -Infinity : a.dateMs
  const bv = b.dateMs == null ? -Infinity : b.dateMs
  return (
    bv - av ||
    String(a.personName ?? '').localeCompare(String(b.personName ?? ''), 'uk')
  )
}
