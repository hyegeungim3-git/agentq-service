/**
 * 본문으로 건너뛰기.
 *
 * 왜 필요한가 — 실측: 사용자 포털에서 본문 입력창에 닿으려면 사이드바 정지점을
 * 40여 곳(홈·워크스페이스 콤보박스·탭 3개·새 대화·전체 지우기·대화마다 열기와
 * 삭제·공지·가이드·설정·분야 선택으로) 전부 지나야 하고, 관리자는 메뉴 버튼
 * 55개를 지나야 한다. 낭독기 사용자는 D(랜드마크 이동)로 우회하지만
 * **키보드만 쓰는 사람에게는 우회로가 없다.**
 *
 * ⚠️ 검사는 이걸 못 잡는다. axe의 `bypass` 규칙은 skip link·랜드마크·제목 중
 * **하나라도** 있으면 통과시키는데, 이 앱에는 `<main>`이 있으므로 건너뛰기가
 * 0건이어도 초록불이었다. 규칙 엔진이 '있다'고 말한 게 아니라 '판정을
 * 포기했다'는 뜻인데, 통과 목록에 섞이면 구별되지 않는다.
 *
 * `<a href="#...">`가 아니라 버튼인 이유: `<main>`은 화면마다 각자 갖고 있어
 * (20여 화면) 공통 id를 심을 자리가 없다. 대신 지금 화면의 `<main>`을 찾아
 * 포커스를 옮긴다 — `tabindex="-1"`을 붙여야 포커스를 받고, 그래도 Tab 순서에는
 * 안 들어간다.
 */
export function SkipToMain({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const main = document.querySelector('main')
        if (!main) return
        main.setAttribute('tabindex', '-1')
        main.focus()
        main.scrollIntoView({ block: 'start' })
      }}
      /* 평소에는 안 보이다가 **포커스를 받으면 나타난다** — 보이지 않는 채로
         활성화되면 키보드 사용자가 자기가 어디 있는지 모른다 */
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
    >
      {label}
    </button>
  )
}
