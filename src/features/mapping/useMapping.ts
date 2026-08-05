import { useCallback, useEffect, useState } from 'react'
import type { MappingMode, MappingResult, MappingStatus } from '@entities/mapping/model'
import type { MappingConfig } from '@shared/api/mapping'
import { fetchMappingConfig, runMapping, type MappingApiOptions } from '@shared/api/mapping'
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

/**
 * 처리 유형·예시·대상 문서는 **발주처가 정한다.**
 * 코어에 두었더니 병원 화면에도 `수입검사성적서_SPCC-2211.pdf`가 떴다.
 */
const EMPTY_CONFIG: MappingConfig = {
  modes: [],
  tagsTargetNote: null,
  ocrDocument: null,
  addressExamples: [],
  codeExamples: [],
}

export function useMapping(opts: MappingOptions = {}) {
  const [config, setConfig] = useState<MappingConfig>(EMPTY_CONFIG)
  const [mode, setModeState] = useState<MappingMode | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [query, setQuery] = useState('')
  const [batchText, setBatchText] = useState('')

  /* 일괄 처리 예시 주소도, 쓰는 처리 유형도 발주처 것이다 */
  useEffect(() => {
    let alive = true
    void fetchSamples().then((res) => {
      if (!alive || !res.ok) return
      setBatchText((prev) => prev || (res.data.addressBatch ?? ''))
    })
    void fetchMappingConfig().then((res) => {
      if (!alive || !res.ok) return
      setConfig(res.data)
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

  /* 아직 목록을 못 받았으면 첫 유형이 정해지지 않는다 — 받은 뒤 첫 항목이 기본이다.
     실행도 이 값을 쓴다. 화면이 보는 값과 실행하는 값이 다르면
     '고른 것이 결과를 안 바꾸는' 화면이 된다 */
  const current: MappingMode | null = mode ?? config.modes[0] ?? null

  const delayMs = opts.delayMs
  const run = useCallback(async () => {
    if (!current) return
    setPhase({ kind: 'running' })
    setApplied(new Set())
    const res = await runMapping(
      { mode: current, query, batchText, documentName: config.ocrDocument ?? '' },
      { delayMs },
    )
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [current, query, batchText, delayMs, config.ocrDocument])

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
    config,
    mode: current,
    setMode,
    phase,
    query,
    setQuery,
    batchText,
    setBatchText,
    ocrDocument: config.ocrDocument ?? '',
    filter,
    setFilter,
    applied,
    applyAuto,
    expanded,
    toggleExpand,
    run,
  }
}
