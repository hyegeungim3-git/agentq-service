/**
 * 벡터 DB · 자동 적재 · 벤치마크 fixture.
 *
 * 다른 화면과 이어진다 — 컬렉션은 지식 관리의 지식영역에 붙고, 적재 소스는
 * 그 영역으로 문서를 넣는다. 벤치마크 점수는 LLM 설정에서 Solar를 중지한 근거다.
 *
 * **일부러 넣은 나쁜 상태 넷.** 없으면 그걸 드러내는 화면이 죽은 코드가 된다.
 *  ① 차원이 다른 컬렉션(768 vs 1024) — 같은 검색에서 못 섞는다
 *  ② 어느 영역에도 안 붙은 컬렉션 — 만들어 두고 잊혔다
 *  ③ 스케줄은 도는데 마지막 수집이 실패한 소스
 *  ④ 성공했는데 0건 — 조용히 아무것도 안 가져온다
 */
import type {
  Benchmark,
  BenchmarkRun,
  IngestSource,
  VectorCollection,
} from '@entities/datainfra/model'

export const COLLECTIONS: VectorCollection[] = [
  { id: 'c-sop', name: 'sop_documents', areaId: 'k-sop', vectors: 412_000, dimensions: 1024, embeddingModel: 'KoE5-large (v2)', state: 'active', updatedOn: '2026-08-02', latencyMs: 38 },
  { id: 'c-quality', name: 'quality_records', areaId: 'k-quality', vectors: 880_000, dimensions: 1024, embeddingModel: 'KoE5-large (v2)', state: 'active', updatedOn: '2026-08-02', latencyMs: 45 },
  /* 차원이 다르다 — 옛 임베딩 모델로 만든 컬렉션이다 */
  { id: 'c-safety', name: 'safety_regulations', areaId: 'k-safety', vectors: 164_000, dimensions: 768, embeddingModel: 'KoE5-base (v1)', state: 'stale', updatedOn: '2026-07-28', latencyMs: 41 },
  { id: 'c-reg', name: 'internal_rules', areaId: 'k-reg', vectors: 68_000, dimensions: 1024, embeddingModel: 'KoE5-large (v2)', state: 'active', updatedOn: '2026-08-02', latencyMs: 33 },
  { id: 'c-equip', name: 'equipment_history', areaId: 'k-equip', vectors: 520_000, dimensions: 1024, embeddingModel: 'KoE5-large (v2)', state: 'building', updatedOn: '2026-08-02', latencyMs: 0 },
  /* 어느 영역에도 안 붙어 있다 */
  { id: 'c-old', name: 'legacy_manuals_2024', areaId: null, vectors: 240_000, dimensions: 768, embeddingModel: 'KoE5-base (v1)', state: 'stale', updatedOn: '2025-11-14', latencyMs: 52 },
]

export const INGEST_SOURCES: IngestSource[] = [
  { id: 'i-edms', name: '전자결재 문서함', method: 'edms', targetAreaId: 'k-reg', schedule: '매일 01:00', lastRunAt: '2026-08-02 01:03', lastOk: true, lastError: null, fetched: 4, total: 27 },
  { id: 'i-mes-doc', name: 'MES 작업표준 폴더', method: 'edms', targetAreaId: 'k-sop', schedule: '매일 01:00', lastRunAt: '2026-08-02 01:05', lastOk: true, lastError: null, fetched: 2, total: 142 },
  /* 스케줄은 도는데 마지막 수집이 실패했다 */
  { id: 'i-law', name: '법제처 Open API', method: 'openapi', targetAreaId: 'k-reg', schedule: '매주 화 05:00', lastRunAt: '2026-07-29 05:00', lastOk: false, lastError: '인증 키가 만료됐습니다(401). 3주째 아무것도 못 가져오고 있습니다.', fetched: 0, total: 86 },
  /* 성공했는데 0건 — 조용히 아무것도 안 가져온다 */
  { id: 'i-safety', name: '안전보건공단 자료실', method: 'crawl', targetAreaId: 'k-safety', schedule: '매주 월 04:00', lastRunAt: '2026-08-02 04:00', lastOk: true, lastError: null, fetched: 0, total: 12 },
  { id: 'i-manual', name: '설비 매뉴얼 업로드', method: 'upload', targetAreaId: 'k-equip', schedule: '수동', lastRunAt: '2026-07-30 14:22', lastOk: true, lastError: null, fetched: 6, total: 205 },
]

