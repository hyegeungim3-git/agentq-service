import { useCallback, useEffect, useState } from 'react'
import type {
  FocusArea,
  SourceDocument,
  SummaryResult,
  SummaryStyle,
  TargetLength,
} from '@entities/summary/model'
import { createSummary, fetchSourceDocuments, type SummaryApiOptions } from '@shared/api/summary'

/**
 * 요약 화면의 상태와 전이.
 *
 * 화면(JSX)에서 분리한 이유는 파일이 길어서가 아니라 **테스트 경계가 다르기** 때문이다
 * (가이드 §3). 전이 규칙은 렌더 없이 검증할 수 있어야 한다.
 */

export type Phase =
  | { kind: 'loadingDocs' }
  | { kind: 'docsError'; message: string }
  | { kind: 'ready' }
  | { kind: 'running' }
  | { kind: 'failed'; message: string }
  | { kind: 'done'; result: SummaryResult }

export type SummarizeOptions = SummaryApiOptions

export function useSummarize(opts: SummarizeOptions = {}) {
  const [docs, setDocs] = useState<SourceDocument[]>([])
  const [phase, setPhase] = useState<Phase>({ kind: 'loadingDocs' })

  const [documentId, setDocumentId] = useState<string | null>(null)
  const [style, setStyle] = useState<SummaryStyle>('detailed')
  const [targetLength, setTargetLength] = useState<TargetLength>(300)
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([])

  useEffect(() => {
    let alive = true
    void fetchSourceDocuments().then((res) => {
      if (!alive) return
      if (!res.ok) {
        setPhase({ kind: 'docsError', message: res.error })
        return
      }
      setDocs(res.data)
      setDocumentId(res.data[0]?.id ?? null)
      setPhase({ kind: 'ready' })
    })
    return () => {
      alive = false
    }
  }, [])

  const toggleFocus = useCallback((area: FocusArea) => {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }, [])

  const run = useCallback(async () => {
    if (!documentId) return
    setPhase({ kind: 'running' })
    const res = await createSummary({ documentId, style, targetLength, focusAreas }, opts)
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [documentId, style, targetLength, focusAreas, opts])

  /** 결과만 지우고 설정은 남긴다 — 방식을 바꿔 다시 돌리는 것이 흔한 동선이다. */
  const reset = useCallback(() => setPhase({ kind: 'ready' }), [])

  const selectedDoc = docs.find((d) => d.id === documentId) ?? null

  return {
    docs,
    selectedDoc,
    phase,
    documentId,
    style,
    targetLength,
    focusAreas,
    setDocumentId,
    setStyle,
    setTargetLength,
    toggleFocus,
    run,
    reset,
  }
}
