/**
 * 표준 보고서 작성 모델.
 *
 * 보고서는 '문장을 잘 쓰는 것'이 아니라 **정해진 양식의 칸을 근거 있는 값으로
 * 채우는 것**이다. 그래서 결과는 자유 텍스트가 아니라 절(section) 배열이고,
 * 각 절은 어느 데이터에서 왔는지(source)를 달고 있다.
 *
 * 사람이 직접 넣어야 하는 칸(주요 실적·다음 계획·특이 사항)은 비워 두면
 * 자동으로 채우지 않고 '확인 필요'로 남긴다. 그럴듯한 문장으로 메우면
 * 결재선에서 그게 실적인 줄 안다.
 */

export type ReportType = 'weekly' | 'monthly' | 'inspection' | 'quality' | 'incident'

/** 문체. 같은 사실을 어떤 모양으로 쓰는가 */
export type ReportTone = 'formal' | 'brief' | 'detailed'

/** 분량. 어디까지 담는가 */
export type ReportLength = 'short' | 'standard' | 'long'

/** 사람이 채우는 칸 */
export type ReportInputs = {
  department: string
  period: string
  achievements: string
  nextPlan: string
  remarks: string
}

export type ReportSection = {
  heading: string
  body: string
  /**
   * 이 절이 어디서 왔는지. 자동 생성이면 데이터 출처, 사람이 넣었으면 '직접 입력'.
   * 출처 없는 수치는 검증할 수 없으므로 빈 값을 허용하지 않는다 —
   * 채우지 못한 칸은 절로 만들지 않고 `pendingFields`에 남긴다.
   */
  source: string
}

export type ReportResult = {
  documentId: string
  type: ReportType
  tone: ReportTone
  length: ReportLength
  docNo: string
  department: string
  period: string
  sections: ReportSection[]
  /** 사람이 반드시 확인해야 하는 칸 — 자동 생성이 닿지 못한 곳을 감추지 않는다 */
  pendingFields: string[]
  elapsedSeconds: number
}

export type ReportRequest = {
  documentId: string
  type: ReportType
  tone: ReportTone
  length: ReportLength
  inputs: ReportInputs
}

const TYPE_LABEL: Record<ReportType, string> = {
  weekly: '주간 실적 보고',
  monthly: '월간 종합 보고',
  inspection: '설비 점검 보고',
  quality: '품질 동향 보고',
  incident: '이상 발생 보고',
}

const TYPE_DESC: Record<ReportType, string> = {
  weekly: '한 주 생산·품질 실적과 차주 계획',
  monthly: '월 단위 지표 종합과 개선 과제',
  inspection: '정기 PM 점검 결과와 조치 필요 설비',
  quality: '분기 품질지표 동향과 부적합 현황',
  incident: '설비 이상·품질 사고의 경위와 조치',
}

const TONE_LABEL: Record<ReportTone, string> = {
  formal: '공식체',
  brief: '요약체',
  detailed: '상세체',
}
const TONE_DESC: Record<ReportTone, string> = {
  formal: '공문서 개조식 — 항목으로 나열',
  brief: '핵심만 한 줄씩',
  detailed: '배경·근거를 문장으로',
}

const LENGTH_LABEL: Record<ReportLength, string> = {
  short: '단문',
  standard: '표준',
  long: '장문',
}
const LENGTH_DESC: Record<ReportLength, string> = {
  short: '핵심 절만',
  standard: '일반 업무 보고',
  long: '근거 데이터까지 첨부',
}

export const REPORT_TYPES = Object.keys(TYPE_LABEL) as ReportType[]
export const REPORT_TONES = Object.keys(TONE_LABEL) as ReportTone[]
export const REPORT_LENGTHS = Object.keys(LENGTH_LABEL) as ReportLength[]

export const reportTypeLabel = (t: ReportType): string => TYPE_LABEL[t]
export const reportTypeDesc = (t: ReportType): string => TYPE_DESC[t]
export const reportToneLabel = (t: ReportTone): string => TONE_LABEL[t]
export const reportToneDesc = (t: ReportTone): string => TONE_DESC[t]
export const reportLengthLabel = (l: ReportLength): string => LENGTH_LABEL[l]
export const reportLengthDesc = (l: ReportLength): string => LENGTH_DESC[l]

export const EMPTY_REPORT_INPUTS: ReportInputs = {
  department: '',
  period: '',
  achievements: '',
  nextPlan: '',
  remarks: '',
}

/** 채워진 칸 / 전체 칸 — 저장하지 않고 파생한다. */
export function fillRate(result: ReportResult): number {
  const total = result.sections.length + result.pendingFields.length
  if (total === 0) return 0
  return result.sections.length / total
}
