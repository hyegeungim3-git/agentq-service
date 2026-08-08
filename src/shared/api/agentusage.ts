import type { AgentActivity } from '@entities/agentusage/model'
import { withPack } from './pack'
import type { ApiResult } from './domains'

/**
 * 에이전트 사용 현황의 데이터 경계.
 *
 * ⚠️ 응답에 **순위를 담지 않기를 요청한다.** 횟수만 주면 화면이 센다.
 * 순위까지 오면 두 값이 어긋나는 날이 오고, 그때 어느 쪽이 맞는지 알 수 없다.
 *
 * '지금 하면 좋을 일'은 **AI 판단이 아니다.** 업무 상태에서 나오는 것이므로
 * 서버가 그 상태를 보고 만든다 — 화면이 추천이라고 부르지 않는 이유다.
 */

export function fetchAgentActivity(): Promise<ApiResult<AgentActivity>> {
  // TODO(api-미확정): GET /agents/activity 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return withPack((pack) => pack.activity)
}
