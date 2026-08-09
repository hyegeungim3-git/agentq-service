import { useEffect, useRef, type RefObject } from 'react'

/**
 * 열어 둔 팝오버를 **바깥을 누르거나 Esc로** 닫는다.
 *
 * 사용자 포털 알림에는 있었고, 관리자 상단바에 종·톱니를 붙이면서 **빠뜨렸다.**
 * 같은 것을 두 번 적으면 늘 이렇게 된다 — 한 곳에 둔다.
 *
 * 모달(`useModalOverlay`)과 다르다. 모달은 뒤를 못 만지게 막고 포커스를 가두지만,
 * 팝오버는 뒤가 그대로 살아 있어야 한다 — 알림을 열어 둔 채 화면을 훑는 것이
 * 정상 동선이다. 그래서 가두지 않고 닫는 길만 준다.
 */
export function useDismissable<T extends HTMLElement>(
  open: boolean,
  close: () => void,
): RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return ref
}
