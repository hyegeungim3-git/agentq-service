import type { DataSourceOption, QueryRequest, QueryResult } from '@entities/dataquery/model'
import type { ApiResult } from './domains'
import { currentPack, withPack } from './pack'

/** 이 발주처가 조회하는 데이터 소스 — 이름도 예시 질의도 발주처가 정한다 */
export function fetchQuerySources(): Promise<ApiResult<DataSourceOption[]>> {
  // TODO(api-미확정): GET /queries/sources 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return withPack((p) => p.querySources)
}

export type QueryApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function runQuery(
  req: QueryRequest,
  opts: QueryApiOptions = {},
): Promise<ApiResult<QueryResult>> {
  await wait(opts.delayMs ?? 1500)
  // TODO(api-미확정): POST /queries 로 교체. 제거 조건 = Text-to-SQL 엔진·응답 형식 확정.
  if (!req.question.trim()) return { ok: false, error: '조회할 내용을 입력하세요.' }
  const pack = await currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }
  const base = pack.queryResults[req.source]
  if (!base) return { ok: false, error: `지원하지 않는 데이터 소스입니다: ${req.source}` }
  return { ok: true, data: base }
}
