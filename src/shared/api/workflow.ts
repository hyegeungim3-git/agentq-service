import type { Workflow } from '@entities/workflow/model'
import { WORKFLOWS } from '@fixtures/workflow'
import type { ApiResult } from './domains'

/**
 * 워크플로우의 데이터 경계.
 *
 * 실행 이력에 **어느 분기를 탔는지**와 **어느 노드에서 멈췄는지**를 함께 달라고
 * 요청한다. 성공률만 오면 화면이 '왜 실패했나'와 '안 타는 분기'를 그릴 수 없다.
 */

export function fetchWorkflows(): Promise<ApiResult<Workflow[]>> {
  // TODO(api-미확정): GET /workflows 로 교체. 분기 이력·실패 노드를 함께 준다.
  return Promise.resolve({ ok: true, data: WORKFLOWS })
}

export function setWorkflowEnabled(id: string, enabled: boolean): Promise<ApiResult<never>> {
  void id
  void enabled
  // TODO(api-미확정): PATCH /workflows/{id} 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error: '워크플로우 상태를 바꾸지 못했습니다. 서버가 연결되지 않아 지금 도는 흐름은 그대로입니다.',
  })
}
