import type {
  ReportSection,
  SatisfactionSurvey,
  StatWindow,
  UsageEntry,
  UsageMode,
  UsageStats,
} from '@entities/analytics/model'
import { REPORT_SECTIONS, STATS, SURVEY, USAGE_ENTRIES } from '@fixtures/analytics'
import type { ApiResult } from './domains'

/**
 * 서비스 분석의 데이터 경계.
 *
 * ⚠️ 이용 이력 응답에 **질의 본문은 없다.** 접근 로그 화면이 '질문 본문은 남기지
 * 않는다'고 말하고 있으므로 여기도 같아야 한다 — 두 화면이 다른 말을 하면 어느 쪽이
 * 사실인지 알 수 없다. 보관 여부는 백엔드가 정한다(§3).
 */

export function fetchUsageEntries(mode: UsageMode | 'all'): Promise<ApiResult<UsageEntry[]>> {
  // TODO(api-미확정): GET /analytics/usage?mode= 로 교체. 제거 조건 = 백엔드가 보관 정책을 확정.
  const hit = mode === 'all' ? USAGE_ENTRIES : USAGE_ENTRIES.filter((e) => e.mode === mode)
  return Promise.resolve({ ok: true, data: hit })
}

export function fetchSurvey(): Promise<ApiResult<SatisfactionSurvey>> {
  // TODO(api-미확정): GET /analytics/satisfaction 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: SURVEY })
}

export function sendSurvey(): Promise<ApiResult<never>> {
  // TODO(api-미확정): POST /analytics/satisfaction:send 로 교체. 제거 조건 = 백엔드가 인증·발송 경로를 확정.
  return Promise.resolve({
    ok: false,
    error:
      '만족도 조사를 보내지 못했습니다. 서버가 연결되지 않아 아무에게도 발송되지 않았습니다.',
  })
}

export function fetchUsageStats(window: StatWindow): Promise<ApiResult<UsageStats>> {
  // TODO(api-미확정): GET /analytics/stats?window= 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: STATS[window] })
}

export function fetchReportSections(): Promise<ApiResult<ReportSection[]>> {
  // TODO(api-미확정): GET /analytics/report-sections 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: REPORT_SECTIONS })
}

export function buildReport(sectionIds: string[], window: StatWindow): Promise<ApiResult<never>> {
  void sectionIds
  void window
  // TODO(api-미확정): POST /analytics/reports 로 교체. 제거 조건 = 백엔드가 파일 생성·보관 경로를 확정.
  return Promise.resolve({
    ok: false,
    error:
      '리포트 파일을 만들지 못했습니다. 파일 생성은 서버가 합니다 — 지금은 내려받을 것이 없습니다.',
  })
}
