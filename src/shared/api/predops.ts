import type { DriftItem, PredModel, RetrainRun } from '@entities/predops/model'
import { DRIFT_ITEMS, PRED_MODELS, RETRAIN_RUNS } from '@fixtures/predops'
import type { ApiResult } from './domains'

/**
 * 예측 모델 운영의 데이터 경계.
 *
 * ⚠️ 지표 응답에 **방향(`direction`)을 반드시 함께** 담기를 요청한다. 값과 임계만 오면
 * 화면이 '높을수록 좋다'를 추측해야 하고, MAE 같은 지표에서 정확히 거꾸로 그린다.
 *
 * 재학습 실행·승격은 **성공한 척하지 않는다.** 재학습은 GPU를 잡고 몇 시간 도는 일이고,
 * 승격은 서비스 중인 모델을 바꾸는 일이다. 화면에서만 바꾸면 바꾼 줄 알고 닫는데
 * 사용자는 옛 모델의 답을 계속 받는다(D-009).
 */

export function fetchPredModels(): Promise<ApiResult<PredModel[]>> {
  // TODO(api-미확정): GET /predops/models 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: PRED_MODELS })
}

export function fetchDriftItems(): Promise<ApiResult<DriftItem[]>> {
  // TODO(api-미확정): GET /predops/drift 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: DRIFT_ITEMS })
}

export function fetchRetrainRuns(): Promise<ApiResult<RetrainRun[]>> {
  // TODO(api-미확정): GET /predops/retrain-runs 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: RETRAIN_RUNS })
}

export function promoteChallenger(runId: string): Promise<ApiResult<never>> {
  // TODO(api-미확정): POST /predops/retrain-runs/{id}:promote 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({
    ok: false,
    error: `승격(${runId})은 서비스 중인 모델을 바꾸는 일이라 서버가 처리해야 합니다. 서버가 연결되지 않아 실행하지 못했습니다.`,
  })
}
