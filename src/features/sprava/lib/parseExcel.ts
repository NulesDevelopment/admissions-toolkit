import * as XLSX from 'xlsx'
import { COL } from '../types'
import type { ApplicantRecord } from '../types'

export type ParseEdeboResult = {
  applicants: ApplicantRecord[]
  totalRows: number
  skipped: number
}

/** @deprecated alias */
export type ParseExcelResult = ParseEdeboResult

function detectCsvEncoding(buf: ArrayBuffer): 'utf-8' | 'windows-1251' {
  const sample = new Uint8Array(buf).slice(0, Math.min(buf.byteLength, 4096))
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(sample)
    return 'utf-8'
  } catch {
    return 'windows-1251'
  }
}

function detectCsvDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const semis = (firstLine.match(/;/g) || []).length
  const commas = (firstLine.match(/,/g) || []).length
  return semis >= commas ? ';' : ','
}

function rowsFromSheet(
  ws: XLSX.WorkSheet,
): (string | number | boolean | null)[][] {
  return XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: '',
  })
}

async function readTableRows(
  file: File,
): Promise<(string | number | boolean | null)[][]> {
  const name = file.name
  const buffer = await file.arrayBuffer()

  if (/\.csv$/i.test(name)) {
    const encoding = detectCsvEncoding(buffer)
    const text = new TextDecoder(encoding)
      .decode(buffer)
      .replace(/^\uFEFF/, '')
    const wb = XLSX.read(text, {
      type: 'string',
      FS: detectCsvDelimiter(text),
      raw: false,
    })
    return rowsFromSheet(wb.Sheets[wb.SheetNames[0]])
  }

  if (/\.(xlsx|xls)$/i.test(name)) {
    const wb = XLSX.read(buffer, { type: 'array', codepage: 1251, raw: false })
    return rowsFromSheet(wb.Sheets[wb.SheetNames[0]])
  }

  throw new Error(
    'Підтримуються файли Excel (.xlsx, .xls) та CSV (.csv).',
  )
}

function buildApplicants(
  rows: (string | number | boolean | null)[][],
): ParseEdeboResult {
  if (rows.length < 2) {
    throw new Error('Файл порожній або пошкоджений.')
  }

  const headers = rows[0].map((h) => String(h ?? '').trim())
  const required = [COL.pib, COL.status, COL.specialty, COL.fileNum]
  const missing = required.filter((c) => !headers.includes(c))
  if (missing.length) {
    throw new Error(
      `У файлі відсутні колонки: ${missing.join(', ')}. Переконайтесь, що це експорт заявок з ЄДЕБО.`,
    )
  }

  const all = rows
    .slice(1)
    .filter((r) => r.some((c) => c !== '' && c != null))
    .map((r, index) => {
      const o: Record<string, string> = {}
      headers.forEach((h, i) => {
        o[h] = String(r[i] ?? '').trim()
      })
      return { id: `${index}-${o[COL.fileNum] || o[COL.pib]}`, raw: o }
    })
    .filter((a) => a.raw[COL.pib])

  const applicants = all.filter((a) =>
    (a.raw[COL.status] || '').toLowerCase().includes('до наказу'),
  )

  return {
    applicants,
    totalRows: all.length,
    skipped: all.length - applicants.length,
  }
}

export async function parseEdeboFile(file: File): Promise<ParseEdeboResult> {
  const rows = await readTableRows(file)
  return buildApplicants(rows)
}

/** @deprecated use parseEdeboFile */
export async function parseEdeboExcel(file: File): Promise<ParseEdeboResult> {
  return parseEdeboFile(file)
}

/** Для тестів: розбір уже прочитаних рядків */
export function parseEdeboRows(
  rows: (string | number | boolean | null)[][],
): ParseEdeboResult {
  return buildApplicants(rows)
}
