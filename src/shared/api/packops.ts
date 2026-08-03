import type { Deployment, DomainPack, ToolEntry } from '@entities/packops/model'
import { DEPLOYMENTS, PACKS, TOOLS } from '@fixtures/packops'
import type { ApiResult } from './domains'

/**
 * 도메인 팩 · 도구/배포의 데이터 경계.
 *
 * 팩 상태는 **포털의 발주처 선택 가능 여부와 같은 근거**여야 한다.
 * 여기서 '준비됨'인데 포털에서 못 고르면 어느 쪽이 맞는지 알 수 없다.
 */

export function fetchPacks(): Promise<ApiResult<DomainPack[]>> {
  // TODO(api-미확정): GET /packs 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: PACKS })
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

export function fetchTools(): Promise<ApiResult<ToolEntry[]>> {
  // TODO(api-미확정): GET /tools 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: TOOLS })
}

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
