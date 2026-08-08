import type { ScanTarget } from '@entities/scan/model'
import { SCAN_TARGETS } from '@fixtures/scan'
import type { ApiResult } from './domains'

/**
 * 스캔 등록부의 데이터 경계.
 *
 * ⚠️ 등록부는 **설비 대장이 정본**이다. 화면이 목록을 들고 있으면 설비를 늘릴 때마다
 * 화면을 고쳐야 하고, 현장에 붙은 코드와 갈라진 채로 남는다.
 */

export function fetchScanTargets(): Promise<ApiResult<ScanTarget[]>> {
  // TODO(api-미확정): GET /scan/targets 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: SCAN_TARGETS })
}
