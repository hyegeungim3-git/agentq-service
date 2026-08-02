import { useCallback, useState } from 'react'
import type { AnalysisKind, AnalysisResult } from '@entities/analysis/model'
import { datasetShape } from '@entities/dataset/model'
import { analyzeData, type AnalysisApiOptions } from '@shared/api/analysis'
import { fetchDatasets } from '@shared/api/datasets'
import type { ApiResult } from '@shared/api/domains'
import { useAgentRun, type AgentInput } from '@features/agent-run/useAgentRun'

export type AnalysisOptions = AnalysisApiOptions

/**
 * 분석의 입력은 업무 문서가 아니라 데이터 파일이다.
 *
 * 목록에 행·열 수를 함께 보여 준다 — 파일 이름만으로는 무엇이 들어 있는지 모르고,
 * 12,960행짜리와 486행짜리는 같은 분석을 해도 결론의 무게가 다르다.
 *
 * 모듈 수준에 둔다 — 렌더마다 새 함수를 만들면 목록을 계속 다시 불러온다.
 */
async function loadDatasets(): Promise<ApiResult<AgentInput[]>> {
  const res = await fetchDatasets()
  if (!res.ok) return res
  return {
    ok: true,
    data: res.data.map((d) => ({
      id: d.id,
      name: d.name,
      sizeBytes: d.sizeBytes,
      detail: `${datasetShape(d)} · ${d.source}`,
    })),
  }
}

export function useAnalysis(opts: AnalysisOptions = {}) {
  const [kind, setKind] = useState<AnalysisKind>('trend')
  const delayMs = opts.delayMs
  const run = useCallback(
    (datasetId: string) => analyzeData({ datasetId, kind }, { delayMs }),
    [kind, delayMs],
  )
  const agent = useAgentRun<AnalysisResult, AgentInput>({ loadInputs: loadDatasets, run })
  return { ...agent, run: agent.execute, kind, setKind }
}
