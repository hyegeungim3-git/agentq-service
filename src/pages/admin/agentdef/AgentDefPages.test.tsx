import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlowBuilderPage } from './FlowBuilderPage'
import { ScenarioBuilderPage } from './ScenarioBuilderPage'
import { AGENTS } from '@entities/agent/model'
import {
  actingWithoutCheck,
  blockedBy,
  checkPoints,
  noHumanCheck,
  notAdopted,
  unknownAgents,
} from '@entities/agentdef/model'
import { AGENT_DEFS, SCENARIO_DEFS } from '@fixtures/agentdef'
import { TOOLS } from '@fixtures/packops'

/** 화면이 발주처를 고르므로 테스트도 고른다 — 콤보박스 하나뿐이다 */
async function pick(orgName: string) {
  const select = await screen.findByLabelText('발주처')
  await userEvent.selectOptions(select, screen.getByRole('option', { name: new RegExp(orgName) }))
}

describe('태스크플로우 빌더', () => {
  /* 목록을 따로 가지면 '관리자에는 있는데 포털에는 없는 에이전트'가 생긴다.
     도입 목록과의 짝 맞춤은 팩 검사(`fixtures/packs.test.ts`)가 본다 */
  it('정의가 카탈로그를 벗어나지 않는다', () => {
    for (const d of AGENT_DEFS) {
      expect(
        AGENTS.some((a) => a.id === d.agentId),
        d.agentId,
      ).toBe(true)
    }
  })

  /**
   * **이 화면의 숫자가 발주처마다 달라야 한다.**
   *
   * 정의를 코어에 하나만 두었을 때는 어느 발주처를 봐도 같은 값이 나왔다 —
   * 그래서 병원 허브에 `설비 상태 조회`가 떴다. 값이 실제로 갈리는지 본다.
   */
  it('발주처를 바꾸면 단계와 판정이 그 발주처 것으로 바뀐다', async () => {
    render(<FlowBuilderPage />)
    expect(await screen.findByText(/사람 확인 없이 실행되는 에이전트 1종/)).toBeInTheDocument()

    await pick('새빛대학교병원')
    /* 병원만 실행형에 확인 지점을 걸어 두었다 */
    expect(await screen.findByText(/사람 확인 없이 실행되는 에이전트 없음/)).toBeInTheDocument()

    const list = await screen.findByRole('list', { name: '에이전트 정의' })
    const safety = within(list)
      .getAllByRole('listitem')
      .filter((el) => el.parentElement === list)
      .find((el) => el.textContent?.includes('안전관리계획 수립'))
    await userEvent.click(
      within(safety as HTMLElement).getByRole('button', { name: '단계 보기' }),
    )
    expect(screen.getByText(/환자안전 담당 확인/)).toBeInTheDocument()
    expect(screen.queryByText(/설비 상태 조회/)).not.toBeInTheDocument()
  })

  /* 능력 배지를 나열만 하면 많을수록 좋아 보인다 */
  it('사람 확인 없이 실행되는 에이전트를 맨 위에 올린다', async () => {
    render(<FlowBuilderPage />)
    expect(await screen.findByText(/사람 확인 없이 실행되는 에이전트 1종/)).toBeInTheDocument()
    expect(screen.getByText(/결과가 그대로 나갑니다/)).toBeInTheDocument()

    const list = await screen.findByRole('list', { name: '에이전트 정의' })
    const items = within(list)
      .getAllByRole('listitem')
      .filter((el) => el.parentElement === list)
    expect(items[0]).toHaveTextContent('안전관리계획 수립')
  })

  it('확인 지점이 없는 에이전트를 이름으로 말한다', async () => {
    render(<FlowBuilderPage />)
    expect(await screen.findByText(/결과가 문서나 지시로 이어지는 것은 확인 지점이 있어야 합니다/)).toBeInTheDocument()
  })

  /* 있는 것만 늘어놓으면 없는 것을 못 본다 */
  it('없는 능력도 함께 표시한다', async () => {
    render(<FlowBuilderPage />)
    expect((await screen.findAllByText(/사람 확인\(HITL\) 없음/)).length).toBeGreaterThan(0)
  })

  it('단계를 펼치면 도구와 확인 지점이 나온다', async () => {
    render(<FlowBuilderPage />)
    const buttons = await screen.findAllByRole('button', { name: '단계 보기' })
    await userEvent.click(buttons[0] as HTMLElement)
    expect(screen.getByText(/설비 상태 조회/)).toBeInTheDocument()
    // 끊긴 도구는 그 자리에서 보인다
    expect(screen.getByText(/PdM 센서 조회\(끊김\)/)).toBeInTheDocument()
  })

  it('정의 저장은 성공한 척하지 않는다', async () => {
    render(<FlowBuilderPage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '정의 저장' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/나가는 답은 그대로입니다/)
  })
})

