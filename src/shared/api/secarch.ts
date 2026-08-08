import type { BoundaryRule, DataFlow, ExternalAccess } from '@entities/secarch/model'
import { BOUNDARY_RULES, DATA_FLOWS, EXTERNAL_ACCESS } from '@fixtures/secarch'
import type { ApiResult } from './domains'

/**
 * 보안 아키텍처의 데이터 경계.
 *
 * ⚠️ 응답에 **게이트웨이 주소·토큰·내부 호스트명을 담지 않기를 요청한다.** 이 화면은
 * 캡처되고 공유된다. 흐름을 보여 주는 데 주소는 필요 없다(API 키를 목록에 두지 않는
 * 것과 같은 이유 — §2-9).
 *
 * 등급별 정책은 **선언된 정책**이다. 실제로 막고 있는지는 게이트웨이가 답해야 하며,
 * 그 확인 API가 생기면 화면이 '정책'과 '실제'를 나란히 놓을 수 있다.
 */

export function fetchDataFlows(): Promise<ApiResult<DataFlow[]>> {
  // TODO(api-미확정): GET /security/flows 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: DATA_FLOWS })
}

export function fetchBoundaryRules(): Promise<ApiResult<BoundaryRule[]>> {
  // TODO(api-미확정): GET /security/boundary-policy 로 교체. 제거 조건 = 보안(§3-3)이 등급별 정책을 확정.
  return Promise.resolve({ ok: true, data: BOUNDARY_RULES })
}

export function fetchExternalAccess(): Promise<ApiResult<ExternalAccess[]>> {
  // TODO(api-미확정): GET /security/external-access 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: EXTERNAL_ACCESS })
}
