import { describe, it, expect } from 'vitest'
import {
  compressionRate,
  styleLabel,
  focusLabel,
  SUMMARY_STYLES,
  FOCUS_AREAS,
  type SummaryStats,
} from './model'

const stats = (sourceChars: number, summaryChars: number): SummaryStats => ({
  sourceChars,
  summaryChars,
  sectionCount: 1,
  elapsedSeconds: 1,
})

describe('compressionRate', () => {
  it('원문 대비 줄어든 비율을 낸다', () => {
    expect(compressionRate(stats(1000, 250))).toBeCloseTo(0.75)
  })

  it('원문이 비면 0을 낸다 — 0으로 나누지 않는다', () => {
    expect(compressionRate(stats(0, 0))).toBe(0)
  })

  it('요약이 원문보다 길면 음수가 된다(감추지 않는다)', () => {
    expect(compressionRate(stats(100, 150))).toBeCloseTo(-0.5)
  })
})

describe('라벨 매핑', () => {
  it('모든 요약 방식에 라벨이 있다', () => {
    for (const s of SUMMARY_STYLES) expect(styleLabel(s)).toBeTruthy()
  })

  it('모든 관점에 라벨이 있다', () => {
    for (const f of FOCUS_AREAS) expect(focusLabel(f)).toBeTruthy()
  })
})
