import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MeetingPage } from './MeetingPage'

const setup = () => render(<MeetingPage apiOptions={{ delayMs: 0 }} />)

describe('MeetingPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('회의 녹음만 대상으로 보여준다', async () => {
    setup()
    expect(await screen.findByText('3월3주_공정회의_녹음.m4a')).toBeInTheDocument()
    expect(screen.queryByText('프레스_작업표준서_SOP-PR-011.pdf')).not.toBeInTheDocument()
  })

  it('결정 사항과 조치 항목을 뽑는다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '회의록 작성' }))
    const r = await screen.findByRole('region', { name: /3월 3주 공정회의/ })
    expect(r).toHaveTextContent('진동 관리 기준을 4.5mm/s에서 3.5mm/s로 하향')
    expect(r).toHaveTextContent('PdM 알람 임계치를 3.5mm/s로 변경')
  })

  /* 회의에서 안 정해진 것을 AI가 채우면 안 된다 */
  it('담당자·기한이 미정인 항목을 미정으로 표시하고 건수를 알린다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '회의록 작성' }))
    const r = await screen.findByRole('region', { name: /3월 3주 공정회의/ })
    expect(r).toHaveTextContent('미정')
    expect(await screen.findByText(/정해지지 않은 항목이 2건/)).toBeInTheDocument()
  })

  it('발언 기록을 끄면 해당 영역이 사라진다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('checkbox', { name: /발언 기록 포함/ }))
    await userEvent.click(screen.getByRole('button', { name: '회의록 작성' }))
    await screen.findByRole('region', { name: /3월 3주 공정회의/ })
    expect(screen.queryByRole('region', { name: '발언 기록' })).not.toBeInTheDocument()
  })
})
