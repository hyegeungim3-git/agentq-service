import type { KnowledgeRequest, KnowledgeResult } from '@entities/knowledge/model'
import { KNOWLEDGE_RESULT } from '@fixtures/knowledge'
import type { ApiResult } from './domains'

export type KnowledgeApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function searchDrawings(
  req: KnowledgeRequest,
  opts: KnowledgeApiOptions = {},
): Promise<ApiResult<KnowledgeResult>> {
  await wait(opts.delayMs ?? 1700)
  /* 최소 유사도가 결과를 실제로 걸러야 한다 — 안 걸리면 그 설정은 장식이다 */
  const hits = KNOWLEDGE_RESULT.hits.filter((h) => h.similarity >= req.minSimilarity)
  return { ok: true, data: { ...KNOWLEDGE_RESULT, documentId: req.documentId, hits } }
}
