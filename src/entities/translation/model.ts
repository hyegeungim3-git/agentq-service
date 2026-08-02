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
  /** 목표 언어별 대응어. 하나만 두면 언어를 바꿔도 같은 말이 나온다 */
  targets: Record<Exclude<LanguageCode, 'ko'>, string>
  /** 용어 분류 — 화면이 라벨을 조회한다 */
  category: 'process' | 'material' | 'quality' | 'equipment'
}

/** 원문을 어디서 받는가 */
export type TranslationSource = 'document' | 'text'

export type TranslationSegment = {
  id: number
  source: string
  target: string
  /** 이 문장에서 실제로 적용된 용어집 항목 */
  appliedTerms: string[]
  /** 0~1. 낮으면 사람이 봐야 한다 */
  confidence: number
  /**
   * 번역이 된 문장인가.
   * 직접 입력한 임의 문장은 엔진 없이 번역할 수 없다 — 그럴듯한 결과를 만드는 대신
   * 안 됐다고 표시한다.
   */
  translated: boolean
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
  source: TranslationSource
  from: LanguageCode
  to: LanguageCode
  tone: TranslationTone
  useGlossary: boolean
  /** 번역과 함께 요약까지 */
  withSummary: boolean
}

export type TranslationResult = {
  documentId: string
  source: TranslationSource
  from: LanguageCode
  to: LanguageCode
  segments: TranslationSegment[]
  /** 번역하지 못한 문장 수 — 감추면 번역이 다 된 줄 안다 */
  untranslated: number
  glossaryUsed: GlossaryEntry[]
  backChecks: BackTranslationCheck[]
  /** 번역+요약을 켰을 때만 채워진다 */
  summary: string | null
  elapsedSeconds: number
}

/**
 * 고를 수 있는 번역 방향.
 * 사내 문서는 한국어라 영→한은 직접 입력으로만 가능하다 — 그 제약을 타입이 아니라
 * 화면이 말해 준다(`documentAvailable`).
 */
export type Direction = { from: LanguageCode; to: LanguageCode }

export const DIRECTIONS: Direction[] = [
  { from: 'ko', to: 'en' },
  { from: 'ko', to: 'ja' },
  { from: 'ko', to: 'zh' },
  { from: 'en', to: 'ko' },
]

/** 사내 문서(한국어)를 원문으로 쓸 수 있는 방향인가 */
export const documentAvailable = (d: Direction): boolean => d.from === 'ko'

export const directionKey = (d: Direction): string => `${d.from}-${d.to}`

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
