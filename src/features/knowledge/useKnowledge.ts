import { useCallback, useState } from 'react'
import type { KnowledgeResult, SimilarityStep } from '@entities/knowledge/model'
import { searchDrawings, type KnowledgeApiOptions } from '@shared/api/knowledge'
import { DOCUMENT_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'

export type KnowledgeOptions = KnowledgeApiOptions

export function useKnowledge(opts: KnowledgeOptions = {}) {
  const [minSimilarity, setMinSimilarity] = useState<SimilarityStep>(0.7)
  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) => searchDrawings({ documentId, minSimilarity }, { delayMs }),
    [minSimilarity, delayMs],
  )
  const agent = useAgentRun<KnowledgeResult>({ run, upload: DOCUMENT_UPLOAD })
  return { ...agent, run: agent.execute, minSimilarity, setMinSimilarity }
}
