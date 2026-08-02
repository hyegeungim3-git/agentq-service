/**
 * 기준정보 표준화 모델.
 *
 * 이 화면의 값어치는 '자동으로 다 해 준다'가 아니라 **어디까지가 자동이고
 * 어디부터 사람이 판단해야 하는지 나누는 것**이다.
 *
 * 그래서 후보마다 판정 상태를 셋으로 나눈다:
 *   auto   신뢰도가 높아 자동 확정 가능
 *   review 근거는 있으나 사람이 골라야 함 (후보가 둘 이상이거나 단위 환산이 필요)
 *   none   AI가 해결할 수 없음 — 설비 교체·양식 개선 같은 현장 조치가 필요
 *
 * none을 review에 섞으면 '검토만 하면 다 된다'는 착각을 만든다.
 */

export type MappingStatus = 'auto' | 'review' | 'none'

export type MappingBasis = {
  label: string
  detail: string
}

export type Alternative = {
  code: string
  name: string
  confidence: number
  /** 왜 이게 1순위가 아닌지 */
  reason: string
}

export type MappingCandidate = {
  id: string
  /** 원본 태그 — 현장에서 쓰던 표기 */
  source: string
  sourceSystem: string
  /** 제안 표준 코드. 없으면 '-' */
  suggested: string
  standardName: string
  /** 0~1 */
  confidence: number
  status: MappingStatus
  basis: MappingBasis[]
  alternatives: Alternative[]
  /** 표준화하려면 무엇이 바뀌어야 하는지 (status가 none일 때) */
  blocker: string | null
}

export type UnmatchedReason = {
  label: string
  count: number
  /** AI가 처리 가능한지 — 불가한 것을 가능한 것처럼 세면 계획이 어긋난다 */
  aiSolvable: boolean
  action: string
}

export type MappingResult = {
  /** 수집된 전체 태그 수 */
  totalTags: number
  /** 이미 표준화된 수 */
  standardized: number
  candidates: MappingCandidate[]
  reasons: UnmatchedReason[]
  /** 자동 확정 가능한 전체 건수 — 화면의 후보 목록은 이 중 일부를 보여 주는 예시다.
      예시 행 수로 표준화율을 계산하면 4,820개 모집단에서 아무 변화가 없다. */
  autoConfirmable: number
  /** 표준 명명규칙 */
  namingPattern: string
  namingExample: string
  elapsedSeconds: number
}

const STATUS_LABEL: Record<MappingStatus, string> = {
  auto: '자동 확정 가능',
  review: '사람 확인 필요',
  none: '표준화 불가',
}

export const mappingStatusLabel = (s: MappingStatus): string => STATUS_LABEL[s]

/** 현재 표준화율 — 저장하지 않고 파생한다 */
export function standardizedRate(r: MappingResult): number {
  if (r.totalTags === 0) return 0
  return r.standardized / r.totalTags
}

/** 자동 확정을 반영했을 때의 표준화율 */
export function projectedRate(r: MappingResult, autoCount: number): number {
  if (r.totalTags === 0) return 0
  return (r.standardized + autoCount) / r.totalTags
}

export function byStatus(r: MappingResult, s: MappingStatus): MappingCandidate[] {
  return r.candidates.filter((c) => c.status === s)
}

/** AI로 해결되지 않는 건수 — 이 숫자가 현장 조치 계획의 근거가 된다 */
export function unsolvableCount(r: MappingResult): number {
  return r.reasons.filter((x) => !x.aiSolvable).reduce((s, x) => s + x.count, 0)
}
