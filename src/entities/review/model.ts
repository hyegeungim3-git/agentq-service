/**
 * 문서 사전 검토 모델.
 *
 * 기안문을 사규와 대조해 위반 소지를 찾는다. 실무의 관심사는 '몇 점인가'가
 * 아니라 **어느 조항에 걸렸고 무엇을 고쳐야 하는가**다. 그래서 점수는 저장하지
 * 않고 위반 목록에서 파생한다.
 */

export type Severity = 'high' | 'medium' | 'low'

/** 대조할 규정 묶음 */
export type RegulationSet = 'labor' | 'purchase' | 'safety' | 'quality' | 'security'

export type Violation = {
  id: string
  /** 걸린 조항 — 근거 없는 지적은 실무에서 무시된다 */
  clause: string
  severity: Severity
  /** 위반 유형 한 줄 */
  type: string
  /** 무엇이 문제인지 */
  detail: string
  /** 무엇을 하면 되는지 — 조치가 없으면 검토 결과가 아니라 잔소리다 */
  action: string
}

export type ReviewRequest = {
  documentId: string
  regulationSets: RegulationSet[]
}

export type ReviewResult = {
  documentId: string
  violations: Violation[]
  /** 대조한 조항 수 — 얼마나 훑었는지 */
  checkedClauses: number
  elapsedSeconds: number
}

/* ── 표시 규칙 ── */

const SEVERITY_LABEL: Record<Severity, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
}

const REGULATION_LABEL: Record<RegulationSet, string> = {
  labor: '취업규칙·복무규정',
  purchase: '구매·계약 규정',
  safety: '안전보건관리규정',
  quality: '품질경영매뉴얼',
  security: '보안정책·개인정보',
}

export const SEVERITIES = Object.keys(SEVERITY_LABEL) as Severity[]
export const REGULATION_SETS = Object.keys(REGULATION_LABEL) as RegulationSet[]

export const severityLabel = (s: Severity): string => SEVERITY_LABEL[s]
export const regulationLabel = (r: RegulationSet): string => REGULATION_LABEL[r]

/** 심각도별 감점 — 규칙을 한 곳에 둔다 */
const PENALTY: Record<Severity, number> = { high: 20, medium: 10, low: 5 }

/** 준수 점수는 저장하지 않고 위반에서 계산한다(가이드 §5). */
export function complianceScore(violations: Violation[]): number {
  const deducted = violations.reduce((sum, v) => sum + PENALTY[v.severity], 0)
  return Math.max(0, 100 - deducted)
}

export function countBySeverity(violations: Violation[]): Record<Severity, number> {
  return {
    high: violations.filter((v) => v.severity === 'high').length,
    medium: violations.filter((v) => v.severity === 'medium').length,
    low: violations.filter((v) => v.severity === 'low').length,
  }
}

/** 상신 가능 여부 — 심각도 높음이 남아 있으면 막는다 */
export function canSubmit(violations: Violation[]): boolean {
  return violations.every((v) => v.severity !== 'high')
}
