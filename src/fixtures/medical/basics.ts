/**
 * 의료(새빛대학교병원) 팩 — 워크스페이스·공지·신호·지표·데이터셋.
 *
 * 앞의 세 팩과 같은 규칙이다. 신호를 눌러 열리는 화면에서 **같은 수치**가 나와야
 * 한 이야기가 된다 — 보류 342건 중 미회신 18건, 응급의료센터 가동률 92.1%,
 * 조정률 0.71%가 그 축이다.
 *
 * ⚠️ 문구는 행정·심사 관점으로만 쓴다. 환자 개인에 대한 판단을 넣지 않는다.
 */
import type { Dataset } from '@entities/dataset/model'
import type { LiveMetric } from '@entities/metric/model'
import type { Notice } from '@entities/notice/model'
import type { WorkSignal } from '@entities/signal/model'
import type { Workspace } from '@entities/workspace/model'

export const MEDICAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-medai',
    name: '의료AI 도입 TF',
    purpose: '청구·기록 업무 자동화 과제 11건의 우선순위와 추진 계획',
  },
  {
    id: 'ws-claim',
    name: '적정진료 개선반',
    purpose: '반복 조정 항목 정리와 청구 전 점검 기준 보완',
  },
  {
    id: 'ws-safety',
    name: '환자안전 위원회',
    purpose: '응급실 과밀 완화와 입원 대기 병상 조정',
  },
]

export const MEDICAL_NOTICES: Notice[] = [
  {
    id: 'nt-suh-1',
    level: 'important',
    title: '사전점검 보류 18건 — 진료과 회신 요청',
    postedOn: '2026-03-26',
    body: '근거 보완이 끝나지 않아 청구가 미뤄진 18건이 있습니다. 해당 진료과는 진료기록 근거를 보완해 회신해 주십시오. 회신이 늦으면 청구 기한을 넘길 수 있습니다.',
  },
  {
    id: 'nt-suh-2',
    level: 'notice',
    title: '응급의료센터 과밀 단계 운영 안내',
    postedOn: '2026-03-26',
    body: '3월 4주 환자안전위원회 결정에 따라 재실 환자가 기준을 넘으면 입원 대기 병상을 우선 조정합니다. 조정 기준과 절차는 병상관리팀 안내를 따라 주십시오.',
  },
  {
    id: 'nt-suh-3',
    level: 'notice',
    title: '청구 전 점검 항목 개정 예정',
    postedOn: '2026-03-27',
    body: '반복 조정 항목을 점검 항목에 추가합니다. 담당과 시행 일자는 아직 정해지지 않았으며, 확정되면 다시 공지합니다.',
  },
]

export const MEDICAL_SIGNALS: WorkSignal[] = [
  {
    id: 'sg-suh-hold',
    at: '2026-03-26T08:05:00',
    title: '사전점검 보류 18건 — 진료과 회신 대기',
    detail:
      '청구 예정 48,210건 중 342건을 보류했고, 그중 18건은 근거 보완 회신이 오지 않았습니다. 청구 기한을 넘기면 조정 위험이 커집니다.',
    severity: 'action',
    source: '삭감위험 사전점검 대장',
    link: { kind: 'agent', agentId: 'dbquery', label: '보류 건 조회' },
  },
  {
    id: 'sg-suh-er',
    at: '2026-03-26T09:20:00',
    title: '응급의료센터 가동률 92.1%',
    detail:
      '재실 환자가 늘어 입원 대기 시간이 길어지고 있습니다. 병상 조정 기준을 확인하고 대기 배정을 조정해야 합니다.',
    severity: 'action',
    source: '병상 운영 현황',
    link: { kind: 'agent', agentId: 'dataanalysis', label: '병상 가동률 분석' },
  },
  {
    id: 'sg-suh-record',
    at: '2026-03-25T16:30:00',
    title: '진료기록 근거 미비 반복 — 조정 항목 1위',
    detail:
      '급여 기준 초과 투여의 기록 근거 미비가 반복 조정 항목 1위입니다. 유사 사례의 보완 방식을 먼저 확인하십시오.',
    severity: 'watch',
    source: '심사 조정 이력',
    link: { kind: 'agent', agentId: 'knowledge', label: '유사 조정 사례 검색' },
  },
  {
    id: 'sg-suh-tf',
    at: '2026-03-24T11:00:00',
    title: '의료AI 과제 1단계 대상 검토 요청',
    detail: '자동화 과제 11건 중 1단계 대상 선정이 필요합니다. 회의는 이번 주 금요일입니다.',
    severity: 'info',
    source: '도입 TF 공유',
    link: null,
  },
]

/**
 * 라이브 지표 — 응급의료센터 재실 환자.
 *
 * 앞의 세 팩과 같은 규칙으로, 임계치를 넘는 순간을 보여 줘야 하므로
 * 아래에서 시작해 넘어간다.
 */
export const MEDICAL_ER_CENSUS: LiveMetric = {
  id: 'm-suh-er-census',
  label: '응급의료센터 재실 환자',
  unit: '명',
  threshold: 40,
  stepSeconds: 60,
  curve: [28, 30, 33, 35, 37, 39, 42, 45, 47, 50],
  source: '응급의료센터 병상 현황 (새빛대학교병원)',
}

export const MEDICAL_DATASETS: Dataset[] = [
  {
    id: 'ds-suh-claim',
    name: '청구내역_사전점검_2026Q1.xlsx',
    format: 'xlsx',
    rows: 48_210,
    columns: 26,
    sizeBytes: 5_242_880,
    source: '원무·청구 시스템',
  },
  {
    id: 'ds-suh-bed',
    name: '진료과별_병상운영_2026Q1.csv',
    format: 'csv',
    rows: 9,
    columns: 11,
    sizeBytes: 21_504,
    source: '병상 관리 시스템',
  },
  {
    id: 'ds-suh-adjust',
    name: '심사조정_항목별_이력.csv',
    format: 'csv',
    rows: 1_486,
    columns: 12,
    sizeBytes: 936_960,
    source: '심사 결과 회신 자료',
  },
]
