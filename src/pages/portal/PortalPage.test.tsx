import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PortalPage } from './PortalPage'
import * as api from '@shared/api/domains'

/* 화면 상태 4종을 전부 테스트한다 — '정상일 때 뜬다'만 보면 서버가 붙는 순간
   로딩·오류 경로가 처음 실행되고, 그때 깨진다. */
describe('PortalPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('로딩 중에는 상태를 알린다', () => {
    vi.spyOn(api, 'fetchDomains').mockReturnValue(new Promise(() => {}))
    render(<PortalPage onSelect={() => {}} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('목록을 받으면 분야 라벨과 조직명을 함께 보여준다', async () => {
    render(<PortalPage onSelect={() => {}} />)
    expect(await screen.findByText('한빛정밀')).toBeInTheDocument()
    expect(screen.getByText('제조')).toBeInTheDocument()
    expect(screen.getByText('한국부동산원')).toBeInTheDocument()
  })

  it('선택하면 도메인 id를 넘긴다', async () => {
    const onSelect = vi.fn()
    render(<PortalPage onSelect={onSelect} />)
    await userEvent.click(await screen.findByRole('button', { name: /한빛정밀/ }))
    expect(onSelect).toHaveBeenCalledWith('manufacturing')
  })

  it('실패하면 오류와 재시도를 보여준다 — 조용히 빈 화면을 두지 않는다', async () => {
    vi.spyOn(api, 'fetchDomains').mockResolvedValue({ ok: false, error: '연결 실패' })
    render(<PortalPage onSelect={() => {}} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('연결 실패')
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('목록이 비면 빈 상태 문구를 보여준다', async () => {
    vi.spyOn(api, 'fetchDomains').mockResolvedValue({ ok: true, data: [] })
    render(<PortalPage onSelect={() => {}} />)
    expect(await screen.findByText('표시할 분야가 없습니다.')).toBeInTheDocument()
  })
})
