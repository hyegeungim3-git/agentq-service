import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReportPage } from './ReportPage'

const setup = () => render(<ReportPage apiOptions={{ delayMs: 0 }} />)

describe('ReportPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('보고서 절마다 출처를 밝힌다 — 출처 없는 수치는 검증할 수 없다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '보고서 생성' }))
    const r = await screen.findByRole('region', { name: /주간 실적 보고/ })
    expect(r).toHaveTextContent('출처 · MES 생산실적')
  })

  /* 자동으로 못 채운 칸을 감추면 담당자가 빈 보고서를 결재에 올린다 */
  it('담당자가 작성해야 하는 칸을 드러낸다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '보고서 생성' }))
    expect(await screen.findByText('담당자 작성이 필요한 칸')).toBeInTheDocument()
    expect(screen.getByText('출처 없음 — 담당자 작성 필요')).toBeInTheDocument()
  })

  it('보고 유형을 바꾸면 문서번호와 절이 달라진다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '보고서 생성' }))
    expect(await screen.findByRole('region', { name: /HBP-생산기술-2026-041/ })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: /이상 발생 보고/ }))
    await userEvent.click(screen.getByRole('button', { name: '보고서 생성' }))
    const r = await screen.findByRole('region', { name: /HBP-보전-2026-102/ })
    expect(r).toHaveTextContent('발생 경위')
  })

  it('AI 초안임을 고지한다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '보고서 생성' }))
    expect(await screen.findByText(/AI가 작성한 초안입니다/)).toBeInTheDocument()
  })
})
