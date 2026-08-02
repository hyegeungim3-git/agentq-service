import { useCallback, useState } from 'react'
import type { RegulationSet, ReviewResult } from '@entities/review/model'
import { createReview, type ReviewApiOptions } from '@shared/api/review'
import { DOCUMENT_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'

/** 사전 검토 화면의 옵션과 실행. 공통 흐름은 useAgentRun이 맡는다. */

export type ReviewOptions = ReviewApiOptions

/** 기본 선택 — 어느 기안문에나 걸리는 두 묶음을 켜 둔다 */
const DEFAULT_SETS: RegulationSet[] = ['labor', 'purchase']

export function useReview(opts: ReviewOptions = {}) {
  const [regulationSets, setRegulationSets] = useState<RegulationSet[]>(DEFAULT_SETS)

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) => createReview({ documentId, regulationSets }, { delayMs }),
    [regulationSets, delayMs],
  )

  const agent = useAgentRun<ReviewResult>({ run, upload: DOCUMENT_UPLOAD })

  const toggleSet = useCallback((set: RegulationSet) => {
    setRegulationSets((prev) => (prev.includes(set) ? prev.filter((s) => s !== set) : [...prev, set]))
  }, [])

  return { ...agent, run: agent.execute, regulationSets, toggleSet }
}
