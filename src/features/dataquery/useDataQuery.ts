import { useCallback, useState } from 'react'
import type { DataSource, QueryResult } from '@entities/dataquery/model'
import { runQuery, type QueryApiOptions } from '@shared/api/dataquery'

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

/** 소스마다 예시 질의가 다르다 — 빈 입력창만 두면 무엇을 물어야 할지 모른다 */
export const SAMPLE_QUESTIONS: Record<DataSource, string> = {
  equipment: '창원본사 최근 설비 중 진동 높은 순으로 보여줘',
  material: 'SUS 자재 재고 부족한 순으로 보여줘',
  production: '지난주 CNC 3라인 생산 실적 알려줘',
}

export function useDataQuery(opts: DataQueryOptions = {}) {
  const [source, setSource] = useState<DataSource>('equipment')
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS.equipment)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  /** 소스를 바꾸면 예시 질의도 함께 바꾼다 — 안 맞는 질의가 남으면 혼란스럽다 */
  const changeSource = useCallback((s: DataSource) => {
    setSource(s)
    setQuestion(SAMPLE_QUESTIONS[s])
    setPhase({ kind: 'idle' })
  }, [])

  const delayMs = opts.delayMs
  const run = useCallback(async () => {
    setPhase({ kind: 'running' })
    const res = await runQuery({ source, question }, { delayMs })
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [source, question, delayMs])

  return {
    source,
    changeSource,
    question,
    setQuestion,
    phase,
    run,
    canRun: question.trim().length > 0,
  }
}
