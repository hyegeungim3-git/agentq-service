/**
 * 안전관리계획 모델.
 *
 * 위험성평가는 '위험요인을 나열하는 것'이 아니라 **빈도 × 강도로 등급을 매기고
 * 그 등급에 맞는 대책을 붙이는 것**이다. 등급은 저장하지 않고 두 값에서 계산한다 —
 * 따로 저장하면 값과 등급이 어긋나는 순간이 온다.
 */

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export type Hazard = {
  id: string
  /** 작업 단계 */
  step: string
  /** 위험 요인 */
  cause: string
  /** 발생 빈도 1~5 */
  frequency: number
  /** 피해 강도 1~5 */
  severity: number
  /** 저감 대책 */
  control: string
  /** 대책 적용 후 남는 위험 — 0으로 만들 수 없다는 것을 드러낸다 */
  residual: string
}

export type SafetyPlan = {
  documentId: string
  taskName: string
  hazards: Hazard[]
  /** 근거 법령·사내 규정 */
  references: string[]
  elapsedSeconds: number
}

export type SafetyRequest = {
  documentId: string
  /** 작업 인원 — 2인 미만이면 일부 대책이 성립하지 않는다 */
  crewSize: number
}

const LEVEL_LABEL: Record<RiskLevel, string> = {
  critical: '매우 높음',
  high: '높음',
  medium: '보통',
  low: '낮음',
}

export const riskLevelLabel = (l: RiskLevel): string => LEVEL_LABEL[l]

/** 위험 점수 = 빈도 × 강도 (1~25) */
export function riskScore(h: Hazard): number {
  return h.frequency * h.severity
}

/** 점수 → 등급. 기준을 한 곳에서만 정한다. */
export function riskLevel(h: Hazard): RiskLevel {
  const s = riskScore(h)
  if (s >= 16) return 'critical'
  if (s >= 10) return 'high'
  if (s >= 5) return 'medium'
  return 'low'
}

/** 즉시 조치가 필요한 위험 — 계획서에서 가장 먼저 봐야 하는 것 */
export function criticalHazards(hazards: Hazard[]): Hazard[] {
  return hazards.filter((h) => riskLevel(h) === 'critical')
}
