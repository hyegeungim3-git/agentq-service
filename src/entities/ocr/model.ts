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

export type OcrResult = {
  documentId: string
  lines: OcrLine[]
  /** 마스킹을 켰을 때만 채워진다 */
  masks: MaskEntry[]
  elapsedSeconds: number
}

export type OcrRequest = {
  documentId: string
  maskPii: boolean
}

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
