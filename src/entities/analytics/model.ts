/**
 * 서비스 분석 — 이용 이력·만족도·통계·리포트.
 *
 * 이 구역의 위험은 **표본이 무엇인지 밝히지 않는 것**이다.
 * '평균 만족도 4.2점'은 누가 답한 4.2인지 없으면 뜻이 없다. 응답률이 68%면
 * 그 4.2는 답한 사람만의 평균이고, 답하지 않은 32%는 아무 말도 하지 않았다.
 *
 * ⚠️ **질의 본문은 여기 없다.** 접근 로그 화면이 '챗봇 질문 본문은 남기지 않는다'고
 * 말하고 있으므로 이 화면도 같아야 한다. 두 화면이 다른 말을 하면 어느 쪽이
 * 사실인지 알 수 없다. 보관 여부는 백엔드가 정한다(API-PROPOSAL §3).
 */

export type UsageMode =
  | 'general'
  | 'review'
  | 'translate'
  | 'report'
  | 'agent'
  | 'secure'

export const MODE_LABEL: Record<UsageMode, string> = {
  general: '일반질의',
  review: '문서검토',
  translate: '번역·요약',
  report: '보고서',
  agent: '에이전트',
  secure: '보안채팅',
}

export const USAGE_MODES: UsageMode[] = [
  'general',
  'review',
  'translate',
  'report',
  'agent',
  'secure',
]

export type UsageEntry = {
  id: string
  at: string
  userName: string
  dept: string
  mode: UsageMode
  tokens: number
  /** 사용자가 만족도를 남겼으면 1~5. 안 남겼으면 null */
  rating: number | null
  /** 오류로 신고된 건 */
  reported: boolean
}

/** 만족도를 남긴 건만 센다 — 안 남긴 것을 0점으로 세면 평균이 무너진다 */
export function averageRating(entries: UsageEntry[]): { value: number | null; counted: number } {
  const rated = entries.filter((e) => e.rating !== null)
  if (rated.length === 0) return { value: null, counted: 0 }
  const sum = rated.reduce((n, e) => n + (e.rating as number), 0)
  return { value: Math.round((sum / rated.length) * 10) / 10, counted: rated.length }
}

export type SatisfactionSurvey = {
  /** 조사를 보낸 사람 수 */
  sent: number
  /** 답한 사람 수 */
  responded: number
  /** 1~5점 각각의 건수 (index 0 = 1점) */
  distribution: number[]
  /** 날짜별 평균 */
  trend: { date: string; value: number }[]
  comments: SurveyComment[]
}

export type SurveyComment = {
  id: string
  userName: string
  dept: string
  rating: number
  text: string
  at: string
}

export const responseRate = (s: SatisfactionSurvey): number =>
  s.sent === 0 ? 0 : s.responded / s.sent

export function surveyAverage(s: SatisfactionSurvey): number | null {
  const total = s.distribution.reduce((n, c) => n + c, 0)
  if (total === 0) return null
  const sum = s.distribution.reduce((n, c, i) => n + c * (i + 1), 0)
  return Math.round((sum / total) * 10) / 10
}

export type StatWindow = '7d' | '30d' | 'quarter'
export const STAT_WINDOWS: StatWindow[] = ['7d', '30d', 'quarter']
export const STAT_WINDOW_LABEL: Record<StatWindow, string> = {
  '7d': '최근 7일',
  '30d': '최근 30일',
  quarter: '분기',
}

export type UsageStats = {
  window: StatWindow
  totalQueries: number
  activeUsers: number
  /** 초 단위. 성공한 요청만 센 값이다 */
  avgSeconds: number
  /** 실패해서 평균에서 빠진 건수 */
  failedQueries: number
  daily: { date: string; queries: number; users: number }[]
  byMode: { mode: UsageMode; queries: number }[]
}

/** 리포트에 넣을 항목 */
export type ReportSection = {
  id: string
  label: string
  /** 서버 없이도 지금 값을 만들 수 있는가 */
  available: boolean
  /** 못 만들면 왜인지 */
  unavailableReason: string | null
}
