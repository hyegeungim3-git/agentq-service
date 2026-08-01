import { useCallback, useState } from 'react'
import type { RegulationAnswer, RegulationCategory } from '@entities/regulation/model'
import { askRegulation, type RegulationApiOptions } from '@shared/api/regulation'
import type { ApiResult } from '@shared/api/domains'

/**
 * 내규 조회는 문서를 고르는 게 아니라 질문을 입력하는 형태라
 * useAgentRun을 쓰지 않는다. 골격을 억지로 맞추면 화면이 이상해진다.
 */

export type Phase =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'failed'; message: string }
  | { kind: 'done'; result: RegulationAnswer }

export type RegulationOptions = RegulationApiOptions

const DEFAULT_CATEGORIES: RegulationCategory[] = ['labor', 'safety']

export function useRegulation(opts: RegulationOptions = {}) {
  const [question, setQuestion] = useState('')
  const [categories, setCategories] = useState<RegulationCategory[]>(DEFAULT_CATEGORIES)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })

  const toggleCategory = useCallback((c: RegulationCategory) => {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }, [])

  const delayMs = opts.delayMs
  const run = useCallback(async () => {
    setPhase({ kind: 'running' })
    const res: ApiResult<RegulationAnswer> = await askRegulation({ question, categories }, { delayMs })
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [question, categories, delayMs])

  const canRun = question.trim().length > 0 && categories.length > 0

  return { question, setQuestion, categories, toggleCategory, phase, run, canRun }
}
