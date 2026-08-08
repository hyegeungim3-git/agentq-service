import type { ReactNode } from 'react'

/**
 * 관리자 표 — 28개가 같은 모양을 손으로 반복하고 있었다.
 *
 * 반복 자체보다 **셋이 빠져 있던 것**이 문제였다.
 *
 *  ① `<caption>`이 없었다 — 낭독기는 이름 없는 표를 만나고, 사용자는 무슨 표에
 *    들어왔는지 모른 채 셀만 듣는다
 *  ② 가로 스크롤 영역 이름이 28곳 모두 `표 — 가로로 스크롤됩니다`로 **똑같았다**.
 *    한 화면에 표가 둘이면 목소리로 고를 수 없다(WCAG 2.5.3에서 이미 한 번 밟았다)
 *  ③ 목록이 비었을 때 머리글만 남았다 — 서버가 붙어 빈 응답이 오는 날
 *    '화면이 덜 그려졌다'로 읽힌다
 *
 * 이름을 **필수 인자**로 둔다. 안 주면 못 만든다 — 있으면 좋은 것으로 두면 빠진다.
 */
export function AdminTable({
  label,
  minW,
  wrap = 'mt-2',
  children,
}: {
  /** 이 표가 무엇인가 — 낭독기가 읽고, 스크롤 영역 이름도 여기서 나온다 */
  label: string
  /** 내용에 따라 다르다. Tailwind가 훑을 수 있게 부르는 쪽이 문자 그대로 적는다 */
  minW: string
  /** 바깥 여백 등 자리마다 다른 것 */
  wrap?: string
  children: ReactNode
}) {
  return (
    <div
      role="region"
      aria-label={`${label} 표 — 가로로 스크롤됩니다`}
      tabIndex={0}
      className={`${wrap} overflow-x-auto rounded-xl border border-slate-200 bg-white`}
    >
      <table className={`w-full ${minW} text-left text-xs`}>
        <caption className="sr-only">{label}</caption>
        {children}
      </table>
    </div>
  )
}

/**
 * 비었을 때 채우는 줄.
 *
 * **왜 비었는지까지 말해야 한다.** '데이터 없음' 한 줄은 조건이 좁아서 없는 것인지,
 * 아직 안 받은 것인지, 원래 없는 것인지 구분해 주지 않는다.
 */
export function EmptyRow({ cols, children }: { cols: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={cols} className="px-3 py-6 text-center text-slate-500">
        {children}
      </td>
    </tr>
  )
}
