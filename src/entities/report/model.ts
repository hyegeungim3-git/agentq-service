/**
 * 표준 보고서 작성 모델.
 *
 * 보고서는 '문장을 잘 쓰는 것'이 아니라 **정해진 양식의 칸을 근거 있는 값으로
 * 채우는 것**이다. 그래서 결과는 자유 텍스트가 아니라 절(section) 배열이고,
 * 각 절은 어느 데이터에서 왔는지(source)를 달고 있다.
 */

export type ReportType = 'weekly' | 'monthly' | 'incident'

export type ReportSection = {
  heading: string
  body: string
  /** 이 절이 참조한 데이터 출처 — 없으면 사람이 채워야 하는 칸이다 */
  source: string | null
}

export type ReportResult = {
  documentId: string
  type: ReportType
  docNo: string
  period: string
  sections: ReportSection[]
  /** 사람이 반드시 확인해야 하는 칸 — 자동 생성이 닿지 못한 곳을 감추지 않는다 */
  pendingFields: string[]
  elapsedSeconds: number
}

export type ReportRequest = {
  documentId: string
  type: ReportType
  includeCharts: boolean
}

const TYPE_LABEL: Record<ReportType, string> = {
  weekly: '주간 실적 보고',
  monthly: '월간 종합 보고',
  incident: '이상 발생 보고',
}

const TYPE_DESC: Record<ReportType, string> = {
  weekly: '한 주 생산·품질 실적과 차주 계획',
  monthly: '월 단위 지표 종합과 개선 과제',
  incident: '설비 이상·품질 사고의 경위와 조치',
}

export const REPORT_TYPES = Object.keys(TYPE_LABEL) as ReportType[]
export const reportTypeLabel = (t: ReportType): string => TYPE_LABEL[t]
export const reportTypeDesc = (t: ReportType): string => TYPE_DESC[t]

/** 자동으로 채워진 비율 — 저장하지 않고 파생한다. */
export function autoFillRate(result: ReportResult): number {
  const total = result.sections.length + result.pendingFields.length
  if (total === 0) return 0
  return result.sections.filter((s) => s.source !== null).length / total
}
