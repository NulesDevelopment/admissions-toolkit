export const REQUIRED_COLUMNS = [
  'Ід заявки',
  'Ід персони',
  'Структурний підрозділ',
  'Спеціальність',
  'Вступник',
  'Контактний номер',
  'Електронна адреса',
  'Статус заявки',
  'Номер (шифр) особової справи',
  'Конкурсний бал',
  'Пріоритет',
  'Претендує на бюджет',
  'Претендує на контракт',
  'Час додання заяви до ЄДЕБО',
] as const

export const APP_ID = 0
export const PERSON_ID = 1
export const PERSON_NAME = 2
export const STATUS = 3
export const SCORE = 4
export const CASE_CODE = 5
export const DATE_MS = 6
export const DATE_TEXT = 7
export const PERSON_KEY = 8
export const COLLEGE = 9
export const PHONE = 10
export const EMAIL = 11
export const CLAIMS_BUDGET = 12
export const PRIORITY = 13
export const CLAIMS_CONTRACT = 14
export const CATEGORY_CODES = 15

export const DEFAULT_THRESHOLD = 145
export const BUDGET_SCORE = 130

export type AppTuple = [
  string, // appId
  string, // personId
  string, // personName
  string, // status
  number | null, // score
  string, // caseCode
  number | null, // dateMs
  string, // dateText
  string, // personKey
  boolean, // college
  string, // phone
  string, // email
  boolean | null, // claimsBudget
  number | null, // priority
  boolean | null, // claimsContract
  string[], // categoryCodes
]

export type PersonAgg = {
  personId: string
  personName: string
  phone: string
  email: string
  maxScore: number | null
  college: boolean
  claimsBudget: boolean | null
  appIndexes: number[]
}

export type SpecialtyBucket = {
  apps: AppTuple[]
  cancelledByApplicant: AppTuple[]
  cancelledPriority: AppTuple[]
  persons: Map<string, PersonAgg>
  cases: Map<string, number[]>
}

export type ColumnIndexes = {
  appId: number
  personId: number
  faculty: number
  specialty: number
  personName: number
  phone: number
  email: number
  status: number
  caseCode: number
  score: number
  priority: number
  claimsBudget: number
  claimsContract: number
  categoryCodes: number | undefined
  submittedAt: number
}

export type LoadMeta = {
  totalRows: number
  validRows: number
  cancelled: number
  cancelledByApplicant: number
  cancelledPriority: number
  encoding: string
}

export type PriorityStats = {
  priority: number
  applications: number
  applicants: number
  budget: number
  contract: number
}

export type SpecialtySummary = {
  specialty: string
  threshold: number
  persons: number
  above: number
  below: number
  budget: number
  contractOnly: number
  claimsBudgetBelow130: number
  college: number
  apps: number
  cancelledByApplicant: number
  cancelledPriority: number
  duplicateCodes: number
  priorities: PriorityStats[]
}

export type PublicAppRecord = {
  personName: string
  phone: string
  email: string
  personId: string
  appId: string
  status: string
  appScore: number | null
  caseCode: string
  claimsBudget: boolean | null
  claimsContract: boolean | null
  dateMs: number | null
  dateText: string
}

export type DuplicateRow = {
  specialty: string
  caseCode: string
  appId: string
  personId: string
  personName: string
  status: string
  claimsBudget: boolean | null
  claimsContract: boolean | null
  score: number | null
  dateMs: number | null
  dateText: string
}

export type CategoryApplication = {
  specialty: string
  score: number | null
  claimsBudget: boolean
  claimsContract: boolean
  caseCode: string
  appId: string
  dateMs: number | null
}

export type CategoryApplicant = {
  personName: string
  personId: string
  phone: string
  email: string
  maxScore: number | null
  applications: CategoryApplication[]
}

export type CategoryGroup = {
  code: string
  applicants: CategoryApplicant[]
}

export type SummaryTotals = {
  specialties: number
  persons: number
  apps: number
  duplicateCodes: number
}

export type SummaryResult = {
  summary: SpecialtySummary[]
  duplicates: DuplicateRow[]
  categories: CategoryGroup[]
  totals: SummaryTotals
}

export type DetailKind =
  | 'persons'
  | 'above'
  | 'below'
  | 'budget'
  | 'contractOnly'
  | 'claimsBudgetBelow130'
  | 'college'
  | 'apps'
  | 'cancelledByApplicant'
  | 'cancelledPriority'
  | 'duplicates'

export type PriorityDetailRow = {
  personName: string
  personId: string
  phone: string
  email: string
  score: number | null
  claimsBudget: boolean | null
  claimsContract: boolean | null
  caseCodes: string[]
  appIds: string[]
  statuses: string[]
  dateMs: number | null
  dateText: string
}

export type EncodingOption = 'auto' | 'windows-1251' | 'utf-8'
export type PrintMode = 'mono' | 'color'

export type DetailState = {
  specialty: string
  kind: DetailKind
  threshold: number
  label: string
  rows: PublicAppRecord[]
  persons: number
  apps: number
} | null

export type PriorityDetailState = {
  specialty: string
  priority: number
  rows: PriorityDetailRow[]
  applications: number
} | null
