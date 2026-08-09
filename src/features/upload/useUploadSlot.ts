import { useCallback, useState } from 'react'
import { validateUpload, type UploadConstraint, type UploadSlot } from '@entities/upload/model'
import type { ApiResult } from '@shared/api/domains'

/**
 * 에이전트 실행과 상관없이 파일 하나를 올리는 자리.
 *
 * 에이전트 화면의 업로드는 `useAgentRun` 안에 있다 — 올린 문서를 **바로 골라야**
 * 하기 때문이다. 대화 우측 패널은 고를 것이 없다. 목록에 얹기만 하면 된다.
 * 그 하나 때문에 실행 훅 전체를 끌어다 쓰면, 안 쓰는 상태(단계·결과)가 따라온다.
 *
 * 형식·용량은 **여기서 먼저 거른다.** 통과한 것만 보낸다 — 서버가 없는 지금도
 * 사용자는 '왜 안 되는지'를 즉시 알아야 한다.
 */
export function useUploadSlot<T>(
  constraint: UploadConstraint,
  send: (file: File) => Promise<ApiResult<T>>,
  onAdded?: (item: T) => void,
): UploadSlot {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const select = useCallback(
    (file: File) => {
      const invalid = validateUpload(file, constraint)
      if (invalid) {
        setError(invalid)
        return
      }
      setError(null)
      setBusy(true)
      void send(file).then((res) => {
        setBusy(false)
        /* 실패를 삼키지 않는다. 지금은 대부분 '서버가 연결되지 않았습니다'인데,
           그 문장이 안 보이면 사용자는 올라간 줄 안다 */
        if (!res.ok) {
          setError(res.error)
          return
        }
        onAdded?.(res.data)
      })
    },
    [constraint, send, onAdded],
  )

  return {
    constraint,
    busy,
    error,
    select,
    clearError: useCallback(() => setError(null), []),
  }
}
