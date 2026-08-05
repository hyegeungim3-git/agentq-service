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
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('목록을 받으면 분야 라벨과 조직명을 함께 보여준다', async () => {
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    expect(await screen.findByText('한빛정밀')).toBeInTheDocument()
    expect(screen.getByText('제조')).toBeInTheDocument()
    expect(screen.getByText('한국부동산원')).toBeInTheDocument()
  })

  it('선택하면 도메인 id를 넘긴다', async () => {
    const onSelect = vi.fn()
    render(<PortalPage onSelect={onSelect} onAdmin={() => {}} />)
    await userEvent.click(await screen.findByRole('button', { name: /한빛정밀/ }))
    expect(onSelect).toHaveBeenCalledWith('manufacturing')
  })

  /* 업무 데이터가 없는 발주처를 열면 다른 발주처의 문서·수치가 그대로 보인다.
     실제로 공공을 골라도 제조 문서 목록이 떴다. 고를 수 없게 막고 이유를 표시한다.
     ⚠️ 공공은 팩이 생겨 열렸다(2026-08-05) — 아직 팩이 없는 곳으로 바꿨다.
     팩과 상태가 어긋나는지는 `scripts/pack-leak.test.ts`가 따로 지킨다. */
  it('업무 데이터가 준비되지 않은 발주처는 선택할 수 없다', async () => {
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    const btn = await screen.findByRole('button', { name: /한성시청/ })
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('업무 데이터 준비 중')
  })

  it('준비되지 않은 발주처는 눌러도 열리지 않는다', async () => {
    const onSelect = vi.fn()
    render(<PortalPage onSelect={onSelect} onAdmin={() => {}} />)
    await userEvent.click(await screen.findByRole('button', { name: /한성시청/ }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('못 고르는 이유를 화면이 말한다', async () => {
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    expect(await screen.findByText(/업무 데이터가 준비된 발주처만 선택할 수 있습니다/)).toBeInTheDocument()
  })

  it('실패하면 오류와 재시도를 보여준다 — 조용히 빈 화면을 두지 않는다', async () => {
    vi.spyOn(api, 'fetchDomains').mockResolvedValue({ ok: false, error: '연결 실패' })
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('연결 실패')
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('목록이 비면 빈 상태 문구를 보여준다', async () => {
    vi.spyOn(api, 'fetchDomains').mockResolvedValue({ ok: true, data: [] })
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    expect(await screen.findByText('표시할 분야가 없습니다.')).toBeInTheDocument()
  })
})
