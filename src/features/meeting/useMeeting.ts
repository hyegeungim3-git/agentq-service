import { useCallback, useEffect, useState } from 'react'
import {
  EMPTY_MEETING_INPUTS,
  type MeetingInputs,
  type MeetingResult,
} from '@entities/meeting/model'
import { createMinutes, type MeetingApiOptions } from '@shared/api/meeting'
import { AUDIO_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'
import { fetchSamples } from '@shared/api/pack'
import { fetchDocuments } from '@shared/api/documents'

export type MeetingOptions = MeetingApiOptions

/** 회의록은 회의 문서만 대상으로 한다 */
const TARGET_KINDS = ['minutes'] as const

/**
 * 맥락으로 붙일 수 있는 회의 자료 — 녹음 말고 문서 쪽이다.
 *
 * 코어에 목록을 박아 뒀더니 병원 회의록 화면에도 `프레스_작업표준서`가 떴다.
 * **이 발주처의 업무 문서**에서 가져온다.
 */
export function useMeeting(opts: MeetingOptions = {}) {
  const [includeUtterances, setIncludeUtterances] = useState(true)
  const [referenceIds, setReferenceIds] = useState<string[]>([])
  const [references, setReferences] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    let alive = true
    void fetchDocuments(['sop', 'report', 'certificate']).then((res) => {
      if (!alive || !res.ok) return
      setReferences(res.data.slice(0, 3).map((d) => ({ id: d.id, name: d.name })))
    })
    return () => {
      alive = false
    }
  }, [])
  const [inputs, setInputs] = useState<MeetingInputs>(EMPTY_MEETING_INPUTS)

  /* 참석자·안건 예시도 발주처 것이다. 예전에는 훅이 fixture에서 직접 가져왔고,
     그러면 발주처를 바꿔도 제조 사람 이름이 입력창에 남는다 */
  useEffect(() => {
    let alive = true
    void fetchSamples().then((res) => {
      if (!alive || !res.ok) return
      setInputs((prev) => ({
        ...prev,
        attendees: prev.attendees || (res.data.attendees ?? ''),
        agenda: prev.agenda || (res.data.agenda ?? ''),
      }))
    })
    return () => {
      alive = false
    }
  }, [])

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
    references,
    includeUtterances,
    setIncludeUtterances,
    referenceIds,
    toggleReference,
    inputs,
    setInput,
  }
}
