import type { EvidenceItem, McpServer, Volume } from '@entities/evidence/model'
import { EVIDENCE, MCP_SERVERS, VOLUMES } from '@fixtures/evidence'
import type { ApiResult } from './domains'

/**
 * 이행 증거 · MCP 서버 · 공유 볼륨의 데이터 경계.
 *
 * 증거 목록은 **지금 이 저장소의 실제 상태**다. 서버가 붙어 기록이 쌓이기
 * 시작하면 `store`가 'none'에서 'server'로 바뀐다 — 그 변화가 곧 진척이다.
 *
 * ⚠️ MCP 서버 응답에 **주소·토큰을 넣지 않기를 요청한다.** 관리 화면에 인프라
 * 주소를 늘어놓을 이유가 없고, 키를 안 보여 주는 이유와 같다.
 */

export function fetchEvidence(): Promise<ApiResult<EvidenceItem[]>> {
  // TODO(api-미확정): GET /compliance/evidence 로 교체. 제거 조건 = 백엔드가 감사 기록 범위를 확정.
  return Promise.resolve({ ok: true, data: EVIDENCE })
}

export function fetchMcpServers(): Promise<ApiResult<McpServer[]>> {
  // TODO(api-미확정): GET /tools/servers 로 교체. 주소·토큰은 응답에 넣지 않는다.
  return Promise.resolve({ ok: true, data: MCP_SERVERS })
}

export function fetchVolumes(): Promise<ApiResult<Volume[]>> {
  // TODO(api-미확정): GET /volumes 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: VOLUMES })
}

export function releaseVolume(id: string): Promise<ApiResult<never>> {
  void id
  // TODO(api-미확정): DELETE /volumes/{id} 로 교체. 제거 조건 = 백엔드가 인증·보관 정책을 확정.
  return Promise.resolve({
    ok: false,
    error: '볼륨을 비우지 못했습니다. 서버가 연결되지 않아 저장 공간은 그대로 잡혀 있습니다.',
  })
}
