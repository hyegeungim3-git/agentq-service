/**
 * 업무 문서 모델.
 *
 * 요약·번역·사전검토·OCR이 모두 같은 문서를 입력으로 받는다.
 * 요약 전용으로 두었다가 번역에서 같은 것이 필요해져 여기로 올렸다 —
 * 처음부터 공통화하지 않고 **두 번째 사용처가 생겼을 때** 옮겼다(가이드 §4).
 */

export type DocumentKind = 'sop' | 'report' | 'certificate' | 'minutes'

export type BusinessDocument = {
  id: string
  name: string
  kind: DocumentKind
  /** 바이트 원시값 — '2.1MB' 같은 표시 문자열로 굳히지 않는다 */
  sizeBytes: number
  /** 추출된 본문. 실제로는 서버가 파싱해서 준다 */
  text: string
}


/** 바이트를 사람이 읽는 단위로. 표시 변환은 한 곳에서만 한다. */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}
