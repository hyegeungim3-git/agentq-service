/**
 * 문서 요약 fixture.
 *
 * 세계관은 제조(한빛정밀)를 기본으로 한다. 요약 결과는 요청한 style에 따라
 * 다르게 나와야 하므로 style별로 준비했다 — 무엇을 고르든 같은 결과가 나오면
 * 시연에서 바로 들킨다.
 */
import type { SourceDocument, SummaryResult, SummaryStyle } from '@entities/summary/model'

export const SOURCE_DOCUMENTS: SourceDocument[] = [
  {
    id: 'doc-press-sop',
    name: '프레스_작업표준서_SOP-PR-011.pdf',
    sizeBytes: 2_205_184,
    text: `프레스 작업표준서 (SOP-PR-011)

제1장 적용 범위
본 표준은 창원본사공장 프레스 라인 전 설비에 적용한다. 400t 서보 프레스와
200t 크랭크 프레스를 포함하며, 금형 교체와 일상 점검 절차를 규정한다.

제2장 작업 전 점검
작업 개시 전 유압 압력, 슬라이드 하강 속도, 안전 플러그 체결 상태를 확인한다.
점검 결과는 일일 점검표에 기록하며 이상 발견 시 즉시 정지하고 보전팀에 통보한다.

제3장 금형 교체
금형 교체는 SMED 절차를 따르며 표준 소요 시간은 25분이다. 2인 1조로 수행하고
크레인 작업 구간에는 통제선을 설치한다. 교체 후 초품 검사를 반드시 실시한다.

제4장 금형 수명 관리
타수 50만 타를 교체 기준으로 하며, 타수 도달 전이라도 버 발생이 관리 기준을
초과하면 교체한다. 교체 이력은 설비 대장에 기록한다.

제5장 이상 대응
진동 RMS가 관리 기준 3.5mm/s를 초과하면 예지보전 알람이 발생한다. 알람 발생 시
운전을 계속하지 말고 보전팀 진단을 받는다. 연속 초과 시 계획정지에 편성한다.`,
  },
  {
    id: 'doc-quality-report',
    name: '2026년_1분기_품질동향조사.pdf',
    sizeBytes: 1_468_006,
    text: `2026년 1분기 품질동향조사

1. 개요
7개 사업장 214개 관리 항목을 대상으로 분기 품질 동향을 조사하였다.

2. 주요 지표
전사 공정 불량률은 0.42%로 전분기 대비 0.06%p 개선되었다. 개선의 주요 원인은
2월 금형 교체(M-204)로 인한 치수 불량 감소이다.

3. 부적합 현황
수입검사 부적합은 9로트 중 1로트로 조건부 합격 처리되었다. 협력사 검사성적서
판정 보류는 3건이며 두께 측정값 재확인을 요청하였다.

4. 개선 과제
침탄로 3호기 후단존 온도 편차가 관리 한계를 초과한 상태가 지속되고 있다.
열전대 재교정으로 편차가 일부 개선되었으나 근본 조치가 필요하다.`,
  },
]

