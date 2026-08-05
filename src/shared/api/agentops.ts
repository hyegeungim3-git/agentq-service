import type { AgentOps, AppSurface, DomainExposure } from '@entities/agentops/model'
import { AGENT_OPS, APP_SURFACES } from '@fixtures/agentops'
import { DOMAIN_FIXTURES } from '@fixtures/domains'
import { packStatuses } from '@fixtures/packs'
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
  /* 표를 따로 두지 않고 **실제 팩과 발주처 목록에서 뽑는다.**
     네 번째 발주처를 열었을 때 포털은 열렸는데 여기는 '데이터 없음'이라고
     말하는 상태가 됐다 — 같은 사실을 두 곳에 두면 반드시 갈라진다. */
  // TODO(api-미확정): GET /apps/domains 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  const byId = new Map(packStatuses().map((p) => [p.domainId, p]))
  const data: DomainExposure[] = DOMAIN_FIXTURES.map((d) => {
    const pack = byId.get(d.id)
    return {
      domainId: d.id,
      orgName: d.orgName,
      dataReady: pack !== undefined,
      openAgents: pack?.agentCount ?? 0,
      note: pack
        ? `업무 데이터가 준비돼 에이전트 ${pack.agentCount}종이 열려 있습니다.`
        : '업무 데이터가 없어 포털에서 고를 수 없습니다.',
    }
  })
  return Promise.resolve({ ok: true, data })
}
