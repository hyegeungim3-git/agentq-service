import { test, expect } from '@playwright/test'
import { openSidebar, openTab } from './shell'

/**
 * 브랜드 색이 화면에 실제로 닿는지.
 *
 * 클래스가 붙어 있는지 보는 것으로는 부족하다 — `bg-brand`가 붙어 있어도
 * 셸이 `--color-brand`를 안 꽂으면 기본 파랑이 나온다. 그래서 **계산된 색**을
 * 발주처 팩의 값과 대조한다. 다크 스킨을 검사할 때 배운 방식이다.
 *
 * 두 발주처를 서로 다른 색으로 확인한다. 한 곳만 보면 '색이 고정돼 있어도' 통과한다.
 */

const BRAND = {
  한빛정밀: 'rgb(15, 118, 110)', // #0F766E
  한국부동산원: 'rgb(0, 48, 135)', // #003087
}

test('발주처를 고르면 그 발주처 색이 화면에 실제로 칠해진다', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()

  const nav = await openSidebar(page)
  const tab = nav.getByRole('button', { name: /^일반/ }).first()
  await expect(tab).toHaveCSS('background-color', BRAND.한빛정밀)
})

test('포털 카드는 발주처마다 다른 색을 쓴다', async ({ page }) => {
  await page.goto('./')
  const chip = (org: string) =>
    page.getByRole('button', { name: new RegExp(org) }).locator('span').first()

  // 첫 span은 브랜드 색 띠 — 발주처마다 달라야 한다
  await expect(chip('한빛정밀')).toHaveCSS('background-color', BRAND.한빛정밀)
  await expect(chip('한국부동산원')).toHaveCSS('background-color', BRAND.한국부동산원)
})

test('로고와 근거 패널이 자리를 지킨다', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()

  const nav = await openSidebar(page)
  await expect(nav.getByText('OCUBE')).toBeVisible()

  /* 근거 패널은 넓은 화면에서만 펼쳐 둔다. 좁으면 버튼으로 연다 —
     어느 쪽이든 '무엇을 근거로 답하는지'에 닿을 수 있어야 한다.
     좁은 화면에서는 사이드바가 덮고 있으므로 먼저 닫는다 */
  const width = page.viewportSize()?.width ?? 0
  if (width < 1280) {
    // 탭을 누르면 좁은 화면에서는 사이드바가 닫힌다 — 그 뒤라야 본문을 누를 수 있다
    await openTab(page, /^일반/)
    await page.getByRole('button', { name: '답변 근거' }).click()
  }
  const panel = page.getByRole('complementary', { name: '답변 근거' })
  await expect(panel).toContainText('지금 답변 근거로 쓸 수 있는 문서')
  await expect(panel).toContainText('등록됐지만 못 찾는 문서가 있는 영역')
})
