import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentFlowTrail } from './AgentFlowTrail'
import { setActiveDomain } from '@shared/api/tenant'

describe('AgentFlowTrail', () => {
  beforeEach(() => {
    setActiveDomain('manufacturing')
  })

  it('단계 수와 사람 확인 지점 수를 접힌 채로 먼저 말한다', async () => {
    render(<AgentFlowTrail agentId="summary" />)
    const toggle = await screen.findByRole('button', { name: /처리 단계/ })
    expect(toggle).toHaveTextContent('3단계')
    expect(toggle).toHaveTextContent('사람 확인 1곳')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  /* `aria-controls`가 가리킬 대상이 있어야 해서 접힌 동안에도 DOM에는 있다.
     그러니 '있다'가 아니라 **'보인다'**로 확인해야 접힘이 진짜 접힘인지 알 수 있다 */
  it('펴면 단계 이름과 사람 확인 지점이 나온다', async () => {
    render(<AgentFlowTrail agentId="summary" />)
    const toggle = await screen.findByRole('button', { name: /처리 단계/ })
    expect(screen.getByText('문서 본문 추출')).not.toBeVisible()

    await userEvent.click(toggle)
    expect(screen.getByText('문서 본문 추출')).toBeVisible()
    expect(screen.getByText('원문 대조 안내 표시')).toBeVisible()
    expect(screen.getByText('사람 확인')).toBeVisible()
  })

  /* 도구 id를 그대로 두면 사용자가 못 읽는다 — 이름을 붙여 준다 */
  it('단계가 쓰는 도구를 이름으로 보여준다', async () => {
    render(<AgentFlowTrail agentId="summary" />)
    await userEvent.click(await screen.findByRole('button', { name: /처리 단계/ }))
    expect(await screen.findByText(/문서 텍스트 추출/)).toBeInTheDocument()
  })

  /**
   * 이것이 이 위젯에서 제일 중요한 검사다.
   *
   * 진행률처럼 보이는 수를 그리는 순간, 모르는 것을 아는 척한 화면이 된다.
   * '3단계'는 단계 수고 '3/5'는 진행이다 — 뒤엣것은 아직 못 만든다.
   */
  it('진행률을 흉내 내지 않는다', async () => {
    render(<AgentFlowTrail agentId="summary" />)
    await userEvent.click(await screen.findByRole('button', { name: /처리 단계/ }))
    expect(screen.getByText(/어느 단계까지 갔는지는 표시하지 않습니다/)).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByText(/\d\s*\/\s*\d/)).not.toBeInTheDocument()
  })

  /* 발주처를 안 고른 채로는 정의를 못 받는다. 빈 껍데기를 그리느니 안 그린다 */
  it('발주처가 없으면 아무것도 그리지 않는다', async () => {
    setActiveDomain(null)
    const { container } = render(<AgentFlowTrail agentId="summary" />)
    await Promise.resolve()
    expect(container).toBeEmptyDOMElement()
  })
})
