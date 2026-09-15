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

export type ApplicantRow = {
  id: string
  fullName: string
  faculty: string
  specialty: string
  form: string
  funding: 'budget' | 'contract'
  orderNumber: string
}

export const defaultSpravaSettings: SpravaSettings = {
  duration: '3 р. 10 міс',
  year: '2026',
  secretary: 'Євгеній НІКІТЕНКО',
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
