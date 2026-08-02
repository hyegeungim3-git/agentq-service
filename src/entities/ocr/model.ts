/**
 * 문서 인식(OCR) 모델.
 *
 * OCR의 실무 관심사는 '텍스트가 나왔다'가 아니라 두 가지다.
 *   ① 어디를 못 읽었는가 — 신뢰도가 낮은 줄을 숨기면 잘못된 값이 그대로 흘러간다
 *   ② 개인정보를 가렸는가 — 가렸다고 말만 하면 안 되고 무엇을 가렸는지 남겨야 한다
 */

export type PiiKind = 'name' | 'phone' | 'address' | 'birth' | 'account'

export type OcrLine = {
  index: number
  text: string
  /** 0~1 */
  confidence: number
}

export type MaskEntry = {
  kind: PiiKind
  original: string
  masked: string
  /** 몇 번째 줄에서 가렸는지 */
  lineIndex: number
}

/* ── 인식 설정 ──────────────────────────────────────────────
   설정은 전부 결과를 바꾼다. 결과가 그대로인 설정은 있으나 마나 한 것이 아니라
   거짓말이다 — 사용자는 자기가 고른 것이 반영됐다고 믿는다. */

/** 인식 언어. 문서와 맞지 않으면 그 문자 종류의 신뢰도가 떨어진다 */
export type OcrLanguage = 'ko' | 'ko-en' | 'en'

/** 처리 모드. 성적서 특화는 KS 검사 양식을 알고 있어 치수·공차를 항목으로 뽑는다 */
export type OcrMode = 'standard' | 'inspection'

/** 내보내기 형식 */
export type OcrFormat = 'text' | 'markdown' | 'json'

export type OcrTableRow = { label: string; value: string }

/** 규격 대비 판정까지 뽑은 항목 — 특화 모드에서만 나온다 */
export type OcrSpecField = {
  field: string
  value: string
  limit: string
  withinSpec: boolean
}

export type OcrResult = {
  documentId: string
  lines: OcrLine[]
  /** 마스킹을 켰을 때만 채워진다 */
  masks: MaskEntry[]
  /** 표 추출을 켰을 때만 */
  table: OcrTableRow[]
  /** 성적서 특화 모드에서만 */
  specFields: OcrSpecField[]
  /** 고른 형식으로 내보낼 본문 */
  exportText: string
  /**
   * 설정 때문에 결과가 나빠졌으면 그 사실을 말한다.
   * 신뢰도만 떨어뜨려 놓고 이유를 감추면 사용자는 스캔본을 탓한다.
   */
  notes: string[]
  elapsedSeconds: number
}

export type OcrRequest = {
  documentId: string
  maskPii: boolean
  language: OcrLanguage
  mode: OcrMode
  format: OcrFormat
  extractTables: boolean
  /** 숫자·기호를 정밀하게 읽는다. 느려지는 대신 수치 줄의 신뢰도가 올라간다 */
  precisionNumbers: boolean
}

const LANGUAGE_LABEL: Record<OcrLanguage, string> = {
  ko: '한국어',
  'ko-en': '한국어+영어',
  en: '영어만',
}
const LANGUAGE_DESC: Record<OcrLanguage, string> = {
  ko: '한글 위주 문서',
  'ko-en': '규격·단위가 영문인 문서',
  en: '영문 문서',
}

const MODE_LABEL: Record<OcrMode, string> = {
  standard: '표준 모드',
  inspection: '도면·성적서 특화',
}
const MODE_DESC: Record<OcrMode, string> = {
  standard: '범용 문서 인식',
  inspection: 'KS 검사 양식 · 치수·공차를 항목으로 추출',
}

const FORMAT_LABEL: Record<OcrFormat, string> = {
  text: '일반 텍스트',
  markdown: '마크다운',
  json: 'JSON 구조화',
}

export const OCR_LANGUAGES = Object.keys(LANGUAGE_LABEL) as OcrLanguage[]
export const OCR_MODES = Object.keys(MODE_LABEL) as OcrMode[]
export const OCR_FORMATS = Object.keys(FORMAT_LABEL) as OcrFormat[]

export const ocrLanguageLabel = (l: OcrLanguage): string => LANGUAGE_LABEL[l]
export const ocrLanguageDesc = (l: OcrLanguage): string => LANGUAGE_DESC[l]
export const ocrModeLabel = (m: OcrMode): string => MODE_LABEL[m]
export const ocrModeDesc = (m: OcrMode): string => MODE_DESC[m]
export const ocrFormatLabel = (f: OcrFormat): string => FORMAT_LABEL[f]

const PII_LABEL: Record<PiiKind, string> = {
  name: '성명',
  phone: '연락처',
  address: '주소',
  birth: '생년월일',
  account: '계좌번호',
}

export const piiLabel = (k: PiiKind): string => PII_LABEL[k]

/** 사람이 확인해야 하는 줄 — 기준을 한 곳에서 정한다 */
export const LOW_CONFIDENCE = 0.85

export function lowConfidenceLines(lines: OcrLine[]): OcrLine[] {
  return lines.filter((l) => l.confidence < LOW_CONFIDENCE)
}

/** 전체 평균 신뢰도 — 저장하지 않고 파생한다 */
export function averageConfidence(lines: OcrLine[]): number {
  if (lines.length === 0) return 0
  return lines.reduce((s, l) => s + l.confidence, 0) / lines.length
}
