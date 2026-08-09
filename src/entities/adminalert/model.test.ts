import { describe, it, expect } from 'vitest'
import { actionCount, buildAlerts, type AlertSources } from './model'

const none: AlertSources = { pods: [], hrFailed: [] }

describe('관리자 알림', () => {
  it('확인할 것이 없으면 빈 목록이다 — 없는 일을 만들지 않는다', () => {
    expect(buildAlerts(none)).toEqual([])
  })

  it('죽은 파드는 급한 것으로, 재시작만 한 파드는 지켜볼 것으로 가른다', () => {
    const out = buildAlerts({
      ...none,
      pods: [
        { name: 'a', phase: 'Failed', restarts: 3 },
        { name: 'b', phase: 'Running', restarts: 2 },
        { name: 'c', phase: 'Running', restarts: 0 },
      ],
    })
    expect(out.map((a) => a.id)).toEqual(['pods-failed', 'pods-restart'])
    expect(actionCount(out)).toBe(1)
  })

  /* 갈 곳 없는 알림은 '어딘가 문제가 있다'까지만 말하고 끝나서 아무도 안 본다 */
  it('모든 알림에 갈 화면이 있다', () => {
    const out = buildAlerts({
      pods: [{ name: 'a', phase: 'Failed', restarts: 0 }],
      hrFailed: [{ name: '김이현', failedReason: '계정 없음' }],
    })
    expect(out.length).toBe(2)
    for (const a of out) {
      expect(a.menuId).not.toBe('')
      expect(a.detail).not.toBe('')
    }
  })

  it('처리에 성공한 인사 변동은 알림이 아니다', () => {
    const out = buildAlerts({ ...none, hrFailed: [{ name: '김이현', failedReason: null }] })
    expect(out).toEqual([])
  })
})
