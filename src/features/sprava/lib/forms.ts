import type { OrderConfigRow, SpravaSettings } from '../types'
import {
  chkBox,
  eduDocStr,
  esc,
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
import { photoBoxHTML } from './photos'
import { COL } from '../types'

export function renderForm201(
  a: Record<string, string>,
  s: SpravaSettings,
  orderLookup: Map<number, string>,
): string {
  const nm = parseName(g(a, COL.pib))
  const fnum = g(a, COL.fileNum)
  const fac = g(a, COL.faculty)
  const prog = g(a, COL.program)
  const spec = g(a, COL.specialty)
  const lvl = g(a, COL.level)
  const sf = g(a, COL.studyForm)
  const orderRaw = g(a, COL.order)
  const orderParsed = parseOrderStr(orderRaw)
  const orderDate =
    getOrderDate(orderParsed.num, orderLookup) || orderParsed.date
  const lvlFull = lvl + (s.duration ? ` (${s.duration})` : '')

  return `
<div class="form-page">

  <p style="text-align:right;font-size:18pt;font-weight:bold;margin:0;text-decoration:underline">
    Наказ №&nbsp;${esc(orderParsed.num) || '_________________________'}&nbsp;
    ${orderDate ? 'від&nbsp;&nbsp;' + esc(orderDate) + '&nbsp;р.' : ''}
  </p>

  <p style="text-align:right;font-size:14pt;font-weight:bold;margin:0 0 3px">${esc(sf)}</p>

  <table class="ft ft-border" style="margin-bottom:1px">
    <tr>
      <td style="width:30%;padding:4px 8px;font-size:21pt;font-weight:bold"><span class="fp-mark">${esc(fnum)}</span></td>
      <td style="padding:4px 8px;font-size:21pt;font-weight:bold"><span class="fp-mark">${esc([nm.last, nm.first, nm.mid].filter(Boolean).join(' '))}</span></td>
    </tr>
  </table>

  <p style="text-align:right;font-size:14pt;font-weight:bold;margin:0">Форма № Н-2.01</p>

  <div style="flex:1.5"></div>

  <table class="ft" style="margin-bottom:2px">
    <tr><td style="text-align:center;padding:3px 8px;border-bottom:1px solid #000;font-size:14pt">${esc(s.university)}</td></tr>
  </table>
  <p class="fp-small" style="text-align:center;margin:0">(повне найменування вищого навчального закладу)</p>

  <div style="flex:1"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:42%;padding:3px 6px;font-size:14pt">Інститут, факультет, відділення</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000;font-size:14pt">${esc(fac)}</td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 6px">(найменування інституту, факультету, відділення)</td>
    </tr>
  </table>

  <div style="flex:1"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:30%;padding:3px 6px;font-size:14pt">Освітня програма</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000;font-size:14pt">"<span class="fp-mark">${esc(prog)}</span>"</td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 6px">(шифр і назва)</td>
    </tr>
  </table>

  <div style="flex:1"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:25%;padding:3px 6px;font-size:14pt">Спеціальність</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000;font-size:14pt"><span class="fp-mark">${esc(spec)}</span></td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 6px">(шифр і назва)</td>
    </tr>
  </table>

  <div style="flex:1"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:50%;padding:3px 6px;font-size:14pt">Рівень вищої освіти/освітньо-кваліфікаційний рівень</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000;font-size:14pt"><span class="fp-mark">${esc(lvlFull)}</span></td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 6px">(молодший спеціаліст, бакалавр, спеціаліст, магістр)</td>
    </tr>
  </table>

  <div style="flex:1"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:30%;padding:3px 6px;font-size:14pt">Форма навчання</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000;font-size:14pt"><span class="fp-mark">${esc(sf)}</span></td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 6px">(денна, вечірня, заочна, дистанційна)</td>
    </tr>
  </table>

  <div style="flex:2.5"></div>

  <div class="fp-section">ОСОБОВА СПРАВА СТУДЕНТА</div>

  <div style="flex:1"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:22%;padding:3px 6px;font-size:14pt">Прізвище</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000;font-size:14pt"><span class="fp-mark">${esc(nm.last)}</span></td>
    </tr>
    <tr>
      <td style="padding:3px 6px;font-size:14pt">Ім'я</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000;font-size:14pt"><span class="fp-mark">${esc(nm.first)}</span></td>
    </tr>
    <tr>
      <td style="padding:3px 6px;font-size:14pt">По батькові</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000;font-size:14pt"><span class="fp-mark">${esc(nm.mid)}</span></td>
    </tr>
  </table>

  <div style="flex:1.5"></div>

  <p style="font-size:14pt;margin:0 0 5px;text-align:center">
    Рік вступу до вищого навчального закладу&nbsp;&nbsp;<span class="fp-ul"><span class="fp-mark">${esc(s.year)}</span></span>
  </p>
  <p style="font-size:14pt;margin:0 0 5px">
    Розпочато &nbsp;&nbsp;"____" ______________________________<span class="fp-mark">${esc(s.year)}</span> року
  </p>
  <p style="font-size:14pt;margin:0 0 5px">
    Закінчено &nbsp;"____" _________________________________ 20___ року
  </p>
  <p style="font-size:14pt;margin:0 0 5px">
    Передано в архів &nbsp;"____" ___________________________ 20___ року
  </p>
  <p style="font-size:14pt;margin:0">
    за описом № _______ &nbsp;від &nbsp;"____" _____________________ 20___ року
  </p>

</div>`
}

export function renderForm1031(
  a: Record<string, string>,
  s: SpravaSettings,
): string {
  const nm = parseName(g(a, COL.pib))
  const fnum = g(a, COL.fileNum)
  const fac = g(a, COL.faculty)
  const prog = g(a, COL.program)
  const spec = g(a, COL.specialty)
  const lvl = g(a, COL.level)
  const dt =
    g(a, COL.dpo) ||
    'Паспорт громадянина України з безконтактним електронним носієм'
  const ds = g(a, COL.dpoSeries)
  const dnDigits = (g(a, COL.dpoNum) || '').replace(/\D/g, '')
  const dn = dnDigits ? dnDigits.padStart(9, '0') : ''
  const dd = excelDate(g(a, COL.dpoDate))
  const di = g(a, COL.dpoIssuer)
  const oldPass = isOldPassport(dd)
  const dsShow = oldPass ? '' : ds
  const dnShow = oldPass ? '' : dn
  const male = isMale(a)
  const { budget, contract } = getFunding(a)
  const cat = getCategory(a)
  const edu = eduDocStr(a)
  const lvlSuffix =
    lvl && lvl.toLowerCase().includes('бакалавр') && s.duration
      ? ` (${s.duration})`
      : ''

  const docs = [
    'Заява',
    edu,
    `${esc(dt)} (копія)`,
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

  const docRows = docs
    .map(
      (d, i) => `
    <tr>
      <td style="text-align:center;border:1px solid #000;padding:3px 4px">${i + 1}</td>
      <td style="border:1px solid #000;padding:3px 6px">${d}</td>
      <td style="border:1px solid #000;padding:3px 4px"></td>
      <td style="border:1px solid #000;padding:3px 4px"></td>
      <td style="border:1px solid #000;padding:3px 4px"></td>
    </tr>`,
    )
    .join('')

  return `
<div class="form-page" style="font-size:10pt">

  <table class="ft" style="margin-bottom:4px">
    <tr>
      <td style="width:26%;vertical-align:top;padding:0">
        ${photoBoxHTML(fnum)}
      </td>
      <td style="vertical-align:top;text-align:right;padding:0;font-size:14pt">
        <b>Форма № Н-1.03.1</b>
      </td>
    </tr>
  </table>
  <div style="flex:0.5"></div>

  <table class="ft" style="margin-bottom:0;font-size:12pt;font-weight:bold">
    <tr>
      <td style="width:52%;padding:4px 6px">ОПИС ОСОБОВОЇ СПРАВИ №</td>
      <td style="padding:4px 6px;border-bottom:1px solid #000"><span class="fp-mark">${esc(fnum)}</span></td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;font-weight:normal;padding:1px 6px">(за журналом реєстрації вступників)</td>
    </tr>
  </table>
  <div style="flex:0.5"></div>

  <table class="ft" style="margin-bottom:0;font-size:12pt">
    <tr>
      <td style="width:18%;padding:3px 6px">Прізвище</td>
      <td style="width:30%;padding:3px 6px;border-bottom:1px solid #000"><span class="fp-mark">${esc(nm.last)}</span></td>
      <td style="width:10%;padding:3px 6px">Ім'я</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000"><span class="fp-mark">${esc(nm.first)}</span></td>
    </tr>
  </table>
  <table class="ft" style="margin-bottom:0;font-size:12pt">
    <tr>
      <td style="width:22%;padding:3px 6px">По батькові</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000"><span class="fp-mark">${esc(nm.mid)}</span></td>
    </tr>
  </table>
  <div style="flex:0.5"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:46%;padding:3px 6px">Інститут/факультет/відділення</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000">${esc(fac)}</td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 6px">(найменування інституту, факультету, відділення)</td>
    </tr>
  </table>
  <div style="flex:0.5"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:46%;padding:3px 6px">Освітньо-кваліфікаційний рівень/ступінь</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000">${esc(lvl)}${esc(lvlSuffix)}</td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 6px">(бакалавр/магістр/доктор філософії)</td>
    </tr>
  </table>
  <div style="flex:0.5"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:40%;padding:3px 6px">Освітня програма / спеціальність</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000"><span class="fp-mark">${esc(prog)}</span> / ${esc(spec)}</td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 6px">(найменування освітньої програми / спеціальності)</td>
    </tr>
  </table>
  <div style="flex:0.5"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:46%;padding:3px 6px">Пред'явлений документ, що посвідчує особу:</td>
      <td style="padding:3px 6px;border-bottom:1px solid #000"><span class="fp-mark">${esc(dt)}</span></td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 6px">(паспорт/свідоцтво про народження/інше)</td>
    </tr>
  </table>
  <div style="flex:0.3"></div>

  <table class="ft" style="margin-bottom:0">
    <tr>
      <td style="width:10%;padding:3px 5px">Серія</td>
      <td style="width:8%;padding:3px 2px;border-bottom:1px solid #000">${esc(dsShow)}&nbsp;</td>
      <td style="width:5%;padding:3px 5px">№</td>
      <td style="width:22%;padding:3px 5px;border-bottom:1px solid #000"><span class="fp-mark">${esc(dnShow)}</span></td>
      <td style="padding:3px 5px;border-bottom:1px solid #000">
        Виданий${oldPass ? '&nbsp;,' : ` <span class="fp-mark">${esc(dd)}</span>${dd ? ',' : ''} <span class="fp-mark">${esc(di)}</span>`}
      </td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td style="text-align:center;font-size:8.5pt;padding:1px 5px">(ким та коли виданий)</td>
    </tr>
  </table>
  <div style="flex:0.5"></div>

  <table class="ft" style="margin-bottom:0;border-collapse:collapse">
    <thead>
      <tr>
        <th style="border:1px solid #000;padding:2px 4px;width:7%;text-align:center">№<br>з/п</th>
        <th style="border:1px solid #000;padding:2px 6px">Назва документів</th>
        <th style="border:1px solid #000;padding:2px 4px;width:11%">Кількість аркушів</th>
        <th style="border:1px solid #000;padding:2px 4px;width:17%">Дата вилучення і місце знаходження документа</th>
        <th style="border:1px solid #000;padding:2px 4px;width:14%">Дата повернення документа в особову справу</th>
      </tr>
    </thead>
    <tbody>${docRows}</tbody>
  </table>
  <div style="flex:0.5"></div>

  <p style="margin:0 0 2px;font-size:10pt"><b>Категорія при зарахуванні (вказати необхідне):</b></p>
  <table class="ft" style="margin-bottom:0;font-size:8pt">
    <tr>
      <td style="width:5%">${chkBox(cat === 'general')}</td>
      <td style="width:36%">&nbsp;- на загальних підставах</td>
      <td style="width:5%">${chkBox(cat === 'quota')}</td>
      <td style="width:26%">&nbsp;- за іспитами та/або квотами</td>
      <td style="width:5%">${chkBox(cat === 'interview')}</td>
      <td>&nbsp;- за співбесідою</td>
    </tr>
  </table>
  <div style="flex:0.3"></div>

  <p style="margin:0 0 2px;font-size:10pt"><b>Джерело фінансування (вказати необхідне):</b></p>
  <table class="ft" style="margin-bottom:0;font-size:8pt">
    <tr>
      <td style="width:5%">${chkBox(budget)}</td>
      <td style="width:36%">&nbsp;- держзамовлення</td>
      <td style="width:5%">${chkBox(contract)}</td>
      <td>&nbsp;- кошти фізичних/юридичних осіб</td>
    </tr>
  </table>
  <div style="flex:1"></div>

  <table style="width:100%;border-collapse:collapse;font-size:10pt">
    <tr>
      <td style="width:55%;vertical-align:bottom;padding-bottom:2px">
        Відповідальний секретар приймальної (відбіркової) комісії
      </td>
      <td style="width:20%;text-align:center;vertical-align:bottom;padding:0 6px">
        <div style="height:45px"></div>
        <div style="border-top:1px solid #000;font-size:7.5pt;text-align:center">(підпис)</div>
      </td>
      <td style="width:25%;vertical-align:bottom;padding-left:8px">
        <div style="border-bottom:1px solid #000;padding-bottom:2px">
          <span class="fp-mark">${esc(s.secretary)}</span>
        </div>
        <div style="font-size:7.5pt;text-align:center">(ПІБ)</div>
      </td>
    </tr>
  </table>

</div>`
}

export function renderApplicantForms(
  a: Record<string, string>,
  s: SpravaSettings,
  orderConfig: OrderConfigRow[],
): string {
  const lookup = orderConfigToLookup(orderConfig)
  return renderForm201(a, s, lookup) + renderForm1031(a, s)
}
