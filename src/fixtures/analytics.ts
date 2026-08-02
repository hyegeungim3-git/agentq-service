/**
 * 서비스 분석 fixture.
 *
 * 세계관은 한빛정밀이다. 사용자 관리·품질 관리 fixture와 같은 사람들이 나오고,
 * 오류로 신고된 건은 품질 관리에서 할루시네이션으로 판정된 그 질문이다
 * (비상 대피 경로 — 지식베이스에 없어 지어낸 답).
 *
 * ⚠️ **질의 본문은 넣지 않는다.** 접근 로그가 '질문 본문은 남기지 않는다'고
 * 말하고 있으므로 여기에 본문이 있으면 두 화면이 다른 말을 하게 된다.
 */
import type {
  ReportSection,
  SatisfactionSurvey,
  StatWindow,
  UsageEntry,
  UsageStats,
} from '@entities/analytics/model'

export const USAGE_ENTRIES: UsageEntry[] = [
  { id: 'u-1', at: '2026-08-02 08:41', userName: '박태윤', dept: '생산기술팀', mode: 'review', tokens: 412, rating: 5, reported: false },
  { id: 'u-2', at: '2026-08-02 07:05', userName: '오세진', dept: '설비보전팀', mode: 'general', tokens: 284, rating: null, reported: false },
  /* 품질 관리에서 할루시네이션으로 판정된 그 질문 */
  { id: 'u-3', at: '2026-07-27 16:42', userName: '한지민', dept: '생산관리팀', mode: 'general', tokens: 185, rating: 1, reported: true },
  { id: 'u-4', at: '2026-08-01 17:22', userName: '정하늘', dept: '품질보증팀', mode: 'report', tokens: 680, rating: 4, reported: false },
  { id: 'u-5', at: '2026-08-01 15:30', userName: '박태윤', dept: '생산기술팀', mode: 'translate', tokens: 556, rating: 4, reported: false },
  { id: 'u-6', at: '2026-08-01 11:05', userName: '이도경', dept: '협력사(대성정공)', mode: 'agent', tokens: 320, rating: null, reported: false },
  { id: 'u-7', at: '2026-07-31 14:15', userName: '정하늘', dept: '품질보증팀', mode: 'secure', tokens: 240, rating: null, reported: false },
  { id: 'u-8', at: '2026-07-31 09:50', userName: '오세진', dept: '설비보전팀', mode: 'agent', tokens: 505, rating: 5, reported: false },
]

/**
 * 만족도 조사.
 *
 * 응답률을 68%로 뒀다. 그러면 평균은 **답한 사람만의 평균**이고, 답하지 않은
 * 32%는 아무 말도 하지 않았다. 화면이 그 사실을 평균 옆에 적는다.
 */
export const SURVEY: SatisfactionSurvey = {
  sent: 503,
  responded: 342,
  /* 1점부터 5점까지 */
  distribution: [10, 18, 41, 95, 178],
  trend: [
    { date: '07-27', value: 3.8 },
    { date: '07-28', value: 4.0 },
    { date: '07-29', value: 4.1 },
    { date: '07-30', value: 3.9 },
    { date: '07-31', value: 4.3 },
    { date: '08-01', value: 4.5 },
    { date: '08-02', value: 4.2 },
  ],
  comments: [
    { id: 'c-1', userName: '박태윤', dept: '생산기술팀', rating: 5, text: '문서 검토 결과가 정확했습니다. 조항 인용이 특히 유용합니다.', at: '2026-08-02' },
    { id: 'c-2', userName: '정하늘', dept: '품질보증팀', rating: 4, text: '번역 품질은 좋은데 역번역 확인이 한 번 더 필요합니다.', at: '2026-08-01' },
    { id: 'c-3', userName: '한지민', dept: '생산관리팀', rating: 1, text: '비상 대피 경로 답변이 사실과 달랐습니다. 모르면 모른다고 해야 합니다.', at: '2026-07-27' },
    { id: 'c-4', userName: '오세진', dept: '설비보전팀', rating: 5, text: '예지보전 알람에서 바로 정비지시서까지 이어지는 흐름이 편합니다.', at: '2026-07-31' },
    { id: 'c-5', userName: '서민아', dept: '경영지원팀', rating: 3, text: '규정 조회는 되는데 개정 이력을 함께 보고 싶습니다.', at: '2026-07-30' },
  ],
}

