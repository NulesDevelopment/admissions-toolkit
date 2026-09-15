import { describe, expect, it } from 'vitest'
import { COL } from '../types'
import { parseEdeboRows } from './parseExcel'

describe('parseEdeboRows', () => {
  it('filters «До наказу» and maps columns', () => {
    const result = parseEdeboRows([
      [
        COL.pib,
        COL.status,
        COL.specialty,
        COL.fileNum,
        COL.faculty,
        COL.studyForm,
        COL.order,
      ],
      ['Іваненко Іван', 'До наказу', 'С1', '100', 'Ф1', 'Денна', '1255 СК'],
      ['Петренко Петро', 'Зараховано', 'С1', '101', 'Ф1', 'Денна', '1309 СК'],
      ['', 'До наказу', 'С1', '102', 'Ф1', 'Денна', '1255 СК'],
    ])

    expect(result.totalRows).toBe(2)
    expect(result.skipped).toBe(1)
    expect(result.applicants).toHaveLength(1)
    expect(result.applicants[0].raw[COL.pib]).toBe('Іваненко Іван')
  })
})
