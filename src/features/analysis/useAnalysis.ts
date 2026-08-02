import { useCallback, useState } from 'react'
import type { AnalysisKind, AnalysisResult } from '@entities/analysis/model'
import { analyzeData, type AnalysisApiOptions } from '@shared/api/analysis'
import { useAgentRun } from '@features/agent-run/useAgentRun'

export type AnalysisOptions = AnalysisApiOptions

export function useAnalysis(opts: AnalysisOptions = {}) {
  const [kind, setKind] = useState<AnalysisKind>('trend')
  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) => analyzeData({ documentId, kind }, { delayMs }),
    [kind, delayMs],
  )
  const agent = useAgentRun<AnalysisResult>({ run })
  return { ...agent, run: agent.execute, kind, setKind }
}
