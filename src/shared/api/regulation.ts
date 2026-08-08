import type { RegulationAnswer, RegulationRequest } from '@entities/regulation/model'
import { NO_MATCH_ANSWER } from '@fixtures/regulation'
import type { ApiResult } from './domains'
import { currentPack } from './pack'

export type RegulationApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function askRegulation(
  req: RegulationRequest,
  opts: RegulationApiOptions = {},
): Promise<ApiResult<RegulationAnswer>> {
  await wait(opts.delayMs ?? 1500)
  // TODO(api-미확정): POST /regulations:search 로 교체. 제거 조건 = 규정 검색 엔진·응답 형식 확정.

  const q = req.question.trim()
  if (!q) return { ok: false, error: '질문을 입력하세요.' }
  if (req.categories.length === 0) return { ok: false, error: '조회할 규정 분류를 1개 이상 선택하세요.' }

  const pack = await currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }

  const hit = pack.regulations.find(
    (e) =>
      e.keywords.some((k) => q.includes(k)) &&
      e.categories.some((c) => req.categories.includes(c)),
  )
  /* 못 찾으면 지어내지 않는다 — 규정 조회에서 지어낸 답은 사고로 이어진다 */
  const answer = hit ? hit.answer : NO_MATCH_ANSWER
  return { ok: true, data: { ...answer, question: q } }
}
