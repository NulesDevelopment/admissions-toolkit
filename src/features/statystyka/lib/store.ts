import { CsvParser } from './csvParser'
import {
  compareDateDesc,
  clean,
  normalizeThreshold,
  parseBoolean,
  parseCategoryCodes,
  parseDate,
  parsePriority,
  parseScore,
} from './parsers'
import {
  APP_ID,
  BUDGET_SCORE,
  CASE_CODE,
  CATEGORY_CODES,
  CLAIMS_BUDGET,
  CLAIMS_CONTRACT,
  DATE_MS,
  DATE_TEXT,
  EMAIL,
  PERSON_ID,
  PERSON_KEY,
  PERSON_NAME,
  PHONE,
  PRIORITY,
  REQUIRED_COLUMNS,
  SCORE,
  STATUS,
  type AppTuple,
  type ColumnIndexes,
  type DetailKind,
  type DuplicateRow,
  type LoadMeta,
  type PublicAppRecord,
  type SpecialtyBucket,
  type SummaryResult,
} from './types'

function makePublicRecord(app: AppTuple): PublicAppRecord {
  return {
    personName: app[PERSON_NAME],
    phone: app[PHONE],
    email: app[EMAIL],
    personId: app[PERSON_ID],
    appId: app[APP_ID],
    status: app[STATUS],
    appScore: app[SCORE],
    caseCode: app[CASE_CODE],
    claimsBudget: app[CLAIMS_BUDGET],
    claimsContract: app[CLAIMS_CONTRACT],
    dateMs: app[DATE_MS],
    dateText: app[DATE_TEXT],
  }
}

function buildIndexes(header: string[]): ColumnIndexes {
  const map = new Map(header.map((v, i) => [clean(v), i]))
  const missing = REQUIRED_COLUMNS.filter((x) => !map.has(x))
  if (missing.length) {
    throw new Error(
      `У CSV відсутні обовʼязкові колонки (${missing.length}): ${missing.join(', ')}. ` +
        'Переконайтесь, що це експорт заявок з ЄДЕБО з роздільником «;».',
    )
  }

  const categoryAliases = [
    'Пільгові категорії',
    'Код категорії особи',
    'Коди категорій особи',
    'Код категорії',
    'Коди категорій',
    'Категорія особи',
  ]
  const categoryCodes = categoryAliases
    .map((name) => map.get(name))
    .find((index) => index != null)

  return {
    appId: map.get('Ід заявки')!,
    personId: map.get('Ід персони')!,
    faculty: map.get('Структурний підрозділ')!,
    specialty: map.get('Спеціальність')!,
    personName: map.get('Вступник')!,
    phone: map.get('Контактний номер')!,
    email: map.get('Електронна адреса')!,
    status: map.get('Статус заявки')!,
    caseCode: map.get('Номер (шифр) особової справи')!,
    score: map.get('Конкурсний бал')!,
    priority: map.get('Пріоритет')!,
    claimsBudget: map.get('Претендує на бюджет')!,
    claimsContract: map.get('Претендує на контракт')!,
    categoryCodes,
    submittedAt: map.get('Час додання заяви до ЄДЕБО')!,
  }
}

async function detectEncoding(
  file: File,
  requested: string,
): Promise<string> {
  if (requested !== 'auto') return requested

  const sample = await file.slice(0, Math.min(file.size, 262144)).arrayBuffer()
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(sample)
    return 'utf-8'
  } catch {
    return 'windows-1251'
  }
}

export class StatystykaStore {
  faculties = new Map<string, Map<string, SpecialtyBucket>>()
  loadMeta: LoadMeta | null = null

  private getBucket(faculty: string, specialty: string): SpecialtyBucket {
    let f = this.faculties.get(faculty)
    if (!f) {
      f = new Map()
      this.faculties.set(faculty, f)
    }

    let b = f.get(specialty)
    if (!b) {
      b = {
        apps: [],
        cancelledByApplicant: [],
        cancelledPriority: [],
        persons: new Map(),
        cases: new Map(),
      }
      f.set(specialty, b)
    }
    return b
  }

  private addCase(bucket: SpecialtyBucket, code: string, appIndex: number) {
    if (!code) return
    const list = bucket.cases.get(code)
    if (list) list.push(appIndex)
    else bucket.cases.set(code, [appIndex])
  }

