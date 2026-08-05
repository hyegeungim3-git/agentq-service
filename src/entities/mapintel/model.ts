/**
 * 지도 인텔리전스 모델 — 사업장별 지표를 한눈에.
 *
 * ⚠️ 지리 좌표가 아니라 **배치 도식**이다. 실제 지도 위에 찍으면 위치가 맞아야 하는데
 * 그 데이터가 없다. 격자 위치만 두고 화면이 '도식'이라고 말한다.
 * 지도처럼 보이는데 위치가 틀리면 그게 제일 위험하다.
 *
 * 값이 없는 사업장을 빼지 않는다. 빼면 '전 사업장이 이렇다'로 읽힌다 —
 * 빈칸으로 두고 왜 없는지 말한다.
 */

export type SiteMetric = {
  id: string
  name: string
  region: string
  /** 격자 배치 (col, row) — 지리 좌표가 아니다 */
  col: number
  row: number
  /** 값이 없으면 null. 0과 구분해야 한다 */
  value: number | null
  /** 최근 추이. 값이 없으면 빈 배열 */
  trend: number[]
  /** 값이 없는 이유 */
  missingReason: string | null
}

export type MapIntel = {
  /**
   * 무엇을 늘어놓는가 — 공장은 사업장, 병원은 진료과, 시청은 행정동이다.
   *
   * 코어에 '사업장'을 박아 뒀더니 병원 화면에 `사업장별 병상 가동률`이 떴다.
   * 지도는 발주처마다 다른 것을 세는 그림이라 세는 단위도 발주처가 정한다.
   */
  siteLabel: string
  metricLabel: string
  unit: string
  period: string
  /** 낮으면 조치가 필요한 지표인지 — 색과 문구의 방향이 반대가 된다 */
  lowerIsWorse: boolean
  threshold: number
  sites: SiteMetric[]
}

export const withData = (m: MapIntel): SiteMetric[] => m.sites.filter((s) => s.value !== null)
export const withoutData = (m: MapIntel): SiteMetric[] => m.sites.filter((s) => s.value === null)

/** 조치가 필요한 사업장 — 지표 방향에 따라 기준이 뒤집힌다 */
export function needsAttention(m: MapIntel): SiteMetric[] {
  return withData(m).filter((s) =>
    m.lowerIsWorse ? (s.value as number) < m.threshold : (s.value as number) > m.threshold,
  )
}

/** 평균 — 값이 있는 곳만 센다. 없는 곳을 0으로 세면 평균이 무너진다 */
export function averageValue(m: MapIntel): number | null {
  const has = withData(m)
  if (has.length === 0) return null
  const sum = has.reduce((n, s) => n + (s.value as number), 0)
  return Math.round((sum / has.length) * 10) / 10
}

/** 0~1로 정규화 — 타일 진하기에 쓴다 */
export function intensity(m: MapIntel, value: number): number {
  const values = withData(m).map((s) => s.value as number)
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return 0.5
  const t = (value - min) / (max - min)
  return m.lowerIsWorse ? 1 - t : t
}