/**
 * 벤치마크.
 *
 * 우리 업무와 얼마나 가까운지를 함께 둔다. 점수만 나열하면 높은 쪽이 우리 일을
 * 잘하는 것처럼 읽힌다 — MTEB는 공개 문서 검색을, KorQuAD는 위키 독해를 잰다.
 */
export const BENCHMARKS: Benchmark[] = [
  { id: 'b-inhouse', name: '사내 문서 QA', measures: '한빛정밀 작업표준·규정에 대한 질의응답 정답률', relevance: 'close', relevanceNote: '실제 업무 질문으로 만든 평가셋입니다. 이 점수가 가장 참고할 만합니다.' },
  { id: 'b-mteb', name: 'MTEB (검색)', measures: '공개 문서 집합에서의 검색 정확도', relevance: 'partial', relevanceNote: '검색 능력은 겹치지만 문서 성격이 다릅니다. 사내 용어·표 형식은 안 들어 있습니다.' },
  { id: 'b-korquad', name: 'KorQuAD 1.0', measures: '한국어 위키 문단 독해', relevance: 'far', relevanceNote: '위키 문장 독해입니다. 사내 문서 QA를 잘한다는 근거로 쓸 수 없습니다.' },
  { id: 'b-hate', name: 'K-Hatespeech', measures: '유해 표현 탐지', relevance: 'far', relevanceNote: '가드레일 관련 지표입니다. 업무 정확도와는 관계가 없습니다.' },
]

export const BENCHMARK_RUNS: BenchmarkRun[] = [
  { id: 'BR-001', benchmarkId: 'b-inhouse', modelName: 'GPT-OSS-120B', modelVersion: 'v2.4.1', score: 0.876, samples: 1_200, elapsed: '1h 10m', state: 'done', runOn: '2026-07-19' },
  { id: 'BR-002', benchmarkId: 'b-mteb', modelName: 'GPT-OSS-120B', modelVersion: 'v2.4.1', score: 0.824, samples: 5_000, elapsed: '4h 20m', state: 'done', runOn: '2026-07-19' },
  { id: 'BR-003', benchmarkId: 'b-korquad', modelName: 'Llama-3-Kor-Instruct', modelVersion: 'v1.8.0', score: 0.852, samples: 3_000, elapsed: '2h 15m', state: 'done', runOn: '2026-08-01' },
  { id: 'BR-004', benchmarkId: 'b-inhouse', modelName: 'Llama-3-Kor-Instruct', modelVersion: 'v1.8.0', score: 0.812, samples: 1_200, elapsed: '55m', state: 'done', runOn: '2026-08-01' },
  /* EXAONE은 업무와 다른 벤치마크로만 쟀다 — 점수는 있는데 근거가 못 된다 */
  { id: 'BR-005', benchmarkId: 'b-hate', modelName: 'EXAONE-3.0-7.8B', modelVersion: 'v1.3.2', score: 0.882, samples: 2_000, elapsed: '1h 30m', state: 'done', runOn: '2026-06-20' },
  { id: 'BR-006', benchmarkId: 'b-inhouse', modelName: 'Solar-10.7B-v1.0', modelVersion: 'v1.0.0', score: 0.641, samples: 1_200, elapsed: '1h 05m', state: 'done', runOn: '2026-06-12' },
  { id: 'BR-007', benchmarkId: 'b-inhouse', modelName: 'GPT-OSS-120B', modelVersion: 'v2.5.0', score: 0, samples: 1_200, elapsed: '-', state: 'running', runOn: '2026-08-02' },
]
