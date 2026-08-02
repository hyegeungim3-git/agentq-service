import type { QueryRequest, QueryResult } from '@entities/dataquery/model'
import { QUERY_RESULTS } from '@fixtures/dataquery'
import type { ApiResult } from './domains'

export type QueryApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function runQuery(
  req: QueryRequest,
  opts: QueryApiOptions = {},
): Promise<ApiResult<QueryResult>> {
  await wait(opts.delayMs ?? 1500)
  if (!req.question.trim()) return { ok: false, error: '조회할 내용을 입력하세요.' }
  const base = QUERY_RESULTS[req.source]
  if (!base) return { ok: false, error: `지원하지 않는 데이터 소스입니다: ${req.source}` }
  return { ok: true, data: base }
}
