import type { ApiEntry, HrSyncState, Integration, PromptEntry } from '@entities/sysops/model'
import { APIS, HR_SYNC, INTEGRATIONS, PROMPTS } from '@fixtures/sysops'
import type { ApiResult } from './domains'

/**
 * HR 연계 · API · 외부 연동의 데이터 경계.
 *
 * ⚠️ **키 재발급 응답에 키 원문을 담지 않는다.** 발급 순간 한 번만 사용자에게
 * 보여 주고 서버도 원문을 갖지 않는 것이 맞다. 조회로 다시 볼 수 있으면
 * 관리 화면을 여는 사람 모두가 모든 키를 갖게 된다.
 */

export function fetchHrSync(): Promise<ApiResult<HrSyncState>> {
  // TODO(api-미확정): GET /integrations/hr 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: HR_SYNC })
}

export function runHrSync(): Promise<ApiResult<never>> {
  // TODO(api-미확정): POST /integrations/hr:sync 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '동기화를 실행하지 못했습니다. 서버가 연결되지 않아 인사 정보를 가져올 곳이 없습니다 — 밀린 처리도 그대로입니다.',
  })
}

export function fetchApis(): Promise<ApiResult<ApiEntry[]>> {
  // TODO(api-미확정): GET /apis 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: APIS })
}

export function reissueApiKey(apiId: string): Promise<ApiResult<never>> {
  void apiId
  // TODO(api-미확정): POST /apis/{id}/keys 로 교체. 응답에 키 원문을 한 번만 담는다.
  //   제거 조건 = 백엔드가 인증·키 보관 방식을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '키를 재발급하지 못했습니다. 서버가 연결되지 않았습니다 — 쓰던 키는 그대로 살아 있습니다.',
  })
}

export function fetchPrompts(): Promise<ApiResult<PromptEntry[]>> {
  // TODO(api-미확정): GET /prompts 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: PROMPTS })
}

export function fetchIntegrations(): Promise<ApiResult<Integration[]>> {
  // TODO(api-미확정): GET /integrations 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: INTEGRATIONS })
}
