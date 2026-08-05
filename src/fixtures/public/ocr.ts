/**
 * 공공(한국부동산원) 문서 인식.
 *
 * 인식 대상은 **서면으로 접수된 이의신청서**다. 실제로 이 조직에서 스캔을 뜨는
 * 문서이고, 데이터 분석 팩이 '서면 접수 61건은 사유 코드가 비어 있다'고 말한
 * 바로 그 문서다 — 두 화면이 한 이야기를 한다.
 *
 * 제조 팩과 같은 규칙:
 *  ① **신뢰도가 낮은 줄을 섞는다.** 전부 99%면 '못 읽은 곳' 표시가 죽은 코드가 된다.
 *  ② 개인정보가 실제로 들어 있다 — 마스킹을 껐을 때 무엇이 남는지 보여 줘야 한다.
 *  ③ 영문·숫자가 섞인 줄을 둔다 — 인식 언어 설정이 결과를 바꾸는 것을 보여 준다.
 */
import type { MaskEntry } from '@entities/ocr/model'
import { makeOcrSimulator, type OcrBaseLine, type OcrCorpus } from '../ocr'

const LINES: OcrBaseLine[] = [
  { index: 0, text: '표준지공시지가 이의신청서', confidence: 0.99, script: 'ko', numeric: false },
  {
    index: 1,
    text: '접수번호: AP-2026-0311',
    confidence: 0.96,
    script: 'mixed',
    numeric: true,
    tableRow: { label: '접수번호', value: 'AP-2026-0311' },
  },
  {
    index: 2,
    text: '신청인: 김서준  연락처: 010-2947-5518',
    confidence: 0.94,
    script: 'ko',
    numeric: false,
    tableRow: { label: '신청인', value: '김서준 / 010-2947-5518' },
    maskedText: '신청인: 김○○  연락처: 010-****-5518',
    maskedTableValue: '김○○ / 010-****-5518',
  },
  {
    index: 3,
    text: '대상 토지: 울산 남구 삼산동 1523-4',
    confidence: 0.93,
    script: 'ko',
    numeric: true,
    tableRow: { label: '대상 토지', value: '울산 남구 삼산동 1523-4' },
    maskedText: '대상 토지: 울산 남구 삼산동 ***',
    maskedTableValue: '울산 남구 삼산동 ***',
  },
  {
    index: 4,
    text: '이용상황: 상업용 (조사표 기재: 주거용)',
    confidence: 0.88,
    script: 'ko',
    numeric: false,
    tableRow: { label: '이용상황', value: '상업용 (조사표: 주거용)' },
    spec: { field: '이용상황', value: '상업용', limit: '조사표 기재와 일치', withinSpec: false },
  },
  {
    index: 5,
    text: '공시지가: 1,845,000 KRW/㎡ (전년 1,620,000)',
    confidence: 0.79,
    script: 'mixed',
    numeric: true,
    tableRow: { label: '공시지가', value: '1,845,000원/㎡' },
    spec: { field: '변동률', value: '13.9%', limit: '시·도 평균 3.24%', withinSpec: false },
  },
  {
    index: 6,
    text: '신청 사유: 인근 표준지 대비 과다 산정',
    confidence: 0.91,
    script: 'ko',
    numeric: false,
    tableRow: { label: '신청 사유', value: '인근 표준지 대비 과다 산정' },
  },
  {
    index: 7,
    text: '접수일: 2026-02-26',
    confidence: 0.97,
    script: 'ko',
    numeric: true,
    tableRow: { label: '접수일', value: '2026-02-26' },
    spec: { field: '처리 기한', value: '2026-03-28', limit: '접수일 +30일', withinSpec: true },
  },
]

const MASKS: MaskEntry[] = [
  { kind: 'name', original: '김서준', masked: '김○○', lineIndex: 2 },
  { kind: 'phone', original: '010-2947-5518', masked: '010-****-5518', lineIndex: 2 },
  { kind: 'address', original: '울산 남구 삼산동 1523-4', masked: '울산 남구 삼산동 ***', lineIndex: 3 },
]

export const PUBLIC_OCR_CORPUS: OcrCorpus = {
  title: '표준지공시지가 이의신청서',
  lines: LINES,
  masks: MASKS,
}

export const simulatePublicOcr = makeOcrSimulator(PUBLIC_OCR_CORPUS)
