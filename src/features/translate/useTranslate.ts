import { useCallback, useEffect, useState } from 'react'
import type { BusinessDocument } from '@entities/document/model'
import type { LanguageCode, TranslationResult, TranslationTone } from '@entities/translation/model'
import { fetchDocuments } from '@shared/api/documents'
import { createTranslation, type TranslationApiOptions } from '@shared/api/translation'

/**
 * 번역 화면의 상태와 전이.
 *
 * 요약 훅과 뼈대가 같다(문서 로딩 → 옵션 선택 → 실행 → 결과).
 * 세 번째 에이전트에서도 같은 모양이 나오면 그때 공통 훅으로 뽑는다 —
 * 지금 뽑으면 표본 2개로 일반화하는 것이라 이르다(가이드 §4).
 */

export type Phase =
  | { kind: 'loadingDocs' }
  | { kind: 'docsError'; message: string }
  | { kind: 'ready' }
  | { kind: 'running' }
  | { kind: 'failed'; message: string }
  | { kind: 'done'; result: TranslationResult }

export type TranslateOptions = TranslationApiOptions

export function useTranslate(opts: TranslateOptions = {}) {
  const [docs, setDocs] = useState<BusinessDocument[]>([])
  const [phase, setPhase] = useState<Phase>({ kind: 'loadingDocs' })

  const [documentId, setDocumentId] = useState<string | null>(null)
  const [to, setTo] = useState<LanguageCode>('en')
  const [tone, setTone] = useState<TranslationTone>('technical')
  const [useGlossary, setUseGlossary] = useState(true)

  useEffect(() => {
    let alive = true
    // 번역은 성적서만 대상으로 한다 — 대상 문서를 좁히는 것이 실무 동선이다
    void fetchDocuments(['certificate']).then((res) => {
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

  const run = useCallback(async () => {
    if (!documentId) return
    setPhase({ kind: 'running' })
    const res = await createTranslation({ documentId, from: 'ko', to, tone, useGlossary }, opts)
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [documentId, to, tone, useGlossary, opts])

  const reset = useCallback(() => setPhase({ kind: 'ready' }), [])

  return {
    docs,
    phase,
    documentId,
    to,
    tone,
    useGlossary,
    setDocumentId,
    setTo,
    setTone,
    setUseGlossary,
    run,
    reset,
  }
}
