/**
 * 지식 관리 — 지식영역·색인·검색 설정.
 *
 * ⚠️ 이 화면의 위험은 **목록에 있는데 검색에 안 잡히는 문서**다.
 * 관리자는 '문서 240건 등록'을 보고 다 찾을 수 있다고 믿는데, 색인이 안 됐거나
 * 실패한 문서는 사용자에게 '없다'고 답한다. 사용자는 그걸 구분할 방법이 없다.
 *
 * 그래서 등록 건수와 **찾을 수 있는 건수를 따로 센다.**
 *
 * 임베딩 모델을 바꾸면 전체 재색인이 필요하다. 안 하면 옛 벡터와 새 벡터가 섞여
 * 검색이 조용히 나빠진다 — 오류가 안 나서 더 늦게 발견된다.
 */

export type IndexState = 'indexed' | 'pending' | 'failed' | 'skipped'

export const INDEX_STATE_LABEL: Record<IndexState, string> = {
  indexed: '색인됨',
  pending: '대기',
  failed: '실패',
  skipped: '제외',
}

export type SecurityLevel = 'public' | 'internal' | 'confidential'

export const SECURITY_LABEL: Record<SecurityLevel, string> = {
  public: '일반',
  internal: '내부',
  confidential: '대외비',
}

export type KnowledgeArea = {
  id: string
  name: string
  purpose: string
  security: SecurityLevel
  /** 등록된 문서 수 */
  registered: number
  /** 실제로 검색에 잡히는 문서 수 */
  searchable: number
  lastIndexedAt: string
  /** 마지막 색인 뒤에 바뀐 문서 수 — 이 문서들은 옛 내용으로 답한다 */
  staleCount: number
}

/** 등록됐지만 못 찾는 문서 수 */
export const missing = (a: KnowledgeArea): number => a.registered - a.searchable

export const hasGap = (a: KnowledgeArea): boolean => missing(a) > 0 || a.staleCount > 0

export type IndexEntry = {
  id: string
  areaId: string
  title: string
  state: IndexState
  /** 색인되지 않았으면 왜인지. 색인됐으면 null */
  reason: string | null
  updatedOn: string
}

export const notSearchable = (list: IndexEntry[]): IndexEntry[] =>
  list.filter((e) => e.state !== 'indexed')

export type SearchMode = 'vector' | 'hybrid' | 'keyword'

export const SEARCH_MODE_LABEL: Record<SearchMode, string> = {
  vector: '벡터 검색',
  hybrid: '하이브리드(벡터+키워드)',
  keyword: '키워드 검색',
}

export type RagConfig = {
  embeddingModel: string
  /** 청크 길이(글자) */
  chunkSize: number
  chunkOverlap: number
  searchMode: SearchMode
  topK: number
  /** 이 설정으로 색인된 비율(0~1). 1이 아니면 옛 설정으로 색인된 문서가 섞여 있다 */
  reindexedRatio: number
}

/** 설정이 바뀌었는데 재색인이 안 끝난 상태 — 검색이 조용히 나빠진다 */
export const needsReindex = (c: RagConfig): boolean => c.reindexedRatio < 1
