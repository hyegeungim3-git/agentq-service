import { test, expect } from '@playwright/test'

test.describe('포털 선택', () => {
  test('분야 목록이 뜨고 선택하면 이동한다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()

    const card = page.getByRole('button', { name: /한빛정밀/ })
    await expect(card).toBeVisible()
    await card.click()
    await expect(page.getByText('선택한 도메인: manufacturing')).toBeVisible()
  })

  test('가로 스크롤이 없다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('한국부동산원')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('터치 타깃이 충분하다', async ({ page }) => {
    await page.goto('/')
    const box = await page.getByRole('button', { name: /한빛정밀/ }).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })
})
