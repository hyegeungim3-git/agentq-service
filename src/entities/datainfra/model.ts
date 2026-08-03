/**
 * 벡터 DB · 자동 적재 · 벤치마크.
 *
 * 세 화면 모두 인프라 수치라 `서버 미연결 — 예시 값` 배지를 단다.
 *
 * 각 화면이 숨기면 안 되는 것:
 *  ① 벡터 DB — **차원이 다른 컬렉션**은 같은 검색에서 비교할 수 없다. 임베딩
 *     모델이 다르기 때문인데, 목록만 보면 그냥 나란한 컬렉션으로 보인다.
 *  ② 자동 적재 — 스케줄이 '정상'인데 **마지막 수집이 실패**했을 수 있다.
 *     스케줄은 돌고 있고 가져온 것만 0건이면 아무도 모른다.
 *  ③ 벤치마크 — **점수가 높다고 우리 업무를 잘한다는 뜻이 아니다.** MTEB·KorQuAD는
 *     공개 데이터로 잰 것이고, 사내 문서 QA는 다른 것이다.
 */

export type CollectionState = 'active' | 'building' | 'stale'

export const COLLECTION_STATE_LABEL: Record<CollectionState, string> = {
  active: '사용 중',
  building: '만드는 중',
  stale: '갱신 필요',
}

export type VectorCollection = {
  id: string
  name: string
  /** 이 컬렉션이 담는 지식영역 id. 안 붙어 있으면 null */
  areaId: string | null
  vectors: number
  /** 임베딩 차원 — 다르면 같은 검색에서 비교할 수 없다 */
  dimensions: number
  embeddingModel: string
  state: CollectionState
  updatedOn: string
  /** 평균 조회 지연(ms) */
  latencyMs: number
}

/** 차원이 여럿이면 같은 검색에서 섞어 쓸 수 없다 */
export function dimensionGroups(list: VectorCollection[]): number[] {
  return [...new Set(list.map((c) => c.dimensions))].sort((a, b) => a - b)
}

/** 지금 검색에 쓸 수 없는 컬렉션 */
export const notUsable = (list: VectorCollection[]): VectorCollection[] =>
  list.filter((c) => c.state !== 'active')

/** 어느 지식영역에도 안 붙은 컬렉션 — 만들어 두고 잊힌 것 */
export const unattached = (list: VectorCollection[]): VectorCollection[] =>
  list.filter((c) => c.areaId === null)

export type IngestMethod = 'edms' | 'openapi' | 'crawl' | 'upload'

export const INGEST_METHOD_LABEL: Record<IngestMethod, string> = {
  edms: '전자결재 연계',
  openapi: 'Open API',
  crawl: '웹 수집',
  upload: '직접 업로드',
}

export type IngestSource = {
  id: string
  name: string
  method: IngestMethod
  targetAreaId: string
  schedule: string
  lastRunAt: string
  /** 마지막 실행이 성공했는가 */
  lastOk: boolean
  /** 실패했으면 이유 */
  lastError: string | null
  /** 마지막 실행에서 새로 가져온 문서 수 */
  fetched: number
  /** 지금까지 이 소스로 들어온 총 문서 수 */
  total: number
}

/** 스케줄은 도는데 마지막 실행이 실패한 것 */
export const failing = (list: IngestSource[]): IngestSource[] => list.filter((s) => !s.lastOk)

/** 성공했는데 0건 — 조용히 아무것도 안 가져오고 있다 */
export const silent = (list: IngestSource[]): IngestSource[] =>
  list.filter((s) => s.lastOk && s.fetched === 0)

export type Benchmark = {
  id: string
  name: string
  /** 무엇을 재는가 */
  measures: string
  /** 우리 업무와 얼마나 가까운가 — 화면이 이걸 먼저 말한다 */
  relevance: 'close' | 'partial' | 'far'
  /** 왜 그렇게 보는가 */
  relevanceNote: string
}

export const RELEVANCE_LABEL: Record<Benchmark['relevance'], string> = {
  close: '업무와 가까움',
  partial: '일부만 겹침',
  far: '업무와 다름',
}

export type BenchmarkRun = {
  id: string
  benchmarkId: string
  modelName: string
  modelVersion: string
  score: number
  samples: number
  elapsed: string
  state: 'done' | 'running' | 'failed'
  runOn: string
}

/** 업무와 다른 벤치마크로만 잰 모델 — 점수는 있는데 근거가 못 된다 */
export function onlyFarBenchmarks(
  runs: BenchmarkRun[],
  benchmarks: Benchmark[],
  modelName: string,
): boolean {
  const mine = runs.filter((r) => r.modelName === modelName && r.state === 'done')
  if (mine.length === 0) return false
  return mine.every((r) => benchmarks.find((b) => b.id === r.benchmarkId)?.relevance === 'far')
}
