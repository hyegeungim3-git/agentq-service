import { useCallback, useState } from 'react'
import {
  EMPTY_MEETING_INPUTS,
  type MeetingInputs,
  type MeetingResult,
} from '@entities/meeting/model'
import { AGENDA_SAMPLE, ATTENDEE_SAMPLE } from '@fixtures/meeting'
import { createMinutes, type MeetingApiOptions } from '@shared/api/meeting'
import { AUDIO_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'

export type MeetingOptions = MeetingApiOptions

/** 회의록은 회의 문서만 대상으로 한다 */
const TARGET_KINDS = ['minutes'] as const

/** 맥락으로 붙일 수 있는 회의 자료 — 녹음 말고 문서 쪽이다 */
export const REFERENCE_CHOICES = [
  { id: 'doc-press-sop', name: '프레스_작업표준서_SOP-PR-011.pdf' },
  { id: 'doc-quality-report', name: '2026년_1분기_품질동향조사.pdf' },
  { id: 'doc-inspection-cert', name: '수입검사성적서_SPCC-2211.pdf' },
]

export function useMeeting(opts: MeetingOptions = {}) {
  const [includeUtterances, setIncludeUtterances] = useState(true)
  const [referenceIds, setReferenceIds] = useState<string[]>([])
  const [inputs, setInputs] = useState<MeetingInputs>({
    ...EMPTY_MEETING_INPUTS,
    attendees: ATTENDEE_SAMPLE,
    agenda: AGENDA_SAMPLE,
  })

  const setInput = useCallback((key: keyof MeetingInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleReference = useCallback((id: string) => {
    setReferenceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) =>
      createMinutes({ documentId, includeUtterances, referenceIds, inputs }, { delayMs }),
    [includeUtterances, referenceIds, inputs, delayMs],
  )
  const agent = useAgentRun<MeetingResult>({ kinds: [...TARGET_KINDS], run, upload: AUDIO_UPLOAD })

  return {
    ...agent,
    run: agent.execute,
    includeUtterances,
    setIncludeUtterances,
    referenceIds,
    toggleReference,
    inputs,
    setInput,
  }
}
