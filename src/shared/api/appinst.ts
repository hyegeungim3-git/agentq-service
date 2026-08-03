import type { AppInstance, PipelineRun } from '@entities/appinst/model'
import { APP_INSTANCES, PIPELINE_RUNS } from '@fixtures/appinst'
import type { ApiResult } from './domains'

/**
 * 앱 인스턴스 · RAG 파이프라인의 데이터 경계.
 *
 * 파이프라인 응답에 **단계별 들어온 수·나간 수·떨어진 이유**를 달라고 요청한다.
 * 최종 색인 건수만 오면 화면이 '어느 단계에서 떨어졌나'를 그릴 수 없고,
 * 그러면 고칠 곳을 찾지 못한다.
 */

export function fetchAppInstances(): Promise<ApiResult<AppInstance[]>> {
  // TODO(api-미확정): GET /apps/instances 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: APP_INSTANCES })
}

export function setInstanceLive(id: string, live: boolean): Promise<ApiResult<never>> {
  void id
  void live
  // TODO(api-미확정): PATCH /apps/instances/{id} 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error: '앱 상태를 바꾸지 못했습니다. 서버가 연결되지 않아 사용자에게는 그대로 보입니다.',
  })
}

export function fetchPipelineRuns(): Promise<ApiResult<PipelineRun[]>> {
  // TODO(api-미확정): GET /knowledge/pipeline-runs 로 교체. 단계별 in/out/사유를 함께 준다.
  return Promise.resolve({ ok: true, data: PIPELINE_RUNS })
}
