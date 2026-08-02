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

  /* 출처 이름만 대면 사용자는 확인할 방법이 없다 */
  describe('출처 원문', () => {
    it('출처를 누르면 원문이 펼쳐진다', async () => {
      setup()
      await ask('금형 교체 주기 알려줘')
      const chip = await screen.findByRole('button', { name: /제4장 금형 수명 관리/ })
      expect(chip).toHaveAttribute('aria-expanded', 'false')
      await userEvent.click(chip)
      expect(await screen.findByText(/타수 50만 타를 교체 기준으로 하며/)).toBeInTheDocument()
    })

    /* 같은 조항을 두 화면이 다르게 인용하면 어느 쪽이 맞는지 알 수 없다 */
    it('규정 인용은 내규 조회와 같은 원문과 개정일을 보여준다', async () => {
      setup()
      await ask('출장 여비 기준')
      const chip = await screen.findByRole('button', { name: /제23조 제2항/ })
      expect(chip).toHaveTextContent('2025-07-01 개정')
      await userEvent.click(chip)
      expect(
        await screen.findByText(/1일 60,000원을 기준으로 하되, 실비가 이를 초과하는 경우/),
      ).toBeInTheDocument()
    })
  })

  describe('자주 묻는 질문', () => {
    it('범주를 고르면 그 범주 질문만 남는다', async () => {
      setup()
      const faq = await screen.findByRole('region', { name: '자주 묻는 질문' })
      expect(faq).toHaveTextContent('출장 여비 기준 알려줘')

      await userEvent.click(screen.getByRole('radio', { name: '작업표준' }))
      expect(faq).toHaveTextContent('초품 검사는 언제 실시하나요?')
      expect(faq).not.toHaveTextContent('출장 여비 기준 알려줘')
    })

    it('질문을 누르면 바로 물어본다', async () => {
      setup()
      await userEvent.click(await screen.findByRole('button', { name: /초품 검사는 언제 실시하나요/ }))
      expect(await screen.findByText(/초품 검사는 금형 교체 직후에 실시합니다/)).toBeInTheDocument()
    })

    /* 목록에 있다고 다 답할 수 있는 건 아니다 — 그 경로가 목록에서도 닿아야 한다 */
    it('목록에 있어도 근거가 없으면 없다고 답한다', async () => {
      setup()
      await userEvent.click(
        await screen.findByRole('button', { name: /기밀 기술자료는 어떻게 처리하나요/ }),
      )
      expect(await screen.findByText('근거 문서 없음 · 담당 부서 확인 필요')).toBeInTheDocument()
    })
  })
})
