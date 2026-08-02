import { useCallback, useState } from 'react'
import type { LanguageCode, TranslationResult, TranslationTone } from '@entities/translation/model'
import { createTranslation, type TranslationApiOptions } from '@shared/api/translation'
import { DOCUMENT_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'

/** 번역 화면의 옵션과 실행. 공통 흐름은 useAgentRun이 맡는다. */

export type TranslateOptions = TranslationApiOptions

/** 번역은 성적서만 대상으로 한다 — 배열을 모듈 상수로 둬 매 렌더 새 참조가 되지 않게 한다 */
const TARGET_KINDS = ['certificate'] as const

export function useTranslate(opts: TranslateOptions = {}) {
  const [to, setTo] = useState<LanguageCode>('en')
  const [tone, setTone] = useState<TranslationTone>('technical')
  const [useGlossary, setUseGlossary] = useState(true)

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) =>
      createTranslation({ documentId, from: 'ko', to, tone, useGlossary }, { delayMs }),
    [to, tone, useGlossary, delayMs],
  )

  const agent = useAgentRun<TranslationResult>({ kinds: [...TARGET_KINDS], run, upload: DOCUMENT_UPLOAD })

  return {
    ...agent,
    run: agent.execute,
    to,
    tone,
    useGlossary,
    setTo,
    setTone,
    setUseGlossary,
  }
}
