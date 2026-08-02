import type { SafetyPlan, SafetyRequest } from '@entities/safety/model'
import { HAZARDS_CREW_1, HAZARDS_CREW_2, SAFETY_REFERENCES } from '@fixtures/safety'
import type { ApiResult } from './domains'

export type SafetyApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function createSafetyPlan(
  req: SafetyRequest,
  opts: SafetyApiOptions = {},
): Promise<ApiResult<SafetyPlan>> {
  await wait(opts.delayMs ?? 1900)
  // TODO(api-미확정): POST /safety-plans 로 교체. 제거 조건 = 평가 모델·응답 형식 확정.
  if (req.crewSize < 1) return { ok: false, error: '작업 인원은 1명 이상이어야 합니다.' }
  /* 1인 작업이면 상호 확인 대책이 성립하지 않아 빈도와 잔여 위험이 달라진다 */
  const hazards = req.crewSize >= 2 ? HAZARDS_CREW_2 : HAZARDS_CREW_1
  return {
    ok: true,
    data: {
      documentId: req.documentId,
      taskName: '프레스 금형 교체 작업',
      hazards,
      references: SAFETY_REFERENCES,
      elapsedSeconds: 7.2,
    },
  }
}
