import type { OcrRequest, OcrResult } from '@entities/ocr/model'
import { currentPack } from './pack'
import type { ApiResult } from './domains'

export type OcrApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function recognizeDocument(
  req: OcrRequest,
  opts: OcrApiOptions = {},
): Promise<ApiResult<OcrResult>> {
  await wait(opts.delayMs ?? 2100)
  /* 인식 설정이 전부 결과를 바꾼다 — 언어·정밀도는 신뢰도를, 표 추출과 특화 모드는
     뽑히는 항목을, 마스킹은 본문과 기록을 바꾼다.
     TODO(api-미확정): POST /ocr:recognize 로 교체. 제거 조건 = OCR 엔진·응답 형식 확정. */
  const pack = await currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }
  const sim = pack.simulate.ocr
  if (!sim) return { ok: false, error: '이 발주처는 이 에이전트를 아직 도입하지 않았습니다.' }
  return { ok: true, data: sim(req) }
}
