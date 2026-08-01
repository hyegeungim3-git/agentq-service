import type { ReportRequest, ReportResult } from '@entities/report/model'
import { REPORT_RESULTS } from '@fixtures/report'
import type { ApiResult } from './domains'

export type ReportApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function createReport(
  req: ReportRequest,
  opts: ReportApiOptions = {},
): Promise<ApiResult<ReportResult>> {
  await wait(opts.delayMs ?? 1800)
  const base = REPORT_RESULTS[req.type]
  if (!base) return { ok: false, error: `지원하지 않는 보고 유형입니다: ${req.type}` }
  return { ok: true, data: { ...base, documentId: req.documentId } }
}
