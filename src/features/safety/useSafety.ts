import { useCallback, useState } from 'react'
import type { SafetyPlan } from '@entities/safety/model'
import { createSafetyPlan, type SafetyApiOptions } from '@shared/api/safety'
import { useAgentRun } from '@features/agent-run/useAgentRun'

export type SafetyOptions = SafetyApiOptions

export function useSafety(opts: SafetyOptions = {}) {
  const [crewSize, setCrewSize] = useState(2)
  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) => createSafetyPlan({ documentId, crewSize }, { delayMs }),
    [crewSize, delayMs],
  )
  const agent = useAgentRun<SafetyPlan>({ run })
  return { ...agent, run: agent.execute, crewSize, setCrewSize }
}
