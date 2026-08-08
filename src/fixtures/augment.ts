/**
 * 지식 증강 전략 fixture.
 *
 * 세계관은 한빛정밀이다. 대상 자료는 다른 화면과 같은 것을 가리킨다 —
 * 작업표준·안전 규정(RAG), 자주 쓰는 표준 문서(CAG), 품질 집계 테이블(TAG).
 *
 * **꺼진 규칙을 하나 넣었다.** 규칙이 목록에 있으면 도는 줄 안다. 꺼져 있으면
 * 그 질의가 아래 규칙으로 흘러가는데, 집계 질의가 문서 검색으로 가면 답이 틀린다.
 *
 * **원문이 바뀐 캐시도 넣었다.** 이것이 이 화면에서 가장 위험한 자리다 —
 * 캐시는 검색 없이 바로 답하므로, 낡은 채로 있으면 옛 내용을 자신 있게 말한다.
 */
import type { CacheEntry, Route, Strategy } from '@entities/augment/model'

export const STRATEGIES: Strategy[] = [
  {
    id: 'rag',
    fullName: 'Retrieval-Augmented Generation',
    what: '벡터 검색으로 근거 문서를 찾아 답합니다',
    targets: ['작업표준', '안전보건 규정'],
    share: 62,
    avgLatencyMs: 1180,
    hitRate: 88,
    strength: '문서가 많고 자주 갱신돼도 따라갑니다',
    caveat: '검색에 시간이 걸리고, 쪼개는 방식이 나쁘면 근거를 못 찾습니다',
  },
  {
    id: 'cag',
    fullName: 'Cache-Augmented Generation',
    what: '자주 쓰는 문서를 미리 올려 두고 검색 없이 답합니다',
    targets: ['품질 검사 기준', '자주 묻는 질문'],
    share: 23,
    avgLatencyMs: 340,
    hitRate: 95,
    strength: '검색 단계가 없어 빠르고 답이 일관됩니다',
    caveat: '올릴 수 있는 양에 한계가 있고, **원문이 바뀌면 다시 올려야** 합니다',
  },
  {
    id: 'tag',
    fullName: 'Table-Augmented Generation',
    what: '자연어를 질의문으로 바꿔 정형 데이터를 집계합니다',
    targets: ['품질 집계 테이블', 'MES 생산 실적'],
    share: 15,
    avgLatencyMs: 860,
    hitRate: 91,
    strength: '수치를 계산해 답하므로 집계·비교가 정확합니다',
    caveat: '스키마와 기준정보가 표준화돼 있어야 합니다',
  },
]

export const ROUTES: Route[] = [
  { id: 'rt-1', order: 1, when: '수치·집계·비교를 묻는 질의', keywords: '건수, 비율, 추이, 대비, 합계', strategy: 'tag', hits: 1240, enabled: false },
  { id: 'rt-2', order: 2, when: '표준 문서·규정 조회', keywords: '기준, 절차, 규정, 지침, 주기', strategy: 'cag', hits: 1860, enabled: true },
  { id: 'rt-3', order: 3, when: '그 외 문서 근거가 필요한 질의', keywords: '(기본 경로)', strategy: 'rag', hits: 4920, enabled: true },
]

export const CACHE_ENTRIES: CacheEntry[] = [
  { id: 'cc-1', name: '품질 검사 기준 요약본', tokens: '42K', loadedAt: '2026-07-28 02:10', loadedRev: 'v4 (2026-07-27)', currentRev: 'v4 (2026-07-27)', hits: 1420 },
  { id: 'cc-2', name: '침탄 열처리 작업표준', tokens: '28K', loadedAt: '2026-07-15 02:10', loadedRev: 'v2 (2026-07-14)', currentRev: 'v2 (2026-07-14)', hits: 640 },
  { id: 'cc-3', name: '자주 묻는 질문 모음', tokens: '16K', loadedAt: '2026-06-20 02:10', loadedRev: 'v6 (2026-06-19)', currentRev: 'v7 (2026-07-25)', hits: 310 },
]
