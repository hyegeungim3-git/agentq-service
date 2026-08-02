import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SafetyPage } from './SafetyPage'

const setup = () => render(<SafetyPage apiOptions={{ delayMs: 0 }} />)

describe('SafetyPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('위험요인마다 대책과 잔여 위험을 함께 준다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '위험성평가 실시' }))
    const r = await screen.findByRole('region', { name: /위험요인/ })
    expect(r).toHaveTextContent('대책 ·')
    /* 잔여 위험을 비우면 '대책을 세웠으니 안전하다'로 읽힌다 */
    expect(r).toHaveTextContent('잔여 위험 ·')
  })

  it('빈도×강도로 등급을 매기고 점수를 함께 표시한다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '위험성평가 실시' }))
    const r = await screen.findByRole('region', { name: /위험요인/ })
    expect(r).toHaveTextContent('빈도 2 × 강도 5')
    expect(r).toHaveTextContent('10점')
  })

  /* 인원 설정이 결과를 바꾸지 않으면 그 선택은 장식이다 */
  it('1인 작업이면 상호 확인 대책이 빠지고 2인 배치를 권고한다', async () => {
    setup()
    await userEvent.selectOptions(await screen.findByLabelText('작업 인원'), '1')
    await userEvent.click(screen.getByRole('button', { name: '위험성평가 실시' }))
    const r = await screen.findByRole('region', { name: /위험요인/ })
    expect(r).toHaveTextContent('2인 배치를 권고한다')
    expect(r).not.toHaveTextContent('2인 1조로 체결 상태 상호 확인')
  })

  it('근거 법령을 함께 제시한다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '위험성평가 실시' }))
    expect(await screen.findByRole('region', { name: '근거 법령·규정' })).toHaveTextContent('산업안전보건법 제36조')
  })
})
