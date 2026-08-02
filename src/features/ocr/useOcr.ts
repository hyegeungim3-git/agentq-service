import { useCallback, useState } from 'react'
import type { OcrResult } from '@entities/ocr/model'
import { recognizeDocument, type OcrApiOptions } from '@shared/api/ocr'
import { useAgentRun } from '@features/agent-run/useAgentRun'

export type OcrOptions = OcrApiOptions

/** OCR은 스캔된 성적서를 대상으로 한다 */
const TARGET_KINDS = ['certificate'] as const

export function useOcr(opts: OcrOptions = {}) {
  const [maskPii, setMaskPii] = useState(true)
  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) => recognizeDocument({ documentId, maskPii }, { delayMs }),
    [maskPii, delayMs],
  )
  const agent = useAgentRun<OcrResult>({ kinds: [...TARGET_KINDS], run })
  return { ...agent, run: agent.execute, maskPii, setMaskPii }
}
