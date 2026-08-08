import type { AnalysisResult, StoredAnalysisKind } from '@entities/analysis/model'
import type { ApiResult } from './domains'
import { currentPack } from './pack'

export type AnalysisApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

/**
 * 저장된 분석 결과 하나.
 *
 * ⚠️ **이상치는 여기서 만들지 않는다.** 추이·분포에서 계산하는 일인데, 그러려면
 * 경계가 엔티티의 함수를 불러야 한다 — 경계는 위층에서 값을 가져오지 않는다
 * (`scripts/boundary.test.ts`가 잡는다). 합치는 일은 화면 쪽(useAnalysis)이 한다.
 * 서버가 붙으면 서버가 이상치까지 계산해 주고, 그때 이 함수의 인자만 넓어진다.
 */
export async function analyzeData(
  req: { datasetId: string; kind: StoredAnalysisKind },
  opts: AnalysisApiOptions = {},
): Promise<ApiResult<AnalysisResult>> {
  await wait(opts.delayMs ?? 2000)
  // TODO(api-미확정): POST /analyses 로 교체. 제거 조건 = 분석 엔진·응답 형식 확정.
  const pack = await currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }
  const byKind = pack.analyses[req.datasetId]
  if (!byKind) return { ok: false, error: `분석 결과가 없는 데이터입니다: ${req.datasetId}` }
  const result = byKind[req.kind]
  if (!result) return { ok: false, error: `지원하지 않는 분석 유형입니다: ${req.kind}` }
  return { ok: true, data: result }
}
