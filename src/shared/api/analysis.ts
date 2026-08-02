import type { AnalysisRequest, AnalysisResult } from '@entities/analysis/model'
import { ANALYSIS_RESULTS } from '@fixtures/analysis'
import type { ApiResult } from './domains'

export type AnalysisApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function analyzeData(
  req: AnalysisRequest,
  opts: AnalysisApiOptions = {},
): Promise<ApiResult<AnalysisResult>> {
  await wait(opts.delayMs ?? 2000)
  const base = ANALYSIS_RESULTS[req.kind]
  if (!base) return { ok: false, error: `지원하지 않는 분석 유형입니다: ${req.kind}` }
  return { ok: true, data: { ...base, documentId: req.documentId } }
}
