import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubPage } from './HubPage'
import { AGENTS } from '@entities/agent/model'
import type { Domain } from '@entities/domain/model'

const domain: Domain = {
  id: 'manufacturing',
  orgName: '한빛정밀',
  orgShort: 'HBP',
  sector: 'manufacturing',
  brandColor: '#0F766E',
  tagline: '스마트팩토리 생성형 AI 플랫폼',
  docPrefix: 'HBP',
  user: { name: '박태윤', dept: '생산기술팀', title: '책임' },
}

const setup = (onOpen = vi.fn()) => {
  render(<HubPage domain={domain} onOpen={onOpen} onBack={vi.fn()} />)
  return onOpen
}

describe('HubPage', () => {
  it('13종을 모두 보여준다 — 안 만든 것을 목록에서 숨기지 않는다', () => {
    setup()
    expect(screen.getAllByRole('button', { name: /요약|번역|챗봇|보고서|회의록|검색|조회|인식|표준화|분석|검토|계획/ }).length)
      .toBeGreaterThanOrEqual(AGENTS.length)
  })

  it('준비된 에이전트는 열 수 있다', async () => {
    const onOpen = setup()
    await userEvent.click(screen.getByRole('button', { name: /문서 요약/ }))
    expect(onOpen).toHaveBeenCalledWith('summary')
  })

  /* 이 두 건이 핵심이다 — 미구현을 죽은 버튼으로 두지 않는다 */
  it('준비 중인 에이전트는 비활성이고 상태를 표시한다', () => {
    setup()
    const btn = screen.getByRole('button', { name: /업무 챗봇/ })
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('준비 중')
  })

  it('준비 중인 에이전트는 눌러도 열리지 않는다', async () => {
    const onOpen = setup()
    await userEvent.click(screen.getByRole('button', { name: /업무 챗봇/ }))
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('이식 진척을 숨기지 않고 표시한다', () => {
    setup()
    expect(screen.getByText(/이식 \d+\/13종/)).toBeInTheDocument()
  })

  it('조직명과 분야를 보여준다', () => {
    setup()
    expect(screen.getByRole('heading', { name: '한빛정밀' })).toBeInTheDocument()
    expect(screen.getByText('제조')).toBeInTheDocument()
  })
})
