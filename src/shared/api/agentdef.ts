import type { AgentDefinition, ScenarioDefinition } from '@entities/agentdef/model'
import type { AgentId } from '@entities/agent/model'
import type { ApiResult } from './domains'
import type { DomainPackData } from '@fixtures/packs'
import { withPack, withPackOf } from './pack'

/**
 * 에이전트 정의 · 시나리오 정의의 데이터 경계.
 *
 * 정의를 바꾸는 것은 **답이 달라지는 일**이다. 서버 없이 화면에서만 바꾸면
 * 바꾼 줄 알고 닫는데 사용자에게 나가는 답은 그대로다.
 *
 * 정의 응답에 **단계와 사람 확인 지점**을 함께 달라고 요청한다. 능력 배지만
 * 오면 화면이 '확인 없이 나가는 에이전트'를 그릴 수 없다.
 *
 * ⚠️ 정의는 **발주처마다 다르다.** 단계 이름이 그 발주처의 업무 용어이고 담당도
 * 그 발주처 부서다. 하나만 두었더니 병원 허브에 `설비 상태 조회`가 떴다.
 * 그래서 발주처를 인자로 받는다 — 관리자는 고른 발주처를, 포털은 지금 발주처를 넘긴다.
 */

export function fetchAgentDefs(domainId: string | null): Promise<ApiResult<AgentDefinition[]>> {
  // TODO(api-미확정): GET /agents/definitions 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return withPackOf(domainId, (p) => p.agentDefs)
}

export function saveAgentDef(agentId: string): Promise<ApiResult<never>> {
  void agentId
  // TODO(api-미확정): PUT /agents/definitions/{id} 로 교체. 제거 조건 = 백엔드가 인증·검토 흐름을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '정의를 저장하지 못했습니다. 서버가 연결되지 않았습니다 — 사용자에게 나가는 답은 그대로입니다.',
  })
}

export function fetchScenarioDefs(domainId: string | null): Promise<ApiResult<ScenarioDefinition[]>> {
  // TODO(api-미확정): GET /scenarios 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return withPackOf(domainId, (p) => p.scenarioDefs)
}

export function saveScenario(id: string): Promise<ApiResult<never>> {
  void id
  // TODO(api-미확정): PUT /scenarios/{id} 로 교체. 제거 조건 = 백엔드가 인증·검토 흐름을 확정.
  return Promise.resolve({
    ok: false,
    error: '시나리오를 저장하지 못했습니다. 서버가 연결되지 않아 실행 순서는 그대로입니다.',
  })
}

/**
 * 이 발주처가 도입한 에이전트.
 *
 * 카탈로그의 `status`(아직 안 만든 화면)와 **다른 축**이다 — 화면은 있는데
 * 이 발주처에는 아직 안 들어온 것이다. 둘을 뭉뚱그리면 '없는 기능'과
 * '아직 안 산 기능'을 구분할 수 없다.
 */
export type AdoptionInfo = {
  agents: AgentId[]
  /** 복합 업무 시나리오 소개. 없으면 허브가 카드를 그리지 않는다 */
  scenario: { title: string; summary: string } | null
}

export function fetchAdoptedAgents(domainId?: string | null): Promise<ApiResult<AdoptionInfo>> {
  // TODO(api-미확정): GET /agents/adopted 로 교체. 제거 조건 = 백엔드가 테넌시(§3-2)를 확정.
  /* 카드 제목은 릴레이가 실제로 그리는 제목과 같아야 한다 — 두 곳에 안 적는다 */
  const read = (p: DomainPackData): AdoptionInfo => ({
    agents: p.agents,
    scenario:
      p.scenario && p.relay ? { title: p.relay.scenario.title, summary: p.scenario.summary } : null,
  })
  /* 인자를 안 주면 지금 발주처(포털), 주면 그 발주처(관리자) */
  return domainId === undefined ? withPack(read) : withPackOf(domainId, read)
}
