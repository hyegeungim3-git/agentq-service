import { useEffect, useRef } from 'react'

/**
 * 좁은 화면에서 **덮어서 여는 패널**을 진짜 대화상자로 만든다.
 *
 * 실측한 상태(고치기 전):
 *  - 375폭에서 사이드바를 열어도 포커스는 여전히 패널 **바깥**의 '사이드바 열기'
 *    버튼에 있었다. 낭독기로 스와이프하면 사이드바가 아니라 **뒤에 깔린 챗봇의
 *    FAQ 목록**이 읽혔다 — 화면에는 안 보이는 것이 읽히는 상태다
 *  - `aria-modal` 0개, `[inert]` 0개, `role=dialog` 0개
 *  - Escape를 눌러도 안 닫혔다(Esc를 처리하는 곳은 알림 벨 한 군데뿐이었다)
 *  - 닫은 뒤 포커스가 어디에도 없어, 이어 읽기가 문서 맨 위로 리셋됐다
 *
 * ⚠️ **자동 검사가 왜 이걸 못 잡았나** — axe의 대화상자 규칙(`aria-dialog-name` 등)은
 * `role="dialog"`가 **있을 때만** 돈다. 역할을 안 붙였으니 검사 대상 자체가 아니었다.
 * 틀린 dialog는 잡히지만 dialog가 아닌 dialog는 안 잡힌다.
 *
 * 여기서 하는 것:
 *  ① 열면 패널 안으로 포커스를 옮긴다
 *  ② Tab이 패널 밖으로 못 나간다(트랩)
 *  ③ Esc로 닫힌다
 *  ④ 닫으면 **연 사람에게** 포커스를 돌려준다
 *  ⑤ 뒤 화면을 `inert`로 끈다 — 보조기기에서도 사라진다
 *  ⑥ 넓은 화면으로 넓히면 스스로 닫는다 — 오버레이가 아닌데 뒤가 꺼져 있으면 안 된다
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** 화면에 실제로 보이는 것만 — 접힌 영역 안의 요소로 포커스를 보내면 사라진 것처럼 보인다 */
const visible = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
  )

export function useModalOverlay(
  open: boolean,
  onClose: () => void,
  /** 이 폭 이상이면 덮지 않고 나란히 놓이므로 대화상자가 아니다 */
  overlayBelow = 1024,
) {
  const panelRef = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  /* 닫기 함수는 렌더마다 새로 만들어질 수 있다. 의존성에 그대로 넣으면 리스너를
     매 렌더 떼었다 붙였다 한다 — 최신 것만 ref에 담아 둔다 */
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  /* ①④ 열면 안으로, 닫으면 연 사람에게 */
  useEffect(() => {
    if (!open) return
    opener.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    if (panel) {
      const first = visible(panel)[0]
      ;(first ?? panel).focus()
    }
    return () => {
      /* 연 버튼이 사라졌으면(예: 목록에서 지워짐) 아무 데도 안 보낸다 —
         엉뚱한 곳으로 보내면 어디로 갔는지 더 모른다 */
      const back = opener.current
      if (back?.isConnected) back.focus()
    }
  }, [open])

  /* ②③ Esc로 닫고, Tab은 패널 안에서 돈다 */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = visible(panel)
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      const active = document.activeElement
      if (!panel.contains(active)) {
        /* 어쩌다 밖으로 나갔으면 도로 넣는다 */
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  /* ⑥ 넓히면 스스로 닫는다 — 안 닫으면 데스크톱에서 본문이 `inert`인 채로 남는다 */
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia(`(min-width: ${overlayBelow}px)`)
    if (mq.matches) {
      closeRef.current()
      return
    }
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) closeRef.current()
    }
    mq.addEventListener('change', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
    }
  }, [open, overlayBelow])

  return panelRef
}
