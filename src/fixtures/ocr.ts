/**
 * OCR fixture.
 *
 * 신뢰도가 낮은 줄을 일부러 섞었다. 전부 99%면 '못 읽은 곳' 표시가
 * 죽은 코드가 되고, 실제 스캔본에서 흐릿한 줄이 나올 때 화면이 대응하지 못한다.
 */
import type { MaskEntry, OcrLine } from '@entities/ocr/model'

export const OCR_LINES: OcrLine[] = [
  { index: 0, text: '수입검사 성적서', confidence: 0.99 },
  { index: 1, text: '공급업체: 대성정밀공업(주)', confidence: 0.97 },
  { index: 2, text: '담당자: 정하늘  연락처: 010-4821-7734', confidence: 0.95 },
  { index: 3, text: '품명: 냉간압연강판 SPCC 2.0T', confidence: 0.98 },
  { index: 4, text: '로트번호: SPCC-2211', confidence: 0.96 },
  // 흐릿하게 찍힌 줄 — 숫자를 잘못 읽으면 판정이 뒤집힌다
  { index: 5, text: '경도: 58.4 HRC (규격 58.0 이상)', confidence: 0.71 },
  { index: 6, text: '두께 편차: ±0.03mm', confidence: 0.82 },
  { index: 7, text: '판정: 조건부 합격', confidence: 0.94 },
  { index: 8, text: '검사일: 2026-03-14', confidence: 0.97 },
]

export const OCR_MASKS: MaskEntry[] = [
  { kind: 'name', original: '정하늘', masked: '정○○', lineIndex: 2 },
  { kind: 'phone', original: '010-4821-7734', masked: '010-****-7734', lineIndex: 2 },
]

/** 마스킹 적용본 — 원문과 같은 줄 수를 유지한다 */
export const OCR_LINES_MASKED: OcrLine[] = OCR_LINES.map((l) =>
  l.index === 2 ? { ...l, text: '담당자: 정○○  연락처: 010-****-7734' } : l,
)
