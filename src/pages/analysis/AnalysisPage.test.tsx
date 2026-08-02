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

  /* 이 화면의 입력은 업무 문서가 아니라 데이터 파일이다.
     작업표준서 PDF를 골라 불량률 추이를 낼 수는 없다. */
  it('데이터 파일을 행·열 수와 함께 보여준다', async () => {
    setup()
    expect(await screen.findByRole('radio', { name: /경도검사_공정조건연계_로트별/ })).toBeInTheDocument()
    expect(screen.getByText(/486행 × 24열 · XLSX/)).toBeInTheDocument()
    expect(screen.getByText(/12,960행 × 8열 · CSV/)).toBeInTheDocument()
  })

  /* 고른 것이 결과를 바꾸지 않으면 고르는 행위에 의미가 없다.
     예전에는 무엇을 골라도 같은 불량률 추이가 나왔다. */
  it('데이터를 바꾸면 지표도 단위도 달라진다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('radio', { name: /침탄로3호기_온도프로파일/ }))
    await userEvent.click(screen.getByRole('button', { name: '분석 실행' }))
    const table = await screen.findByRole('table', { name: '추이 분석 데이터' })
    expect(table).toHaveTextContent('7.8℃')
    expect(table).not.toHaveTextContent('0.42%')
    // 지표 이름은 요약 헤더와 하단 목록 두 곳에 나온다
    expect(screen.getAllByText('3월 후단존 편차').length).toBeGreaterThan(0)
    expect(screen.queryByText('3월 불량률')).not.toBeInTheDocument()
  })

  /* 결측이 없는 경로도 있어야 '부분 결론' 경고가 죽은 코드가 되지 않는다 */
  it('빠진 데이터가 없으면 없다고 말한다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('radio', { name: /침탄로3호기_온도프로파일/ }))
    await userEvent.click(screen.getByRole('button', { name: '분석 실행' }))
    expect(await screen.findByText(/빠진 데이터가 없습니다/)).toBeInTheDocument()
    expect(screen.queryByText(/전체의 71%입니다/)).not.toBeInTheDocument()
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
