import { useCallback, useEffect, useState } from 'react'
import type { BusinessDocument, DocumentKind } from '@entities/document/model'
import { validateUpload, type UploadConstraint, type UploadSlot } from '@entities/upload/model'

export type { UploadSlot }
import { fetchDocuments, uploadDocument } from '@shared/api/documents'
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

/**
 * 목록에서 하나를 고르게 하는 데 필요한 최소 형태.
 *
 * 업무 문서(`BusinessDocument`)와 분석 데이터셋(`Dataset`)이 둘 다 이걸 만족한다.
 * 분석 화면이 문서 대신 데이터 파일을 받게 되면서 생겼다 — 둘을 억지로 한 타입으로
 * 합치지 않고, 목록이 실제로 쓰는 속성만 남겼다.
 */
export type AgentInput = {
  id: string
  name: string
  sizeBytes: number
  /** 이름 아래 한 줄. 데이터 파일의 '486행 × 24열'처럼 고를 때 필요한 정보 */
  detail?: string
}

export type UseAgentRunArgs<R, I extends AgentInput> = {
  /** 대상 문서 종류. 생략하면 전체 — 번역은 성적서만 받는 식이다. */
  kinds?: DocumentKind[] | undefined
  /**
   * 입력 목록을 바꿔 끼운다. 생략하면 업무 문서 목록이다.
   * 모듈 수준 함수를 넘길 것 — 렌더마다 새 함수를 만들면 목록을 계속 다시 불러온다.
   */
  loadInputs?: (() => Promise<ApiResult<I[]>>) | undefined
  /** 실제 호출. 호출부가 자기 옵션을 묶어 useCallback으로 넘긴다. */
  run: (documentId: string) => Promise<ApiResult<R>>
  /** 업로드를 받을 때의 형식·용량 제약. 없으면 업로드 자리를 그리지 않는다. */
  upload?: UploadConstraint | undefined
  /** 올린 파일을 보낼 곳. 생략하면 업무 문서 업로드다(분석은 데이터셋으로 갈아 끼운다). */
  sendUpload?: ((file: File) => Promise<ApiResult<I>>) | undefined
}

/** 화면이 업로드 자리를 그리는 데 필요한 것 — 페이지는 이 묶음만 넘긴다. */


/**
 * `I`는 목록 항목의 실제 타입이다. 기본값이 `BusinessDocument`라
 * 문서형 에이전트는 종전대로 `docs[].kind`까지 볼 수 있다 —
 * 공통 최소 타입으로 뭉개면 '성적서만 불러온다' 같은 검증이 타입에서 사라진다.
 */
export function useAgentRun<R, I extends AgentInput = BusinessDocument>({
  kinds,
  loadInputs,
  run,
  upload: constraint,
  sendUpload,
}: UseAgentRunArgs<R, I>) {
  const [docs, setDocs] = useState<I[]>([])
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [phase, setPhase] = useState<RunPhase<R>>({ kind: 'loadingDocs' })
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // kinds는 배열 리터럴로 넘어오기 쉬워 매 렌더 새 참조가 된다 — 키로 고정한다
  const kindsKey = kinds?.join(',') ?? ''

  useEffect(() => {
    let alive = true
    const filter = kindsKey ? (kindsKey.split(',') as DocumentKind[]) : undefined
    /* loadInputs가 없으면 I는 기본값 BusinessDocument다.
       타입 인자로는 그 관계를 표현할 수 없어 이 한 곳에서만 좁힌다. */
    const load: () => Promise<ApiResult<I[]>> =
      loadInputs ?? (() => fetchDocuments(filter) as Promise<ApiResult<I[]>>)
    void load().then((res) => {
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
  }, [kindsKey, loadInputs])

  const execute = useCallback(async () => {
    if (!documentId) return
    setPhase({ kind: 'running' })
    const res = await run(documentId)
    setPhase(res.ok ? { kind: 'done', result: res.data } : { kind: 'failed', message: res.error })
  }, [documentId, run])

  /** 결과만 지우고 옵션은 남긴다 — 설정을 바꿔 다시 돌리는 것이 흔한 동선이다. */
  const reset = useCallback(() => setPhase({ kind: 'ready' }), [])

  /**
   * 형식·용량은 여기서 먼저 거른다. 통과한 것만 서버로 보낸다.
   * 서버가 문서를 돌려주면 목록에 얹고 바로 선택한다 — 올린 사람은 그걸 쓰려고 올린 것이다.
   */
  const selectFile = useCallback(
    async (file: File) => {
      if (!constraint) return
      const invalid = validateUpload(file, constraint)
      if (invalid) {
        setUploadError(invalid)
        return
      }
      setUploadError(null)
      setUploadBusy(true)
      /* loadInputs와 같은 이유의 좁히기 — sendUpload가 없으면 I는 BusinessDocument다. */
      const send = sendUpload ?? ((f: File) => uploadDocument(f) as Promise<ApiResult<I>>)
      const res = await send(file)
      setUploadBusy(false)
      if (!res.ok) {
        setUploadError(res.error)
        return
      }
      const added = res.data
      setDocs((prev) => [added, ...prev])
      setDocumentId(added.id)
    },
    [constraint, sendUpload],
  )

  const uploadSlot: UploadSlot | null = constraint
    ? {
        constraint,
        busy: uploadBusy,
        error: uploadError,
        select: (file: File) => void selectFile(file),
        clearError: () => setUploadError(null),
      }
    : null

  const selectedDoc = docs.find((d) => d.id === documentId) ?? null

  return { docs, selectedDoc, documentId, setDocumentId, phase, execute, reset, upload: uploadSlot }
}
