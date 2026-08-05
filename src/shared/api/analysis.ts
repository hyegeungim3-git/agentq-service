import type { AnalysisRequest, AnalysisResult } from '@entities/analysis/model'
import type { ApiResult } from './domains'
import { currentPack } from './pack'

export type AnalysisApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function analyzeData(
  req: AnalysisRequest,
  opts: AnalysisApiOptions = {},
): Promise<ApiResult<AnalysisResult>> {
  await wait(opts.delayMs ?? 2000)
  // TODO(api-미확정): POST /analyses 로 교체. 제거 조건 = 분석 엔진·응답 형식 확정.
  const pack = currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }
  const byKind = pack.analyses[req.datasetId]
  if (!byKind) return { ok: false, error: `분석 결과가 없는 데이터입니다: ${req.datasetId}` }
  const result = byKind[req.kind]
  if (!result) return { ok: false, error: `지원하지 않는 분석 유형입니다: ${req.kind}` }
  return { ok: true, data: result }
}
