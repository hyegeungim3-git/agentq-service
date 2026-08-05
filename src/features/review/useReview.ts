import { useCallback, useEffect, useState } from 'react'
import type { RegulationSet, RegulationSetOption, ReviewResult } from '@entities/review/model'
import { createReview, fetchReviewSets, type ReviewApiOptions } from '@shared/api/review'
import { DOCUMENT_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'

/** 사전 검토 화면의 옵션과 실행. 공통 흐름은 useAgentRun이 맡는다. */

export type ReviewOptions = ReviewApiOptions

export function useReview(opts: ReviewOptions = {}) {
  /**
   * 대조할 규정 묶음은 **발주처가 정한다.**
   *
   * 예전에는 코드 다섯 개를 화면이 알고 있었고 기본 선택도 `['labor','purchase']`로
   * 박혀 있었다 — 그 코드가 없는 발주처에서는 아무것도 안 켜진 채로 열린다.
   * 이제 목록을 받아 **앞의 둘**을 켠다.
   */
  const [sets, setSets] = useState<RegulationSetOption[]>([])
  const [regulationSets, setRegulationSets] = useState<RegulationSet[]>([])

  useEffect(() => {
    let alive = true
    void fetchReviewSets().then((res) => {
      if (!alive || !res.ok) return
      setSets(res.data)
      setRegulationSets(res.data.slice(0, 2).map((s) => s.code))
    })
    return () => {
      alive = false
    }
  }, [])

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) => createReview({ documentId, regulationSets }, { delayMs }),
    [regulationSets, delayMs],
  )

  const agent = useAgentRun<ReviewResult>({ run, upload: DOCUMENT_UPLOAD })

  const toggleSet = useCallback((set: RegulationSet) => {
    setRegulationSets((prev) => (prev.includes(set) ? prev.filter((s) => s !== set) : [...prev, set]))
  }, [])

  return { ...agent, run: agent.execute, sets, regulationSets, toggleSet }
}
