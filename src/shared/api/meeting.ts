import type { MeetingRequest, MeetingResult } from '@entities/meeting/model'
import { currentPack } from './pack'
import type { ApiResult } from './domains'

export type MeetingApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function createMinutes(
  req: MeetingRequest,
  opts: MeetingApiOptions = {},
): Promise<ApiResult<MeetingResult>> {
  await wait(opts.delayMs ?? 2200)
  /* 회의 자료는 결정에 근거를 붙이고, 참석자 명단은 발언과 대조되고,
     안건은 논의 여부로 갈린다. 발언 기록 토글도 결과를 실제로 바꾼다.
     TODO(api-미확정): POST /minutes 로 교체. 제거 조건 = STT·생성 모델 응답 형식 확정. */
  const pack = await currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }
  const sim = pack.simulate.meeting
  if (!sim) return { ok: false, error: '이 발주처는 이 에이전트를 아직 도입하지 않았습니다.' }
  return { ok: true, data: sim(req) }
}
