import { describe, it, expect } from 'vitest'
import { GPU_HOT_CELSIUS, allocatedRatio, gpuSummary, isOverloaded } from './model'
import { GPU_NODES, TRAINER } from '@fixtures/infra'
import type { GpuCard } from './model'

const card = (over: Partial<GpuCard>): GpuCard => ({
  index: 0,
  utilRatio: 0.3,
  vramRatio: 0.3,
  celsius: 50,
  watt: 200,
  ...over,
})

describe('GPU 판정', () => {
  it('사용률이 기준을 넘으면 과부하다', () => {
    expect(isOverloaded(card({ utilRatio: 0.95 }))).toBe(true)
    expect(isOverloaded(card({ utilRatio: 0.5 }))).toBe(false)
  })

  /* 사용률만 보면 뜨거운데 놀고 있는 카드를 놓친다 — 팬 고장이 그렇게 시작한다 */
  it('사용률이 낮아도 뜨거우면 과부하다', () => {
    expect(isOverloaded(card({ utilRatio: 0.1, celsius: GPU_HOT_CELSIUS }))).toBe(true)
  })

  it('요약은 카드 전체를 센다', () => {
    const s = gpuSummary(GPU_NODES)
    expect(s.total).toBe(12)
    expect(s.overloaded).toBe(1)
    expect(s.avgCelsius).toBe(53)
  })

  it('카드가 없으면 평균을 지어내지 않는다', () => {
    expect(gpuSummary([])).toEqual({ total: 0, avgUtil: 0, avgCelsius: 0, overloaded: 0 })
  })
})

describe('학습 집계', () => {
  /* 억지로 100%를 채우면 여유가 없는 것처럼 보인다 */
  it('자원 배분의 합은 1이 아니다 — 남는 몫이 여유다', () => {
    const week = TRAINER.week
    expect(allocatedRatio(week.allocations)).toBeLessThan(1)
    expect(1 - allocatedRatio(week.allocations)).toBeCloseTo(0.05, 5)
  })

  it('구간마다 다른 집계가 온다', () => {
    expect(TRAINER.day.done).not.toBe(TRAINER.week.done)
    expect(TRAINER.week.done).not.toBe(TRAINER.month.done)
  })

  /* 건수만 세면 손쓸 수 없다 */
  it('실패한 작업에는 사유가 있다', () => {
    for (const w of ['day', 'week', 'month'] as const) {
      const failed = TRAINER[w].jobs.filter((j) => j.state === 'failed')
      expect(failed.length, w).toBeGreaterThan(0)
      for (const j of failed) expect(j.note, `${w}/${j.id}`).toBeTruthy()
    }
  })
})
