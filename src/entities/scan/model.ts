/**
 * 설비·로트 코드 스캔.
 *
 * 현장에서 "PRS-C03 진동 어때?"를 **장갑 낀 손으로 타이핑하는 것**이 실제 병목이다.
 * 설비에 붙은 코드를 찍는 것이 제조의 표준 동선이다.
 *
 * ⚠️ **카메라에만 기대지 않는다.** 브라우저가 코드 인식을 지원하지 않거나, 권한이
 * 거부되거나, 조명이 나쁘면 못 읽는다. 그때 아무것도 못 하면 그 기능은 현장에서
 * 없는 것과 같다. 그래서 **등록 코드 목록과 직접 입력을 항상 함께** 둔다.
 *
 * ⚠️ **등록되지 않은 코드를 추측하지 않는다.** 비슷한 코드로 넘겨짚으면 옆 설비의
 * 상태를 그 설비의 것으로 읽게 된다.
 */

export type ScanKind = 'equipment' | 'lot' | 'workOrder' | 'material'

export const SCAN_KIND_LABEL: Record<ScanKind, string> = {
  equipment: '설비',
  lot: '로트',
  workOrder: '작업지시',
  material: '자재',
}

export type ScanTarget = {
  code: string
  kind: ScanKind
  name: string
  /** 이 대상을 찍었을 때 물어볼 문장 — 찍는 이유가 곧 질문이다 */
  ask: string
}

/**
 * 코드로 대상을 찾는다.
 *
 * 대소문자와 앞뒤 공백은 무시한다 — 스캐너와 사람이 넣는 형태가 다르다.
 * 그 이상은 봐주지 않는다: 못 찾으면 못 찾았다고 한다.
 */
export function lookupCode(list: ScanTarget[], raw: string): ScanTarget | null {
  const code = raw.trim().toLowerCase()
  if (code === '') return null
  return list.find((t) => t.code.toLowerCase() === code) ?? null
}

/** 브라우저가 코드 인식을 할 수 있는가 — 없으면 목록·직접 입력으로 간다 */
export const cameraScanSupported = (): boolean =>
  typeof window !== 'undefined' && 'BarcodeDetector' in window