describe('시나리오 빌더', () => {
  /* 목록에는 '켜짐'으로 보인다 — 눌러 보기 전까지 모른다 */
  it('켜져 있지만 못 도는 시나리오를 먼저 말한다', async () => {
    render(<ScenarioBuilderPage />)
    expect(await screen.findByText(/켜져 있지만 지금 끝까지 못 도는 시나리오 1건/)).toBeInTheDocument()
    expect(screen.getByText(/사용자에게는 카드가 그대로 보입니다/)).toBeInTheDocument()
  })

  it('어느 단계가 막혔는지 표시한다', async () => {
    render(<ScenarioBuilderPage />)
    expect((await screen.findAllByText(/도구 끊김/)).length).toBeGreaterThan(0)
  })

  /* 빼면 만든 적 없는 것으로 읽힌다 */
  it('꺼 둔 시나리오도 목록에 남긴다', async () => {
    render(<ScenarioBuilderPage />)
    expect(await screen.findByText('사규 개정 영향 검토')).toBeInTheDocument()
    expect(screen.getByText('꺼짐')).toBeInTheDocument()
  })

  /**
   * 네 발주처가 13종을 모두 도입해 '안 산 에이전트' 시나리오가 없어졌다.
   * 판정 자체는 순수 함수로 지킨다(아래 `판정` 묶음) — 화면에서는
   * 지금 사실을 본다: 병원 시나리오는 부르는 에이전트가 다 있다.
   */
  it('부르는 에이전트가 다 있는 시나리오는 못 도는 것으로 표시하지 않는다', async () => {
    render(<ScenarioBuilderPage />)
    await pick('새빛대학교병원')
    expect(await screen.findByText('청구 보류 건 회신 처리')).toBeInTheDocument()
    expect(screen.queryByText(/도입하지 않은 에이전트를 부릅니다/)).not.toBeInTheDocument()
  })

  it('시나리오 저장은 성공한 척하지 않는다', async () => {
    render(<ScenarioBuilderPage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '시나리오 저장' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/실행 순서는 그대로입니다/)
  })
})

describe('판정', () => {
  it('확인 지점이 없으면 잡는다', () => {
    const ids = noHumanCheck(AGENT_DEFS).map((d) => d.agentId)
    expect(ids).toContain('chatbot')
    expect(ids).not.toContain('review')
  })

  /* 답만 내놓는 것과 무언가를 하는 것은 위험이 다르다 */
  it('실행형이면서 확인이 없는 것만 따로 센다', () => {
    expect(actingWithoutCheck(AGENT_DEFS).map((d) => d.agentId)).toEqual(['safety'])
  })

  it('확인 지점을 단계에서 찾는다', () => {
    const review = AGENT_DEFS.find((d) => d.agentId === 'review')
    expect(checkPoints(review as NonNullable<typeof review>)).toHaveLength(1)
  })

  /* 도입 목록에서 빠진 에이전트를 부르면 그 시나리오는 거기서 멈춘다 */
  it('안 산 에이전트를 부르면 잡는다', () => {
    const s = SCENARIO_DEFS[0] as NonNullable<(typeof SCENARIO_DEFS)[0]>
    expect(notAdopted(s, AGENTS.map((a) => a.id))).toEqual([])
    const without = AGENTS.map((a) => a.id).filter((id) => id !== 'address')
    expect(notAdopted(s, without)).toEqual(['address'])
  })

  it('시나리오가 부르는 에이전트는 모두 카탈로그에 있다', () => {
    const known = AGENTS.map((a) => a.id)
    for (const s of SCENARIO_DEFS) {
      expect(unknownAgents(s, known), s.id).toEqual([])
    }
  })

  /* 도구·배포 화면과 같은 판정이어야 한다 */
  it('끊긴 도구를 쓰는 시나리오를 잡는다', () => {
    const broken = TOOLS.filter((t) => !t.connected).map((t) => t.id)
    const s2 = SCENARIO_DEFS.find((s) => s.id === 'sc-2')
    const hits = blockedBy(s2 as NonNullable<typeof s2>, AGENT_DEFS, broken)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.map((h) => h.toolId)).toContain('t-pdm')

    const s1 = SCENARIO_DEFS.find((s) => s.id === 'sc-1')
    expect(blockedBy(s1 as NonNullable<typeof s1>, AGENT_DEFS, broken)).toEqual([])
  })
})
