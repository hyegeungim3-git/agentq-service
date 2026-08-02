import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnalysisPage } from './AnalysisPage'

const setup = () => render(<AnalysisPage apiOptions={{ delayMs: 0 }} />)

describe('AnalysisPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  /* 부분 데이터로 낸 결론을 전체 결론처럼 읽으면 안 된다 */
  it('적용률이 낮으면 부분 결론임을 알린다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '분석 실행' }))
    expect(await screen.findByText(/전체의 71%입니다/)).toBeInTheDocument()
  })

  it('빠진 데이터의 사유를 밝힌다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '분석 실행' }))
    const ex = await screen.findByRole('region', { name: '분석에서 빠진 데이터' })
    expect(ex).toHaveTextContent('로트 키 미발행')
  })

  /* 차트는 스크린리더가 못 읽는다 — 같은 데이터를 표로도 준다 */
  it('차트와 같은 데이터를 표로도 제공한다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '분석 실행' }))
    const table = await screen.findByRole('table', { name: '추이 분석 데이터' })
    expect(table).toHaveTextContent('2026.03')
    expect(table).toHaveTextContent('0.42%')
  })

  it('관리 기준을 넘은 기간을 눈으로 찾게 두지 않는다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '분석 실행' }))
    expect(await screen.findByText(/기준을 넘은 기간이 3개월/)).toBeInTheDocument()
  })

  it('분석 유형을 바꾸면 표 내용이 달라진다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('radio', { name: /분포 분석/ }))
    await userEvent.click(screen.getByRole('button', { name: '분석 실행' }))
    const table = await screen.findByRole('table', { name: '분포 분석 데이터' })
    expect(table).toHaveTextContent('치수 불량')
    expect(table).toHaveTextContent('142건')
  })
})
