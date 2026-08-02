import { useCallback, useState } from 'react'
import type { MappingResult, MappingStatus } from '@entities/mapping/model'
import { analyzeMapping, type MappingApiOptions } from '@shared/api/mapping'

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

export function useMapping(opts: MappingOptions = {}) {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [filter, setFilter] = useState<MappingStatus | 'all'>('all')
  /** 사용자가 확정한 후보 id — 확정은 사람이 누른 것만 반영한다 */
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)

  const delayMs = opts.delayMs
  const run = useCallback(async () => {
    setPhase({ kind: 'running' })
    setApplied(new Set())
    const res = await analyzeMapping({ delayMs })
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [delayMs])

  /** 자동 확정 가능한 것만 일괄 반영 — review·none은 건드리지 않는다.
      화면의 후보는 예시라 반영 효과는 집계값(autoConfirmable)으로 계산한다. */
  const applyAuto = useCallback(() => {
    if (phase.kind !== 'done') return
    const ids = phase.result.candidates.filter((c) => c.status === 'auto').map((c) => c.id)
    setApplied(new Set(ids))
  }, [phase])

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => (prev === id ? null : id))
  }, [])

  return { phase, filter, setFilter, applied, applyAuto, expanded, toggleExpand, run }
}
