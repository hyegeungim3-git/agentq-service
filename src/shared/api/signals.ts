import type { WorkSignal } from '@entities/signal/model'
import { SIGNALS } from '@fixtures/signals'
import type { ApiResult } from './domains'

/** 업무 신호 — 알림 센터와 오늘의 브리핑이 같은 것을 쓴다 */
export function fetchSignals(): Promise<ApiResult<WorkSignal[]>> {
  // TODO(api-미확정): GET /signals 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: SIGNALS })
}
