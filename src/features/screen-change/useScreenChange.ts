import { useEffect, useRef } from 'react'

/**
 * 화면이 바뀌었다는 것을 **소리로도 알린다.**
 *
 * 이 앱은 라우터가 없다. `setView`로 트리를 갈아 끼우므로 주소도, 문서 제목도,
 * 포커스도 그대로다. 눈으로 보는 사람에게는 화면이 통째로 바뀐 것이 명백하지만,
 * 낭독기 사용자에게는 **아무 일도 일어나지 않은 것과 구분되지 않는다.**
 *
 * 실측한 것들:
 *  - 저장소 전체에 `.focus()` 0건 — 발주처 진입·에이전트 열기·돌아가기 다섯 경우
 *    모두 포커스가 `body`로 떨어지고 낭독기 가상 커서가 문서 맨 위로 리셋된다
 *  - 발주처 넷의 문서 제목이 전부 `AgentQ`로 같아, 지금 어느 발주처인지 알 길이 없다
 *
 * 그래서 화면이 바뀔 때 세 가지를 함께 한다.
 *  ① 문서 제목을 바꾼다 — 낭독기의 창 제목 읽기(NVDA+T)로 확인할 수 있다
 *  ② 라이브 리전으로 한 번 말한다 — 포커스를 옮기지 않아도 바뀐 것을 안다
 *  ③ 새 화면의 첫 제목으로 포커스를 옮긴다 — 이어서 읽으면 새 화면부터 읽힌다
 *
 * ③을 안 하고 ②만 하면 Tab이 여전히 문서 맨 위에서 시작해, 사이드바 40여 개를
 * 다시 지나야 본문에 닿는다. ②를 안 하고 ③만 하면 포커스가 조용히 움직여
 * 사용자가 왜 위치가 바뀌었는지 모른다. 둘 다 필요하다.
 */

/** 라이브 리전 한 곳 — 여러 개 두면 같은 말이 겹쳐 들린다 */
const REGION_ID = 'screen-change-announcer'

function announcer(): HTMLElement {
  const found = document.getElementById(REGION_ID)
  if (found) return found
  const el = document.createElement('div')
  el.id = REGION_ID
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  /* 이 문장은 늘 한국어다 — 화면 틀을 English로 바꿔도 화면 이름(에이전트명·관리자
     메뉴)이 한국어 원문이라 섞어 쓰면 오히려 못 읽는다. 그러니 한국어라고 표시한다 */
  el.setAttribute('lang', 'ko')
  /* 화면에는 안 보이지만 낭독기는 읽는다 — Tailwind의 sr-only와 같은 방식 */
  el.style.cssText =
    'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'
  document.body.appendChild(el)
  return el
}

export type ScreenChange = {
  /** 창 제목에 쓸 화면 이름 */
  title: string
  /** 어느 조직의 화면인가 — 없으면 제품 이름만 쓴다 */
  org?: string | undefined
  /**
   * 낭독기에 한 번 말할 문장. 없으면 제목을 그대로 쓴다.
   * 제목과 다른 말을 하고 싶을 때만 준다(예: '문서 요약 에이전트로 이동했습니다').
   */
  say?: string | undefined
}

/**
 * `key`가 바뀔 때만 동작한다 — 같은 화면에서 상태가 바뀔 때마다 말하면
 * 낭독기가 쉬지 않고 떠든다.
 *
 * 값은 의존성으로 받는다. 렌더 중에 ref에 최신값을 넣어 두는 방법은
 * React 19에서 금지돼 있고(`react-hooks/refs`), 실제로 렌더가 버려질 때
 * 어긋난 값이 남는다. 대신 **본 적 있는 key**만 ref에 적는다 — 그건 effect
 * 안에서 쓰는 것이라 안전하다.
 */
export function useScreenChange(key: string, change: ScreenChange): void {
  const seen = useRef<string | null>(null)
  const phrase = useRef<string>('')
  const { title, org, say } = change

  /**
   * 제목은 값이 바뀔 때마다 고친다. **발주처 이름은 나중에 온다** —
   * 진입 순간에는 아직 `null`이라, key가 바뀔 때만 쓰면 제목에 조직 이름이
   * 영영 안 들어간다(실측으로 잡았다).
   *
   * 말할 문장도 여기서 ref에 담아 둔다. 아래 effect는 `key`만 보게 해야 하는데
   * (그래야 이름이 늦게 채워질 때 두 번 말하지 않는다) 그러면 최신 문장을
   * 의존성으로 못 받기 때문이다. ref 쓰기는 effect 안이라 허용된다.
   */
  useEffect(() => {
    document.title = org ? `${title} · ${org} · AgentQ` : `${title} · AgentQ`
    phrase.current = say ?? title
  }, [title, org, say])

  /**
   * 말하기와 포커스 이동은 **화면이 실제로 바뀔 때만.**
   *
   * ⚠️ 의존성에 `title`·`org`를 넣으면 안 된다. 이름이 늦게 채워지는 순간
   * effect가 다시 돌면서 **먼저 예약해 둔 포커스 이동을 취소**한다
   * (cleanup이 `cancelAnimationFrame`을 부르는데, 재실행은 `seen.current === key`라
   * 곧바로 반환해 다시 예약하지 않는다). 실제로 그래서 포커스가 body에 남았다.
   */
  useEffect(() => {
    if (seen.current === key) return
    const firstEver = seen.current === null
    seen.current = key

    /* 처음 그릴 때는 말하지 않는다 — 페이지를 연 것은 사용자가 아는 일이다.
       그때 말하면 문서를 처음부터 읽는 소리와 겹친다 */
    if (firstEver) return

    announcer().textContent = phrase.current

    /**
     * 새 화면의 첫 제목으로 포커스를 옮긴다.
     *
     * `tabindex="-1"`을 붙여야 포커스를 받을 수 있고, 그래도 Tab 순서에는
     * 안 들어간다. 옮기고 나면 이어 읽기가 새 화면부터 시작한다.
     *
     * 화면마다 제목이 오는 시점이 달라(자료를 기다리는 화면이 있다) 몇 프레임
     * 기다렸다 포기한다. 끝내 못 찾으면 아무것도 안 하는 편이 낫다 —
     * 엉뚱한 곳으로 옮기면 사용자가 어디로 갔는지 더 모른다.
     */
    let id = 0
    let tries = 0
    const move = () => {
      const main = document.querySelector('main')
      const target = main?.querySelector('h1') ?? main
      if (!target) {
        tries += 1
        if (tries < 10) id = requestAnimationFrame(move)
        return
      }
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
    id = requestAnimationFrame(move)
    return () => {
      cancelAnimationFrame(id)
    }
  }, [key])
}
