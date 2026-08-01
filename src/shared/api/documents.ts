/**
 * 업무 문서 접근 경계. 문서를 입력으로 받는 에이전트는 전부 여기를 통과한다.
 */
import type { BusinessDocument, DocumentKind } from '@entities/document/model'
import { DOCUMENTS } from '@fixtures/documents'
import type { ApiResult } from './domains'

/** kinds를 주면 그 종류만 걸러 준다 — 번역은 성적서를, 요약은 전부 받는 식이다. */
export function fetchDocuments(kinds?: DocumentKind[]): Promise<ApiResult<BusinessDocument[]>> {
  // TODO(api-미확정): GET /documents 로 교체. 제거 조건 = API 명세 확정.
  const data = kinds?.length ? DOCUMENTS.filter((d) => kinds.includes(d.kind)) : DOCUMENTS
  return Promise.resolve({ ok: true, data })
}
