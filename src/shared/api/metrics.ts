import type { LiveMetric } from '@entities/metric/model'
import { PRESS_VIBRATION } from '@fixtures/metrics'
import type { ApiResult } from './domains'

/**
 * 라이브 지표.
 *
 * 실제 서버는 값을 스트리밍하거나 짧은 주기로 폴링해 준다. 지금은 예시 곡선을
 * 통째로 주고 화면이 시간에 맞춰 재생한다 — 그래서 화면이 '예시 값'이라고 말한다.
 */
export function fetchLiveMetrics(): Promise<ApiResult<LiveMetric[]>> {
  // TODO(api-미확정): GET /metrics/live 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: [PRESS_VIBRATION] })
}
