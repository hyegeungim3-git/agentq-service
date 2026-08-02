import { describe, it, expect } from 'vitest'
import { exceeds, isFinished, valueAt } from './model'
import { PRESS_VIBRATION as M } from '@fixtures/metrics'

describe('라이브 지표 계산', () => {
  it('시작 시점은 곡선의 첫 값이다', () => {
    expect(valueAt(M, 0, 1)).toBe(3.1)
  })

  /* 틱 횟수가 아니라 벽시계 경과로 계산해야 백그라운드에서 멈추지 않는다 */
  it('같은 시간이 흘렀으면 배속에 비례해 더 나아간다', () => {
    const oneMin = 60_000
    const slow = valueAt(M, oneMin, 1)
    const fast = valueAt(M, oneMin, 10)
    expect(fast).toBeGreaterThan(slow)
    // 1배속 60초는 곡선 한 칸(60초)
    expect(slow).toBeCloseTo(3.2, 5)
    // 10배속 60초는 열 칸 — 곡선 끝을 넘어선다
    expect(fast).toBe(4.2)
  })

  it('점 사이를 이어서 준다 — 계단으로 뛰지 않는다', () => {
    const half = valueAt(M, 30_000, 1) // 30초 = 반 칸
    expect(half).toBeGreaterThan(3.1)
    expect(half).toBeLessThan(3.2)
  })

  /* 되감아 반복하면 오르내리는 것처럼 보인다 */
  it('곡선 끝에 닿으면 마지막 값을 유지한다', () => {
    expect(valueAt(M, 999_999_999, 60)).toBe(4.2)
    expect(isFinished(M, 999_999_999, 60)).toBe(true)
    expect(isFinished(M, 0, 1)).toBe(false)
  })

  /* 처음부터 넘어 있으면 '넘는 순간'을 보여 주는 화면이 죽은 코드가 된다 */
  it('기준 아래에서 시작해 넘어간다', () => {
    expect(exceeds(M, valueAt(M, 0, 1))).toBe(false)
    expect(exceeds(M, valueAt(M, 999_999_999, 60))).toBe(true)
  })
})
