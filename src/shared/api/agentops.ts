import type { AgentOps, AppSurface, DomainExposure } from '@entities/agentops/model'
import { AGENT_OPS, APP_SURFACES, DOMAIN_EXPOSURE } from '@fixtures/agentops'
import type { ApiResult } from './domains'

/**
 * 에이전트 운영 · 애플리케이션의 데이터 경계.
 *
 * 에이전트 **목록**은 여기서 주지 않는다 — 카탈로그는 `entities/agent/model.ts`
 * 하나이고 포털도 그것을 쓴다. 여기서는 그 id에 붙는 운영 정보만 준다.
 * 목록을 두 곳에서 주면 관리자와 포털이 서로 다른 에이전트를 보게 된다.
 */

export function fetchAgentOps(): Promise<ApiResult<AgentOps[]>> {
  // TODO(api-미확정): GET /agents/ops 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: AGENT_OPS })
}

export function setAgentExposure(agentId: string, exposed: boolean): Promise<ApiResult<never>> {
  void agentId
  void exposed
  // TODO(api-미확정): PATCH /agents/{id} 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '노출 설정을 저장하지 못했습니다. 서버가 연결되지 않아 사용자 포털에는 그대로 보입니다.',
  })
}

export function fetchAppSurfaces(): Promise<ApiResult<AppSurface[]>> {
  // TODO(api-미확정): GET /apps 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: APP_SURFACES })
}

export function fetchDomainExposure(): Promise<ApiResult<DomainExposure[]>> {
  // TODO(api-미확정): GET /apps/domains 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: DOMAIN_EXPOSURE })
}
