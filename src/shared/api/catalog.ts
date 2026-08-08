import type { DataAsset, Lineage } from '@entities/catalog/model'
import { DATA_ASSETS, LINEAGES } from '@fixtures/catalog'
import type { ApiResult } from './domains'

/**
 * 데이터 카탈로그 · 리니지의 데이터 경계.
 *
 * ⚠️ 리니지는 **없으면 없는 대로** 돌려주기를 요청한다. 빈 계보를 그럴듯하게
 * 채워 보내면 화면이 '계보가 있다'고 그리고, 아무도 그 자산을 안 고친다.
 *
 * 표준화율은 **비율만이 아니라 기준 시점**과 함께 오는 것이 좋다. 지금은 비율만
 * 쓰지만, 언제 잰 비율인지 모르면 개선됐는지 나빠졌는지 말할 수 없다.
 */

export function fetchDataAssets(): Promise<ApiResult<DataAsset[]>> {
  // TODO(api-미확정): GET /catalog/assets 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: DATA_ASSETS })
}

export function fetchLineages(): Promise<ApiResult<Lineage[]>> {
  // TODO(api-미확정): GET /catalog/lineage 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: LINEAGES })
}
