import { useCallback, useState } from 'react'
import type { OcrFormat, OcrLanguage, OcrMode, OcrResult } from '@entities/ocr/model'
import { recognizeDocument, type OcrApiOptions } from '@shared/api/ocr'
import { SCAN_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'

export type OcrOptions = OcrApiOptions

/** OCR은 스캔된 성적서를 대상으로 한다 */
const TARGET_KINDS = ['certificate'] as const

/**
 * 기본값을 '이 문서에 딱 맞는 설정'으로 두지 않았다.
 * 처음부터 최적이면 설정을 건드릴 이유가 없고, 설정이 결과를 어떻게 바꾸는지
 * 알 기회도 없다. 대신 결과 화면이 '수치 정밀 인식이 꺼져 있어 신뢰도가 낮다'고 말한다.
 */
export function useOcr(opts: OcrOptions = {}) {
  const [maskPii, setMaskPii] = useState(true)
  const [language, setLanguage] = useState<OcrLanguage>('ko-en')
  const [mode, setMode] = useState<OcrMode>('standard')
  const [format, setFormat] = useState<OcrFormat>('text')
  const [extractTables, setExtractTables] = useState(false)
  const [precisionNumbers, setPrecisionNumbers] = useState(false)

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) =>
      recognizeDocument(
        { documentId, maskPii, language, mode, format, extractTables, precisionNumbers },
        { delayMs },
      ),
    [maskPii, language, mode, format, extractTables, precisionNumbers, delayMs],
  )
  const agent = useAgentRun<OcrResult>({ kinds: [...TARGET_KINDS], run, upload: SCAN_UPLOAD })

  return {
    ...agent,
    run: agent.execute,
    maskPii,
    setMaskPii,
    language,
    setLanguage,
    mode,
    setMode,
    format,
    setFormat,
    extractTables,
    setExtractTables,
    precisionNumbers,
    setPrecisionNumbers,
  }
}
