import '@testing-library/jest-dom/vitest'

/* jsdom은 scrollIntoView를 구현하지 않는다. 브라우저에는 항상 있으므로
   컴포넌트에서 방어하지 않고 테스트 환경에서 채운다
   (가이드: 안 일어나는 상황을 방어하는 코드를 넣지 않는다). */
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

/* jsdom은 matchMedia도 구현하지 않는다. 덮어 여는 대화상자는 '넓어지면 스스로 닫는다'를
   위해 이걸 쓴다 — 브라우저에는 항상 있으므로 화면 코드에서 방어하지 않고 여기서 채운다.
   좁은 화면으로 답하게 둔다: 단위 테스트에서 대화상자는 열려 있어야 볼 수 있다. */
if (typeof window !== 'undefined' && window.matchMedia === undefined) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

/* 화면 테스트는 페이지를 단독으로 그린다 — 앱을 거치지 않으니 발주처가 안 정해진다.
   실제 앱에서는 발주처를 고른 뒤에만 이 화면들에 닿으므로, 그 상태를 여기서 만든다.
   이 줄이 없으면 모든 화면이 '이 발주처의 업무 데이터가 없습니다'를 그린다. */
import { setActiveDomain } from '@shared/api/tenant'
import { loadPack } from '@fixtures/packs'
import { beforeEach } from 'vitest'

/* 팩은 **고를 때 받는다**(첫 화면에서 넷을 다 받지 않으려는 것). 실제 앱에서는
   발주처를 고른 뒤에야 화면이 뜨므로, 테스트도 그 상태에서 시작해야 한다.
   안 그러면 첫 테스트만 모듈 로딩 비용을 물고 타임아웃한다(실제로 그랬다). */
beforeEach(async () => {
  setActiveDomain('manufacturing')
  await loadPack('manufacturing')
})
