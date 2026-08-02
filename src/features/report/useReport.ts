import { useCallback, useState } from 'react'
import {
  EMPTY_REPORT_INPUTS,
  type ReportInputs,
  type ReportLength,
  type ReportResult,
  type ReportTone,
  type ReportType,
} from '@entities/report/model'
import { createReport, type ReportApiOptions } from '@shared/api/report'
import { DOCUMENT_UPLOAD } from '@entities/upload/model'
import { useAgentRun } from '@features/agent-run/useAgentRun'

export type ReportOptions = ReportApiOptions

export function useReport(opts: ReportOptions = {}) {
  const [type, setType] = useState<ReportType>('weekly')
  const [tone, setTone] = useState<ReportTone>('formal')
  const [length, setLength] = useState<ReportLength>('standard')
  const [inputs, setInputs] = useState<ReportInputs>(EMPTY_REPORT_INPUTS)

  /** 칸 하나만 바꾼다 — 화면이 setInputs로 통째로 갈아 끼우지 않게 한다 */
  const setInput = useCallback((key: keyof ReportInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }, [])

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) => createReport({ documentId, type, tone, length, inputs }, { delayMs }),
    [type, tone, length, inputs, delayMs],
  )
  const agent = useAgentRun<ReportResult>({ run, upload: DOCUMENT_UPLOAD })

  return {
    ...agent,
    run: agent.execute,
    type,
    setType,
    tone,
    setTone,
    length,
    setLength,
    inputs,
    setInput,
  }
}
