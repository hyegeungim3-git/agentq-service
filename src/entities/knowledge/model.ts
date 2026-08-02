/**
 * 지식 검색 모델.
 *
 * 검색의 값어치는 순위가 아니라 **왜 이게 걸렸는가**와 **무엇이 빠졌는가**다.
 * 유사도 92%만 보여 주면 담당자가 신뢰할 근거가 없고,
 * 필터에 걸려 빠진 문서를 말하지 않으면 '없다'로 읽힌다 — 있는데 안 보여 준 것뿐인데.
 */

export type AttributeMatch = {
  label: string
  /** 검색 대상(신규 사양)의 값 */
  queryValue: string
  /** 후보 도면의 값 */
  candidateValue: string
  matched: boolean
}

export type DrawingHit = {
  /** 도면 번호 */
  code: string
  year: number
  attributes: AttributeMatch[]
  /** 재사용할 수 있는 요소 */
  reusable: string[]
}

/** 검색 방식. 찾는 것도, 보여 주는 근거도 다르다 */
export type SearchMode = 'semantic' | 'fulltext'

/** 문서 보안 등급 */
export type SecurityLevel = 'public' | 'internal' | 'confidential'

export type KnowledgeBase = {
  id: string
  name: string
  docCount: number
  /** 'YYYY-MM-DD' */
  updatedAt: string
}

export type SearchHit = {
  id: string
  title: string
  baseId: string
  security: SecurityLevel
  /** 본문 발췌 — 전문 검색이면 일치한 말이 들어 있는 문장이다 */
  snippet: string
  /** 0~1 */
  score: number
  /** 왜 걸렸는지. 전문 검색은 정확히 일치한 말, 시맨틱은 이어진 개념 */
  matchedTerms: string[]
  /** 도면이면 속성 대조까지 준다 */
  drawing?: DrawingHit
}

export type KnowledgeResult = {
  query: string
  mode: SearchMode
  /** 고른 범위의 문서 수 — 얼마나 큰 모집단에서 찾았는지 */
  indexedCount: number
  hits: SearchHit[]
  /** 조건에 맞았지만 상위 N에 잘린 건수 */
  truncated: number
  /** 보안 등급 필터에 걸려 빠진 건수 — 감추면 '없다'로 읽힌다 */
  excludedBySecurity: number
  /** 검색 범위에서 뺀 지식베이스 때문에 못 본 건수 */
  excludedByScope: number
  elapsedSeconds: number
}

export type KnowledgeRequest = {
  query: string
  mode: SearchMode
  /** 검색할 지식베이스 id들 */
  baseIds: string[]
  /** 'all'이면 전 등급, 아니면 그 등급만 */
  security: SecurityLevel | 'all'
  topK: number
}

export const TOP_K_STEPS = [3, 5, 10] as const
export type TopKStep = (typeof TOP_K_STEPS)[number]

const MODE_LABEL: Record<SearchMode, string> = {
  semantic: '시맨틱 검색',
  fulltext: '전문 검색',
}
const MODE_DESC: Record<SearchMode, string> = {
  semantic: '뜻이 가까운 문서까지 — 말이 달라도 찾는다',
  fulltext: '입력한 말이 그대로 있는 문서만 — 인용 문장을 보여 준다',
}

const SECURITY_LABEL: Record<SecurityLevel, string> = {
  public: '일반',
  internal: '내부',
  confidential: '대외비',
}

export const SEARCH_MODES = Object.keys(MODE_LABEL) as SearchMode[]
export const SECURITY_LEVELS = Object.keys(SECURITY_LABEL) as SecurityLevel[]

export const searchModeLabel = (m: SearchMode): string => MODE_LABEL[m]
export const searchModeDesc = (m: SearchMode): string => MODE_DESC[m]
export const securityLabel = (s: SecurityLevel): string => SECURITY_LABEL[s]

/** 일치한 속성 수 / 전체 — 유사도 점수의 근거를 숫자로 보여 준다 */
export function matchRatio(d: DrawingHit): number {
  if (d.attributes.length === 0) return 0
  return d.attributes.filter((a) => a.matched).length / d.attributes.length
}

/** 불일치 속성만 — 담당자가 확인해야 하는 지점 */
export function mismatches(d: DrawingHit): AttributeMatch[] {
  return d.attributes.filter((a) => !a.matched)
}

/** 필터 때문에 빠진 것이 있는가 — 있으면 '검색 결과 없음'을 그대로 믿으면 안 된다 */
export function hasHiddenByFilter(r: KnowledgeResult): boolean {
  return r.excludedBySecurity > 0 || r.excludedByScope > 0
}
