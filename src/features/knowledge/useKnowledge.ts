import { useCallback, useEffect, useState } from 'react'
import type {
  KnowledgeBase,
  KnowledgeResult,
  SearchMode,
  SecurityLevel,
  TopKStep,
} from '@entities/knowledge/model'
import {
  fetchKnowledgeBases,
  searchKnowledge,
  type KnowledgeApiOptions,
} from '@shared/api/knowledge'

export type KnowledgeOptions = KnowledgeApiOptions

/**
 * 지식 검색은 문서를 고르는 화면이 아니라 **검색어를 입력하는 화면**이라
 * 문서 입력형 골격(AgentShell·useAgentRun)을 쓰지 않는다.
 * 억지로 맞추면 '문서를 고르라'는 절이 남아 화면이 이상해진다(내규 조회와 같은 이유).
 */
export type SearchPhase =
  | { kind: 'loadingBases' }
  | { kind: 'basesError'; message: string }
  | { kind: 'ready' }
  | { kind: 'searching' }
  | { kind: 'failed'; message: string }
  | { kind: 'done'; result: KnowledgeResult }

export function useKnowledge(opts: KnowledgeOptions = {}) {
  const [bases, setBases] = useState<KnowledgeBase[]>([])
  const [baseIds, setBaseIds] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('semantic')
  const [security, setSecurity] = useState<SecurityLevel | 'all'>('all')
  const [topK, setTopK] = useState<TopKStep>(3)
  const [phase, setPhase] = useState<SearchPhase>({ kind: 'loadingBases' })

  useEffect(() => {
    let alive = true
    void fetchKnowledgeBases().then((res) => {
      if (!alive) return
      if (!res.ok) {
        setPhase({ kind: 'basesError', message: res.error })
        return
      }
      setBases(res.data)
      // 기본은 전 범위 — 좁히는 것은 사용자의 선택이다
      setBaseIds(res.data.map((b) => b.id))
      setPhase({ kind: 'ready' })
    })
    return () => {
      alive = false
    }
  }, [])

  const delayMs = opts.delayMs
  const search = useCallback(async () => {
    setPhase({ kind: 'searching' })
    const res = await searchKnowledge({ query, mode, baseIds, security, topK }, { delayMs })
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [query, mode, baseIds, security, topK, delayMs])

  const toggleBase = useCallback((id: string) => {
    setBaseIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]))
  }, [])

  const reset = useCallback(() => setPhase({ kind: 'ready' }), [])

  return {
    bases,
    baseIds,
    toggleBase,
    query,
    setQuery,
    mode,
    setMode,
    security,
    setSecurity,
    topK,
    setTopK,
    phase,
    search,
    reset,
  }
}
