import { describe, expect, it } from 'vitest'
import {
  clampScale,
  clearAllPhotos,
  clearPhoto,
  coverScale,
  getPhoto,
  photoBoxHTML,
  setPhoto,
} from './photos'

describe('photos', () => {
  it('computes cover scale for portrait box 90×110', () => {
    expect(coverScale(180, 220)).toBeCloseTo(0.5)
    expect(coverScale(90, 110)).toBe(1)
  })

  it('clamps zoom', () => {
    expect(clampScale(0.01)).toBe(0.05)
    expect(clampScale(100)).toBe(12)
  })

  it('renders box with/without image and stores by file num', () => {
    clearAllPhotos()
    expect(photoBoxHTML('42')).toContain('data-ph="42"')
    expect(photoBoxHTML('42')).not.toContain('<img')

    setPhoto('42', { src: 'data:image/png;base64,xx', x: 1, y: 2, scale: 1.2 })
    expect(getPhoto('42')?.x).toBe(1)
    expect(photoBoxHTML('42')).toContain('has-img')
    expect(photoBoxHTML('42')).toContain('<img')

    clearPhoto('42')
    expect(getPhoto('42')).toBeUndefined()
  })
})
