import { describe, expect, it } from 'vitest'
import { CsvParser } from './csvParser'
import {
  clean,
  normalizeThreshold,
  parseBoolean,
  parseCategoryCodes,
  parseDate,
  parsePriority,
  parseScore,
} from './parsers'

describe('parsers', () => {
  it('cleans BOM and whitespace', () => {
    expect(clean('\uFEFF  тест  ')).toBe('тест')
  })

  it('parses scores with comma', () => {
    expect(parseScore('145,5')).toBe(145.5)
    expect(parseScore('')).toBeNull()
  })

  it('parses ukrainian booleans', () => {
    expect(parseBoolean('Так')).toBe(true)
    expect(parseBoolean('ні')).toBe(false)
    expect(parseBoolean('?')).toBeNull()
  })

  it('parses priorities 1-10', () => {
    expect(parsePriority('3')).toBe(3)
    expect(parsePriority('0')).toBeNull()
    expect(parsePriority('11')).toBeNull()
  })

  it('parses category codes', () => {
    expect(parseCategoryCodes('104, 117; 104')).toEqual(['104', '117'])
  })

  it('parses dates', () => {
    const [ms, text] = parseDate('01.08.2026 12:30')
    expect(text).toBe('01.08.2026 12:30')
    expect(ms).not.toBeNull()
  })

  it('normalizes thresholds', () => {
    expect(normalizeThreshold(145)).toBe(145)
    expect(normalizeThreshold(50)).toBe(101)
    expect(normalizeThreshold(300)).toBe(199)
    expect(normalizeThreshold('x')).toBe(145)
  })
})

describe('CsvParser', () => {
  it('parses semicolon csv with quotes', () => {
    const rows: string[][] = []
    const parser = new CsvParser((row) => rows.push(row))
    parser.push('A;B\r\n"1;2";3\r\n', true)
    expect(rows).toEqual([
      ['A', 'B'],
      ['1;2', '3'],
    ])
  })
})