/** style별 요약 결과. 실제로는 서버가 생성한다. */
export const SUMMARY_RESULTS: Record<string, Record<SummaryStyle, SummaryResult>> = {
  'doc-press-sop': {
    brief: {
      documentId: 'doc-press-sop',
      style: 'brief',
      sections: [
        {
          heading: '핵심',
          body: '창원본사공장 프레스 라인의 작업 전 점검, 금형 교체(SMED 표준 25분), 수명 관리(50만 타), 이상 대응 절차를 규정한 표준서다. 진동 RMS 3.5mm/s 초과 시 운전을 멈추고 보전 진단을 받도록 정한 것이 핵심 통제점이다.',
        },
      ],
      keywords: [
        { word: '금형 교체', weight: 0.94 },
        { word: 'SMED', weight: 0.88 },
        { word: '진동 RMS', weight: 0.82 },
        { word: '타수 수명', weight: 0.71 },
        { word: '초품 검사', weight: 0.64 },
      ],
      stats: { sourceChars: 612, summaryChars: 118, sectionCount: 1, elapsedSeconds: 6.2 },
    },
    detailed: {
      documentId: 'doc-press-sop',
      style: 'detailed',
      sections: [
        { heading: '적용 범위', body: '창원본사공장 프레스 라인 전 설비. 400t 서보 프레스와 200t 크랭크 프레스를 포함하며 금형 교체와 일상 점검 절차를 다룬다.' },
        { heading: '작업 전 점검', body: '유압 압력·슬라이드 하강 속도·안전 플러그 체결을 확인하고 일일 점검표에 기록한다. 이상 발견 시 즉시 정지 후 보전팀 통보.' },
        { heading: '금형 교체', body: 'SMED 절차, 표준 25분, 2인 1조. 크레인 구간에 통제선을 설치하고 교체 후 초품 검사를 의무화한다.' },
        { heading: '수명 관리', body: '타수 50만 타가 교체 기준이나, 버 발생이 관리 기준을 넘으면 타수 도달 전에도 교체한다. 이력은 설비 대장에 기록.' },
        { heading: '이상 대응', body: '진동 RMS 3.5mm/s 초과 시 예지보전 알람. 운전을 계속하지 않고 보전 진단을 받으며, 연속 초과 시 계획정지에 편성한다.' },
      ],
      keywords: [
        { word: '금형 교체', weight: 0.94 },
        { word: 'SMED', weight: 0.88 },
        { word: '진동 RMS', weight: 0.82 },
        { word: '타수 수명', weight: 0.71 },
        { word: '초품 검사', weight: 0.64 },
        { word: '일일 점검표', weight: 0.58 },
      ],
      stats: { sourceChars: 612, summaryChars: 396, sectionCount: 5, elapsedSeconds: 7.4 },
    },
    bullet: {
      documentId: 'doc-press-sop',
      style: 'bullet',
      sections: [
        { heading: '적용 범위', body: '창원본사공장 프레스 라인 전 설비 (400t 서보 · 200t 크랭크)' },
        { heading: '점검', body: '유압 압력 · 슬라이드 하강 속도 · 안전 플러그 체결 / 일일 점검표 기록' },
        { heading: '교체', body: 'SMED 표준 25분 · 2인 1조 · 통제선 설치 · 초품 검사 의무' },
        { heading: '수명', body: '타수 50만 타 또는 버 관리 기준 초과 시 교체' },
        { heading: '이상', body: '진동 RMS 3.5mm/s 초과 → 알람 → 운전 정지 → 보전 진단' },
      ],
      keywords: [
        { word: '금형 교체', weight: 0.94 },
        { word: 'SMED', weight: 0.88 },
        { word: '진동 RMS', weight: 0.82 },
        { word: '타수 수명', weight: 0.71 },
      ],
      stats: { sourceChars: 612, summaryChars: 214, sectionCount: 5, elapsedSeconds: 5.8 },
    },
    table: {
      documentId: 'doc-press-sop',
      style: 'table',
      sections: [
        { heading: '금형 교체 표준 시간', body: '25분' },
        { heading: '금형 타수 수명 기준', body: '50만 타' },
        { heading: '진동 관리 기준', body: '3.5mm/s (RMS)' },
        { heading: '교체 작업 인원', body: '2인 1조' },
        { heading: '교체 후 필수 절차', body: '초품 검사' },
      ],
      keywords: [
        { word: '관리 기준', weight: 0.91 },
        { word: '금형 교체', weight: 0.86 },
        { word: '진동 RMS', weight: 0.79 },
      ],
      stats: { sourceChars: 612, summaryChars: 96, sectionCount: 5, elapsedSeconds: 5.1 },
    },
  },
  'doc-quality-report': {
    brief: {
      documentId: 'doc-quality-report',
      style: 'brief',
      sections: [
        {
          heading: '핵심',
          body: '7개 사업장 214개 항목 조사 결과 전사 불량률은 0.42%로 전분기 대비 0.06%p 개선됐다. 개선 원인은 2월 금형 교체(M-204)다. 침탄로 3호기 온도 편차 초과가 미해결 과제로 남아 있다.',
        },
      ],
      keywords: [
        { word: '불량률', weight: 0.93 },
        { word: '침탄로', weight: 0.84 },
        { word: '금형 교체', weight: 0.77 },
        { word: '수입검사', weight: 0.62 },
      ],
      stats: { sourceChars: 341, summaryChars: 104, sectionCount: 1, elapsedSeconds: 4.6 },
    },
    detailed: {
      documentId: 'doc-quality-report',
      style: 'detailed',
      sections: [
        { heading: '조사 개요', body: '7개 사업장 214개 관리 항목 대상 분기 품질 동향 조사.' },
        { heading: '주요 지표', body: '전사 공정 불량률 0.42% — 전분기 대비 0.06%p 개선. 2월 금형 교체(M-204)에 따른 치수 불량 감소가 주 원인.' },
        { heading: '부적합 현황', body: '수입검사 9로트 중 1로트 조건부 합격. 협력사 검사성적서 판정 보류 3건, 두께 측정값 재확인 요청.' },
        { heading: '개선 과제', body: '침탄로 3호기 후단존 온도 편차가 관리 한계 초과 상태로 지속. 열전대 재교정으로 일부 개선됐으나 근본 조치 필요.' },
      ],
      keywords: [
        { word: '불량률', weight: 0.93 },
        { word: '침탄로', weight: 0.84 },
        { word: '금형 교체', weight: 0.77 },
        { word: '수입검사', weight: 0.62 },
        { word: '열전대', weight: 0.55 },
      ],
      stats: { sourceChars: 341, summaryChars: 268, sectionCount: 4, elapsedSeconds: 5.9 },
    },
    bullet: {
      documentId: 'doc-quality-report',
      style: 'bullet',
      sections: [
        { heading: '조사 규모', body: '7개 사업장 · 214개 관리 항목' },
        { heading: '불량률', body: '0.42% (전분기 대비 -0.06%p)' },
        { heading: '개선 원인', body: '2월 금형 교체 M-204 → 치수 불량 감소' },
        { heading: '부적합', body: '수입검사 1로트 조건부 · 성적서 보류 3건' },
        { heading: '미해결', body: '침탄로 3호기 후단존 온도 편차 초과' },
      ],
      keywords: [
        { word: '불량률', weight: 0.93 },
        { word: '침탄로', weight: 0.84 },
        { word: '금형 교체', weight: 0.77 },
      ],
      stats: { sourceChars: 341, summaryChars: 152, sectionCount: 5, elapsedSeconds: 4.9 },
    },
    table: {
      documentId: 'doc-quality-report',
      style: 'table',
      sections: [
        { heading: '조사 사업장', body: '7개소' },
        { heading: '관리 항목', body: '214개' },
        { heading: '전사 불량률', body: '0.42% (전분기 대비 -0.06%p)' },
        { heading: '수입검사 부적합', body: '9로트 중 1로트 (조건부 합격)' },
        { heading: '성적서 판정 보류', body: '3건' },
      ],
      keywords: [
        { word: '불량률', weight: 0.93 },
        { word: '관리 항목', weight: 0.71 },
        { word: '수입검사', weight: 0.62 },
      ],
      stats: { sourceChars: 341, summaryChars: 88, sectionCount: 5, elapsedSeconds: 4.2 },
    },
  },
}
