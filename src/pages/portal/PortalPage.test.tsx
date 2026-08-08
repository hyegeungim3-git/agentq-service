import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PortalPage } from './PortalPage'
import * as api from '@shared/api/domains'
import { DOMAIN_FIXTURES } from '@fixtures/domains'
import type { Domain } from '@entities/domain/model'

/* 화면 상태 4종을 전부 테스트한다 — '정상일 때 뜬다'만 보면 서버가 붙는 순간
   로딩·오류 경로가 처음 실행되고, 그때 깨진다. */
describe('PortalPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('로딩 중에는 상태를 알린다', () => {
    vi.spyOn(api, 'fetchDomains').mockReturnValue(new Promise(() => {}))
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  /* 발주처는 위쪽 스위처에서 고르고, 들어가는 것은 카드로 한다(D-014) */
  it('스위처에 발주처가 모두 나오고 고른 곳의 소개가 뜬다', async () => {
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    const nav = await screen.findByRole('navigation', { name: '발주처 선택' })
    for (const d of DOMAIN_FIXTURES) {
      expect(within(nav).getByRole('button', { name: d.orgName })).toBeInTheDocument()
    }
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('한빛정밀')
  })

  it('발주처를 바꾸면 제목·소개·기능 목록이 함께 바뀐다', async () => {
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    const nav = await screen.findByRole('navigation', { name: '발주처 선택' })
    await userEvent.click(within(nav).getByRole('button', { name: '한국부동산원' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('한국부동산원')
    expect(screen.getByText(/표준지공시지가 조사지침/)).toBeInTheDocument()
  })

  it('사용자 포털로 들어가면 고른 발주처 id를 넘긴다', async () => {
    const onSelect = vi.fn()
    render(<PortalPage onSelect={onSelect} onAdmin={() => {}} />)
    const nav = await screen.findByRole('navigation', { name: '발주처 선택' })
    await userEvent.click(within(nav).getByRole('button', { name: '한성시청' }))
    await userEvent.click(screen.getByRole('button', { name: /사용자 포털 입장/ }))
    expect(onSelect).toHaveBeenCalledWith('civic')
  })

  /* 업무 데이터가 없는 발주처를 열면 다른 발주처의 문서·수치가 그대로 보인다.
     실제로 공공을 골라도 제조 문서 목록이 떴다. 고를 수 없게 막고 이유를 표시한다.

     ⚠️ 2026-08-05에 네 발주처가 전부 열려서 이 경로를 밟을 실제 데이터가 없어졌다.
     그렇다고 지우면 다음에 발주처를 추가할 때 막는 코드가 죽은 채로 배포된다 —
     **응답을 주입해서** 경로를 살려 둔다. 팩과 상태가 어긋나는지는
     `src/fixtures/packs.test.ts`가 따로 지킨다. */
  const withPlanned = () => {
    const ready = DOMAIN_FIXTURES[0] as Domain
    const planned: Domain = { ...ready, id: 'x', orgName: '준비중기관', status: 'planned' }
    vi.spyOn(api, 'fetchDomains').mockResolvedValue({ ok: true, data: [ready, planned] })
  }

  it('업무 데이터가 준비되지 않은 발주처는 선택할 수 없다', async () => {
    withPlanned()
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    const btn = await screen.findByRole('button', { name: '준비중기관' })
    expect(btn).toBeDisabled()
  })

  it('준비되지 않은 발주처는 눌러도 열리지 않는다', async () => {
    withPlanned()
    const onSelect = vi.fn()
    render(<PortalPage onSelect={onSelect} onAdmin={() => {}} />)
    await userEvent.click(await screen.findByRole('button', { name: '준비중기관' }))
    /* 눌려도 스위처가 안 바뀌므로 들어가는 곳은 그대로다 */
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('한빛정밀')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('못 고르는 이유를 화면이 말한다', async () => {
    withPlanned()
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    expect(await screen.findByText(/업무 데이터가 준비된 발주처만 선택할 수 있습니다/)).toBeInTheDocument()
  })

  /* 반대편 — 지금은 전부 열려 있어야 한다 */
  it('팩이 있는 발주처는 모두 고를 수 있다', async () => {
    render(<PortalPage onSelect={() => {}} onAdmin={() => {}} />)
    const nav = await screen.findByRole('navigation', { name: '발주처 선택' })
    for (const d of DOMAIN_FIXTURES.filter((x) => x.status === 'ready')) {
      expect(within(nav).getByRole('button', { name: d.orgName })).toBeEnabled()
    }
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
