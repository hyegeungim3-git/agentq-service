/**
 * 분석 데이터셋 접근 경계.
 */
import type { Dataset } from '@entities/dataset/model'
import { DATASETS } from '@fixtures/datasets'
import type { ApiResult } from './domains'

export function fetchDatasets(): Promise<ApiResult<Dataset[]>> {
  // TODO(api-미확정): GET /datasets 로 교체. 제거 조건 = API 명세 확정.
  return Promise.resolve({ ok: true, data: DATASETS })
}
