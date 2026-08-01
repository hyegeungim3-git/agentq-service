import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegulationPage } from './RegulationPage'

const setup = () => render(<RegulationPage apiOptions={{ delayMs: 0 }} />)

describe('RegulationPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('질문이 비면 실행할 수 없다', () => {
    setup()
    expect(screen.getByRole('button', { name: '규정 조회' })).toBeDisabled()
  })

  it('답변과 근거 조항 원문을 함께 준다', async () => {
    setup()
    await userEvent.type(screen.getByLabelText(/무엇이 궁금하신가요/), '출장 여비 기준')
    await userEvent.click(screen.getByRole('button', { name: '규정 조회' }))

    const r = await screen.findByRole('region', { name: '조회 결과' })
    expect(r).toHaveTextContent('일 60,000원')
    expect(r).toHaveTextContent('취업규칙 제23조 제2항')
  })

  /* 규정 조회에서 지어낸 답은 사고로 이어진다 */
  it('근거를 못 찾으면 지어내지 않고 없다고 밝힌다', async () => {
    setup()
    await userEvent.type(screen.getByLabelText(/무엇이 궁금하신가요/), '사내 동호회 지원금')
    await userEvent.click(screen.getByRole('button', { name: '규정 조회' }))

    expect(await screen.findByText(/근거 조항을 찾지 못했습니다/)).toBeInTheDocument()
    expect(screen.getByText(/지어낸 답을 드리지 않기 위해/)).toBeInTheDocument()
  })

  it('개정 후 오래된 근거에 확인 필요를 표시한다', async () => {
    setup()
    await userEvent.type(screen.getByLabelText(/무엇이 궁금하신가요/), '금형 교체 주기')
    await userEvent.click(screen.getByRole('button', { name: '규정 조회' }))

    expect(await screen.findByText(/개정 후 3년 경과/)).toBeInTheDocument()
  })

  it('분류를 모두 해제하면 실행할 수 없다', async () => {
    setup()
    await userEvent.type(screen.getByLabelText(/무엇이 궁금하신가요/), '출장 여비')
    await userEvent.click(screen.getByRole('checkbox', { name: '취업·복무' }))
    await userEvent.click(screen.getByRole('checkbox', { name: '안전보건' }))
    expect(screen.getByRole('button', { name: '규정 조회' })).toBeDisabled()
  })
})
