import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useScreenChange } from './useScreenChange'

/**
 * **화면이 한 번 더 갈리는 경우**를 재현한다.
 *
 * 이 검사가 왜 여기(단위)에 있나 — 브라우저 검사로는 못 잡았기 때문이다.
 * 발주처를 고르면 자료가 올 때까지 제목 없는 '불러오는 중' 화면이 먼저 뜨고,
 * 자료가 오면 그 `<main>`이 통째로 교체된다. 한 프레임 뒤에 한 번만 포커스를
 * 옮기는 구현은 **그 임시 화면**을 잡고, 교체되는 순간 포커스가 `body`로 떨어진다.
 * key는 그대로라 훅은 다시 돌지 않는다.
 *
 * 로컬 미리보기에서는 자료가 늘 먼저 도착해 이 경합이 안 일어난다 — 그래서
 * e2e는 통과하는데 **배포본에서는 끝까지 body에 남아 있었다**(실측).
 * 여기서는 갈리는 순서를 손으로 만들 수 있으므로 결함이 결정적으로 재현된다.
 */

/** 자료를 기다리는 화면 — 제목이 없다. 실제 App.tsx의 `!domain` 분기와 같은 모양이다 */
function Loading() {
  return (
    <main role="status" aria-live="polite">
      <span>불러오는 중입니다</span>
    </main>
  )
}

/** 자료가 온 뒤의 진짜 화면 */
function Ready() {
  return (
    <main>
      <h1>업무 챗봇</h1>
      <button type="button">질문하기</button>
    </main>
  )
}

function Harness({ view, ready }: { view: 'portal' | 'shell'; ready: boolean }) {
  useScreenChange(view === 'portal' ? 'portal' : 'suh:general', {
    title: view === 'portal' ? '분야 선택' : '업무 챗봇',
    say: `${view === 'portal' ? '분야 선택' : '업무 챗봇'} 화면입니다.`,
  })
  if (view === 'portal') {
    return (
      <main>
        <h1>AgentQ</h1>
        <button type="button">새빛대학교병원</button>
      </main>
    )
  }
  return ready ? <Ready /> : <Loading />
}

/** 프레임을 실제로 흘려보낸다 — 훅이 rAF로 다시 시도하기 때문이다 */
async function frames(n: number) {
  for (let i = 0; i < n; i += 1) {
    await act(async () => {
      await new Promise((r) => {
        requestAnimationFrame(() => r(null))
      })
    })
  }
}

describe('화면 전환 알림', () => {
  beforeEach(() => {
    document.getElementById('screen-change-announcer')?.remove()
  })

  it('자료가 늦게 와 화면이 한 번 더 갈려도 포커스가 새 제목에 자리 잡는다', async () => {
    const { rerender } = render(<Harness view="portal" ready={false} />)

    /* 화면을 바꾼 버튼에 포커스를 둔다 — 진짜 조작과 같은 상태로 만든다 */
    screen.getByRole('button', { name: '새빛대학교병원' }).focus()

    /* 발주처로 들어갔지만 자료는 아직 안 왔다 — 제목 없는 임시 화면 */
    rerender(<Harness view="shell" ready={false} />)
    await frames(2)

    /* 자료가 도착해 화면이 통째로 갈린다. 훅은 다시 돌지 않는다(key가 같다) */
    rerender(<Harness view="shell" ready />)
    await frames(6)

    const h1 = screen.getByRole('heading', { level: 1, name: '업무 챗봇' })
    expect(
      document.activeElement,
      '임시 화면을 잡았다가 교체되며 놓치면 결과는 포커스를 안 옮긴 것과 같다',
    ).toBe(h1)
    expect(h1).toHaveAttribute('tabindex', '-1')
  })

  it('사용자가 직접 포커스를 옮기면 되뺏지 않는다', async () => {
    const { rerender } = render(<Harness view="portal" ready={false} />)
    screen.getByRole('button', { name: '새빛대학교병원' }).focus()

    rerender(<Harness view="shell" ready />)
    await frames(2)

    /* 사용자가 본문 버튼으로 옮겼다 — 그 뒤로는 훅이 손대면 안 된다 */
    const button = screen.getByRole('button', { name: '질문하기' })
    button.focus()
    await frames(6)

    expect(document.activeElement, '하던 일을 뺏으면 어디로 갔는지 알 수 없다').toBe(button)
  })

  it('처음 그릴 때는 말하지 않는다', async () => {
    render(<Harness view="portal" ready={false} />)
    await frames(2)
    expect(document.getElementById('screen-change-announcer')?.textContent ?? '').toBe('')
  })

  it('화면이 바뀌면 한 번 말하고 제목이 바뀐다', async () => {
    const { rerender } = render(<Harness view="portal" ready={false} />)
    rerender(<Harness view="shell" ready />)
    await frames(2)

    expect(document.getElementById('screen-change-announcer')?.textContent).toBe(
      '업무 챗봇 화면입니다.',
    )
    expect(document.title).toContain('업무 챗봇')
  })
})