/** 구간마다 다른 집계 — 어느 구간이나 같으면 고를 이유가 없다 */
export const STATS: Record<StatWindow, UsageStats> = {
  '7d': {
    window: '7d',
    totalQueries: 1_842,
    activeUsers: 41,
    avgSeconds: 1.1,
    failedQueries: 12,
    daily: [
      { date: '07-27', queries: 210, users: 22 },
      { date: '07-28', queries: 305, users: 31 },
      { date: '07-29', queries: 288, users: 29 },
      { date: '07-30', queries: 264, users: 27 },
      { date: '07-31', queries: 331, users: 34 },
      { date: '08-01', queries: 289, users: 30 },
      { date: '08-02', queries: 155, users: 18 },
    ],
    byMode: [
      { mode: 'general', queries: 742 },
      { mode: 'agent', queries: 488 },
      { mode: 'review', queries: 265 },
      { mode: 'translate', queries: 180 },
      { mode: 'report', queries: 121 },
      { mode: 'secure', queries: 46 },
    ],
  },
  '30d': {
    window: '30d',
    totalQueries: 7_310,
    activeUsers: 96,
    avgSeconds: 1.3,
    failedQueries: 64,
    daily: [
      { date: '07-06', queries: 240, users: 26 },
      { date: '07-13', queries: 288, users: 30 },
      { date: '07-20', queries: 262, users: 28 },
      { date: '07-27', queries: 210, users: 22 },
      { date: '08-02', queries: 155, users: 18 },
    ],
    byMode: [
      { mode: 'general', queries: 2_980 },
      { mode: 'agent', queries: 1_905 },
      { mode: 'review', queries: 1_060 },
      { mode: 'translate', queries: 702 },
      { mode: 'report', queries: 470 },
      { mode: 'secure', queries: 193 },
    ],
  },
  quarter: {
    window: 'quarter',
    totalQueries: 21_470,
    activeUsers: 128,
    avgSeconds: 1.5,
    failedQueries: 310,
    daily: [
      { date: '05월', queries: 5_820, users: 88 },
      { date: '06월', queries: 7_340, users: 112 },
      { date: '07월', queries: 8_310, users: 128 },
    ],
    byMode: [
      { mode: 'general', queries: 8_720 },
      { mode: 'agent', queries: 5_610 },
      { mode: 'review', queries: 3_120 },
      { mode: 'translate', queries: 2_060 },
      { mode: 'report', queries: 1_380 },
      { mode: 'secure', queries: 580 },
    ],
  },
}

/**
 * 리포트 항목.
 *
 * 만들 수 없는 항목을 목록에서 빼지 않는다 — 빼면 애초에 없는 지표로 읽힌다.
 * 고를 수 없게 하고 왜 못 만드는지 적는다.
 */
export const REPORT_SECTIONS: ReportSection[] = [
  { id: 's-usage', label: '이용 현황(질의 수·활성 사용자)', available: true, unavailableReason: null },
  { id: 's-mode', label: '업무 유형별 분포', available: true, unavailableReason: null },
  { id: 's-satisfaction', label: '만족도 조사 결과', available: true, unavailableReason: null },
  { id: 's-quality', label: '답변 품질 검토 결과', available: true, unavailableReason: null },
  { id: 's-cost', label: '모델 호출 비용', available: false, unavailableReason: '과금 단가가 정해지지 않아 금액을 계산할 수 없습니다.' },
  { id: 's-dept', label: '부서별 비교', available: false, unavailableReason: '조직도 연동(HR 연계)이 아직 없어 부서를 묶을 수 없습니다.' },
]
