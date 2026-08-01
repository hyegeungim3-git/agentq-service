import { useCallback, useEffect, useState } from 'react'
import type { BusinessDocument, DocumentKind } from '@entities/document/model'
import { fetchDocuments } from '@shared/api/documents'
import type { ApiResult } from '@shared/api/domains'

/**
 * 문서를 입력으로 받는 에이전트의 공통 실행 흐름.
 *
 * 요약·번역·검토 세 개를 각각 만들고 나서 뽑았다. 표본 하나로 일반화하면
 * 잘못된 골격이 나오고, 둘이면 우연일 수 있다. 셋에서 같은 모양이 나왔다:
 *
 *   문서 목록 로딩 → 옵션 선택 → 실행 → 진행 중 → 결과 또는 실패 → 재설정
 *
 * 에이전트마다 다른 것은 **어떤 옵션을 갖는가**와 **무엇을 호출하는가**뿐이라,
 * 그 둘만 호출부에 남기고 나머지를 여기로 옮겼다.
 *
 * 결과 타입은 제네릭이다 — 요약 결과와 번역 결과는 공통 조상이 없고,
 * 억지로 만들면 화면이 다시 좁혀야 한다.
 */

export type RunPhase<R> =
  | { kind: 'loadingDocs' }
  | { kind: 'docsError'; message: string }
  | { kind: 'ready' }
  | { kind: 'running' }
  | { kind: 'failed'; message: string }
  | { kind: 'done'; result: R }

export type UseAgentRunArgs<R> = {
  /** 대상 문서 종류. 생략하면 전체 — 번역은 성적서만 받는 식이다. */
  kinds?: DocumentKind[] | undefined
  /** 실제 호출. 호출부가 자기 옵션을 묶어 useCallback으로 넘긴다. */
  run: (documentId: string) => Promise<ApiResult<R>>
}

export function useAgentRun<R>({ kinds, run }: UseAgentRunArgs<R>) {
  const [docs, setDocs] = useState<BusinessDocument[]>([])
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [phase, setPhase] = useState<RunPhase<R>>({ kind: 'loadingDocs' })

  // kinds는 배열 리터럴로 넘어오기 쉬워 매 렌더 새 참조가 된다 — 키로 고정한다
  const kindsKey = kinds?.join(',') ?? ''

  useEffect(() => {
    let alive = true
    const filter = kindsKey ? (kindsKey.split(',') as DocumentKind[]) : undefined
    void fetchDocuments(filter).then((res) => {
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
  }, [kindsKey])

  const execute = useCallback(async () => {
    if (!documentId) return
    setPhase({ kind: 'running' })
    const res = await run(documentId)
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [documentId, run])

  /** 결과만 지우고 옵션은 남긴다 — 설정을 바꿔 다시 돌리는 것이 흔한 동선이다. */
  const reset = useCallback(() => setPhase({ kind: 'ready' }), [])

  const selectedDoc = docs.find((d) => d.id === documentId) ?? null

  return { docs, selectedDoc, documentId, setDocumentId, phase, execute, reset }
}
