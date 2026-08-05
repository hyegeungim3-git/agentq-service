import { useCallback, useEffect, useState } from 'react'
import type { DataSource, DataSourceOption, QueryResult } from '@entities/dataquery/model'
import { fetchQuerySources, runQuery, type QueryApiOptions } from '@shared/api/dataquery'

/**
 * 데이터 조회는 문서 선택이 아니라 질문 입력형이라 useAgentRun을 쓰지 않는다
 * (내규 조회와 같은 이유).
 */

export type Phase =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'failed'; message: string }
  | { kind: 'done'; result: QueryResult }

export type DataQueryOptions = QueryApiOptions

export function useDataQuery(opts: DataQueryOptions = {}) {
  /* 소스도 예시 질의도 발주처가 준다 — 예전에는 '설비 대장·자재 재고·생산 실적'을
     화면이 알고 있었고, 그건 제조 전용이었다 */
  const [sources, setSources] = useState<DataSourceOption[]>([])
  const [source, setSource] = useState<DataSource>('')
  const [question, setQuestion] = useState('')
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  useEffect(() => {
    let alive = true
    void fetchQuerySources().then((res) => {
      if (!alive || !res.ok) return
      setSources(res.data)
      const first = res.data[0]
      if (first) {
        setSource(first.code)
        setQuestion(first.sample)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  /** 소스를 바꾸면 예시 질의도 함께 바꾼다 — 안 맞는 질의가 남으면 혼란스럽다 */
  const changeSource = useCallback(
    (s: DataSource) => {
      setSource(s)
      setQuestion(sources.find((x) => x.code === s)?.sample ?? '')
      setPhase({ kind: 'idle' })
    },
    [sources],
  )

  const delayMs = opts.delayMs
  const run = useCallback(async () => {
    setPhase({ kind: 'running' })
    const res = await runQuery({ source, question }, { delayMs })
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [source, question, delayMs])

  return {
    sources,
    source,
    changeSource,
    question,
    setQuestion,
    phase,
    run,
    canRun: question.trim().length > 0,
  }
}
