/**
 * 내규·규정 조회 모델.
 *
 * 규정 조회의 값어치는 답변 문장이 아니라 **어느 조항에 근거했는가**다.
 * 근거 없는 답은 실무에서 쓸 수 없으므로, 인용 없는 답변이 나오지 않도록
 * 결과에 citations를 필수로 둔다.
 */

export type RegulationCategory = 'labor' | 'purchase' | 'safety' | 'security'

export type Citation = {
  /** 규정 이름 + 조항 — '취업규칙 제23조 제2항' */
  clause: string
  /** 인용 원문. 요약이 아니라 그대로 */
  text: string
  /** 최종 개정일 — 오래된 근거는 사람이 확인해야 한다 */
  revisedOn: string
}

export type RegulationAnswer = {
  question: string
  answer: string
  citations: Citation[]
  /** 관련은 있으나 직접 근거는 아닌 조항 */
  related: string[]
  elapsedSeconds: number
}

export type RegulationRequest = {
  question: string
  categories: RegulationCategory[]
}

const CATEGORY_LABEL: Record<RegulationCategory, string> = {
  labor: '취업·복무',
  purchase: '구매·계약',
  safety: '안전보건',
  security: '보안·개인정보',
}

export const REGULATION_CATEGORIES = Object.keys(CATEGORY_LABEL) as RegulationCategory[]
export const categoryLabel = (c: RegulationCategory): string => CATEGORY_LABEL[c]

/** 개정 후 오래 지난 근거 — 기준을 한 곳에서 정한다 */
const STALE_YEARS = 3

export function isStale(citation: Citation, now: Date = new Date()): boolean {
  const revised = new Date(citation.revisedOn)
  const years = (now.getTime() - revised.getTime()) / (365.25 * 24 * 3600 * 1000)
  return years >= STALE_YEARS
}
