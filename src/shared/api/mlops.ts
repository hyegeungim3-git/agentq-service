import type { Dataset, EvalResult, ModelVersion, TrainRun, Workspace } from '@entities/mlops/model'
import { DATASETS, EVAL_RESULTS, MODEL_VERSIONS, TRAIN_RUNS, WORKSPACES } from '@fixtures/mlops'
import type { ApiResult } from './domains'

/**
 * P4(인프라·개발)의 데이터 경계.
 *
 * ⚠️ 여기서 나오는 값은 **전부 예시**다. 인프라 수치는 업무 로직이 없어 숫자
 * 자체가 전부이므로, 화면이 반드시 '서버 미연결 — 예시 값'을 함께 그린다.
 *
 * 모델 응답에 **계보**(어떤 학습 작업·데이터셋에서 나왔는지)를 함께 달라고
 * 요청한다. 없으면 개인정보 삭제 요청이 왔을 때 어느 모델을 다시 학습해야
 * 하는지 답할 수 없다.
 */

export function fetchDatasets(): Promise<ApiResult<Dataset[]>> {
  // TODO(api-미확정): GET /datasets 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: DATASETS })
}

export function fetchWorkspaces(): Promise<ApiResult<Workspace[]>> {
  // TODO(api-미확정): GET /workspaces 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: WORKSPACES })
}

export function releaseWorkspace(id: string): Promise<ApiResult<never>> {
  void id
  // TODO(api-미확정): POST /workspaces/{id}:release 로 교체. 제거 조건 = 백엔드가 인증·회수 정책을 확정.
  return Promise.resolve({
    ok: false,
    error: '자원을 회수하지 못했습니다. 서버가 연결되지 않아 GPU는 그대로 잡혀 있습니다.',
  })
}

export function fetchModelVersions(): Promise<ApiResult<ModelVersion[]>> {
  // TODO(api-미확정): GET /models/versions 로 교체. 계보(trainJobId·datasetIds)를 함께 준다.
  return Promise.resolve({ ok: true, data: MODEL_VERSIONS })
}

export function fetchTrainRuns(): Promise<ApiResult<TrainRun[]>> {
  // TODO(api-미확정): GET /training/runs 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: TRAIN_RUNS })
}

export function fetchEvalResults(): Promise<ApiResult<EvalResult[]>> {
  // TODO(api-미확정): GET /evaluations 로 교체. 학습셋 겹침 여부를 함께 준다.
  return Promise.resolve({ ok: true, data: EVAL_RESULTS })
}
