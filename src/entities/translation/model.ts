/**
 * 문서 번역 모델.
 *
 * 제조 수출 문서(검사성적서·작업표준)를 대상으로 한다. 번역 자체보다
 * **용어집 일치**와 **역번역 검증**이 실무의 관심사다 — 규격 용어가 흔들리면
 * 해외 고객 검수에서 반려된다.
 */

export type LanguageCode = 'ko' | 'en' | 'ja' | 'zh'

export type TranslationTone = 'technical' | 'business' | 'plain'

export type GlossaryEntry = {
  source: string
  target: string
  /** 용어 분류 — 화면이 라벨을 조회한다 */
  category: 'process' | 'material' | 'quality' | 'equipment'
}

export type TranslationSegment = {
  id: number
  source: string
  target: string
  /** 이 문장에서 실제로 적용된 용어집 항목 */
  appliedTerms: string[]
  /** 0~1. 낮으면 사람이 봐야 한다 */
  confidence: number
}

export type BackTranslationCheck = {
  segmentId: number
  /** 번역문을 원문 언어로 되돌린 결과 */
  backText: string
  /** 원문과의 의미 일치도 0~1 */
  similarity: number
}

export type TranslationRequest = {
  documentId: string
  from: LanguageCode
  to: LanguageCode
  tone: TranslationTone
  useGlossary: boolean
}

export type TranslationResult = {
  documentId: string
  from: LanguageCode
  to: LanguageCode
  segments: TranslationSegment[]
  glossaryUsed: GlossaryEntry[]
  backChecks: BackTranslationCheck[]
  elapsedSeconds: number
}

/* ── 표시 규칙 ── */

const LANGUAGE_LABEL: Record<LanguageCode, string> = {
  ko: '한국어',
  en: '영어',
  ja: '일본어',
  zh: '중국어',
}

const TONE_LABEL: Record<TranslationTone, string> = {
  technical: '기술 문서체',
  business: '비즈니스체',
  plain: '평이한 표현',
}

const CATEGORY_LABEL: Record<GlossaryEntry['category'], string> = {
  process: '공정',
  material: '소재',
  quality: '품질',
  equipment: '설비',
}

export const LANGUAGES = Object.keys(LANGUAGE_LABEL) as LanguageCode[]
export const TONES = Object.keys(TONE_LABEL) as TranslationTone[]

export const languageLabel = (c: LanguageCode): string => LANGUAGE_LABEL[c]
export const toneLabel = (t: TranslationTone): string => TONE_LABEL[t]
export const categoryLabel = (c: GlossaryEntry['category']): string => CATEGORY_LABEL[c]

/** 사람이 봐야 하는 문장 — 임계값을 한 곳에서 정한다. */
export const REVIEW_THRESHOLD = 0.85

export function needsReview(seg: TranslationSegment): boolean {
  return seg.confidence < REVIEW_THRESHOLD
}

/** 역번역 일치도가 낮은 문장 — 의미가 틀어졌을 가능성 */
export function driftedChecks(checks: BackTranslationCheck[]): BackTranslationCheck[] {
  return checks.filter((c) => c.similarity < REVIEW_THRESHOLD)
}
