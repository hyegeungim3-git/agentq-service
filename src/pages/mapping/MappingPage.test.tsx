import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MappingPage } from './MappingPage'

const setup = () => render(<MappingPage apiOptions={{ delayMs: 0 }} />)
const analyze = async () => {
  setup()
  await userEvent.click(screen.getByRole('button', { name: '태그 수집·매핑 분석' }))
  return screen.findByRole('region', { name: '표준화 현황' })
}

describe('MappingPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  /* AI로 되는 것과 안 되는 것을 섞으면 계획이 어긋난다 */
  it('AI로 해결되지 않는 건수와 표준화율 상한을 밝힌다', async () => {
    const s = await analyze()
    expect(s).toHaveTextContent('660개는 AI로 해결되지 않습니다')
    expect(s).toHaveTextContent('86%가 상한입니다')
  })

  it('미매칭 사유마다 AI 처리 가능 여부를 표시한다', async () => {
    await analyze()
    const r = await screen.findByRole('region', { name: '미매칭 사유' })
    expect(r).toHaveTextContent('로트 키 미발행')
    expect(r).toHaveTextContent('설비 제어기 펌웨어 업데이트')
  })

  it('자동 확정을 반영하면 표준화율 변화가 보인다', async () => {
    await analyze()
    await userEvent.click(screen.getByRole('button', { name: /자동 확정 1,172건 반영/ }))
    // 화면의 후보 7건은 예시다 — 반영 효과는 집계값으로 계산돼야 한다
    expect(await screen.findByText(/표준화 62% → 86%/)).toBeInTheDocument()
  })

  it('필터로 상태별 후보만 볼 수 있다', async () => {
    await analyze()
    await userEvent.click(screen.getByRole('button', { name: '표준화 불가' }))
    const c = screen.getByRole('region', { name: '매핑 후보' })
    expect(c).toHaveTextContent('LOT_KEY')
    expect(c).not.toHaveTextContent('P1_PRS3_VIB')
  })

  /* AI가 못 하는 일을 못 한다고 말하는 자리 */
  it('표준화 불가 후보는 무엇이 필요한지 밝힌다', async () => {
    await analyze()
    await userEvent.click(screen.getByRole('button', { name: '표준화 불가' }))
    const rows = screen.getAllByRole('button', { name: '근거 보기' })
    await userEvent.click(rows[0]!)
    expect(await screen.findByText(/AI로는 해결할 수 없습니다/)).toBeInTheDocument()
  })
})
