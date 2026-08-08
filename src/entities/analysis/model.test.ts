import { describe, it, expect } from 'vitest'
import { buildOutlierResult, findOutliers, OUTLIER_FACTOR, type AnalysisResult } from './model'

const base: AnalysisResult = {
  datasetId: 'ds-x',
  kind: 'trend',
  unit: '%',
  trend: [
    { period: '1월', value: 0.4, limit: 0.5 },
    { period: '2월', value: 0.55, limit: 0.5 },
    { period: '3월', value: 0.7, limit: 0.5 },
  ],
  distribution: [
    { label: '치수', count: 100 },
    { label: '표면', count: 20 },
    { label: '기타', count: 12 },
  ],
  stats: [],
  coverage: 0.8,
  excludedReasons: ['추이 쪽 사유'],
  elapsedSeconds: 3,
}

const dist: AnalysisResult = {
  ...base,
  kind: 'distribution',
  trend: [],
  coverage: 0.95,
  excludedReasons: ['분포 쪽 사유'],
  elapsedSeconds: 2,
}

describe('이상치', () => {
  it('관리 기준을 넘은 구간을 집는다', () => {
    const rows = findOutliers(base)
    const periods = rows.map((r) => r.label)
    expect(periods).toContain('2월')
    expect(periods).toContain('3월')
    expect(periods).not.toContain('1월')
  })

  /* 왜 이상인지 못 대는 표시는 확인할 방법이 없어 결국 무시된다 */
  it('모든 줄이 근거와 이유를 갖는다', () => {
    for (const r of findOutliers(base)) {
      expect(r.basis).not.toBe('')
      expect(r.why).not.toBe('')
    }
  })

  it(`평균의 ${OUTLIER_FACTOR}배를 넘은 항목만 집는다`, () => {
    const rows = findOutliers(base).filter((r) => r.value.endsWith('건'))
    expect(rows.map((r) => r.label)).toEqual(['치수'])
  })

  it('넘은 것이 없으면 빈 목록이다 — 억지로 채우지 않는다', () => {
    const calm: AnalysisResult = {
      ...base,
      trend: base.trend.map((p) => ({ ...p, value: 0.1 })),
      distribution: [
        { label: 'a', count: 10 },
        { label: 'b', count: 11 },
      ],
    }
    expect(findOutliers(calm)).toEqual([])
  })

  describe('합성 결과', () => {
    it('두 결과의 제외 사유를 합치고 적용률은 낮은 쪽을 쓴다', () => {
      const r = buildOutlierResult(base, dist)
      expect(r.excludedReasons).toEqual(['추이 쪽 사유', '분포 쪽 사유'])
      /* 낮은 쪽을 써야 '이 결론이 덮는 범위'를 넘겨 말하지 않는다 */
      expect(r.coverage).toBe(0.8)
    })

    it('추이와 분포를 모두 담는다 — 한쪽만 담으면 절반만 본다', () => {
      const r = buildOutlierResult(base, dist)
      expect(r.trend.length).toBe(3)
      expect(r.distribution.length).toBe(3)
    })

    it('지표는 센 수만 말한다 — 전기 대비 변화는 지어내지 않는다', () => {
      const r = buildOutlierResult(base, dist)
      expect(r.stats.every((s) => s.change === null)).toBe(true)
      expect(r.stats.find((s) => s.metric === '이상 항목')?.value).toBe('3건')
    })
  })
})
