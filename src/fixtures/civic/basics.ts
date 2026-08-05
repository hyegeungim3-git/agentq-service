/**
 * 행정(한성시청) 팩 — 워크스페이스·공지·신호·지표·데이터셋.
 *
 * 앞의 두 팩과 같은 규칙이다. 신호를 눌러 열리는 화면에서 **같은 수치**가 나와야
 * 한 이야기가 된다 — 여기서는 기한 도과 118건, 안전 미달 광고물 25건,
 * 강변동 민원 집중이 그 축이다.
 */
import type { Dataset } from '@entities/dataset/model'
import type { LiveMetric } from '@entities/metric/model'
import type { Notice } from '@entities/notice/model'
import type { WorkSignal } from '@entities/signal/model'
import type { Workspace } from '@entities/workspace/model'

export const CIVIC_WORKSPACES: Workspace[] = [
  {
    id: 'ws-smart',
    name: '스마트행정 추진단',
    purpose: '민원 처리 자동화 과제 14건의 우선순위와 추진 계획',
  },
  {
    id: 'ws-civil',
    name: '민원처리 개선 TF',
    purpose: '기한 도과 118건의 원인 분석과 재발 방지',
  },
  {
    id: 'ws-safety',
    name: '재난안전 상황실',
    purpose: '호우 대비 취약 구간 점검과 상황 보고 체계',
  },
]

export const CIVIC_NOTICES: Notice[] = [
  {
    id: 'nt-hsc-1',
    level: 'important',
    title: '호우 대비 취약 구간 점검 — 4월 3일까지',
    postedOn: '2026-03-25',
    body: '우기 전 취약 구간 점검을 4월 3일까지 마쳐 주십시오. 강변동 하천 공사 구간은 임시 제방 상태를 우선 확인하고, 확인 일자와 확인자를 점검 대장에 반드시 기록해 주십시오.',
  },
  {
    id: 'nt-hsc-2',
    level: 'notice',
    title: '옥외광고물 안전 기준 미달 25건 계고 일정',
    postedOn: '2026-03-25',
    body: '3월 4주 재난안전대책회의 결정에 따라 안전 기준 미달 광고물 25건을 우선 계고합니다. 강풍 시 낙하 위험이 있어 4월 첫째 주까지 계고장을 발송합니다.',
  },
  {
    id: 'nt-hsc-3',
    level: 'notice',
    title: '민원 처리 기한 연장 통지 서식 개정 예정',
    postedOn: '2026-03-26',
    body: '연장 사유와 연장 기간을 함께 적도록 서식을 고칩니다. 담당과 시행 일자는 아직 정해지지 않았으며, 확정되면 다시 공지합니다.',
  },
]

export const CIVIC_SIGNALS: WorkSignal[] = [
  {
    id: 'sg-hsc-overdue',
    at: '2026-03-25T08:20:00',
    title: '법정 기한 도과 민원 118건',
    detail:
      '1분기 기한 도과가 118건으로 전분기 대비 27건 늘었습니다. 연장 통지 없이 넘긴 건은 감사 지적 대상입니다.',
    severity: 'action',
    source: '민원 처리 대장',
    link: { kind: 'agent', agentId: 'dbquery', label: '기한 도과 민원 조회' },
  },
  {
    id: 'sg-hsc-ad',
    at: '2026-03-25T09:15:00',
    title: '옥외광고물 안전 기준 미달 25건',
    detail:
      '실태 점검 3,180건 중 위반 의심 214건, 그중 안전 기준 미달이 25건입니다. 강풍 시 낙하 위험이 있어 우선 계고 대상입니다.',
    severity: 'action',
    source: '옥외광고물 점검 대장',
    link: { kind: 'agent', agentId: 'ocr', label: '정비 결과서 인식' },
  },
  {
    id: 'sg-hsc-river',
    at: '2026-03-24T17:40:00',
    title: '강변동 하천 공사 구간 임시 제방 점검 필요',
    detail:
      '하천 정비 공사로 임시 제방이 설치된 구간입니다. 호우 시 월류 위험을 우선 확인해야 합니다.',
    severity: 'watch',
    source: '재난안전 점검 계획',
    link: { kind: 'agent', agentId: 'knowledge', label: '유사 점검 사례 검색' },
  },
  {
    id: 'sg-hsc-tf',
    at: '2026-03-23T11:00:00',
    title: '스마트행정 과제 1단계 대상 검토 요청',
    detail: '자동화 과제 14건 중 1단계 대상 선정이 필요합니다. 회의는 이번 주 금요일입니다.',
    severity: 'info',
    source: '추진단 공유',
    link: null,
  },
]

/**
 * 라이브 지표 — 민원 처리 대기.
 *
 * 제조가 설비 진동, 공공이 이의신청 대기라면 여기는 **민원 대기**다.
 * 임계치를 넘는 순간을 보여 줘야 하므로 아래에서 시작해 넘어간다.
 */
export const CIVIC_CIVIL_QUEUE: LiveMetric = {
  id: 'm-hsc-civil-queue',
  label: '민원 처리 대기',
  unit: '건',
  threshold: 60,
  stepSeconds: 60,
  curve: [41, 44, 48, 52, 55, 58, 62, 66, 69, 73],
  source: '민원 처리 시스템 (한성시 본청)',
}

export const CIVIC_DATASETS: Dataset[] = [
  {
    id: 'ds-hsc-civil',
    name: '민원처리현황_2026Q1.xlsx',
    format: 'xlsx',
    rows: 8_412,
    columns: 19,
    sizeBytes: 3_355_443,
    source: '민원 처리 시스템',
  },
  {
    id: 'ds-hsc-ad',
    name: '옥외광고물_점검결과_2026Q1.csv',
    format: 'csv',
    rows: 3_180,
    columns: 14,
    sizeBytes: 1_468_006,
    source: '옥외광고물 점검 대장',
  },
  {
    id: 'ds-hsc-dong',
    name: '행정동별_민원접수_인구대비.csv',
    format: 'csv',
    rows: 12,
    columns: 8,
    sizeBytes: 18_432,
    source: '통계 포털 · 주민등록 연계',
  },
]
