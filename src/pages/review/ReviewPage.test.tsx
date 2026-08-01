import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewPage } from './ReviewPage'
import * as docApi from '@shared/api/documents'

const NO_DELAY = { delayMs: 0 }
const setup = () => render(<ReviewPage apiOptions={NO_DELAY} />)

describe('ReviewPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('검토 결과에 조항·조치가 함께 나온다 — 근거 없는 지적을 두지 않는다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '사전 검토 시작' }))
    const result = await screen.findByRole('region', { name: /검토 결과/ })
    expect(result).toHaveTextContent('취업규칙 제23조 제2항')
    expect(result).toHaveTextContent('조치 ·')
  })

  /* 규정 선택이 결과를 바꾸지 않으면 그 체크박스는 장식이다 */
  it('규정을 추가하면 위반이 늘어난다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '사전 검토 시작' }))
    const before = (await screen.findByRole('region', { name: /검토 결과/ })).textContent ?? ''

    await userEvent.click(screen.getByRole('checkbox', { name: '안전보건관리규정' }))
    await userEvent.click(screen.getByRole('button', { name: '사전 검토 시작' }))
    const after = (await screen.findByRole('region', { name: /검토 결과/ })).textContent ?? ''

    expect(after).toContain('위험성평가 미첨부')
    expect(before).not.toContain('위험성평가 미첨부')
  })

  it('심각도 높음이 있으면 상신을 권하지 않는다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '사전 검토 시작' }))
    expect(await screen.findByText(/상신을 권하지 않습니다/)).toBeInTheDocument()
  })

  it('규정을 모두 해제하면 실행 버튼이 비활성이다', async () => {
    setup()
    await screen.findByRole('button', { name: '사전 검토 시작' })
    await userEvent.click(screen.getByRole('checkbox', { name: '취업규칙·복무규정' }))
    await userEvent.click(screen.getByRole('checkbox', { name: '구매·계약 규정' }))
    expect(screen.getByRole('button', { name: '사전 검토 시작' })).toBeDisabled()
    expect(screen.getByText('규정을 1개 이상 선택하세요.')).toBeInTheDocument()
  })

  it('문서 목록이 비면 안내를 보여준다', async () => {
    vi.spyOn(docApi, 'fetchDocuments').mockResolvedValue({ ok: true, data: [] })
    setup()
    expect(await screen.findByText('검토할 문서가 없습니다.')).toBeInTheDocument()
  })

  it('AI 대조 결과임을 고지한다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '사전 검토 시작' }))
    expect(await screen.findByText(/AI가 대조한 결과입니다/)).toBeInTheDocument()
  })
})
