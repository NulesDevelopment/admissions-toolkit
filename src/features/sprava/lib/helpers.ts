import { BUDGET_ORDER, COL, type OrderConfigRow } from '../types'

export function g(obj: Record<string, string>, key: string): string {
  return (obj[key] || '').trim()
}

export function esc(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const PASSPORT_CUTOFF = new Date(2022, 7, 1)

export function isOldPassport(ddmmyyyy: string): boolean {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(ddmmyyyy || '').trim())
  if (!m) return false
  const d = new Date(+m[3], +m[2] - 1, +m[1])
  return d < PASSPORT_CUTOFF
}

export function excelDate(val: unknown): string {
  if (val === null || val === undefined || val === '') return ''
  if (typeof val === 'string') {
    if (/\d{2}\.\d{2}\.\d{4}/.test(val)) return val
    val = val.trim()
  }
  const n = Number(val)
  if (Number.isNaN(n) || n < 1) return String(val)
  const d = new Date(Math.round((n - 25569) * 86400000))
  const day = String(d.getUTCDate()).padStart(2, '0')
  const mon = String(d.getUTCMonth() + 1).padStart(2, '0')
  const yr = d.getUTCFullYear()
  return `${day}.${mon}.${yr}`
}

export function parseName(full: string) {
  const clean = full
    .trim()
    .replace(/\d{2}\.\d{2}\.\d{2,4}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const p = clean.split(/\s+/)
  return { last: p[0] || '', first: p[1] || '', mid: p.slice(2).join(' ') || '' }
}

export function isMale(a: Record<string, string>): boolean {
  const v = g(a, COL.gender).toLowerCase()
  return v === 'чоловіча' || v === 'ч' || v === 'm' || v === 'male'
}

export function parseOrderStr(raw: string) {
  const numMatch = raw.match(/\b(\d{3,5})\s*(?:«?СК»?)/i)
  const dateMatch = raw.match(/від\s+(\d{2}\.\d{2}\.\d{4})/i)
  return {
    num: numMatch ? numMatch[1] + ' «СК»' : raw,
    date: dateMatch ? dateMatch[1] : '',
  }
}

export function orderConfigToLookup(rows: OrderConfigRow[]): Map<number, string> {
  const map = new Map<number, string>()
  for (const row of rows) {
    const nums = row.orderNumbers
      .split(/[,;\s]+/)
      .map((x) => parseInt(x.replace(/\D/g, ''), 10))
      .filter((n) => !Number.isNaN(n))
    for (const n of nums) map.set(n, row.date)
  }
  return map
}

export function getOrderDate(
  orderNum: string,
  lookup: Map<number, string>,
): string {
  const n = parseInt(String(orderNum).replace(/\D/g, ''), 10)
  if (Number.isNaN(n)) return ''
  return lookup.get(n) ?? ''
}

export function getFunding(a: Record<string, string>) {
  const isBudget = g(a, COL.order).replace(/\D/g, '').includes(BUDGET_ORDER)
  return { budget: isBudget, contract: !isBudget }
}

export function getCategory(a: Record<string, string>) {
  const ct = g(a, COL.compType).toLowerCase().trim()
  if (ct.includes('співбесід')) return 'interview'
  if (ct.includes('квот') || ct.includes('пільг') || ct.includes('іспит'))
    return 'quota'
  return 'general'
}

export function eduDocStr(a: Record<string, string>) {
  const t = g(a, COL.docType)
  const s = g(a, COL.docSeries)
  const n = g(a, COL.docNum)
  const d = excelDate(g(a, COL.docDate))
  const iss = g(a, COL.docIssuer)
  const hon = g(a, COL.honors)
  let str = t || 'Документ про освіту'
  if (s) str += ' ' + s
  if (n) str += ' № ' + n
  if (d) str += ', виданий ' + d + ' р.'
  if (iss) str += ' ' + iss
  if (hon && !/^(ні|no|0|false|-)$/i.test(hon) && hon !== '') {
    str += ' (з відзнакою)'
  }
  str += ' + додаток (копії)'
  return str
}

export function chkBox(checked: boolean) {
  return `<span class="chk${checked ? ' chk-x' : ''}"></span>`
}

export function photoBoxHTML(fnum: string) {
  return `<div class="photo-box" data-ph="${esc(fnum)}" contenteditable="false">
    <span class="ph-hint">фото</span>
  </div>`
}
