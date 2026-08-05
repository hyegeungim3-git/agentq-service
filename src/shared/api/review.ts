import type { RegulationSetOption, ReviewRequest, ReviewResult } from '@entities/review/model'
import type { ApiResult } from './domains'
import { currentPack, withPack } from './pack'

/** 이 발주처가 대조하는 규정 묶음 — 이름도 발주처가 정한다 */
export function fetchReviewSets(): Promise<ApiResult<RegulationSetOption[]>> {
  // TODO(api-미확정): GET /reviews/regulation-sets 로 교체. 제거 조건 = API 명세 확정.
  return withPack((p) => p.reviewSets)
}

export type ReviewApiOptions = { delayMs?: number | undefined }

const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function createReview(
  req: ReviewRequest,
  opts: ReviewApiOptions = {},
): Promise<ApiResult<ReviewResult>> {
  await wait(opts.delayMs ?? 2000)
  // TODO(api-미확정): POST /reviews 로 교체. 제거 조건 = 검토 모델·응답 형식 확정.

  if (req.regulationSets.length === 0) {
    return { ok: false, error: '대조할 규정을 1개 이상 선택하세요.' }
  }

  const pack = currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }

  /* 선택한 규정 묶음의 위반만 모은다 — 규정 선택이 결과를 실제로 바꿔야
     그 체크박스가 장식이 아니게 된다. */
  const violations = req.regulationSets.flatMap((set) => pack.violationsBySet[set] ?? [])
  const checkedClauses = req.regulationSets.reduce(
    (sum, set) => sum + (pack.clauseCountBySet[set] ?? 0),
    0,
  )

  return {
    ok: true,
    data: {
      documentId: req.documentId,
      violations,
      checkedClauses,
      elapsedSeconds: Math.round((4 + req.regulationSets.length * 1.4) * 10) / 10,
    },
  }
}
