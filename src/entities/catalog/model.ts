/**
 * 데이터 카탈로그 · 리니지.
 *
 * 답의 출처를 **데이터 자산까지** 따라가는 화면이다. 근거 문서 이름만으로는
 * '이 수치가 어디서 왔나'에 답할 수 없다 — 원천이 무엇이고, 어떤 처리를 거쳤고,
 * 어느 에이전트가 그걸 쓰는지가 리니지다.
 *
 * 두 가지를 드러낸다.
 *  ① **리니지가 없는 자산** — 계보가 없으면 틀렸을 때 어디를 고쳐야 하는지 모른다
 *  ② **표준화율이 낮은데 집계에 쓰이는 자산** — 코드·단위가 안 맞으면 합계가 틀린다.
 *     문서 검색이면 사람이 읽고 판단하지만, 집계는 **틀린 수치를 그대로 답한다**
 */

export type GradeCode = 'confidential' | 'restricted' | 'internal' | 'public'

export const GRADE_LABEL: Record<GradeCode, string> = {
  confidential: '기밀',
  restricted: '대외비',
  internal: '내부',
  public: '공개',
}

/** 이 자산을 무엇으로 쓰는가 — 집계에 쓰이면 표준화가 낮을 때 위험이 다르다 */
export type UsageKind = 'search' | 'aggregate' | 'ocr'

export const USAGE_LABEL: Record<UsageKind, string> = {
  search: '문서 근거 검색',
  aggregate: '수치 집계',
  ocr: '문서 인식',
}

export type DataAsset = {
  id: string
  name: string
  source: string
  owner: string
  grade: GradeCode
  format: string
  volume: string
  updateCycle: string
  /** 마지막으로 새로 들어온 때 */
  freshness: string
  /** 코드·단위가 표준에 맞는 비율(%) */
  standardizedRatio: number
  usage: UsageKind
  /** 이 자산이 틀리면 함께 틀리는 곳 */
  consumers: string[]
}

/** 집계에 쓰이는데 표준화가 이 아래면 합계를 믿을 수 없다 */
export const STANDARD_FLOOR = 90

export const riskyForAggregate = (list: DataAsset[]): DataAsset[] =>
  list.filter((a) => a.usage === 'aggregate' && a.standardizedRatio < STANDARD_FLOOR)

export type LineageNode = { name: string; kind: string }

export type LineageStage = { name: string; what: string; tool: string }

export type Lineage = {
  assetId: string
  upstream: LineageNode[]
  stages: LineageStage[]
  downstream: LineageNode[]
}

export const lineageOf = (list: Lineage[], assetId: string): Lineage | null =>
  list.find((l) => l.assetId === assetId) ?? null

/** 계보가 안 그려진 자산 — 틀렸을 때 어디를 고칠지 모른다 */
export const withoutLineage = (assets: DataAsset[], lineages: Lineage[]): DataAsset[] =>
  assets.filter((a) => lineageOf(lineages, a.id) === null)
