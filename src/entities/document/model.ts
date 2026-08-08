/**
 * 업무 문서 모델.
 *
 * 요약·번역·사전검토·OCR이 모두 같은 문서를 입력으로 받는다.
 * 요약 전용으로 두었다가 번역에서 같은 것이 필요해져 여기로 올렸다 —
 * 처음부터 공통화하지 않고 **두 번째 사용처가 생겼을 때** 옮겼다(가이드 §4).
 */

export type DocumentKind = 'sop' | 'report' | 'certificate' | 'minutes'

import type { SecurityLevel } from '@entities/knowledgebase/model'

export type BusinessDocument = {
  id: string
  name: string
  kind: DocumentKind
  /** 바이트 원시값 — '2.1MB' 같은 표시 문자열로 굳히지 않는다 */
  sizeBytes: number
  /** 추출된 본문. 실제로는 서버가 파싱해서 준다 */
  text: string
  /** 지식베이스에 등록된 날 */
  registeredOn: string
  /** 이 문서를 누가 볼 수 있는가 */
  security: SecurityLevel
  /** 색인이 끝나 검색에 잡히는가. 아니면 목록에 있어도 못 찾는다 */
  indexed: boolean
  /**
   * 이 문서를 넣을 때 거친 처리 — 'DRM 자동해제', 'OCR 적용' 같은 것.
   *
   * 문서마다 다르고, 무엇을 거쳤는지가 **답변 품질의 이유**가 된다.
   * 스캔본을 OCR로 읽었다면 오탈자가 섞일 수 있다는 뜻이다.
   */
  tags: string[]
}


/** 바이트를 사람이 읽는 단위로. 표시 변환은 한 곳에서만 한다. */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}
