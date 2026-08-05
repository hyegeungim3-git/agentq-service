/**
 * 공공(한국부동산원) 팩 — 워크스페이스·공지·신호·지표·데이터셋.
 *
 * 제조 팩과 같은 규칙이다. 신호를 눌러 열리는 화면에서 **같은 수치**가 나와야
 * 한 이야기가 된다 — 여기서는 이의신청 미처리 18건, 실거래 의심 거래 8건,
 * 표준지 조사 마감 D-12가 그 축이다.
 */
import type { Dataset } from '@entities/dataset/model'
import type { LiveMetric } from '@entities/metric/model'
import type { Notice } from '@entities/notice/model'
import type { WorkSignal } from '@entities/signal/model'
import type { Workspace } from '@entities/workspace/model'

export const PUBLIC_WORKSPACES: Workspace[] = [
  {
    id: 'ws-ax',
    name: 'AI활용 업무혁신 TF',
    purpose: '공시업무 AI 적용 과제 19건의 우선순위와 추진 계획',
  },
  {
    id: 'ws-survey',
    name: '공시지가조사 업무반',
    purpose: '표준지 56만 필지 조사·검증과 이의신청 처리',
  },
  {
    id: 'ws-sec',
    name: '정보보안 실태조사 TF',
    purpose: '실거래 자료 반출 기준과 내부망 처리 범위',
  },
]

export const PUBLIC_NOTICES: Notice[] = [
  {
    id: 'nt-reb-1',
    level: 'important',
    title: '표준지 조사표 제출 마감 — 4월 5일',
    postedOn: '2026-03-24',
    body: '2026년 표준지 조사표 제출 기한은 4월 5일입니다. 이용상황이 직전 연도와 달라진 필지는 변동 사유를 반드시 기재해 주십시오. 사유가 없으면 검증 단계에서 반려됩니다.',
  },
  {
    id: 'nt-reb-2',
    level: 'notice',
    title: '이의신청 처리 기한 안내 (접수일 +30일)',
    postedOn: '2026-03-24',
    body: '3월 4주 심의회 결정에 따라 이의신청 처리 현황을 주 단위로 점검합니다. 미처리 18건의 처리 기한은 4월 12일이며, 재조사가 필요한 건은 위원회 재심의 일정을 먼저 확인하십시오.',
  },
  {
    id: 'nt-reb-3',
    level: 'notice',
    title: '경계 지역 가격 균형 협의 기준 개정 예정',
    postedOn: '2026-03-25',
    body: '협의 대상 거리(현행 500미터)와 변동률 차이 기준(현행 3%포인트) 조정을 검토합니다. 담당과 확정 일자는 아직 정해지지 않았으며, 확정되면 다시 공지합니다.',
  },
]

export const PUBLIC_SIGNALS: WorkSignal[] = [
  {
    id: 'sg-reb-appeal',
    at: '2026-03-24T08:10:00',
    title: '이의신청 미처리 18건 — 처리 기한 임박',
    detail:
      '접수 342건 중 18건이 미처리 상태이며 처리 기한은 4월 12일입니다. 재조사가 진행 중인 건은 위원회 재심의 일정이 함께 필요합니다.',
    severity: 'action',
    source: '공시가격 이의신청 대장',
    link: { kind: 'agent', agentId: 'dbquery', label: '이의신청 현황 조회' },
  },
  {
    id: 'sg-reb-rtms',
    at: '2026-03-24T09:35:00',
    title: '실거래 신고 의심 거래 8건 분류',
    detail:
      '1분기 신고 1,842건 중 시세 괴리율 30% 이상 8건을 정밀조사 대상으로 분류했습니다. 조회 → 괴리 분석 → 법령 대조 → 보고서까지 한 번에 처리할 수 있습니다.',
    severity: 'action',
    source: '실거래 검증 시스템',
    link: { kind: 'scenario', label: '이상거래 검증 릴레이 열기' },
  },
  {
    id: 'sg-reb-balance',
    at: '2026-03-23T16:20:00',
    title: '경계 표준지 변동률 차이 3.4%p — 협의 대상',
    detail:
      '인접 시·군 경계 표준지의 변동률 차이가 기준(3%포인트)을 넘었습니다. 유사 사례와 직전 협의 조서를 먼저 확인하십시오.',
    severity: 'watch',
    source: '가격 균형 점검',
    link: { kind: 'agent', agentId: 'knowledge', label: '유사 협의 사례 검색' },
  },
  {
    id: 'sg-reb-tf',
    at: '2026-03-22T11:00:00',
    title: 'AI 적용 과제 1단계 대상 검토 요청',
    detail: '발굴 과제 19건 중 1단계 대상 선정이 필요합니다. 회의는 이번 주 금요일입니다.',
    severity: 'info',
    source: '업무혁신 TF 공유',
    link: null,
  },
]

/**
 * 라이브 지표 — 이의신청 처리 대기.
 *
 * 제조가 '설비 진동'이라면 공공은 **처리 대기 건수**다. 임계치를 넘는 순간을
 * 보여 줘야 하므로 아래에서 시작해 넘어간다.
 */
export const PUBLIC_APPEAL_QUEUE: LiveMetric = {
  id: 'm-reb-appeal-queue',
  label: '이의신청 처리 대기',
  unit: '건',
  threshold: 20,
  stepSeconds: 60,
  curve: [12, 13, 15, 16, 18, 19, 21, 23, 24, 26],
  source: '공시가격 이의신청 접수 시스템',
}

export const PUBLIC_DATASETS: Dataset[] = [
  {
    id: 'ds-reb-appeal',
    name: '이의신청_처리현황_2026.xlsx',
    format: 'xlsx',
    rows: 342,
    columns: 18,
    sizeBytes: 1_887_436,
    source: '공시가격 이의신청 시스템',
  },
  {
    id: 'ds-reb-rtms',
    name: '실거래신고_1분기_전국.csv',
    format: 'csv',
    rows: 1_842,
    columns: 22,
    sizeBytes: 2_936_012,
    source: 'RTMS 실거래 신고 자료',
  },
  {
    id: 'ds-reb-landprice',
    name: '표준지_공시지가_변동률_시도별.csv',
    format: 'csv',
    rows: 17,
    columns: 9,
    sizeBytes: 24_576,
    source: '부동산 공시가격 알리미',
  },
]
