import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BriefingCards } from './BriefingCards'
import { SIGNALS } from '@fixtures/signals'

describe('BriefingCards', () => {
  /* 빈 화면에서 가장 먼저 봐야 하는 것은 오늘 처리할 일이다 */
  it('처리해야 하는 건수를 먼저 말한다', () => {
    render(<BriefingCards signals={SIGNALS} onOpen={vi.fn()} />)
    expect(screen.getByText(/지금 처리해야 하는 일이 2건 있습니다/)).toBeInTheDocument()
  })

  it('처리 필요와 그 밖의 것을 나눠 보여준다', () => {
    render(<BriefingCards signals={SIGNALS} onOpen={vi.fn()} />)
    expect(screen.getByText('PRS-C03 진동 관리 기준 초과')).toBeInTheDocument()
    expect(screen.getByText('그 밖에')).toBeInTheDocument()
  })

  /* 눌러도 아무 데도 못 가면 읽음 처리 버튼일 뿐이다 */
  it('처리할 화면으로 잇는다', async () => {
    const onOpen = vi.fn()
    render(<BriefingCards signals={SIGNALS} onOpen={onOpen} />)
    await userEvent.click(screen.getByRole('button', { name: /접수 처리 릴레이 열기/ }))
    expect(onOpen).toHaveBeenCalledWith({ kind: 'scenario', label: '접수 처리 릴레이 열기' })
  })

  it('처리할 일이 없으면 없다고 말한다', () => {
    render(<BriefingCards signals={SIGNALS.filter((s) => s.severity !== 'action')} onOpen={vi.fn()} />)
    expect(screen.getByText(/지금 처리해야 하는 일은 없습니다/)).toBeInTheDocument()
  })

  it('신호가 아예 없으면 절 자체를 그리지 않는다', () => {
    const { container } = render(<BriefingCards signals={[]} onOpen={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })
})
