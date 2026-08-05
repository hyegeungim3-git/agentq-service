/**
 * 문서 사전 검토 모델.
 *
 * 기안문을 사규와 대조해 위반 소지를 찾는다. 실무의 관심사는 '몇 점인가'가
 * 아니라 **어느 조항에 걸렸고 무엇을 고쳐야 하는가**다. 그래서 점수는 저장하지
 * 않고 위반 목록에서 파생한다.
 */

export type Severity = 'high' | 'medium' | 'low'

/**
 * 대조할 규정 묶음.
 *
 * 코드는 **발주처가 정한다.** 예전에는 다섯 개를 여기 못박아 두고 라벨까지 들고
 * 있었는데, 그 라벨이 '품질경영매뉴얼'처럼 제조 전용이었다 — 두 번째 발주처를
 * 열자마자 드러났다. 이름은 팩이 주고, 여기서는 **묶음이 있다는 사실**만 다룬다.
 */
export type RegulationSet = string

/** 화면이 고를 수 있는 규정 묶음 — 발주처마다 다르다 */
export type RegulationSetOption = {
  code: RegulationSet
  label: string
}

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

export const SEVERITIES = Object.keys(SEVERITY_LABEL) as Severity[]

export const severityLabel = (s: Severity): string => SEVERITY_LABEL[s]

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
