import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatPage } from './ChatPage'

const setup = () => render(<ChatPage apiOptions={{ delayMs: 0 }} />)
const ask = async (text: string) => {
  await userEvent.type(screen.getByLabelText('질문 입력'), text)
  await userEvent.click(screen.getByRole('button', { name: '전송' }))
}

describe('ChatPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('답변에 근거 문서를 함께 준다', async () => {
    setup()
    await ask('금형 교체 주기 알려줘')
    expect(await screen.findByText(/타수 50만 타/)).toBeInTheDocument()
    expect(screen.getByText(/SOP-PR-011 · 제4장/)).toBeInTheDocument()
  })

  /* 대화형은 근거를 확인하지 않고 넘어가기 쉬워 더 위험하다 */
  it('모르는 질문은 지어내지 않고 근거 없음을 표시한다', async () => {
    setup()
    await ask('사내 동호회 지원금 얼마야')
    expect(await screen.findByText(/지어내지 않기 위해/)).toBeInTheDocument()
    expect(screen.getByText('근거 문서 없음 · 담당 부서 확인 필요')).toBeInTheDocument()
  })

  it('신뢰도가 낮으면 원문 확인을 권한다', async () => {
    setup()
    await ask('출장 여비 기준')
    expect(await screen.findByText(/원문 확인 권장/)).toBeInTheDocument()
  })

  it('더 나은 에이전트가 있으면 안내한다', async () => {
    setup()
    await ask('진동 알람 어떻게 해')
    // 부모 <p>와 <span> 양쪽에 걸리므로 이유 문장으로 좁힌다
    expect(await screen.findByText(/설비별 실측값을 표로 확인하려면/)).toBeInTheDocument()
  })

  it('빈 입력은 전송할 수 없다', () => {
    setup()
    expect(screen.getByRole('button', { name: '전송' })).toBeDisabled()
  })

  it('Enter로 전송된다 — 안내한 대로 동작해야 한다', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('질문 입력'), '금형 교체 주기{Enter}')
    expect(await screen.findByText(/타수 50만 타/)).toBeInTheDocument()
  })

  it('대화를 지울 수 있다', async () => {
    setup()
    await ask('금형 교체 주기')
    await screen.findByText(/타수 50만 타/)
    await userEvent.click(screen.getByRole('button', { name: '대화 지우기' }))
    expect(screen.queryByText(/타수 50만 타/)).not.toBeInTheDocument()
  })
})
