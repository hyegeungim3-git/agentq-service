import type {
  ConfidencePolicy,
  GuardrailRule,
  ModelEntry,
  QualityReview,
  RerankPipeline,
} from '@entities/llmops/model'
import { CONFIDENCE_POLICY, GUARDRAILS, MODELS, PIPELINES, REVIEWS } from '@fixtures/llmops'
import type { ApiResult } from './domains'

/**
 * LLM 운영의 데이터 경계.
 *
 * 조회는 되고 **바꾸는 것은 안 된다.** 모델 파라미터·가드레일 스위치·임계값은
 * 서비스 전체의 답변을 바꾸는 설정이다. 서버 없이 화면에서만 바꾸면
 * 바꾼 줄 알고 닫는데 실제 답변은 그대로다 — 가장 위험한 종류의 거짓말이다.
 */

export function fetchModels(): Promise<ApiResult<ModelEntry[]>> {
  // TODO(api-미확정): GET /llm/models 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: MODELS })
}

export function updateModelParams(
  modelId: string,
  params: { temperature: number },
): Promise<ApiResult<never>> {
  void modelId
  void params
  // TODO(api-미확정): PATCH /llm/models/{id} 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '모델 설정을 저장하지 못했습니다. 서버가 연결되지 않았습니다 — 지금 사용자에게 나가는 답변은 그대로입니다.',
  })
}

export function fetchPipelines(): Promise<ApiResult<RerankPipeline[]>> {
  // TODO(api-미확정): GET /llm/rerank-pipelines 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: PIPELINES })
}

export function fetchGuardrails(): Promise<ApiResult<GuardrailRule[]>> {
  // TODO(api-미확정): GET /llm/guardrails 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: GUARDRAILS })
}

export function toggleGuardrail(ruleId: string, enabled: boolean): Promise<ApiResult<never>> {
  void ruleId
  void enabled
  // TODO(api-미확정): PATCH /llm/guardrails/{id} 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '가드레일 설정을 저장하지 못했습니다. 서버가 연결되지 않아 실제 필터는 바뀌지 않았습니다.',
  })
}

export function fetchConfidencePolicy(): Promise<ApiResult<ConfidencePolicy>> {
  // TODO(api-미확정): GET /llm/confidence-policy 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: CONFIDENCE_POLICY })
}

export function fetchQualityReviews(): Promise<ApiResult<QualityReview[]>> {
  // TODO(api-미확정): GET /quality/reviews 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: REVIEWS })
}
