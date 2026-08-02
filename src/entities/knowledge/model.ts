/**
 * 지식 검색 모델.
 *
 * 유사 도면 검색의 값어치는 순위가 아니라 **왜 이게 유사한가**다.
 * 유사도 92%만 보여 주면 담당자가 신뢰할 근거가 없다. 그래서 속성별
 * 일치/불일치를 함께 준다 — 어떤 축에서 닮았고 어디가 다른지 보여야 한다.
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
  id: string
  /** 도면 번호 */
  code: string
  name: string
  year: number
  /** 0~1 */
  similarity: number
  attributes: AttributeMatch[]
  /** 재사용할 수 있는 요소 */
  reusable: string[]
}

export type KnowledgeResult = {
  documentId: string
  /** 색인된 도면 수 — 얼마나 큰 모집단에서 찾았는지 */
  indexedCount: number
  hits: DrawingHit[]
  elapsedSeconds: number
}

export type KnowledgeRequest = {
  documentId: string
  /** 최소 유사도 — 낮추면 후보가 늘어난다 */
  minSimilarity: number
}

export const SIMILARITY_STEPS = [0.7, 0.8, 0.9] as const
export type SimilarityStep = (typeof SIMILARITY_STEPS)[number]

/** 일치한 속성 수 / 전체 — 유사도 점수의 근거를 숫자로 보여 준다 */
export function matchRatio(hit: DrawingHit): number {
  if (hit.attributes.length === 0) return 0
  return hit.attributes.filter((a) => a.matched).length / hit.attributes.length
}

/** 불일치 속성만 — 담당자가 확인해야 하는 지점 */
export function mismatches(hit: DrawingHit): AttributeMatch[] {
  return hit.attributes.filter((a) => !a.matched)
}
