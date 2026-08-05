import { describe, it, expect } from 'vitest'
import {
  canSubmit,
  complianceScore,
  countBySeverity,
  severityLabel,
  SEVERITIES,
  type Violation,
} from './model'

const v = (id: string, severity: Violation['severity']): Violation => ({
  id,
  clause: '조항',
  severity,
  type: '유형',
  detail: '내용',
  action: '조치',
})

describe('complianceScore', () => {
  it('위반이 없으면 100점이다', () => {
    expect(complianceScore([])).toBe(100)
  })

  it('심각도별로 감점한다 (높음 20 · 중간 10 · 낮음 5)', () => {
    expect(complianceScore([v('1', 'high'), v('2', 'medium'), v('3', 'low')])).toBe(65)
  })

  it('0 아래로 내려가지 않는다', () => {
    const many = Array.from({ length: 10 }, (_, i) => v(String(i), 'high'))
    expect(complianceScore(many)).toBe(0)
  })
})

describe('canSubmit', () => {
  it('심각도 높음이 있으면 상신을 막는다', () => {
    expect(canSubmit([v('1', 'high')])).toBe(false)
  })

  it('중간·낮음만 있으면 상신할 수 있다', () => {
    expect(canSubmit([v('1', 'medium'), v('2', 'low')])).toBe(true)
  })

  it('위반이 없으면 상신할 수 있다', () => {
    expect(canSubmit([])).toBe(true)
  })
})

describe('countBySeverity', () => {
  it('심각도별로 센다', () => {
    expect(countBySeverity([v('1', 'high'), v('2', 'high'), v('3', 'low')])).toEqual({
      high: 2,
      medium: 0,
      low: 1,
    })
  })
})

describe('라벨 매핑', () => {
  it('모든 심각도에 라벨이 있다', () => {
    for (const s of SEVERITIES) expect(severityLabel(s)).toBeTruthy()
  })
  /* 규정 묶음 라벨은 이제 발주처(팩)가 준다 — 여기가 아니라
     `src/fixtures/packs.test.ts`가 '팩마다 묶음이 있는지'를 본다 */
})