  private processRecord(
    row: string[],
    idx: ColumnIndexes,
    meta: LoadMeta,
  ) {
    meta.totalRows++

    const faculty = clean(row[idx.faculty]) || '(Не вказано факультет)'
    const specialty = clean(row[idx.specialty]) || '(Не вказано спеціальність)'
    const appId = clean(row[idx.appId])
    const personId = clean(row[idx.personId])
    const personName = clean(row[idx.personName])
    const phone = clean(row[idx.phone])
    const email = clean(row[idx.email])
    const statusText = clean(row[idx.status])
    const normalizedStatus = statusText.toLocaleLowerCase('uk-UA')
    const caseCode = clean(row[idx.caseCode])
    const score = parseScore(row[idx.score])
    const priority = parsePriority(row[idx.priority])
    const claimsBudget = parseBoolean(row[idx.claimsBudget])
    const claimsContract = parseBoolean(row[idx.claimsContract])
    const categoryCodes =
      idx.categoryCodes == null
        ? []
        : parseCategoryCodes(row[idx.categoryCodes])
    const date = parseDate(row[idx.submittedAt])
    const personKey =
      personId || (appId ? '@app:' + appId : '@row:' + meta.totalRows)
    const college = /ВП[1-9]$/iu.test(caseCode)

    const app: AppTuple = [
      appId,
      personId,
      personName,
      statusText,
      score,
      caseCode,
      date[0],
      date[1],
      personKey,
      college,
      phone,
      email,
      claimsBudget,
      priority,
      claimsContract,
      categoryCodes,
    ]

    const bucket = this.getBucket(faculty, specialty)

    if (normalizedStatus === 'скасовано вступником') {
      bucket.cancelledByApplicant.push(app)
      meta.cancelledByApplicant++
      meta.cancelled++
      return
    }

    if (normalizedStatus === 'скасовано (втрата пріор.)') {
      bucket.cancelledPriority.push(app)
      meta.cancelledPriority++
      meta.cancelled++
      return
    }

    const appIndex = bucket.apps.length
    bucket.apps.push(app)

    let person = bucket.persons.get(personKey)
    if (!person) {
      person = {
        personId,
        personName,
        phone,
        email,
        maxScore: score,
        college,
        claimsBudget,
        appIndexes: [appIndex],
      }
      bucket.persons.set(personKey, person)
    } else {
      if (!person.personName && personName) person.personName = personName
      if (!person.personId && personId) person.personId = personId
      if (!person.phone && phone) person.phone = phone
      if (!person.email && email) person.email = email
      if (person.claimsBudget == null && claimsBudget != null) {
        person.claimsBudget = claimsBudget
      }
      if (claimsBudget === true) person.claimsBudget = true
      if (
        score !== null &&
        (person.maxScore === null || score > person.maxScore)
      ) {
        person.maxScore = score
      }
      if (college) person.college = true
      person.appIndexes.push(appIndex)
    }

    this.addCase(bucket, caseCode, appIndex)
    meta.validRows++
  }

  async loadFile(
    file: File,
    requestedEncoding: string,
    onProgress?: (rows: number) => void,
  ) {
    this.faculties = new Map()

    const encoding = await detectEncoding(file, requestedEncoding)
    const decoder = new TextDecoder(encoding)
    const meta: LoadMeta = {
      totalRows: 0,
      validRows: 0,
      cancelled: 0,
      cancelledByApplicant: 0,
      cancelledPriority: 0,
      encoding,
    }

    let header: string[] | null = null
    let idx: ColumnIndexes | null = null
    let lastProgress = 0

    const parser = new CsvParser((row) => {
      if (!header) {
        header = row

        if (header.length === 1 && /^sep=;$/i.test(clean(header[0]))) {
          header = null
          return
        }

        idx = buildIndexes(header)
        return
      }

      if (row.length === 1 && !clean(row[0])) return
      this.processRecord(row, idx!, meta)

      if (meta.totalRows - lastProgress >= 25000) {
        lastProgress = meta.totalRows
        onProgress?.(meta.totalRows)
      }
    })

    if (file.stream) {
      const reader = file.stream().getReader()
      while (true) {
        const part = await reader.read()
        if (part.done) break
        parser.push(decoder.decode(part.value, { stream: true }))
      }
      parser.push(decoder.decode(), true)
    } else {
      const buf = await file.arrayBuffer()
      parser.push(decoder.decode(buf), true)
    }

    if (!header) {
      throw new Error(
        'CSV порожній або не містить заголовка. Очікується файл ЄДЕБО з першим рядком назв колонок.',
      )
    }

    this.loadMeta = meta

    return {
      faculties: [...this.faculties.keys()].sort((a, b) =>
        a.localeCompare(b, 'uk'),
      ),
      meta,
    }
  }

