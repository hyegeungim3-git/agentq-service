/**
 * 도메인 데이터 접근 경계.
 *
 * 화면은 이 함수만 부른다. 지금은 fixture를 돌려주고, 서버가 정해지면
 * **이 파일 안에서만** fetch로 바꾼다. 호출부는 손대지 않는다.
 *
 * 반환 타입이 Promise인 이유: 지금 동기라고 동기로 두면 나중에 전부 바꿔야 한다.
 * 비동기 경계를 처음부터 열어 두는 편이 싸다.
 *
 * ⚠️ API 계약이 미확정이므로 여기서 운영 계약을 만들지 않는다(가이드 §6).
 * 엔드포인트·인증·에러 코드는 백엔드가 정해지면 그때 채운다.
 */
import type { Domain } from '@entities/domain/model'
import { DOMAIN_FIXTURES } from '@fixtures/domains'

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/** 전체 도메인 목록. 포털 선택 화면이 쓴다. */
export function fetchDomains(): Promise<ApiResult<Domain[]>> {
  // TODO(api-미확정): 서버 확정 시 GET /domains 로 교체. 제거 조건 = API 명세 확정.
  // 지금은 동기지만 반환 타입은 Promise로 고정한다 — 나중에 호출부를 바꾸지 않기 위해서다.
  return Promise.resolve({ ok: true, data: DOMAIN_FIXTURES })
}

/** 단일 도메인. 없으면 실패를 실패로 돌려준다 — 빈 객체로 얼버무리지 않는다. */
export function fetchDomain(id: string): Promise<ApiResult<Domain>> {
  const found = DOMAIN_FIXTURES.find((d) => d.id === id)
  return Promise.resolve(
    found ? { ok: true, data: found } : { ok: false, error: `알 수 없는 도메인: ${id}` },
  )
}
