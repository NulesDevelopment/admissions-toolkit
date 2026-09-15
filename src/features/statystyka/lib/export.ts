export function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  if (/[;"\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function csvText(rows: unknown[][]): string {
  return (
    '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n')
  )
}

export function downloadCsv(name: string, rows: unknown[][]) {
  const blob = new Blob([csvText(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadReportZip(
  name: string,
  files: { name: string; rows: unknown[][] }[],
) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  for (const file of files) {
    zip.file(file.name, csvText(file.rows))
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function yesNo(value: boolean | null | undefined): string {
  if (value === true) return 'Так'
  if (value === false) return 'Ні'
  return '—'
}

export function detailKindLabel(kind: string, threshold: number): string {
  const labels: Record<string, string> = {
    persons: 'Усі вступники',
    above: 'Бал ≥ ' + threshold,
    below: 'Бал < ' + threshold,
    budget: 'Проходять на бюджет — бал ≥ 130',
    contractOnly: 'Проходять тільки на контракт — бал < 130',
    claimsBudgetBelow130: 'Претендують на бюджет, але бал < 130',
    college: 'Вступники з коледжу',
    apps: 'Усі чинні заяви',
    cancelledByApplicant: 'Скасовано вступником',
    cancelledPriority: 'Скасовано (втрата пріор.)',
    duplicates: 'Заяви з дубльованим шифром справи',
  }
  return labels[kind] || kind
}
