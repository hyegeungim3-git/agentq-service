import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubPage } from './HubPage'
import { AGENTS } from '@entities/agent/model'
import { noHumanCheck } from '@entities/agentdef/model'
import { AGENT_DEFS } from '@fixtures/agentdef'
import * as agentdefApi from '@shared/api/agentdef'
import type { Domain } from '@entities/domain/model'
import { DOMAIN_FIXTURES } from '@fixtures/domains'

/* 화면이 안 쓰는 칸까지 손으로 채우면 스키마가 바뀔 때마다 검사가 깨진다 —
   fixture의 진짜 발주처를 그대로 쓴다 */
const domain: Domain = {
  ...(DOMAIN_FIXTURES.find((d) => d.id === 'manufacturing') as Domain),
  id: 'manufacturing',
  orgName: '한빛정밀',
  orgShort: 'HBP',
  sector: 'manufacturing',
  brandColor: '#0F766E',
  tagline: '스마트팩토리 생성형 AI 플랫폼',
  status: 'ready',
  docPrefix: 'HBP',
  user: { name: '박태윤', dept: '생산기술팀', title: '책임' },
}

const setup = (onOpen = vi.fn()) => {
  render(<HubPage domain={domain} onOpen={onOpen} onBack={vi.fn()} />)
  return onOpen
}

describe('HubPage', () => {
  it('13종을 모두 보여준다 — 안 만든 것을 목록에서 숨기지 않는다', () => {
    setup()
    expect(screen.getAllByRole('button', { name: /요약|번역|챗봇|보고서|회의록|검색|조회|인식|표준화|분석|검토|계획/ }).length)
      .toBeGreaterThanOrEqual(AGENTS.length)
  })

  it('준비된 에이전트는 열 수 있다', async () => {
    const onOpen = setup()
    await userEvent.click(screen.getByRole('button', { name: /문서 요약/ }))
    expect(onOpen).toHaveBeenCalledWith('summary')
  })

  /* 13종이 모두 ready가 된 뒤에도 이 경로는 지켜야 한다 —
     앞으로 에이전트를 추가하면 다시 planned가 생긴다. 목록을 주입해 검증한다. */
  it('준비 중인 에이전트는 비활성이고 상태를 표시한다', () => {
    render(
      <HubPage
        domain={domain}
        onOpen={vi.fn()}
        onBack={vi.fn()}
        agents={[{ id: 'chatbot', name: '미구현 예시', desc: '설명', status: 'planned' }]}
      />,
    )
    const btn = screen.getByRole('button', { name: /미구현 예시/ })
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('준비 중')
  })

  it('준비 중인 에이전트는 눌러도 열리지 않는다', async () => {
    const onOpen = vi.fn()
    render(
      <HubPage
        domain={domain}
        onOpen={onOpen}
        onBack={vi.fn()}
        agents={[{ id: 'chatbot', name: '미구현 예시', desc: '설명', status: 'planned' }]}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /미구현 예시/ }))
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('이식 진척을 숨기지 않고 표시한다', () => {
    setup()
    expect(screen.getByText(/이식 \d+\/13종/)).toBeInTheDocument()
  })

  it('조직명과 분야를 보여준다', () => {
    setup()
    expect(screen.getByRole('heading', { name: '한빛정밀' })).toBeInTheDocument()
    expect(screen.getByText('제조')).toBeInTheDocument()
  })

  /* 이름과 한 줄 설명만으로는 눌러 보기 전에 무엇을 하는지 모른다 */
  it('카드가 밟는 단계를 정의에서 가져와 보여준다', async () => {
    setup()
    const def = AGENT_DEFS.find((d) => d.agentId === 'summary')
    for (const s of def?.steps ?? []) {
      expect(await screen.findByText(s.name)).toBeInTheDocument()
    }
  })

  /* 배지를 늘어놓으면 능력이 많을수록 좋아 보인다. 정작 위험한 것은 이쪽이다 */
  it('사람 확인 지점이 없는 에이전트를 카드에서 말한다', async () => {
    setup()
    const bare = noHumanCheck(AGENT_DEFS).length
    expect(bare, '확인 지점이 없는 에이전트가 fixture에 있어야 이 경로가 산다').toBeGreaterThan(0)
    expect(await screen.findAllByText('사람 확인 지점 없음')).toHaveLength(bare)
  })

  /* 버튼 이름이 길어지면 다른 에이전트와 겹친다 — 실제로 겹쳐서 테스트가 깨졌다 */
  it('카드 버튼의 이름은 에이전트 이름뿐이다', async () => {
    setup()
    await screen.findByText('문서 본문 추출')
    expect(screen.getByRole('button', { name: '데이터 조회' })).toBeInTheDocument()
  })
})

/**
 * **도입 전 표시 경로를 지킨다.**
 *
 * 네 발주처가 13종을 모두 도입하면서 이 경로를 밟을 실제 데이터가 없어졌다.
 * 단언을 지우면 팩에서 하나를 빼도 아무도 모른다 — 그래서 값을 주입해 밟는다.
 * ('안 만든 것'과 '아직 안 산 것'은 다른 축이라 둘 다 화면에 있어야 한다)
 */
describe('도입 전 표시', () => {
  it('도입하지 않은 에이전트는 사유를 붙여 막는다', async () => {
    vi.spyOn(agentdefApi, 'fetchAdoptedAgents').mockResolvedValue({
      ok: true,
      data: { agents: ['summary'], scenario: null },
    })
    render(<HubPage domain={domain} onOpen={vi.fn()} onBack={vi.fn()} />)

    expect((await screen.findAllByText('도입 전')).length).toBe(AGENTS.length - 1)
    expect(screen.getByRole('button', { name: /^문서 요약/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /^문서 번역/ })).toBeDisabled()
  })
})
