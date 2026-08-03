import type {
  Benchmark,
  BenchmarkRun,
  IngestSource,
  VectorCollection,
} from '@entities/datainfra/model'
import { BENCHMARKS, BENCHMARK_RUNS, COLLECTIONS, INGEST_SOURCES } from '@fixtures/datainfra'
import type { ApiResult } from './domains'

/**
 * 벡터 DB · 자동 적재 · 벤치마크의 데이터 경계.
 *
 * 벤치마크 응답에 **우리 업무와 얼마나 가까운지**를 함께 달라고 요청한다.
 * 점수만 오면 화면이 높은 쪽을 좋은 것으로 그리게 되고, 그러면 위키 독해를
 * 잘하는 모델을 사내 문서 QA용으로 고르게 된다.
 */

export function fetchCollections(): Promise<ApiResult<VectorCollection[]>> {
  // TODO(api-미확정): GET /vector/collections 로 교체. 차원·임베딩 모델을 함께 준다.
  return Promise.resolve({ ok: true, data: COLLECTIONS })
}

export function fetchIngestSources(): Promise<ApiResult<IngestSource[]>> {
  // TODO(api-미확정): GET /ingest/sources 로 교체. 마지막 실행 성공 여부와 가져온 건수를 함께 준다.
  return Promise.resolve({ ok: true, data: INGEST_SOURCES })
}

export function runIngest(id: string): Promise<ApiResult<never>> {
  void id
  // TODO(api-미확정): POST /ingest/sources/{id}:run 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error: '수집을 실행하지 못했습니다. 서버가 연결되지 않아 새로 들어온 문서는 없습니다.',
  })
}

export function fetchBenchmarks(): Promise<ApiResult<Benchmark[]>> {
  // TODO(api-미확정): GET /benchmarks 로 교체. 업무 근접도(relevance)를 함께 준다.
  return Promise.resolve({ ok: true, data: BENCHMARKS })
}

export function fetchBenchmarkRuns(): Promise<ApiResult<BenchmarkRun[]>> {
  // TODO(api-미확정): GET /benchmarks/runs 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: BENCHMARK_RUNS })
}
