import '@testing-library/jest-dom/vitest'

/* jsdom은 scrollIntoView를 구현하지 않는다. 브라우저에는 항상 있으므로
   컴포넌트에서 방어하지 않고 테스트 환경에서 채운다
   (가이드: 안 일어나는 상황을 방어하는 코드를 넣지 않는다). */
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

/* 화면 테스트는 페이지를 단독으로 그린다 — 앱을 거치지 않으니 발주처가 안 정해진다.
   실제 앱에서는 발주처를 고른 뒤에만 이 화면들에 닿으므로, 그 상태를 여기서 만든다.
   이 줄이 없으면 모든 화면이 '이 발주처의 업무 데이터가 없습니다'를 그린다. */
import { setActiveDomain } from '@shared/api/tenant'
import { beforeEach } from 'vitest'

beforeEach(() => {
  setActiveDomain('manufacturing')
})
