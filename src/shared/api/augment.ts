import type { CacheEntry, Route, Strategy } from '@entities/augment/model'
import { CACHE_ENTRIES, ROUTES, STRATEGIES } from '@fixtures/augment'
import type { ApiResult } from './domains'

/**
 * 지식 증강 전략의 데이터 경계.
 *
 * ⚠️ 캐시 응답에 **올릴 때의 원문 버전과 지금 원문 버전을 모두** 담기를 요청한다.
 * '최신/재적재 필요' 같은 판정만 오면 화면이 그 판정을 그대로 그리게 되고,
 * 판정 기준이 서버에 숨는다. 두 버전이 오면 화면이 직접 비교할 수 있다.
 *
 * 순서 바꾸기·재적재는 **서버가 해야 실제로 바뀐다.** 화면에서만 바꾸면 바꾼 줄 알고
 * 닫는데 라우팅은 그대로다(계정 정지·업로드와 같은 처리 — D-009).
 */

export function fetchStrategies(): Promise<ApiResult<Strategy[]>> {
  // TODO(api-미확정): GET /augment/strategies 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: STRATEGIES })
}

export function fetchRoutes(): Promise<ApiResult<Route[]>> {
  // TODO(api-미확정): GET /augment/routes 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: ROUTES })
}

export function fetchCacheEntries(): Promise<ApiResult<CacheEntry[]>> {
  // TODO(api-미확정): GET /augment/cache 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: CACHE_ENTRIES })
}

export function reloadCacheEntry(id: string): Promise<ApiResult<never>> {
  // TODO(api-미확정): POST /augment/cache/{id}:reload 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({
    ok: false,
    error: `다시 올리기(${id})는 서버가 원문을 읽어 캐시를 교체해야 합니다. 서버가 연결되지 않아 실행하지 못했습니다.`,
  })
}
