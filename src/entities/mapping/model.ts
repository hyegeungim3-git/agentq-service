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

/**
 * 처리 유형. 설비 태그와 주소는 다루는 대상이 다르지만
 * **판정 3분류(auto·review·none)는 그대로 공유한다** — 어디까지가 자동인지
 * 나누는 것이 이 에이전트의 값어치이고, 그건 대상이 달라도 같다.
 */
export type MappingMode = 'tags' | 'address-single' | 'address-batch' | 'address-ocr' | 'code-lookup'

/** 주소 한 건의 표준화 결과 */
export type AddressResolution = {
  status: MappingStatus
  /** 0~1 */
  confidence: number
  roadAddress: string | null
  jibunAddress: string | null
  postalCode: string | null
  /** 법정동코드 10자리 */
  legalCode: string | null
  basis: MappingBasis[]
  alternatives: Alternative[]
  /** 표준화하려면 무엇이 바뀌어야 하는지 (status가 none일 때) */
  blocker: string | null
}

export type TagMappingResult = {
  mode: 'tags'
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

export type SingleAddressResult = {
  mode: 'address-single'
  input: string
  resolved: AddressResolution
  elapsedSeconds: number
}

export type BatchAddressRow = {
  id: string
  input: string
  resolved: AddressResolution
}

export type BatchAddressResult = {
  mode: 'address-batch'
  rows: BatchAddressRow[]
  elapsedSeconds: number
}

export type OcrAddressCandidate = {
  id: string
  /** 문서에서 뽑아낸 원문 */
  text: string
  lineNo: number
  /** OCR 자체 신뢰도 — 이게 낮으면 주소 표준화도 믿을 수 없다 */
  ocrConfidence: number
  resolved: AddressResolution
}

export type OcrAddressResult = {
  mode: 'address-ocr'
  documentName: string
  candidates: OcrAddressCandidate[]
  elapsedSeconds: number
}

export type CodeLookupResult = {
  mode: 'code-lookup'
  code: string
  /** 못 찾으면 null — 없는 것을 있는 것처럼 만들지 않는다 */
  found: {
    roadAddress: string
    jibunAddress: string
    legalCode: string
    /** 폐지된 코드면 후속 코드를 알려 준다 */
    supersededBy: string | null
    note: string
  } | null
  status: MappingStatus
  blocker: string | null
  elapsedSeconds: number
}

export type MappingResult =
  | TagMappingResult
  | SingleAddressResult
  | BatchAddressResult
  | OcrAddressResult
  | CodeLookupResult

const STATUS_LABEL: Record<MappingStatus, string> = {
  auto: '자동 확정 가능',
  review: '사람 확인 필요',
  none: '표준화 불가',
}

const MODE_LABEL: Record<MappingMode, string> = {
  tags: '설비 태그 매핑',
  'address-single': '단일 주소',
  'address-batch': '일괄 처리',
  'address-ocr': 'OCR 파일',
  'code-lookup': '코드 역조회',
}

const MODE_DESC: Record<MappingMode, string> = {
  tags: '수집 태그를 표준 명명규칙으로 매핑·정비',
  'address-single': '비정형 주소 1건을 도로명·우편번호·법정동코드로 변환',
  'address-batch': '협력사·사업장 목록을 붙여넣어 일괄 표준화',
  'address-ocr': '검사성적서·거래명세서에서 주소를 뽑아 표준화',
  'code-lookup': '법정동코드로 정식 주소를 역방향 조회',
}

export const MAPPING_MODES = Object.keys(MODE_LABEL) as MappingMode[]
export const mappingModeLabel = (m: MappingMode): string => MODE_LABEL[m]
export const mappingModeDesc = (m: MappingMode): string => MODE_DESC[m]

export const mappingStatusLabel = (s: MappingStatus): string => STATUS_LABEL[s]

/** 판정별 건수 — 요약에서 '몇 건이 사람 몫인지'를 먼저 말하기 위해 */
export function countByStatus(
  items: { resolved: AddressResolution }[],
): Record<MappingStatus, number> {
  return {
    auto: items.filter((i) => i.resolved.status === 'auto').length,
    review: items.filter((i) => i.resolved.status === 'review').length,
    none: items.filter((i) => i.resolved.status === 'none').length,
  }
}

/** 현재 표준화율 — 저장하지 않고 파생한다 */
export function standardizedRate(r: TagMappingResult): number {
  if (r.totalTags === 0) return 0
  return r.standardized / r.totalTags
}

/** 자동 확정을 반영했을 때의 표준화율 */
export function projectedRate(r: TagMappingResult, autoCount: number): number {
  if (r.totalTags === 0) return 0
  return (r.standardized + autoCount) / r.totalTags
}

export function byStatus(r: TagMappingResult, s: MappingStatus): MappingCandidate[] {
  return r.candidates.filter((c) => c.status === s)
}

/** AI로 해결되지 않는 건수 — 이 숫자가 현장 조치 계획의 근거가 된다 */
export function unsolvableCount(r: TagMappingResult): number {
  return r.reasons.filter((x) => !x.aiSolvable).reduce((s, x) => s + x.count, 0)
}
