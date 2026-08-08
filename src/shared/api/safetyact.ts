import type { RiskAssessment, SafetyDuty, SafetyTraining } from '@entities/safetyact/model'
import { RISK_ASSESSMENTS, SAFETY_DUTIES, SAFETY_TRAININGS } from '@fixtures/safetyact'
import type { ApiResult } from './domains'

/**
 * 중대재해처벌법 대응의 데이터 경계.
 *
 * ⚠️ 증빙 응답에 **갱신 시각을 반드시 담기를 요청한다.** 이행 여부만 오면 화면은
 * 한 번 초록색이 된 항목을 영원히 초록색으로 그린다. 낡은 증빙이 살아 있는 증빙처럼
 * 보이는 것이 이 화면에서 가장 위험하다.
 */

export function fetchSafetyDuties(): Promise<ApiResult<SafetyDuty[]>> {
  // TODO(api-미확정): GET /safety/duties 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: SAFETY_DUTIES })
}

export function fetchRiskAssessments(): Promise<ApiResult<RiskAssessment[]>> {
  // TODO(api-미확정): GET /safety/risk-assessments 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: RISK_ASSESSMENTS })
}

export function fetchSafetyTrainings(): Promise<ApiResult<SafetyTraining[]>> {
  // TODO(api-미확정): GET /safety/trainings 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: SAFETY_TRAININGS })
}
