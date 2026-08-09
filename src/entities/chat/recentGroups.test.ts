import { describe, it, expect } from 'vitest'
import { groupByRecency } from './recentGroups'

/* 시각을 인자로 받으므로 '오늘'을 만들어 놓고 잴 수 있다 */
const NOW = new Date('2026-08-09T14:00:00').getTime()
const at = (iso: string) => new Date(iso).getTime()

describe('최근 대화 묶기', () => {
  it('오늘·어제·이전으로 나눈다', () => {
    const out = groupByRecency(
      [
        { id: 'a', at: at('2026-08-09T09:00:00') },
        { id: 'b', at: at('2026-08-08T23:59:00') },
        { id: 'c', at: at('2026-07-30T10:00:00') },
      ],
      NOW,
    )
    expect(out.map((g) => g.label)).toEqual(['오늘', '어제', '이전'])
    expect(out[0]?.items.map((i) => i.id)).toEqual(['a'])
  })

  /* 예전에 저장해 둔 대화에는 시각이 없다. 안 보이게 하면 대화가 사라진 것으로 보인다 */
  it('시각이 없는 대화도 버리지 않는다', () => {
    const out = groupByRecency<{ id: string; at?: number }>([{ id: 'old' }], NOW)
    expect(out).toEqual([{ label: '이전', items: [{ id: 'old' }] }])
  })

  it('빈 묶음은 그리지 않는다', () => {
    const out = groupByRecency([{ id: 'a', at: NOW }], NOW)
    expect(out.map((g) => g.label)).toEqual(['오늘'])
  })

  /* 시계가 뒤로 간 기기에서 '미래' 묶음이 생기면 왜 거기 있는지 알 방법이 없다 */
  it('앞선 시각은 오늘로 본다', () => {
    const out = groupByRecency([{ id: 'a', at: at('2026-08-10T09:00:00') }], NOW)
    expect(out.map((g) => g.label)).toEqual(['오늘'])
  })

  it('아무것도 없으면 빈 배열이다', () => {
    expect(groupByRecency([], NOW)).toEqual([])
  })
})
