import { Suspense, type ReactNode } from 'react'

/**
 * 코드를 받는 동안 보여 줄 것.
 *
 * 빈 화면을 두지 않는다 — 눌렀는데 아무 일도 안 일어난 것처럼 보인다.
 * 낭독기에도 말한다: 화면이 바뀌는 중이라는 것을 소리로 알 수 있어야
 * '안 눌렸나' 하고 다시 누르지 않는다.
 *
 * `fill`은 셸 **안쪽**에 놓일 때 쓴다. 셸이 이미 화면을 채우고 있으므로
 * 여기까지 `min-h-dvh`를 주면 사이드바 옆에서 화면 하나만큼 더 밀린다.
 */
export function Loadable({ children, fill = 'page' }: { children: ReactNode; fill?: 'page' | 'inner' }) {
  return (
    <Suspense
      fallback={
        <main
          role="status"
          aria-live="polite"
          className={`grid place-items-center ${fill === 'page' ? 'min-h-dvh' : 'min-h-64 p-6'}`}
        >
          <span className="sr-only">화면을 불러오는 중입니다</span>
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        </main>
      }
    >
      {children}
    </Suspense>
  )
}
