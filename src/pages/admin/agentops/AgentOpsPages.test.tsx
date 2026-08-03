import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentOpsPage } from './AgentOpsPage'
import { AppSurfacePage } from './AppSurfacePage'
import { AGENTS } from '@entities/agent/model'
import { byFailure, failureRatio, unused } from '@entities/agentops/model'
import { AGENT_OPS } from '@fixtures/agentops'

describe('에이전트 운영', () => {
  /* 관리자가 목록을 따로 가지면 '관리자에는 있는데 포털에는 없는' 에이전트가 생긴다 */
  it('포털과 같은 카탈로그를 쓴다', async () => {
    render(<AgentOpsPage />)
    expect(
      await screen.findByText(/포털이 그리는 목록과 같은\s*카탈로그입니다/),
    ).toBeInTheDocument()
    // 운영 정보가 카탈로그 전 항목을 덮는지 — 빠지면 표에 이름 없는 행이 생긴다
    expect(AGENT_OPS).toHaveLength(AGENTS.length)
    for (const o of AGENT_OPS) {
      expect(AGENTS.some((a) => a.id === o.agentId), o.agentId).toBe(true)
    }
  })

  it('카탈로그의 이름으로 표를 그린다', async () => {
    render(<AgentOpsPage />)
    // 경고 상자와 표 양쪽에 나온다 — 표 쪽만 본다
    expect((await screen.findAllByText('안전관리계획 수립')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('업무 챗봇').length).toBeGreaterThan(0)
  })

  /* 이름순으로 두면 문제를 찾아 훑어야 한다 */
  it('실패율이 높은 순으로 올린다', async () => {
    render(<AgentOpsPage />)
    const rows = await screen.findAllByRole('row')
    expect(rows[1]).toHaveTextContent('안전관리계획 수립')
  })

  /* 답이 부실한 원인은 대개 에이전트가 아니라 그 아래 데이터에 있다 */
  it('근거 문서에 빈틈이 있는 에이전트를 지식 관리와 이어 준다', async () => {
    render(<AgentOpsPage />)
    expect(await screen.findByText(/근거 문서에 빈틈이 있는 에이전트/)).toBeInTheDocument()
    expect(screen.getByText(/에이전트보다 먼저 지식 관리를 보십시오/)).toBeInTheDocument()
    // 챗봇과 안전관리계획 둘 다 안전·환경 영역에 기댄다
    expect(screen.getAllByText(/안전·환경에 검색에 안 잡히는 문서/).length).toBeGreaterThan(0)
  })

  it('노출 변경은 성공한 척하지 않는다', async () => {
    render(<AgentOpsPage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '내리기' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/사용자 포털에는 그대로 보입니다/)
  })

  /* 미뤄 두기만 하면 그 자리가 비어 있는 것이다 — 실제 화면으로 이었다 */
  it('정의는 태스크플로우 빌더에서 본다고 잇는다', async () => {
    render(<AgentOpsPage />)
    expect(await screen.findByText(/같은\s*카탈로그를 두 각도로 나눠 본 것입니다/)).toBeInTheDocument()
    expect(screen.getByText('태스크플로우 빌더')).toBeInTheDocument()
  })
})

describe('애플리케이션', () => {
  /* 못 여는 것을 목록에서 빼면 계획에 없는 것으로 읽힌다 */
  it('못 여는 앱과 그 이유를 함께 보여 준다', async () => {
    render(<AppSurfacePage />)
    expect(await screen.findByText('모바일 앱')).toBeInTheDocument()
    expect(screen.getByText(/푸시·오프라인·설치 정책이 정해져야 합니다/)).toBeInTheDocument()
    expect(screen.getByText(/인증 방식이 정해지지 않아 열 수 없습니다/)).toBeInTheDocument()
  })

  /* 관리자에서만 열려 있는 것처럼 보이면 안 된다 */
  it('발주처별 노출이 포털과 같은 기준임을 밝힌다', async () => {
    render(<AppSurfacePage />)
    expect(await screen.findByText(/여기서만 열려 있는 것처럼 보이면/)).toBeInTheDocument()
    expect(screen.getByText('한빛정밀')).toBeInTheDocument()
    expect(screen.getAllByText('0종')).toHaveLength(3)
  })
})

describe('운영 계산', () => {
  it('실행이 없으면 실패율을 만들지 않는다', () => {
    expect(failureRatio({ ...(AGENT_OPS[0] as NonNullable<(typeof AGENT_OPS)[0]>), runs7d: 0 })).toBeNull()
  })

  it('실패율 높은 순으로 정렬한다', () => {
    const sorted = byFailure(AGENT_OPS)
    expect(sorted[0]?.agentId).toBe('safety')
  })

  /* 0건은 '문제 없음'이 아니다 */
  it('한 번도 안 쓴 에이전트를 골라낸다', () => {
    expect(unused(AGENT_OPS)).toHaveLength(0)
    expect(unused([{ ...(AGENT_OPS[0] as NonNullable<(typeof AGENT_OPS)[0]>), runs7d: 0 }])).toHaveLength(1)
  })
})
