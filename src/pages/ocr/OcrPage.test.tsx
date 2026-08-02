import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OcrPage } from './OcrPage'

const setup = () => render(<OcrPage apiOptions={{ delayMs: 0 }} />)

describe('OcrPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  /* 못 읽은 줄을 감추면 잘못된 값이 그대로 흘러간다 */
  it('신뢰도가 낮은 줄을 표시하고 건수를 알린다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '문서 인식' }))
    const r = await screen.findByRole('region', { name: '인식 결과' })
    expect(r).toHaveTextContent('확인 필요')
    expect(r).toHaveTextContent('미만인 줄이 2개 있습니다')
  })

  it('마스킹을 켜면 원문이 가려지고 무엇을 가렸는지 남는다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '문서 인식' }))
    const mask = await screen.findByRole('region', { name: '개인정보 마스킹' })
    expect(mask).toHaveTextContent('010-****-7734')
    expect(mask).toHaveTextContent('연락처')
    expect(screen.getByRole('region', { name: '인식 결과' })).not.toHaveTextContent('010-4821-7734')
  })

  it('마스킹을 끄면 원문이 남고 주의를 알린다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('checkbox', { name: /개인정보 자동 마스킹/ }))
    await userEvent.click(screen.getByRole('button', { name: '문서 인식' }))
    expect(await screen.findByText(/외부 공유에 주의/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '인식 결과' })).toHaveTextContent('010-4821-7734')
  })
})