  private getDuplicateIndexes(bucket: SpecialtyBucket) {
    const indexes: number[] = []
    let duplicateCodes = 0

    for (const list of bucket.cases.values()) {
      if (list.length < 2) continue
      duplicateCodes++
      for (const index of list) indexes.push(index)
    }

    return { duplicateCodes, indexes }
  }

  summarize(
    faculty: string,
    thresholds: Record<string, number> | null | undefined,
  ): SummaryResult {
    const f = this.faculties.get(faculty)
    if (!f) {
      return {
        summary: [],
        duplicates: [],
        categories: [],
        totals: { specialties: 0, persons: 0, apps: 0, duplicateCodes: 0 },
      }
    }

    const summary = []
    const duplicates: DuplicateRow[] = []
    const categoryMap = new Map<
      string,
      Map<
        string,
        {
          personName: string
          personId: string
          phone: string
          email: string
          applications: Map<
            string,
            {
              specialty: string
              score: number | null
              claimsBudget: boolean
              claimsContract: boolean
              caseCode: string
              appId: string
              dateMs: number | null
            }
          >
        }
      >
    >()
    let totalPersons = 0
    let totalApps = 0
    let totalDuplicateCodes = 0

    for (const [specialty, bucket] of f) {
      for (const app of bucket.apps) {
        for (const code of app[CATEGORY_CODES]) {
          let group = categoryMap.get(code)
          if (!group) {
            group = new Map()
            categoryMap.set(code, group)
          }

          const personKey = app[PERSON_KEY]
          let person = group.get(personKey)

          if (!person) {
            person = {
              personName: app[PERSON_NAME],
              personId: app[PERSON_ID],
              phone: app[PHONE],
              email: app[EMAIL],
              applications: new Map(),
            }
            group.set(personKey, person)
          } else {
            if (!person.personName && app[PERSON_NAME])
              person.personName = app[PERSON_NAME]
            if (!person.personId && app[PERSON_ID])
              person.personId = app[PERSON_ID]
            if (!person.phone && app[PHONE]) person.phone = app[PHONE]
            if (!person.email && app[EMAIL]) person.email = app[EMAIL]
          }

          const applicationKey =
            app[APP_ID] ||
            [specialty, app[CASE_CODE], app[DATE_MS], app[SCORE]].join('\u0000')

          if (!person.applications.has(applicationKey)) {
            person.applications.set(applicationKey, {
              specialty,
              score: app[SCORE],
              claimsBudget: app[CLAIMS_BUDGET] === true,
              claimsContract:
                app[CLAIMS_BUDGET] !== true && app[CLAIMS_CONTRACT] === true,
              caseCode: app[CASE_CODE],
              appId: app[APP_ID],
              dateMs: app[DATE_MS],
            })
          }
        }
      }

      const priorityPersons = Array.from({ length: 10 }, () => new Map<string, { budget: boolean; contract: boolean }>())
      const priorityApplications = Array.from({ length: 10 }, () => 0)

      for (const app of bucket.apps) {
        const priority = app[PRIORITY]
        if (priority === null) continue

        priorityApplications[priority - 1]++
        const people = priorityPersons[priority - 1]
        const key = app[PERSON_KEY]
        let flags = people.get(key)

        if (!flags) {
          flags = { budget: false, contract: false }
          people.set(key, flags)
        }

        if (app[CLAIMS_BUDGET]) flags.budget = true
        if (app[CLAIMS_CONTRACT]) flags.contract = true
      }

      const threshold = normalizeThreshold(thresholds && thresholds[specialty])
      let above = 0
      let below = 0
      let budget = 0
      let contractOnly = 0
      let claimsBudgetBelow130 = 0
      let college = 0

      for (const person of bucket.persons.values()) {
        if (person.maxScore !== null) {
          if (person.maxScore >= threshold) above++
          else below++

          if (person.maxScore >= BUDGET_SCORE) budget++
          else {
            contractOnly++
            if (person.claimsBudget) claimsBudgetBelow130++
          }
        }

        if (person.college) college++
      }

      const duplicateInfo = this.getDuplicateIndexes(bucket)

      for (const appIndex of duplicateInfo.indexes) {
        const app = bucket.apps[appIndex]
        duplicates.push({
          specialty,
          caseCode: app[CASE_CODE],
          appId: app[APP_ID],
          personId: app[PERSON_ID],
          personName: app[PERSON_NAME],
          status: app[STATUS],
          claimsBudget: app[CLAIMS_BUDGET],
          claimsContract: app[CLAIMS_CONTRACT],
          score: app[SCORE],
          dateMs: app[DATE_MS],
          dateText: app[DATE_TEXT],
        })
      }

      const persons = bucket.persons.size

      summary.push({
        specialty,
        threshold,
        persons,
        above,
        below,
        budget,
        contractOnly,
        claimsBudgetBelow130,
        college,
        apps: bucket.apps.length,
        cancelledByApplicant: bucket.cancelledByApplicant.length,
        cancelledPriority: bucket.cancelledPriority.length,
        duplicateCodes: duplicateInfo.duplicateCodes,
        priorities: priorityPersons.map((people, index) => {
          let budgetCount = 0
          let contractCount = 0

          for (const flags of people.values()) {
            if (flags.budget) budgetCount++
            else if (flags.contract) contractCount++
          }

          return {
            priority: index + 1,
            applications: priorityApplications[index],
            applicants: people.size,
            budget: budgetCount,
            contract: contractCount,
          }
        }),
      })

      totalPersons += persons
      totalApps += bucket.apps.length
      totalDuplicateCodes += duplicateInfo.duplicateCodes
    }

    summary.sort((a, b) => a.specialty.localeCompare(b.specialty, 'uk'))
    duplicates.sort(
      (a, b) =>
        a.specialty.localeCompare(b.specialty, 'uk') ||
        a.caseCode.localeCompare(b.caseCode, 'uk') ||
        compareDateDesc(a, b),
    )

    const categories = [...categoryMap.entries()]
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([code, persons]) => ({
        code,
        applicants: [...persons.values()]
          .map((person) => {
            const applications = [...person.applications.values()].sort(
              (a, b) => {
                const specialtyCompare = String(a.specialty).localeCompare(
                  String(b.specialty),
                  'uk',
                  { numeric: true, sensitivity: 'base' },
                )
                if (specialtyCompare) return specialtyCompare
                const av = a.score == null ? -Infinity : a.score
                const bv = b.score == null ? -Infinity : b.score
                return (
                  bv - av ||
                  String(a.caseCode).localeCompare(String(b.caseCode), 'uk')
                )
              },
            )

            const maxScore = applications.reduce<number | null>(
              (max, application) =>
                application.score !== null &&
                (max === null || application.score > max)
                  ? application.score
                  : max,
              null,
            )

            return {
              personName: person.personName,
              personId: person.personId,
              phone: person.phone,
              email: person.email,
              maxScore,
              applications,
            }
          })
          .sort((a, b) => {
            const av = a.maxScore == null ? -Infinity : a.maxScore
            const bv = b.maxScore == null ? -Infinity : b.maxScore
            return (
              bv - av ||
              String(a.personName).localeCompare(String(b.personName), 'uk')
            )
          }),
      }))

