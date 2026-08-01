/**
 * 문서 요약 데이터 접근 경계.
 *
 * 실제 서버는 요약 생성에 시간이 걸린다. 그 지연을 여기서 흉내 내야
 * 화면의 로딩 상태가 '실제로 쓰이는 코드'가 된다 — 즉시 반환하면
 * 로딩 UI가 한 번도 실행되지 않은 채 배포된다.
 */
import type { SummaryRequest, SummaryResult } from '@entities/summary/model'
import { SUMMARY_RESULTS } from '@fixtures/summary'
import type { ApiResult } from './domains'

/** 테스트에서 지연을 0으로 만들기 위한 주입점 — 테스트가 4초를 기다리게 두지 않는다. */
export type SummaryApiOptions = { delayMs?: number }

const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function createSummary(
  req: SummaryRequest,
  opts: SummaryApiOptions = {},
): Promise<ApiResult<SummaryResult>> {
  await wait(opts.delayMs ?? 1600)

  const byDoc = SUMMARY_RESULTS[req.documentId]
  if (!byDoc) return { ok: false, error: `요약할 문서를 찾지 못했습니다: ${req.documentId}` }

  const result = byDoc[req.style]
  if (!result) return { ok: false, error: `지원하지 않는 요약 방식입니다: ${req.style}` }

  return { ok: true, data: result }
}
