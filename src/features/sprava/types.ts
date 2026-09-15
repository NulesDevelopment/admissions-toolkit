/** Назви колонок експорту ЄДЕБО */
export const COL = {
  pib: 'Вступник',
  program: 'Назва КП',
  level: 'ОКР',
  specialty: 'Спеціальність',
  studyForm: 'Форма навчання',
  faculty: 'Структурний підрозділ',
  fileNum: 'Номер (шифр) особової справи',
  order: 'Наказ про зарахування',
  docType: 'Тип документа',
  docSeries: 'Серія документа',
  docNum: 'Номер документа',
  docDate: 'Дата видачі документа',
  docIssuer: 'Ким видано',
  gender: 'Стать',
  benefits: 'Пільгові категорії',
  isBudget: 'Претендує на бюджет',
  isContract: 'Претендує на контракт',
  interview: 'Чи рекомендовано за співбесідою',
  compType: 'Тип конкурсу, за яким отримано рекомендацію',
  dpo: 'ДПО',
  dpoSeries: 'ДПО.Серія',
  dpoNum: 'ДПО.Номер',
  dpoDate: 'ДПО.Дата видачі',
  dpoIssuer: 'ДПО.Ким видано',
  taxId: 'РНОКПП',
  honors: 'Відзнака',
  status: 'Статус заявки',
} as const

export const BUDGET_ORDER = '1255'

export type SpravaSettings = {
  duration: string
  year: string
  secretary: string
  university: string
}

export type OrderConfigRow = {
  id: string
  date: string
  orderNumbers: string
}

export type ApplicantFilters = {
  search: string
  faculty: string
  specialty: string
  form: string
  funding: '' | 'budget' | 'contract'
}

/** Сирий рядок ЄДЕБО + службові поля */
export type ApplicantRecord = {
  id: string
  raw: Record<string, string>
}

/** Рядок для таблиці попереднього перегляду */
export type ApplicantRow = {
  id: string
  fullName: string
  faculty: string
  specialty: string
  form: string
  funding: 'budget' | 'contract'
  fileNum: string
  level: string
  status: string
}

export const defaultSpravaSettings: SpravaSettings = {
  duration: '3 р. 10 міс',
  year: '2026',
  secretary: '',
  university:
    'Національний університет біоресурсів і природокористування України',
}

export const defaultFilters: ApplicantFilters = {
  search: '',
  faculty: '',
  specialty: '',
  form: '',
  funding: '',
}

/** Порожній старт — дати наказів задаються користувачем і живуть у localStorage. */
export const defaultOrderConfig: OrderConfigRow[] = []
