import { useCallback, useEffect, useState } from 'react'
import {
  DIRECTIONS,
  documentAvailable,
  type Direction,
  type TranslationResult,
  type TranslationSource,
  type TranslationTone,
} from '@entities/translation/model'
import { createTranslation, type TranslationApiOptions } from '@shared/api/translation'
import { DOCUMENT_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'
import { fetchSamples } from '@shared/api/pack'

/** 번역 화면의 옵션과 실행. 공통 흐름은 useAgentRun이 맡는다. */

export type TranslateOptions = TranslationApiOptions

/** 번역은 성적서만 대상으로 한다 — 배열을 모듈 상수로 둬 매 렌더 새 참조가 되지 않게 한다 */
const TARGET_KINDS = ['certificate'] as const

export function useTranslate(opts: TranslateOptions = {}) {
  const [direction, setDirectionState] = useState<Direction>(DIRECTIONS[0] as Direction)
  const [source, setSource] = useState<TranslationSource>('document')
  const [text, setText] = useState('')
  const [tone, setTone] = useState<TranslationTone>('technical')
  const [useGlossary, setUseGlossary] = useState(true)
  const [withSummary, setWithSummary] = useState(false)
  /* 예시 원문도 발주처 것이다 — 화면이 fixture를 직접 읽으면 발주처를 바꿔도 안 바뀐다 */
  const [samples, setSamples] = useState<Record<'ko' | 'en', string> | null>(null)

  useEffect(() => {
    let alive = true
    void fetchSamples().then((res) => {
      if (alive && res.ok) setSamples(res.data.translationSource ?? null)
    })
    return () => {
      alive = false
    }
  }, [])

  /**
   * 사내 문서는 한국어라 영→한은 문서를 원문으로 쓸 수 없다.
   * 방향을 바꿀 때 입력 방식을 함께 맞춰 준다 — 고를 수 없는 조합을 남겨 두면
   * 실행하고 나서야 안 된다는 걸 알게 된다.
   */
  const setDirection = useCallback(
    (next: Direction) => {
      setDirectionState(next)
      if (!documentAvailable(next)) {
        setSource('text')
        setText((prev) => (prev.trim().length > 0 ? prev : (samples?.en ?? '')))
      }
    },
    [samples],
  )

  const loadSample = useCallback(() => {
    setText(direction.from === 'ko' ? (samples?.ko ?? '') : (samples?.en ?? ''))
  }, [direction.from, samples])

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) =>
      createTranslation(
        {
          documentId,
          source,
          from: direction.from,
          to: direction.to,
          tone,
          useGlossary,
          withSummary,
        },
        text,
        { delayMs },
      ),
    [source, direction, tone, useGlossary, withSummary, text, delayMs],
  )

  const agent = useAgentRun<TranslationResult>({ kinds: [...TARGET_KINDS], run, upload: DOCUMENT_UPLOAD })

  return {
    ...agent,
    run: agent.execute,
    direction,
    setDirection,
    source,
    setSource,
    text,
    setText,
    loadSample,
    tone,
    useGlossary,
    withSummary,
    setTone,
    setUseGlossary,
    setWithSummary,
    canUseDocument: documentAvailable(direction),
  }
}
