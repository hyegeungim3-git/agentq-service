import type { AgentDefinition, ScenarioDefinition } from '@entities/agentdef/model'
import { AGENT_DEFS, SCENARIO_DEFS } from '@fixtures/agentdef'
import type { ApiResult } from './domains'

/**
 * 에이전트 정의 · 시나리오 정의의 데이터 경계.
 *
 * 정의를 바꾸는 것은 **답이 달라지는 일**이다. 서버 없이 화면에서만 바꾸면
 * 바꾼 줄 알고 닫는데 사용자에게 나가는 답은 그대로다.
 *
 * 정의 응답에 **단계와 사람 확인 지점**을 함께 달라고 요청한다. 능력 배지만
 * 오면 화면이 '확인 없이 나가는 에이전트'를 그릴 수 없다.
 */

export function fetchAgentDefs(): Promise<ApiResult<AgentDefinition[]>> {
  // TODO(api-미확정): GET /agents/definitions 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: AGENT_DEFS })
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

export function fetchScenarioDefs(): Promise<ApiResult<ScenarioDefinition[]>> {
  // TODO(api-미확정): GET /scenarios 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: SCENARIO_DEFS })
}

export function saveScenario(id: string): Promise<ApiResult<never>> {
  void id
  // TODO(api-미확정): PUT /scenarios/{id} 로 교체. 제거 조건 = 백엔드가 인증·검토 흐름을 확정.
  return Promise.resolve({
    ok: false,
    error: '시나리오를 저장하지 못했습니다. 서버가 연결되지 않아 실행 순서는 그대로입니다.',
  })
}
