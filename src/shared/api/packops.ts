import type { Deployment, DomainPack, ToolEntry } from '@entities/packops/model'
import { AGENTS } from '@entities/agent/model'
import { DEPLOYMENTS } from '@fixtures/packops'
import { DOMAIN_FIXTURES } from '@fixtures/domains'
import { packStatuses, type DomainPackData } from '@fixtures/packs'
import { sectorLabel } from '@entities/domain/model'
import type { ApiResult } from './domains'
import { withPack, withPackOf } from './pack'

/**
 * 도메인 팩 · 도구/배포의 데이터 경계.
 *
 * 팩 상태는 **포털의 발주처 선택 가능 여부와 같은 근거**여야 한다.
 * 여기서 '준비됨'인데 포털에서 못 고르면 어느 쪽이 맞는지 알 수 없다.
 */

export function fetchPacks(): Promise<ApiResult<DomainPack[]>> {
  /* 팩 현황도 레지스트리에서 뽑는다 — 노출 현황과 같은 근거여야 한다.
     예전에는 여기에 표를 따로 뒀고, 네 번째 발주처를 열자 갈라졌다. */
  // TODO(api-미확정): GET /packs 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  const byId = new Map(packStatuses().map((p) => [p.domainId, p]))
  const data: DomainPack[] = DOMAIN_FIXTURES.map((d) => {
    const pack = byId.get(d.id)
    return {
      domainId: d.id,
      orgName: d.orgName,
      sector: sectorLabel(d.sector),
      filled: (pack?.filled ?? []) as DomainPack['filled'],
      usable: pack !== undefined,
    }
  })
  return Promise.resolve({ ok: true, data })
}

export function createPack(orgName: string): Promise<ApiResult<never>> {
  void orgName
  // TODO(api-미확정): POST /packs 로 교체. 제거 조건 = 백엔드가 인증·저장소를 확정.
  return Promise.resolve({
    ok: false,
    error:
      '팩을 만들지 못했습니다. 서버가 연결되지 않아 업무 데이터를 올릴 곳이 없습니다 — 포털에는 아무 발주처도 추가되지 않았습니다.',
  })
}

/**
 * 이 도구를 **실제로 부르는** 에이전트 이름.
 *
 * 손으로 적어 두었더니 어긋났다 — 안전관리계획이 지식 검색을 부르는데
 * 그 도구의 사용처 목록에는 없어서, 화면이 '끊기면 멈추는 에이전트'를
 * 실제보다 적게 말하고 있었다. 정의에서 유도하면 어긋날 자리가 없다.
 */
function usedBy(pack: DomainPackData, toolId: string): string[] {
  const ids = pack.agentDefs
    .filter((d) => d.steps.some((s) => s.toolIds.includes(toolId)))
    .map((d) => d.agentId)
  return ids.map((id) => AGENTS.find((a) => a.id === id)?.name ?? id)
}

/**
 * 도구는 **발주처마다 다르다.** 공장은 MES를, 시청은 처리 대장을 부른다.
 * 관리자는 발주처 소속이 아니므로 어느 발주처의 도구인지 화면이 말해야 한다(§3-2-1).
 */
export function fetchTools(domainId?: string | null): Promise<ApiResult<ToolEntry[]>> {
  // TODO(api-미확정): GET /tools 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  const read = (p: DomainPackData): ToolEntry[] =>
    p.tools.map((t) => ({ ...t, usedBy: usedBy(p, t.id) }))
  /* 인자를 안 주면 지금 발주처(포털), 주면 그 발주처(관리자) */
  return domainId === undefined ? withPack(read) : withPackOf(domainId, read)
}

/** 배포는 발주처별이 아니다 — 플랫폼이 한 번 올리면 모든 발주처가 그 버전을 쓴다 */
export function fetchDeployments(): Promise<ApiResult<Deployment[]>> {
  // TODO(api-미확정): GET /deployments 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: DEPLOYMENTS })
}

export function promote(target: string, version: string): Promise<ApiResult<never>> {
  void target
  void version
  // TODO(api-미확정): POST /deployments:promote 로 교체. 제거 조건 = 백엔드가 인증·배포 경로를 확정.
  return Promise.resolve({
    ok: false,
    error: '운영 반영을 실행하지 못했습니다. 배포는 서버가 합니다 — 운영 버전은 그대로입니다.',
  })
}
