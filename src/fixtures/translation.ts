/**
 * 문서 번역 fixture.
 *
 * 세계관은 요약 fixture와 같은 제조(한빛정밀)다 — 같은 문서를 다른 에이전트로
 * 처리할 수 있어야 시연에서 이야기가 이어진다.
 *
 * 일부러 낮은 신뢰도 문장과 역번역 불일치를 섞었다. 전부 완벽하면
 * '사람이 봐야 하는 지점'을 보여주는 화면이 죽은 코드가 된다.
 */
import type { GlossaryEntry, TranslationResult } from '@entities/translation/model'

export const GLOSSARY: GlossaryEntry[] = [
  { source: '침탄 열처리', target: 'Carburizing heat treatment', category: 'process' },
  { source: '금형 교체', target: 'Die change', category: 'process' },
  { source: '초품 검사', target: 'First article inspection', category: 'quality' },
  { source: '경도', target: 'Hardness (HRC)', category: 'quality' },
  { source: '버', target: 'Burr', category: 'quality' },
  { source: '서보 프레스', target: 'Servo press', category: 'equipment' },
  { source: '냉간압연강판', target: 'Cold rolled steel sheet (SPCC)', category: 'material' },
]

export const TRANSLATION_RESULTS: Record<string, TranslationResult> = {
  'doc-inspection-cert': {
    documentId: 'doc-inspection-cert',
    from: 'ko',
    to: 'en',
    elapsedSeconds: 8.3,
    segments: [
      {
        id: 1,
        source: '본 검사성적서는 냉간압연강판 SPCC 2.0T 코일에 대한 수입검사 결과를 기록한 것이다.',
        target:
          'This inspection certificate records the incoming inspection results for cold rolled steel sheet (SPCC) 2.0T coils.',
        appliedTerms: ['냉간압연강판'],
        confidence: 0.96,
      },
      {
        id: 2,
        source: '시험편 경도는 58.4 HRC로 규격 하한 58.0 HRC에 근접하였다.',
        target: 'The specimen hardness was 58.4 HRC, close to the lower specification limit of 58.0 HRC.',
        appliedTerms: ['경도'],
        confidence: 0.94,
      },
      {
        id: 3,
        source: '침탄 열처리 후단존 온도 편차가 관리 한계를 초과하여 조건부 합격으로 판정하였다.',
        target:
          'The rear zone temperature deviation after carburizing heat treatment exceeded the control limit, so the lot was judged as conditionally accepted.',
        appliedTerms: ['침탄 열처리'],
        confidence: 0.88,
      },
      {
        id: 4,
        source: '버 발생은 관리 기준 이내이나 금형 교체 주기 도래가 임박하였다.',
        target: 'Burr occurrence is within the control criteria, but the die change interval is approaching.',
        appliedTerms: ['버', '금형 교체'],
        confidence: 0.81,
      },
      {
        id: 5,
        source: '초품 검사는 2인 1조로 실시하며 결과는 설비 대장에 기록한다.',
        target:
          'First article inspection is performed by a two-person team and the results are recorded in the equipment ledger.',
        appliedTerms: ['초품 검사'],
        confidence: 0.92,
      },
    ],
    glossaryUsed: GLOSSARY.filter((g) =>
      ['냉간압연강판', '경도', '침탄 열처리', '버', '금형 교체', '초품 검사'].includes(g.source),
    ),
    backChecks: [
      {
        segmentId: 1,
        backText: '본 검사성적서는 냉간압연강판(SPCC) 2.0T 코일의 입고 검사 결과를 기록한다.',
        similarity: 0.95,
      },
      {
        segmentId: 3,
        backText: '침탄 열처리 후 후방 구역 온도 편차가 제어 한계를 초과하여 로트는 조건부 승인으로 판정되었다.',
        similarity: 0.9,
      },
      {
        /* 의도적 불일치 — '주기 도래가 임박'이 '간격이 다가온다'로 약해졌다.
           사람이 봐야 하는 지점을 화면이 보여줄 수 있게 남겨 둔 것이다. */
        segmentId: 4,
        backText: '버 발생은 관리 기준 이내이지만 금형 교체 간격이 다가오고 있다.',
        similarity: 0.78,
      },
    ],
  },
}
