/**
 * 공정 데이터 분석 모델.
 *
 * 분석의 위험은 **일부 데이터로 낸 결론을 전체 결론처럼 말하는 것**이다.
 * 로트 키가 없는 데이터가 29%인데 "불량률은 0.42%입니다"라고만 하면,
 * 담당자는 그 수치가 전수 기준인 줄 안다.
 *
 * 그래서 결과에 coverage(적용률)와 제외 사유를 함께 담는다.
 */

/**
 * 무엇을 보는가.
 *
 * 이전 데모는 네 가지(기술통계·이상치 탐지·추세 분석·종합)로 나눴다. 기술통계는
 * 어느 유형에서나 늘 함께 내보내므로 따로 고를 것이 아니고, 종합은 나머지를 이어
 * 붙인 것이라 뺐다. 남은 것이 셋이다.
 */
export type AnalysisKind = 'trend' | 'distribution' | 'outlier'

/**
 * 팩이 실제로 들고 있는 유형.
 *
 * 이상치는 **저장하지 않는다.** 추이와 분포에서 계산해서 만든다 — 발주처마다
 * 이상치 목록을 손으로 적어 두면, 추이 수치를 고친 날 이상치만 옛날 이야기를 한다.
 * 두 수가 서로 다른 말을 하는 화면은 둘 다 못 믿게 된다.
 */
export type StoredAnalysisKind = Exclude<AnalysisKind, 'outlier'>

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
  outlier: '이상치 탐지',
}

const KIND_DESC: Record<AnalysisKind, string> = {
  trend: '기간별 변화와 관리 기준선 대비',
  distribution: '원인별 발생 건수 분포',
  outlier: '관리 기준을 넘은 구간과 유난히 많은 항목',
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

/**
 * 이상으로 본 것 한 줄.
 *
 * `why`가 비어 있으면 안 된다 — 왜 이상인지 못 대는 표시는 사용자가 확인할 방법이
 * 없고, 그러면 결국 무시된다.
 */
export type OutlierRow = {
  /** 어느 구간·어느 항목 */
  label: string
  /** 그 값 */
  value: string
  /** 무엇과 비교했나 */
  basis: string
  /** 왜 이상으로 봤나 */
  why: string
  severity: 'high' | 'watch'
}

/**
 * 분포에서 '유난히 많다'고 볼 배수.
 *
 * 평균의 몇 배부터 이상인지는 통계가 정해 주지 않는다 — 업무가 정한다. 지금은
 * 1.5배로 두고 **화면이 그 수를 밝힌다.** 서버가 붙으면 발주처가 정한 값이 온다.
 */
export const OUTLIER_FACTOR = 1.5

/**
 * 이상치 — 저장된 값이 아니라 계산이다.
 *
 * 두 가지만 본다. 관리 기준을 넘은 구간(추이), 평균의 1.5배를 넘은 항목(분포).
 * 정규분포를 가정한 표준편차 기준은 쓰지 않는다 — 불량 건수처럼 한쪽으로 쏠린
 * 데이터에서는 멀쩡한 값을 이상이라고 말한다.
 */
export function findOutliers(result: AnalysisResult): OutlierRow[] {
  const rows: OutlierRow[] = []

  for (const p of breaches(result.trend)) {
    const over = p.value - p.limit
    rows.push({
      label: p.period,
      value: `${p.value}${result.unit}`,
      basis: `관리 기준 ${p.limit}${result.unit}`,
      why: `기준보다 ${Number(over.toFixed(2))}${result.unit} 높습니다`,
      severity: over >= p.limit * 0.2 ? 'high' : 'watch',
    })
  }

  const counts = result.distribution.map((d) => d.count)
  const mean = counts.length === 0 ? 0 : counts.reduce((a, b) => a + b, 0) / counts.length
  for (const d of result.distribution) {
    if (mean === 0 || d.count < mean * OUTLIER_FACTOR) continue
    rows.push({
      label: d.label,
      value: `${d.count}건`,
      basis: `항목 평균 ${Math.round(mean)}건`,
      why: `평균의 ${(d.count / mean).toFixed(1)}배입니다`,
      severity: d.count >= mean * 2 ? 'high' : 'watch',
    })
  }

  return rows
}

/**
 * 이상치 결과를 만든다 — 추이 하나와 분포 하나를 합쳐서.
 *
 * 저장된 값이 아니라 계산이므로 여기 한 곳에만 둔다. 화면이 직접 합치면
 * 유형이 늘 때마다 화면마다 다시 합치게 되고, 어느 화면은 분포를 빼먹는다.
 */
export function buildOutlierResult(trend: AnalysisResult, dist: AnalysisResult): AnalysisResult {
  const merged: AnalysisResult = {
    ...trend,
    kind: 'outlier',
    distribution: dist.distribution,
    /* 두 결과에서 왔으니 제외 사유도 둘을 합친다 — 한쪽만 보이면 '나머지는
       전수였다'로 읽힌다 */
    excludedReasons: [...new Set([...trend.excludedReasons, ...dist.excludedReasons])],
    coverage: Math.min(trend.coverage, dist.coverage),
    elapsedSeconds: Number((trend.elapsedSeconds + dist.elapsedSeconds).toFixed(1)),
    stats: [],
  }
  const rows = findOutliers(merged)
  const high = rows.filter((r) => r.severity === 'high').length
  /* 센 수와 적용률만 말한다. 없는 것(전기 대비 변화)은 지어내지 않는다 */
  merged.stats = [
    {
      metric: '이상 항목',
      value: `${rows.length}건`,
      change: null,
      status: rows.length === 0 ? 'good' : 'bad',
    },
    { metric: '즉시 확인', value: `${high}건`, change: null, status: high === 0 ? 'good' : 'bad' },
    { metric: '본 구간', value: `${merged.trend.length}개`, change: null, status: 'good' },
    {
      metric: '분석 적용률',
      value: `${Math.round(merged.coverage * 100)}%`,
      change: null,
      status: merged.coverage < COVERAGE_WARN ? 'watch' : 'good',
    },
  ]
  return merged
}

/** 적용률이 낮으면 결론을 전체로 읽으면 안 된다 */
const COVERAGE_WARN = 0.9

export function isPartial(result: AnalysisResult): boolean {
  return result.coverage < COVERAGE_WARN
}
