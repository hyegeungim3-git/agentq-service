import type { CSSProperties } from 'react'

/**
 * 발주처 브랜드 색을 그 아래 전체에 꽂는다.
 *
 * 화면마다 `style={{ backgroundColor: domain.brandColor }}`를 뿌리는 대신
 * 변수 하나만 덮어쓴다. 안쪽은 `bg-brand`·`text-brand`·`bg-brand-soft`로만 부르므로
 * 새로 만드는 화면도 자동으로 따라온다 — 빠뜨릴 자리가 없다.
 *
 * 포털처럼 한 화면에 발주처가 여럿이면 카드마다 꽂으면 된다. 변수는 상속되므로
 * 카드 안쪽만 그 발주처 색이 된다.
 */
export function brandVars(color: string): CSSProperties {
  /* CSS 변수는 CSSProperties의 알려진 속성이 아니다 —
     그래서 인덱스가 있는 타입을 거쳐 넘긴다(단언이 아니라 대입이다) */
  const vars: Record<string, string> = { '--color-brand': color }
  return vars
}
