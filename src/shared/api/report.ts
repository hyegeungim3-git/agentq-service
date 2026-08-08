import type { ReportRequest, ReportResult } from '@entities/report/model'
import { currentPack } from './pack'
import type { ApiResult } from './domains'

export type ReportApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function createReport(
  req: ReportRequest,
  opts: ReportApiOptions = {},
): Promise<ApiResult<ReportResult>> {
  await wait(opts.delayMs ?? 1800)
  /* 유형은 절 구성을, 문체는 문장 모양을, 분량은 담는 범위를 바꾼다.
     직접 입력한 칸은 그대로 들어가고, 비운 칸은 지어내지 않고 확인 필요로 남는다.
     TODO(api-미확정): POST /reports 로 교체. 제거 조건 = 생성 모델·응답 형식 확정. */
  const pack = await currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }
  const sim = pack.simulate.report
  if (!sim) return { ok: false, error: '이 발주처는 이 에이전트를 아직 도입하지 않았습니다.' }
  return { ok: true, data: sim(req) }
}
