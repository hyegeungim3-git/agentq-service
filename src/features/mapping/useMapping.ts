import { useCallback, useEffect, useState } from 'react'
import type { MappingMode, MappingResult, MappingStatus } from '@entities/mapping/model'
import { runMapping, type MappingApiOptions } from '@shared/api/mapping'
import { fetchSamples } from '@shared/api/pack'

/**
 * 기준정보 표준화는 문서 선택도 질문 입력도 아니라 '수집 결과를 훑고
 * 사람이 판정하는' 형태다. 그래서 useAgentRun을 쓰지 않는다.
 */

export type Phase =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'failed'; message: string }
  | { kind: 'done'; result: MappingResult }

export type MappingOptions = MappingApiOptions

/** OCR 대상 문서 — 이 에이전트는 성적서에서 주소를 뽑는다 */
const OCR_DOCUMENT = '수입검사성적서_SPCC-2211.pdf'

export function useMapping(opts: MappingOptions = {}) {
  const [mode, setModeState] = useState<MappingMode>('tags')
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [query, setQuery] = useState('')
  const [batchText, setBatchText] = useState('')

  /* 일괄 처리 예시 주소도 발주처 것이다 */
  useEffect(() => {
    let alive = true
    void fetchSamples().then((res) => {
      if (!alive || !res.ok) return
      setBatchText((prev) => prev || (res.data.addressBatch ?? ''))
    })
    return () => {
      alive = false
    }
  }, [])
  const [filter, setFilter] = useState<MappingStatus | 'all'>('all')
  /** 사용자가 확정한 후보 id — 확정은 사람이 누른 것만 반영한다 */
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)

  /** 유형을 바꾸면 이전 결과를 지운다 — 다른 유형의 결과가 남아 있으면 오해한다 */
  const setMode = useCallback((next: MappingMode) => {
    setModeState(next)
    setPhase({ kind: 'idle' })
    setApplied(new Set())
    setExpanded(null)
  }, [])

  const delayMs = opts.delayMs
  const run = useCallback(async () => {
    setPhase({ kind: 'running' })
    setApplied(new Set())
    const res = await runMapping({ mode, query, batchText, documentName: OCR_DOCUMENT }, { delayMs })
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [mode, query, batchText, delayMs])

  /** 자동 확정 가능한 것만 일괄 반영 — review·none은 건드리지 않는다.
      화면의 후보는 예시라 반영 효과는 집계값(autoConfirmable)으로 계산한다. */
  const applyAuto = useCallback(() => {
    if (phase.kind !== 'done' || phase.result.mode !== 'tags') return
    const ids = phase.result.candidates.filter((c) => c.status === 'auto').map((c) => c.id)
    setApplied(new Set(ids))
  }, [phase])

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => (prev === id ? null : id))
  }, [])

  return {
    mode,
    setMode,
    phase,
    query,
    setQuery,
    batchText,
    setBatchText,
    ocrDocument: OCR_DOCUMENT,
    filter,
    setFilter,
    applied,
    applyAuto,
    expanded,
    toggleExpand,
    run,
  }
}
