import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryPage } from './SummaryPage'
import * as api from '@shared/api/summary'

const NO_DELAY = { delayMs: 0 }
const setup = () => render(<SummaryPage apiOptions={NO_DELAY} />)

describe('SummaryPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('문서 목록과 요약 방식을 보여준다', async () => {
    setup()
    expect(await screen.findByText('프레스_작업표준서_SOP-PR-011.pdf')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /상세 요약/ })).toBeChecked()
  })

  it('요약을 생성하면 결과와 통계가 나온다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '요약 생성' }))
    const result = await screen.findByRole('region', { name: /요약 결과/ })
    expect(result).toHaveTextContent('적용 범위')
    expect(result).toHaveTextContent('압축률')
  })

  it('요약 방식을 바꾸면 결과 내용이 달라진다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('radio', { name: /핵심 요약/ }))
    await userEvent.click(screen.getByRole('button', { name: '요약 생성' }))
    const result = await screen.findByRole('region', { name: /요약 결과/ })
    expect(result).toHaveTextContent('핵심 요약')
    /* 본문 텍스트로 판별하면 안 된다 — 핵심 요약 '본문 안에' 상세의 소제목 단어가
       문장으로 등장한다(실제로 이 단언으로 오탐이 났다). 구조로 판별한다:
       핵심 요약은 소제목 1개, 상세 요약은 5개다. */
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2) // 요약 1 + 키워드 1
    expect(screen.getByRole('heading', { level: 3, name: '핵심' })).toBeInTheDocument()
  })

  it('상세 요약은 소제목이 여러 개다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '요약 생성' }))
    await screen.findByRole('region', { name: /요약 결과/ })
    expect(screen.getByRole('heading', { level: 3, name: '적용 범위' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: '이상 대응' })).toBeInTheDocument()
  })

  it('실패하면 오류와 재시도를 보여준다', async () => {
    setup()
    await screen.findByRole('button', { name: '요약 생성' })
    vi.spyOn(api, 'createSummary').mockResolvedValue({ ok: false, error: '모델 응답 없음' })
    await userEvent.click(screen.getByRole('button', { name: '요약 생성' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('모델 응답 없음')
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('문서 목록이 비면 안내를 보여준다', async () => {
    vi.spyOn(api, 'fetchSourceDocuments').mockResolvedValue({ ok: true, data: [] })
    setup()
    expect(await screen.findByText('요약할 문서가 없습니다.')).toBeInTheDocument()
  })

  it('문서가 없으면 실행 버튼이 비활성이다', async () => {
    vi.spyOn(api, 'fetchSourceDocuments').mockResolvedValue({ ok: true, data: [] })
    setup()
    expect(await screen.findByRole('button', { name: '요약 생성' })).toBeDisabled()
  })

  it('관점 칩을 선택할 수 있다', async () => {
    setup()
    const chip = await screen.findByRole('checkbox', { name: '위험 요소' })
    await userEvent.click(chip)
    expect(chip).toBeChecked()
  })

  it('AI 생성물 고지를 항상 붙인다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '요약 생성' }))
    expect(await screen.findByText(/AI가 생성한 요약입니다/)).toBeInTheDocument()
  })
})
