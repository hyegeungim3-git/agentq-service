import type { IndexEntry, KnowledgeArea, RagConfig } from '@entities/knowledgebase/model'
import { RAG_CONFIG } from '@fixtures/knowledgebase'
import type { DomainPackData } from '@fixtures/packs'
import type { ApiResult } from './domains'
import { withPack, withPackOf } from './pack'

/**
 * 지식 관리의 데이터 경계.
 *
 * 지식영역 응답에 **등록 건수와 검색 가능 건수를 따로** 달라고 요청한다.
 * 하나만 오면 화면이 '등록됐는데 못 찾는 문서'를 그릴 수 없다.
 *
 * ⚠️ 지식 영역은 **발주처 데이터**다. 하나만 두었더니 병원 대화 화면의 답변 근거에
 * 제조의 작업표준·설비 대장이 떴다. 포털은 지금 발주처, 관리자는 고른 발주처다(§3-2-1).
 */

export function fetchAreas(domainId?: string | null): Promise<ApiResult<KnowledgeArea[]>> {
  // TODO(api-미확정): GET /knowledge/areas 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  const read = (p: DomainPackData): KnowledgeArea[] => p.knowledgeAreas
  return domainId === undefined ? withPack(read) : withPackOf(domainId, read)
}

/** `areaId`가 'all'이면 전체 */
export function fetchIndexEntries(
  areaId: string,
  domainId?: string | null,
): Promise<ApiResult<IndexEntry[]>> {
  // TODO(api-미확정): GET /knowledge/index?area= 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  const read = (p: DomainPackData): IndexEntry[] =>
    areaId === 'all' ? p.indexEntries : p.indexEntries.filter((e) => e.areaId === areaId)
  return domainId === undefined ? withPack(read) : withPackOf(domainId, read)
}

/** RAG 설정은 플랫폼 것이다 — 임베딩 모델·청크 크기는 발주처가 고르지 않는다 */
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
