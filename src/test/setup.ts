import '@testing-library/jest-dom/vitest'

/* jsdom은 scrollIntoView를 구현하지 않는다. 브라우저에는 항상 있으므로
   컴포넌트에서 방어하지 않고 테스트 환경에서 채운다
   (가이드: 안 일어나는 상황을 방어하는 코드를 넣지 않는다). */
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
