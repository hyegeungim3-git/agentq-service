import type { KnowledgeBase, KnowledgeRequest, KnowledgeResult } from '@entities/knowledge/model'
import { simulateSearch } from '@fixtures/knowledge'
import type { ApiResult } from './domains'
import { withPack } from './pack'

export type KnowledgeApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

/** 검색 범위로 고를 지식베이스 목록 */
export function fetchKnowledgeBases(): Promise<ApiResult<KnowledgeBase[]>> {
  // TODO(api-미확정): GET /knowledge-bases 로 교체. 제거 조건 = API 명세 확정.
  return withPack((p) => p.knowledgeBases)
}

export async function searchKnowledge(
  req: KnowledgeRequest,
  opts: KnowledgeApiOptions = {},
): Promise<ApiResult<KnowledgeResult>> {
  if (req.query.trim().length === 0) {
    return { ok: false, error: '검색어를 입력해 주세요.' }
  }
  if (req.baseIds.length === 0) {
    return { ok: false, error: '검색할 지식베이스를 하나 이상 선택해 주세요.' }
  }
  await wait(opts.delayMs ?? 1700)
  /* 검색어·검색 방식·범위·보안등급·결과 수가 전부 결과를 바꾼다.
     TODO(api-미확정): POST /knowledge:search 로 교체. 제거 조건 = 검색 엔진·응답 형식 확정. */
  return { ok: true, data: simulateSearch(req) }
}
