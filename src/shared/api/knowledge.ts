import type { KnowledgeContext, KnowledgeRequest, KnowledgeResult } from '@entities/knowledge/model'
import { simulateSearch } from '@fixtures/knowledge'
import type { ApiResult } from './domains'
import { currentPack, withPack } from './pack'

export type KnowledgeApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

/**
 * 검색 화면이 그리는 데 필요한 것 — 범위 목록·예시 질의·견주는 사양.
 *
 * 예전에는 목록만 주고 나머지는 화면이 fixture에서 직접 가져왔다.
 * 그러면 발주처를 바꿔도 예시와 사양이 제조 것으로 남는다.
 */
export function fetchKnowledgeContext(): Promise<ApiResult<KnowledgeContext>> {
  // TODO(api-미확정): GET /knowledge-bases 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return withPack((p) => ({
    bases: p.knowledgeBases,
    examples: p.knowledgeExamples,
    referenceSpec: p.knowledgeReferenceSpec,
  }))
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
  const pack = await currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }
  await wait(opts.delayMs ?? 1700)
  /* 검색어·검색 방식·범위·보안등급·결과 수가 전부 결과를 바꾼다.
     TODO(api-미확정): POST /knowledge:search 로 교체. 제거 조건 = 검색 엔진·응답 형식 확정. */
  return { ok: true, data: simulateSearch(req, pack.knowledgeCorpus) }
}
