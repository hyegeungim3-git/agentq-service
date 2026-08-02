import { useEffect, useState } from 'react'
import type { ApiResult } from '@shared/api/domains'

/**
 * 경계 함수 하나를 불러 화면 상태로 바꾼다.
 *
 * 화면마다 로딩·오류·완료 상태를 다시 쓰면 어느 화면은 로딩을 빠뜨린다.
 * 관리자 대시보드처럼 같은 모양이 반복되는 곳에서 한 번만 정의한다.
 *
 * `deps`가 바뀌면 다시 부른다 — 구간 선택이 서버 질의 조건이기 때문이다.
 *
 * 받아 둔 결과에 **어떤 조건으로 받은 것인지**를 같이 저장한다. 조건이 바뀌면
 * 저장된 결과가 지금 조건과 안 맞으므로 그대로 '불러오는 중'이 된다.
 * effect에서 로딩으로 되돌리는 방식은 쓰지 않는다 — 렌더 한 번 동안
 * 이전 조건의 결과가 새 조건의 화면에 잠깐 보인다.
 */

export type Remote<T> =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: T }

export function useRemote<T>(load: () => Promise<ApiResult<T>>, deps: unknown[]): Remote<T> {
  const key = JSON.stringify(deps)
  const [store, setStore] = useState<{ key: string; state: Remote<T> } | null>(null)

  useEffect(() => {
    let alive = true
    void load().then((res) => {
      // 늦게 온 응답이 최신 응답을 덮지 않게 한다
      if (!alive) return
      setStore({
        key,
        state: res.ok ? { kind: 'ready', data: res.data } : { kind: 'error', message: res.error },
      })
    })
    return () => {
      alive = false
    }
    // load는 매 렌더 새 함수라 의존성에 넣으면 무한히 다시 부른다.
    // 무엇이 바뀌면 다시 부를지는 호출부가 deps로 말하고, key가 그것을 대신한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return store !== null && store.key === key ? store.state : { kind: 'loading' }
}
