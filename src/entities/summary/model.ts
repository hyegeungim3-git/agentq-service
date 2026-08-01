/**
 * 문서 요약 모델.
 *
 * 이전 데모의 요약 데이터는 표시 속성이 섞여 있었다:
 *   { id:'핵심', label:'핵심 요약', border:'border-blue-400', bg:'bg-blue-50', dot:'bg-blue-500' }
 * Tailwind 클래스명이 데이터에 들어 있으면 서버가 줄 수 없고, 디자인을 바꾸면
 * 데이터를 고쳐야 한다. 여기서는 코드만 두고 표현은 화면이 정한다.
 */

/** 요약 방식. 한국어 라벨은 화면이 조회한다. */
export type SummaryStyle = 'brief' | 'detailed' | 'bullet' | 'table'

/** 목표 분량 — 글자 수 원시값. '300자' 같은 문자열로 굳히지 않는다. */
export type TargetLength = 100 | 300 | 500 | 1000

/** 요약에서 강조할 관점 */
export type FocusArea =
  | 'conclusion'
  | 'figures'
  | 'legal'
  | 'schedule'
  | 'risk'
  | 'action'

export type SummaryRequest = {
  documentId: string
  style: SummaryStyle
  targetLength: TargetLength
  focusAreas: FocusArea[]
}

export type Keyword = {
  word: string
  /** 0~1 가중치. 퍼센트 변환은 화면이 한다 */
  weight: number
}

export type SummarySection = {
  heading: string
  body: string
}

export type SummaryStats = {
  sourceChars: number
  summaryChars: number
  sectionCount: number
  /** 초 단위 처리 시간 */
  elapsedSeconds: number
}

export type SummaryResult = {
  documentId: string
  style: SummaryStyle
  sections: SummarySection[]
  keywords: Keyword[]
  stats: SummaryStats
}

/* ── 표시 규칙 — 한 곳에서만 정한다 ── */

const STYLE_LABEL: Record<SummaryStyle, string> = {
  brief: '핵심 요약',
  detailed: '상세 요약',
  bullet: '불릿 포인트',
  table: '표 형식',
}

const STYLE_DESC: Record<SummaryStyle, string> = {
  brief: '핵심 내용만 3~5줄',
  detailed: '섹션별 구조화 요약',
  bullet: '중요 항목 체계적 나열',
  table: '항목별 비교 표 출력',
}

const FOCUS_LABEL: Record<FocusArea, string> = {
  conclusion: '핵심 결론',
  figures: '수치·데이터',
  legal: '법적 근거',
  schedule: '일정·기한',
  risk: '위험 요소',
  action: '실행 항목',
}

export const SUMMARY_STYLES = Object.keys(STYLE_LABEL) as SummaryStyle[]
export const FOCUS_AREAS = Object.keys(FOCUS_LABEL) as FocusArea[]
export const TARGET_LENGTHS: TargetLength[] = [100, 300, 500, 1000]

export const styleLabel = (s: SummaryStyle): string => STYLE_LABEL[s]
export const styleDesc = (s: SummaryStyle): string => STYLE_DESC[s]
export const focusLabel = (f: FocusArea): string => FOCUS_LABEL[f]

/** 압축률 — 계산 가능한 값은 저장하지 않고 파생한다(가이드 §5). */
export function compressionRate(stats: SummaryStats): number {
  if (stats.sourceChars === 0) return 0
  return 1 - stats.summaryChars / stats.sourceChars
}
