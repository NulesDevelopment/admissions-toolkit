import { describe, expect, it } from 'vitest'
import { filterApplicants, toApplicantRow } from './applicants'
import { getFunding, parseName, parseOrderStr } from './helpers'
import { BUDGET_ORDER, COL, type ApplicantRecord } from '../types'

function rec(raw: Record<string, string>, id = '1'): ApplicantRecord {
  return { id, raw }
}

describe('sprava helpers', () => {
  it('parses name parts', () => {
    expect(parseName('Шевченко Тарас Григорович')).toEqual({
      last: 'Шевченко',
      first: 'Тарас',
      mid: 'Григорович',
    })
  })

  it('detects budget by order number', () => {
    expect(
      getFunding({ [COL.order]: `Наказ № ${BUDGET_ORDER} «СК» від 13.08.2026` })
        .budget,
    ).toBe(true)
    expect(getFunding({ [COL.order]: 'Наказ № 1309 «СК»' }).budget).toBe(false)
  })

  it('parses order number and date', () => {
    const p = parseOrderStr('Наказ № 1255 «СК» від 13.08.2026')
    expect(p.num).toContain('1255')
    expect(p.date).toBe('13.08.2026')
  })
})

describe('filterApplicants', () => {
  const applicants = [
    rec({
      [COL.pib]: 'А Альфа',
      [COL.faculty]: 'Ф1',
      [COL.specialty]: 'С1',
      [COL.studyForm]: 'Денна',
      [COL.order]: `№ ${BUDGET_ORDER}`,
    }),
    rec(
      {
        [COL.pib]: 'Б Бета',
        [COL.faculty]: 'Ф1',
        [COL.specialty]: 'С2',
        [COL.studyForm]: 'Заочна',
        [COL.order]: '№ 1309',
      },
      '2',
    ),
  ]

  it('requires specialty', () => {
    expect(
      filterApplicants(applicants, {
        search: '',
        faculty: '',
        specialty: '',
        form: '',
        funding: '',
      }),
    ).toHaveLength(0)
  })

  it('filters by specialty and funding', () => {
    const rows = filterApplicants(applicants, {
      search: '',
      faculty: '',
      specialty: 'С1',
      form: '',
      funding: 'budget',
    })
    expect(rows).toHaveLength(1)
    expect(toApplicantRow(rows[0]).fullName).toBe('А Альфа')
  })
})
