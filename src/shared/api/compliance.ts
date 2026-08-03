import type { AiSystem, Assessment, GuardrailHit, LabelRule } from '@entities/compliance/model'
import { AI_SYSTEMS, ASSESSMENTS, HITS, LABEL_RULES } from '@fixtures/compliance'
import type { ApiResult } from './domains'

/**
 * 가드레일 이력 · AI 기본법 대응의 데이터 경계.
 *
 * ⚠️ 차단 이력 응답에 **걸린 원문을 담지 않기를 요청한다.** 종류와 건수면 충분하다.
 * 개인정보를 가리려고 만든 규칙의 이력에 그 개인정보가 실려 있으면 앞뒤가 안 맞는다.
 */

export function fetchGuardrailHits(): Promise<ApiResult<GuardrailHit[]>> {
  // TODO(api-미확정): GET /guardrails/hits 로 교체. 제거 조건 = 백엔드가 보관 정책을 확정.
  return Promise.resolve({ ok: true, data: HITS })
}

export function fetchAiSystems(): Promise<ApiResult<AiSystem[]>> {
  // TODO(api-미확정): GET /compliance/systems 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: AI_SYSTEMS })
}

export function fetchLabelRules(): Promise<ApiResult<LabelRule[]>> {
  // TODO(api-미확정): GET /compliance/labeling 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: LABEL_RULES })
}

export function fetchAssessments(): Promise<ApiResult<Assessment[]>> {
  // TODO(api-미확정): GET /compliance/assessments 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: ASSESSMENTS })
}
