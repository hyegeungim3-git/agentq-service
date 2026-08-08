import { useCallback, useState } from 'react'
import type { AnalysisKind, AnalysisResult } from '@entities/analysis/model'
import { buildOutlierResult } from '@entities/analysis/model'
import { datasetShape } from '@entities/dataset/model'
import { DATASET_UPLOAD } from '@entities/upload/model'
import { analyzeData, type AnalysisApiOptions } from '@shared/api/analysis'
import { fetchDatasets, uploadDataset } from '@shared/api/datasets'
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

/** 올린 데이터 파일도 목록과 같은 모양으로 만들어 돌려준다 */
async function sendDataset(file: File): Promise<ApiResult<AgentInput>> {
  const res = await uploadDataset(file)
  if (!res.ok) return res
  const d = res.data
  return {
    ok: true,
    data: { id: d.id, name: d.name, sizeBytes: d.sizeBytes, detail: `${datasetShape(d)} · ${d.source}` },
  }
}

export function useAnalysis(opts: AnalysisOptions = {}) {
  const [kind, setKind] = useState<AnalysisKind>('trend')
  const delayMs = opts.delayMs
  const run = useCallback(
    async (datasetId: string): Promise<ApiResult<AnalysisResult>> => {
      if (kind !== 'outlier') return analyzeData({ datasetId, kind }, { delayMs })

      /* 이상치는 저장돼 있지 않다 — 추이와 분포를 받아서 계산한다.
         한쪽만 실패해도 이상치라고 부르면 안 된다. 그대로 실패로 말한다 */
      const [trend, dist] = await Promise.all([
        analyzeData({ datasetId, kind: 'trend' }, { delayMs }),
        analyzeData({ datasetId, kind: 'distribution' }, { delayMs: 0 }),
      ])
      if (!trend.ok) return trend
      if (!dist.ok) return dist
      return { ok: true, data: buildOutlierResult(trend.data, dist.data) }
    },
    [kind, delayMs],
  )
  const agent = useAgentRun<AnalysisResult, AgentInput>({
    loadInputs: loadDatasets,
    run,
    upload: DATASET_UPLOAD,
    sendUpload: sendDataset,
  })
  return { ...agent, run: agent.execute, kind, setKind }
}
