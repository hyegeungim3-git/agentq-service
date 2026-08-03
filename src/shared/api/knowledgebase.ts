import type { IndexEntry, KnowledgeArea, RagConfig } from '@entities/knowledgebase/model'
import { AREAS, INDEX_ENTRIES, RAG_CONFIG } from '@fixtures/knowledgebase'
import type { ApiResult } from './domains'

/**
 * 지식 관리의 데이터 경계.
 *
 * 지식영역 응답에 **등록 건수와 검색 가능 건수를 따로** 달라고 요청한다.
 * 하나만 오면 화면이 '등록됐는데 못 찾는 문서'를 그릴 수 없다.
 */

export function fetchAreas(): Promise<ApiResult<KnowledgeArea[]>> {
  // TODO(api-미확정): GET /knowledge/areas 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: AREAS })
}

/** `areaId`가 'all'이면 전체 */
export function fetchIndexEntries(areaId: string): Promise<ApiResult<IndexEntry[]>> {
  // TODO(api-미확정): GET /knowledge/index?area= 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  const hit = areaId === 'all' ? INDEX_ENTRIES : INDEX_ENTRIES.filter((e) => e.areaId === areaId)
  return Promise.resolve({ ok: true, data: hit })
}

export function fetchRagConfig(): Promise<ApiResult<RagConfig>> {
  // TODO(api-미확정): GET /knowledge/rag-config 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: RAG_CONFIG })
}

export function runReindex(areaId: string): Promise<ApiResult<never>> {
  void areaId
  // TODO(api-미확정): POST /knowledge/areas/{id}:reindex 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '재색인을 시작하지 못했습니다. 색인은 서버가 합니다 — 못 찾는 문서는 그대로 못 찾습니다.',
  })
}
