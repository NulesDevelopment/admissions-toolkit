import { COL, type OrderConfigRow, type SpravaSettings } from '../types'
import {
  excelDate,
  g,
  getCategory,
  getFunding,
  getOrderDate,
  isMale,
  isOldPassport,
  orderConfigToLookup,
  parseName,
  parseOrderStr,
} from './helpers'
import { DOCX_TEMPLATE_B64 } from './docxTemplateB64'

function xmlEsc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function eduDocStrPlain(a: Record<string, string>): string {
  const t = g(a, COL.docType)
  const s2 = g(a, COL.docSeries)
  const n = g(a, COL.docNum)
  const d = excelDate(g(a, COL.docDate))
  const iss = g(a, COL.docIssuer)
  const hon = g(a, COL.honors)
  let str = t || 'Документ про освіту'
  if (s2) str += ' ' + s2
  if (n) str += ' № ' + n
  if (d) str += ', виданий ' + d + ' р.'
  if (iss) str += ' ' + iss
  if (hon && !/^(ні|no|0|false|-)$/i.test(hon) && hon !== '') {
    str += ' (з відзнакою)'
  }
  str += ' + додаток (копії)'
  return str
}

const TNR_FMT =
  '<w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/>'

function makeDocxRow(num: number, text: string): string {
  const emptyCell = (w: number) =>
    `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:rPr>${TNR_FMT}</w:rPr></w:pPr></w:p></w:tc>`
  return (
    `<w:tr>` +
    `<w:tc><w:tcPr><w:tcW w:w="421" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:rPr>${TNR_FMT}</w:rPr></w:pPr><w:r><w:rPr>${TNR_FMT}</w:rPr><w:t>${num}</w:t></w:r></w:p></w:tc>` +
    `<w:tc><w:tcPr><w:tcW w:w="5645" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:rPr>${TNR_FMT}</w:rPr></w:pPr><w:r><w:rPr>${TNR_FMT}</w:rPr><w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r></w:p></w:tc>` +
    emptyCell(1017) +
    emptyCell(1417) +
    emptyCell(1694) +
    `</w:tr>`
  )
}

function b64ToArrayBuffer(b64: string): ArrayBuffer {
  const bytes = atob(b64)
  const ab = new ArrayBuffer(bytes.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i)
  return ab
}

export async function generateApplicantDocx(
  raw: Record<string, string>,
  settings: SpravaSettings,
  orderConfig: OrderConfigRow[],
): Promise<void> {
  const lookup = orderConfigToLookup(orderConfig)
  const nm = parseName(g(raw, COL.pib))
  const fnum = g(raw, COL.fileNum)
  const fac = g(raw, COL.faculty)
  const prog = g(raw, COL.program)
  const spec = g(raw, COL.specialty)
  const lvl = g(raw, COL.level)
  const sf = g(raw, COL.studyForm)
  const orderParsed = parseOrderStr(g(raw, COL.order))
  const orderDate = getOrderDate(orderParsed.num, lookup) || orderParsed.date
  const lvlFull = lvl + (settings.duration ? ` (${settings.duration})` : '')
  const dt =
    g(raw, COL.dpo) ||
    'Паспорт громадянина України з безконтактним електронним носієм'
  const ds = g(raw, COL.dpoSeries)
  const dnDigits = (g(raw, COL.dpoNum) || '').replace(/\D/g, '')
  const dn = dnDigits ? dnDigits.padStart(9, '0') : ''
  const dd = excelDate(g(raw, COL.dpoDate))
  const di = g(raw, COL.dpoIssuer)
  const oldPass = isOldPassport(dd)
  const dsOut = oldPass ? '' : ds
  const dnOut = oldPass ? '' : dn
  const issuedLine = oldPass
    ? 'Виданий ,'
    : `Виданий ${dd}${dd ? ',' : ''} ${di}`.replace(/\s+/g, ' ').trim()
  const male = isMale(raw)
  const { budget, contract } = getFunding(raw)
  const cat = getCategory(raw)
  const edu = eduDocStrPlain(raw)
  const sfUC = sf ? sf.charAt(0).toUpperCase() + sf.slice(1) : sf
  const orderNum = orderParsed.num || '_________________________'
  const orderLine = `Наказ №_${orderNum}_ від __${orderDate ? orderDate + ' р' : '____________'}.__ `

  const docs = [
    'Заява',
    edu,
    `${dt} (копія)`,
    'Витяг з реєстру територіальної громади',
    'Картка платника податків (копія)',
    male
      ? 'Військово-обліковий документ (копія)'
      : 'Військово-обліковий документ (копія) — не потрібно',
    'Договір про навчання в закладі вищої освіти',
    ...(contract
      ? ['Договір про надання платної освітньої послуги для підготовки фахівців']
      : []),
  ]
  const docsRowsXml = docs.map((d, i) => makeDocxRow(i + 1, d)).join('')
  const progSpec = `${prog} / ${spec}`
  const CHK = (v: boolean) => (v ? 'х' : ' ')

  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(b64ToArrayBuffer(DOCX_TEMPLATE_B64))
  const docFile = zip.file('word/document.xml')
  if (!docFile) throw new Error('DOCX-шаблон пошкоджений')
  let xml = await docFile.async('string')

  const rep = (ph: string, val: unknown) => {
    xml = xml.split(ph).join(xmlEsc(String(val ?? '')))
  }
  rep('Виданий {{DOC_DATE}}, орган, що видав {{DOC_ISSUER}}', issuedLine)
  rep('{{ORDER_LINE}}', orderLine)
  rep('{{STUDY_FORM_UC}}', sfUC)
  rep('{{FILE_NUM}}', fnum)
  rep('{{PIB_FULL}}', `${nm.last} ${nm.first} ${nm.mid}`)
  rep('{{FACULTY}}', fac)
  rep('{{PROGRAM}}', prog)
  rep('{{SPECIALTY}}', spec)
  rep('{{LEVEL_FULL}}', lvlFull)
  rep('{{STUDY_FORM}}', sf)
  rep('{{LAST_NAME}}', nm.last)
  rep('{{FIRST_NAME}}', nm.first)
  rep('{{PATR_NAME}}', nm.mid)
  rep('{{YEAR}}', settings.year || String(new Date().getFullYear()))
  rep('{{LEVEL}}', lvl)
  rep('{{PROG_SPEC}}', progSpec)
  rep('{{DOC_TYPE}}', dt)
  rep('{{DOC_SERIES}}', dsOut)
  rep('{{DOC_NUM}}', dnOut)
  rep('{{DOC_DATE}}', dd)
  rep('{{DOC_ISSUER}}', di)
  rep('{{CHK_GENERAL}}', CHK(cat === 'general'))
  rep('{{CHK_QUOTA}}', CHK(cat === 'quota'))
  rep('{{CHK_INTERVIEW}}', CHK(cat === 'interview'))
  rep('{{CHK_BUDGET}}', CHK(budget))
  rep('{{CHK_CONTRACT}}', CHK(contract))
  rep('{{SECRETARY}}', settings.secretary || '')

  xml = xml.replace(
    '<w:tr><w:tc><w:p><w:r><w:t>{{DOCS_ROWS}}</w:t></w:r></w:p></w:tc></w:tr>',
    docsRowsXml,
  )

  zip.file('word/document.xml', xml)
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fnum} ${nm.last} ${nm.first}.docx`.trim()
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
