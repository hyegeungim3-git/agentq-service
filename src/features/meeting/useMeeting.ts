import { useCallback, useState } from 'react'
import type { MeetingResult } from '@entities/meeting/model'
import { createMinutes, type MeetingApiOptions } from '@shared/api/meeting'
import { AUDIO_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'

export type MeetingOptions = MeetingApiOptions

/** 회의록은 회의 문서만 대상으로 한다 */
const TARGET_KINDS = ['minutes'] as const

export function useMeeting(opts: MeetingOptions = {}) {
  const [includeUtterances, setIncludeUtterances] = useState(true)

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) => createMinutes({ documentId, includeUtterances }, { delayMs }),
    [includeUtterances, delayMs],
  )
  const agent = useAgentRun<MeetingResult>({ kinds: [...TARGET_KINDS], run, upload: AUDIO_UPLOAD })
  return { ...agent, run: agent.execute, includeUtterances, setIncludeUtterances }
}
