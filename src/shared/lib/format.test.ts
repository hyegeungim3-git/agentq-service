import { describe, it, expect } from 'vitest'
import { formatCount } from './format'

describe('formatCount', () => {
  it('천 단위 구분자를 넣는다', () => {
    expect(formatCount(1842)).toBe('1,842')
  })
  it('0을 그대로 표기한다', () => {
    expect(formatCount(0)).toBe('0')
  })
})
