import { describe, it, expect } from 'vitest'
import { averageValue, intensity, needsAttention, withData, withoutData } from './model'
import { SITE_UTILIZATION as M } from '@fixtures/mapintel'
import type { MapIntel } from './model'

describe('지도 인텔리전스 계산', () => {
  it('값이 있는 곳과 없는 곳을 나눈다', () => {
    expect(withData(M)).toHaveLength(5)
    expect(withoutData(M).map((s) => s.name)).toEqual(['천안공장', '광주공장'])
    /* 값 없는 사업장을 빼고 세면 '전 사업장'으로 읽힌다 */
    expect(withData(M).length).toBeLessThan(M.sites.length)
  })

  /* 없는 값을 0으로 세면 평균이 무너진다 — 가동률 0%인 공장이 둘 있는 셈이 된다 */
  it('평균은 값이 있는 곳만 센다', () => {
    expect(averageValue(M)).toBe(87.7)
    const naive = M.sites.reduce((n, s) => n + (s.value ?? 0), 0) / M.sites.length
    expect(averageValue(M)).not.toBeCloseTo(naive, 1)
  })

  it('값이 하나도 없으면 평균을 만들지 않는다', () => {
    const empty: MapIntel = { ...M, sites: withoutData(M) }
    expect(averageValue(empty)).toBeNull()
  })

  it('가동률은 낮을수록 나쁘다 — 기준 아래를 잡는다', () => {
    expect(needsAttention(M).map((s) => s.name)).toEqual(['창원본사', '양산공장'])
  })

  /* 지표 방향이 뒤집히면 잡히는 쪽도 뒤집혀야 한다.
     방향을 무시하면 진동 같은 '높을수록 나쁜' 지표에서 정반대를 잡는다 */
  it('높을수록 나쁜 지표면 기준 위를 잡는다', () => {
    const flipped: MapIntel = { ...M, lowerIsWorse: false }
    expect(needsAttention(flipped).map((s) => s.name)).toEqual([
      '김해1공장',
      '김해2공장',
      '대구공장',
    ])
  })

  it('진하기는 나쁜 쪽이 진하다', () => {
    const worst = intensity(M, 81.4)
    const best = intensity(M, 93.5)
    expect(worst).toBeGreaterThan(best)
    expect(worst).toBeCloseTo(1, 5)
    expect(best).toBeCloseTo(0, 5)
  })
})
