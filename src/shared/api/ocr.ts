import type { OcrRequest, OcrResult } from '@entities/ocr/model'
import { OCR_LINES, OCR_LINES_MASKED, OCR_MASKS } from '@fixtures/ocr'
import type { ApiResult } from './domains'

export type OcrApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function recognizeDocument(
  req: OcrRequest,
  opts: OcrApiOptions = {},
): Promise<ApiResult<OcrResult>> {
  await wait(opts.delayMs ?? 2100)
  /* 마스킹 토글이 본문과 마스킹 기록을 모두 바꾼다 —
     '가렸다'고 말만 하고 원문이 그대로면 위험하다 */
  return {
    ok: true,
    data: {
      documentId: req.documentId,
      lines: req.maskPii ? OCR_LINES_MASKED : OCR_LINES,
      masks: req.maskPii ? OCR_MASKS : [],
      elapsedSeconds: 9.4,
    },
  }
}
