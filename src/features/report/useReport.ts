import { useCallback, useState } from 'react'
import type { ReportResult, ReportType } from '@entities/report/model'
import { createReport, type ReportApiOptions } from '@shared/api/report'
import { useAgentRun } from '@features/agent-run/useAgentRun'

export type ReportOptions = ReportApiOptions

export function useReport(opts: ReportOptions = {}) {
  const [type, setType] = useState<ReportType>('weekly')
  const [includeCharts, setIncludeCharts] = useState(false)

  const delayMs = opts.delayMs
  const run = useCallback(
    (documentId: string) => createReport({ documentId, type, includeCharts }, { delayMs }),
    [type, includeCharts, delayMs],
  )
  const agent = useAgentRun<ReportResult>({ run })
  return { ...agent, run: agent.execute, type, setType, includeCharts, setIncludeCharts }
}
