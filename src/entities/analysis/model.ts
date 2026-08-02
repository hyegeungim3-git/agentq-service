/**
 * 공정 데이터 분석 모델.
 *
 * 분석의 위험은 **일부 데이터로 낸 결론을 전체 결론처럼 말하는 것**이다.
 * 로트 키가 없는 데이터가 29%인데 "불량률은 0.42%입니다"라고만 하면,
 * 담당자는 그 수치가 전수 기준인 줄 안다.
 *
 * 그래서 결과에 coverage(적용률)와 제외 사유를 함께 담는다.
 */

export type AnalysisKind = 'trend' | 'distribution'

export type TrendPoint = {
  /** x축 라벨 (기간) */
  period: string
  /** 실측값 */
  value: number
  /** 관리 기준선 — 차트에 함께 그린다 */
  limit: number
}

export type DistributionBar = {
  label: string
  count: number
}

export type StatRow = {
  metric: string
  value: string
  /** 전기 대비 변화. 없으면 null */
  change: string | null
  status: 'good' | 'watch' | 'bad'
}

export type AnalysisResult = {
  datasetId: string
  kind: AnalysisKind
  /** 실측값의 단위 — '%'·'℃'·'mm/s'. 데이터셋마다 다르므로 화면에 굳히지 않는다 */
  unit: string
  trend: TrendPoint[]
  distribution: DistributionBar[]
  stats: StatRow[]
  /** 분석에 실제로 쓰인 데이터 비율 0~1 */
  coverage: number
  /** 왜 나머지가 빠졌는지 — 감추면 부분 결론이 전체 결론으로 읽힌다 */
  excludedReasons: string[]
  elapsedSeconds: number
}

export type AnalysisRequest = {
  datasetId: string
  kind: AnalysisKind
}

const KIND_LABEL: Record<AnalysisKind, string> = {
  trend: '추이 분석',
  distribution: '분포 분석',
}

const KIND_DESC: Record<AnalysisKind, string> = {
  trend: '기간별 변화와 관리 기준선 대비',
  distribution: '원인별 발생 건수 분포',
}

const STATUS_LABEL: Record<StatRow['status'], string> = {
  good: '개선',
  watch: '주의',
  bad: '악화',
}

export const ANALYSIS_KINDS = Object.keys(KIND_LABEL) as AnalysisKind[]
export const analysisKindLabel = (k: AnalysisKind): string => KIND_LABEL[k]
export const analysisKindDesc = (k: AnalysisKind): string => KIND_DESC[k]
export const statusLabel = (s: StatRow['status']): string => STATUS_LABEL[s]

/** 관리 기준을 넘은 시점 — 차트에서 눈으로 찾게 두지 않는다 */
export function breaches(trend: TrendPoint[]): TrendPoint[] {
  return trend.filter((p) => p.value > p.limit)
}

/** 적용률이 낮으면 결론을 전체로 읽으면 안 된다 */
const COVERAGE_WARN = 0.9

export function isPartial(result: AnalysisResult): boolean {
  return result.coverage < COVERAGE_WARN
}
