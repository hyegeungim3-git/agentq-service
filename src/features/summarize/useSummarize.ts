import { useCallback, useState } from 'react'
import type { FocusArea, SummaryResult, SummaryStyle, TargetLength } from '@entities/summary/model'
import { createSummary, type SummaryApiOptions } from '@shared/api/summary'
import { useAgentRun } from '@features/agent-run/useAgentRun'

/**
 * 요약 화면의 옵션과 실행.
 *
 * 문서 로딩·실행 전이는 useAgentRun이 맡는다. 여기 남은 것은
 * **이 에이전트만의 옵션**(방식·분량·관점)뿐이다.
 */

export type SummarizeOptions = SummaryApiOptions

export function useSummarize(opts: SummarizeOptions = {}) {
  const [style, setStyle] = useState<SummaryStyle>('detailed')
  const [targetLength, setTargetLength] = useState<TargetLength>(300)
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([])

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) =>
      createSummary({ documentId, style, targetLength, focusAreas }, { delayMs }),
    [style, targetLength, focusAreas, delayMs],
  )

  const agent = useAgentRun<SummaryResult>({ run })

  const toggleFocus = useCallback((area: FocusArea) => {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }, [])

  return {
    ...agent,
    run: agent.execute,
    style,
    targetLength,
    focusAreas,
    setStyle,
    setTargetLength,
    toggleFocus,
  }
}