    return {
      summary,
      duplicates,
      categories,
      totals: {
        specialties: summary.length,
        persons: totalPersons,
        apps: totalApps,
        duplicateCodes: totalDuplicateCodes,
      },
    }
  }

  detail(
    faculty: string,
    specialty: string,
    kind: DetailKind,
    threshold: unknown,
  ) {
    const f = this.faculties.get(faculty)
    const bucket = f && f.get(specialty)

    if (!bucket) {
      return { rows: [] as PublicAppRecord[], persons: 0, apps: 0 }
    }

    const t = normalizeThreshold(threshold)

    if (kind === 'cancelledByApplicant' || kind === 'cancelledPriority') {
      const source =
        kind === 'cancelledByApplicant'
          ? bucket.cancelledByApplicant
          : bucket.cancelledPriority

      const rows = source.map(makePublicRecord)
      const persons = new Set(source.map((app) => app[PERSON_KEY])).size
      rows.sort(compareDateDesc)

      return { rows, persons, apps: rows.length }
    }

    const selectedPersonKeys = new Set<string>()
    const selectedAppIndexes = new Set<number>()

    if (kind === 'apps') {
      for (let i = 0; i < bucket.apps.length; i++) selectedAppIndexes.add(i)
    } else if (kind === 'duplicates') {
      const duplicateInfo = this.getDuplicateIndexes(bucket)
      for (const index of duplicateInfo.indexes) selectedAppIndexes.add(index)
    } else {
      for (const [personKey, person] of bucket.persons) {
        let include = false

        if (kind === 'persons') include = true
        else if (kind === 'above') {
          include = person.maxScore !== null && person.maxScore >= t
        } else if (kind === 'below') {
          include = person.maxScore !== null && person.maxScore < t
        } else if (kind === 'budget') {
          include = person.maxScore !== null && person.maxScore >= BUDGET_SCORE
        } else if (kind === 'contractOnly') {
          include = person.maxScore !== null && person.maxScore < BUDGET_SCORE
        } else if (kind === 'claimsBudgetBelow130') {
          include =
            person.maxScore !== null &&
            person.maxScore < BUDGET_SCORE &&
            !!person.claimsBudget
        } else if (kind === 'college') {
          include = person.college
        }

        if (include) {
          selectedPersonKeys.add(personKey)
          for (const index of person.appIndexes) selectedAppIndexes.add(index)
        }
      }
    }

    if (kind === 'apps' || kind === 'duplicates') {
      for (const index of selectedAppIndexes) {
        const app = bucket.apps[index]
        selectedPersonKeys.add(app[PERSON_KEY])
      }
    }

    const rows: PublicAppRecord[] = []
    for (const index of selectedAppIndexes) {
      rows.push(makePublicRecord(bucket.apps[index]))
    }
    rows.sort(compareDateDesc)

    return {
      rows,
      persons: selectedPersonKeys.size,
      apps: rows.length,
    }
  }

  priorityDetail(faculty: string, specialty: string, priority: number) {
    const f = this.faculties.get(faculty)
    const bucket = f && f.get(specialty)
    priority = Number(priority)

    if (!bucket || !Number.isInteger(priority) || priority < 1 || priority > 10) {
      return { rows: [], applications: 0 }
    }

    const persons = new Map<
      string,
      {
        personName: string
        personId: string
        phone: string
        email: string
        score: number | null
        claimsBudget: boolean | null
        claimsContract: boolean | null
        caseCodes: Set<string>
        appIds: Set<string>
        statuses: Set<string>
        dateMs: number | null
        dateText: string
      }
    >()
    let applications = 0

    for (const app of bucket.apps) {
      if (app[PRIORITY] !== priority) continue
      applications++

      const key = app[PERSON_KEY]
      let person = persons.get(key)

      if (!person) {
        person = {
          personName: app[PERSON_NAME],
          personId: app[PERSON_ID],
          phone: app[PHONE],
          email: app[EMAIL],
          score: app[SCORE],
          claimsBudget: app[CLAIMS_BUDGET],
          claimsContract: app[CLAIMS_CONTRACT],
          caseCodes: new Set(),
          appIds: new Set(),
          statuses: new Set(),
          dateMs: app[DATE_MS],
          dateText: app[DATE_TEXT],
        }
        persons.set(key, person)
      } else {
        if (!person.personName && app[PERSON_NAME])
          person.personName = app[PERSON_NAME]
        if (!person.personId && app[PERSON_ID]) person.personId = app[PERSON_ID]
        if (!person.phone && app[PHONE]) person.phone = app[PHONE]
        if (!person.email && app[EMAIL]) person.email = app[EMAIL]
        if (person.claimsBudget == null && app[CLAIMS_BUDGET] != null) {
          person.claimsBudget = app[CLAIMS_BUDGET]
        }
        if (person.claimsContract == null && app[CLAIMS_CONTRACT] != null) {
          person.claimsContract = app[CLAIMS_CONTRACT]
        }
        if (app[CLAIMS_BUDGET] === true) person.claimsBudget = true
        if (app[CLAIMS_CONTRACT] === true) person.claimsContract = true

        if (
          app[SCORE] !== null &&
          (person.score === null || app[SCORE] > person.score)
        ) {
          person.score = app[SCORE]
        }

        const oldDate = person.dateMs == null ? -Infinity : person.dateMs
        const newDate = app[DATE_MS] == null ? -Infinity : app[DATE_MS]

        if (newDate > oldDate) {
          person.dateMs = app[DATE_MS]
          person.dateText = app[DATE_TEXT]
        }
      }

      if (app[CASE_CODE]) person.caseCodes.add(app[CASE_CODE])
      if (app[APP_ID]) person.appIds.add(app[APP_ID])
      if (app[STATUS]) person.statuses.add(app[STATUS])
    }

    const rows = [...persons.values()].map((person) => ({
      personName: person.personName,
      personId: person.personId,
      phone: person.phone,
      email: person.email,
      score: person.score,
      claimsBudget: person.claimsBudget,
      claimsContract: person.claimsContract,
      caseCodes: [...person.caseCodes].sort((a, b) => a.localeCompare(b, 'uk')),
      appIds: [...person.appIds],
      statuses: [...person.statuses],
      dateMs: person.dateMs,
      dateText: person.dateText,
    }))

    rows.sort((a, b) => {
      const aScore = a.score == null ? -Infinity : a.score
      const bScore = b.score == null ? -Infinity : b.score
      return (
        bScore - aScore ||
        String(a.personName).localeCompare(String(b.personName), 'uk')
      )
    })

    return { rows, applications }
  }
}
