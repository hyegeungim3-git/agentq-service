import { useCallback, useState } from 'react'
import { lowConfidenceLines } from '@entities/ocr/model'
import { countByStatus } from '@entities/mapping/model'
import { EMPTY_REPORT_INPUTS } from '@entities/report/model'
import type { StepOutcome } from '@entities/orchestration/model'
import { recognizeDocument } from '@shared/api/ocr'
import { runMapping } from '@shared/api/mapping'
import { runQuery } from '@shared/api/dataquery'
import { createReport } from '@shared/api/report'
import { currentPack } from '@shared/api/pack'

export type OrchestrationOptions = { delayMs?: number | undefined }

/**
 * 서류 한 건이 들어왔을 때의 릴레이.
 *
 * 각 단계는 **해당 에이전트의 API 경계를 실제로 호출**한다. 따로 흉내 낸 결과를
 * 두면 에이전트를 고쳐도 릴레이는 옛 값을 계속 보여 준다.
 *
 * ⚠️ 구조(인식 → 표준화 → 조회 → 보고)만 여기 있고 **부르는 값과 단계 이름은
 * 팩이 준다**(`pack.relay`). 코어에 이야기를 하나 박아 뒀더니 릴레이가 제조
 * 전용이 돼서 나머지 세 발주처는 카드를 못 그렸다.
 */

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
  const relay = currentPack()?.relay ?? null

  const delayMs = opts.delayMs

  const run = useCallback(async () => {
    if (!relay) return
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
          documentId: relay.ocr.documentId,
          maskPii: true,
          language: 'ko-en',
          mode: relay.ocr.mode,
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

    // 2 · 기준정보 표준화 (주소를 안 푸는 발주처는 태그·코드 매핑으로 돈다)
    const addr = await step(1, async () => {
      const res = await runMapping(
        {
          mode: relay.mapping.mode,
          query: '',
          batchText: '',
          documentName: relay.mapping.documentName,
        },
        { delayMs },
      )
      if (!res.ok) return fail(res.error)
      if (res.data.mode === 'address-ocr') {
        const c = countByStatus(res.data.candidates)
        const points: string[] = []
        if (c.review > 0) points.push(`${c.review}건은 대상이 특정되지 않아 담당자 확인 필요`)
        if (c.none > 0) points.push(`${c.none}건은 인식 신뢰도가 낮아 표준화하지 못함`)
        return {
          status: 'done' as const,
          output: `${res.data.candidates.length}건 중 자동 확정 ${c.auto}건`,
          reviewPoints: points,
          elapsedSeconds: res.data.elapsedSeconds,
          error: null,
        }
      }
      if (res.data.mode === 'tags') {
        const stuck = res.data.reasons.filter((r) => !r.aiSolvable)
        return {
          status: 'done' as const,
          output: `${res.data.totalTags.toLocaleString('ko-KR')}건 중 표준화 ${res.data.standardized.toLocaleString('ko-KR')}건`,
          reviewPoints: stuck.map((r) => `AI로 안 되는 ${r.count}건 — ${r.label}`),
          elapsedSeconds: res.data.elapsedSeconds,
          error: null,
        }
      }
      return fail('예상과 다른 결과 형식입니다.')
    })
    if (addr.status === 'failed') return setPhase({ kind: 'stopped', index: 1 })

    // 3 · 이력 조회
    const q = await step(2, async () => {
      const r = await runQuery(
        { source: relay.query.source, question: relay.query.question },
        { delayMs },
      )
      if (!r.ok) return fail(r.error)
      return {
        status: 'done' as const,
        output: `${r.data.rows.length}건 조회`,
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
          documentId: relay.report.documentId,
          type: relay.report.type,
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
  }, [delayMs, relay])

  const reset = useCallback(() => {
    setPhase({ kind: 'idle' })
    setOutcomes([])
  }, [])

  return { scenario: relay?.scenario ?? null, phase, outcomes, run, reset }
}
