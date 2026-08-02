import { useCallback, useState } from 'react'
import { lowConfidenceLines } from '@entities/ocr/model'
import { countByStatus } from '@entities/mapping/model'
import { EMPTY_REPORT_INPUTS } from '@entities/report/model'
import type { Scenario, StepOutcome } from '@entities/orchestration/model'
import { recognizeDocument } from '@shared/api/ocr'
import { runMapping } from '@shared/api/mapping'
import { runQuery } from '@shared/api/dataquery'
import { createReport } from '@shared/api/report'

export type OrchestrationOptions = { delayMs?: number | undefined }

/**
 * 검사성적서 한 건이 들어왔을 때의 릴레이.
 *
 * 각 단계는 **해당 에이전트의 API 경계를 실제로 호출**한다. 따로 흉내 낸 결과를
 * 두면 에이전트를 고쳐도 릴레이는 옛 값을 계속 보여 준다.
 */
export const INSPECTION_SCENARIO: Scenario = {
  id: 'sc-inspection',
  title: '수입검사 성적서 접수 처리',
  trigger: '협력사가 보낸 검사성적서 스캔본 1건이 접수되었습니다.',
  deliverable: '이상 발생 보고 초안',
  steps: [
    {
      id: 'st-ocr',
      agentId: 'ocr',
      title: '성적서 인식',
      input: '스캔본 PDF',
      apiCall: 'shared/api/ocr · recognizeDocument()',
    },
    {
      id: 'st-address',
      agentId: 'address',
      title: '공급업체 주소 표준화',
      input: '인식된 본문에서 뽑은 주소 줄',
      apiCall: 'shared/api/mapping · runMapping({ mode: address-ocr })',
    },
    {
      id: 'st-query',
      agentId: 'dbquery',
      title: '해당 설비 이력 조회',
      input: '성적서의 로트·설비 정보',
      apiCall: 'shared/api/dataquery · runQuery()',
    },
    {
      id: 'st-report',
      agentId: 'report',
      title: '이상 발생 보고 초안',
      input: '앞 단계의 인식·조회 결과',
      apiCall: 'shared/api/report · createReport({ type: incident })',
    },
  ],
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'running'; index: number }
  | { kind: 'stopped'; index: number }
  | { kind: 'done' }

const fail = (message: string): StepOutcome => ({
  status: 'failed',
  output: null,
  reviewPoints: [],
  elapsedSeconds: null,
  error: message,
})

export function useOrchestration(opts: OrchestrationOptions = {}) {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [outcomes, setOutcomes] = useState<StepOutcome[]>([])

  const delayMs = opts.delayMs

  const run = useCallback(async () => {
    setOutcomes([])
    const acc: StepOutcome[] = []

    const step = async (i: number, fn: () => Promise<StepOutcome>) => {
      setPhase({ kind: 'running', index: i })
      const out = await fn()
      acc.push(out)
      setOutcomes([...acc])
      return out
    }

    // 1 · 성적서 인식
    const ocr = await step(0, async () => {
      const res = await recognizeDocument(
        {
          documentId: 'doc-inspection-cert',
          maskPii: true,
          language: 'ko-en',
          mode: 'inspection',
          format: 'text',
          extractTables: true,
          precisionNumbers: true,
        },
        { delayMs },
      )
      if (!res.ok) return fail(res.error)
      const weak = lowConfidenceLines(res.data.lines)
      return {
        status: 'done' as const,
        output: `${res.data.lines.length}줄 인식 · 규격 항목 ${res.data.specFields.length}건 추출`,
        reviewPoints: weak.map(
          (l) => `${l.index + 1}번째 줄 신뢰도 ${Math.round(l.confidence * 100)}% — 원본 대조 필요`,
        ),
        elapsedSeconds: res.data.elapsedSeconds,
        error: null,
      }
    })
    if (ocr.status === 'failed') return setPhase({ kind: 'stopped', index: 0 })

    // 2 · 공급업체 주소 표준화
    const addr = await step(1, async () => {
      const res = await runMapping(
        { mode: 'address-ocr', query: '', batchText: '', documentName: '수입검사성적서_SPCC-2211.pdf' },
        { delayMs },
      )
      if (!res.ok) return fail(res.error)
      if (res.data.mode !== 'address-ocr') return fail('예상과 다른 결과 형식입니다.')
      const c = countByStatus(res.data.candidates)
      const points: string[] = []
      if (c.review > 0) points.push(`주소 ${c.review}건은 건물이 특정되지 않아 담당자 확인 필요`)
      if (c.none > 0) points.push(`주소 ${c.none}건은 OCR 신뢰도가 낮아 표준화하지 못함`)
      return {
        status: 'done' as const,
        output: `주소 ${res.data.candidates.length}건 중 자동 확정 ${c.auto}건`,
        reviewPoints: points,
        elapsedSeconds: res.data.elapsedSeconds,
        error: null,
      }
    })
    if (addr.status === 'failed') return setPhase({ kind: 'stopped', index: 1 })

    // 3 · 설비 이력 조회
    const q = await step(2, async () => {
      const r = await runQuery(
        { source: 'equipment', question: '창원본사 최근 도입 설비를 진동 높은 순으로' },
        { delayMs },
      )
      if (!r.ok) return fail(r.error)
      return {
        status: 'done' as const,
        output: `설비 ${r.data.rows.length}건 조회`,
        reviewPoints: [
          ...r.data.assumptions.map((a) => `조회 가정 — ${a}`),
          ...r.data.unmapped.map((u) => `SQL로 옮기지 못한 표현 — ${u}`),
        ],
        elapsedSeconds: r.data.elapsedSeconds,
        error: null,
      }
    })
    if (q.status === 'failed') return setPhase({ kind: 'stopped', index: 2 })

    // 4 · 이상 발생 보고 초안
    const rep = await step(3, async () => {
      const res = await createReport(
        {
          documentId: 'doc-inspection-cert',
          type: 'incident',
          tone: 'formal',
          length: 'standard',
          inputs: EMPTY_REPORT_INPUTS,
        },
        { delayMs },
      )
      if (!res.ok) return fail(res.error)
      return {
        status: 'done' as const,
        output: `${res.data.docNo} 초안 작성`,
        reviewPoints: res.data.pendingFields.map((f) => `보고서 미기재 — ${f}`),
        elapsedSeconds: res.data.elapsedSeconds,
        error: null,
      }
    })
    if (rep.status === 'failed') return setPhase({ kind: 'stopped', index: 3 })

    setPhase({ kind: 'done' })
  }, [delayMs])

  const reset = useCallback(() => {
    setPhase({ kind: 'idle' })
    setOutcomes([])
  }, [])

  return { scenario: INSPECTION_SCENARIO, phase, outcomes, run, reset }
}
