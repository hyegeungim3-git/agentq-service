/**
 * 지식 증강 전략 — RAG · CAG · TAG.
 *
 * "RAG 하나로 다 한다"가 아니라 질의 성격에 맞는 방법을 골라 쓴다는 것을 관리할 수
 * 있게 만든 화면이다. 규정 조회에 매번 벡터 검색을 도는 것은 낭비고, 집계 수치를
 * 문서 검색으로 답하면 **틀린다**.
 *
 * 이 화면의 위험한 자리는 캐시(CAG)다. 원문이 바뀌었는데 다시 안 올리면
 * **옛 내용으로 자신 있게 답한다.** 규정·표준 문서에서 특히 위험하다.
 * 지식 관리의 '색인 뒤 바뀜'과 다른 것이다 — 저기는 검색 색인, 여기는 미리 올려 둔 본문.
 *
 * 라우팅은 **위에서부터** 적용된다. 순서가 결과를 바꾸므로 순서 자체가 설정이다.
 */

export type StrategyId = 'rag' | 'cag' | 'tag'

export const STRATEGY_LABEL: Record<StrategyId, string> = {
  rag: 'RAG',
  cag: 'CAG',
  tag: 'TAG',
}

export type Strategy = {
  id: StrategyId
  fullName: string
  what: string
  /** 어떤 자료에 쓰는가 */
  targets: string[]
  /** 전체 질의 중 이 방법으로 답한 비율(%) */
  share: number
  avgLatencyMs: number
  /** 근거를 찾아낸 비율(%) */
  hitRate: number
  strength: string
  /** 이 방법이 못 하는 것 — 강점만 적으면 고를 수 없다 */
  caveat: string
}

/** 비중 합이 100이 아니면 어딘가 빠졌다는 뜻이다 */
export const shareTotal = (list: Strategy[]): number => list.reduce((n, s) => n + s.share, 0)

export type Route = {
  id: string
  /** 위에서부터 적용된다 — 이 값이 곧 우선순위다 */
  order: number
  when: string
  keywords: string
  strategy: StrategyId
  hits: number
  enabled: boolean
}

/** 실제로 적용되는 순서대로 */
export const inOrder = (list: Route[]): Route[] => [...list].sort((a, b) => a.order - b.order)

/**
 * 꺼져 있어서 아래 규칙으로 흘러가는 것.
 *
 * 규칙이 목록에 있으면 도는 줄 안다. 꺼진 규칙이 있으면 그 질의가 **어디로 가는지**를
 * 말해야 한다 — 집계 질의가 문서 검색으로 가면 답이 틀린다.
 */
export const disabled = (list: Route[]): Route[] => list.filter((r) => !r.enabled)

/** 꺼진 규칙 다음에 걸리는 규칙 — 그 질의가 실제로 가는 곳 */
export function fallbackFor(list: Route[], route: Route): Route | null {
  return inOrder(list).find((r) => r.order > route.order && r.enabled) ?? null
}

export type CacheEntry = {
  id: string
  name: string
  tokens: string
  loadedAt: string
  /** 캐시에 올릴 때의 원문 버전 */
  loadedRev: string
  /** 지금 원문 버전 */
  currentRev: string
  hits: number
}

/** 원문이 바뀌었는데 다시 안 올린 것 — 옛 내용으로 답한다 */
export const staleCache = (list: CacheEntry[]): CacheEntry[] =>
  list.filter((c) => c.loadedRev !== c.currentRev)
