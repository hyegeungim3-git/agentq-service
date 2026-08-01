import type { MeetingRequest, MeetingResult } from '@entities/meeting/model'
import { MEETING_RESULT } from '@fixtures/meeting'
import type { ApiResult } from './domains'

export type MeetingApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function createMinutes(
  req: MeetingRequest,
  opts: MeetingApiOptions = {},
): Promise<ApiResult<MeetingResult>> {
  await wait(opts.delayMs ?? 2200)
  /* 발언 기록 토글이 결과를 실제로 바꾼다 — 바뀌지 않으면 그 스위치는 장식이다 */
  const utterances = req.includeUtterances ? MEETING_RESULT.utterances : []
  return { ok: true, data: { ...MEETING_RESULT, documentId: req.documentId, utterances } }
}
