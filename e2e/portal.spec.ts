import { test, expect } from '@playwright/test'

test.describe('포털 · 허브', () => {
  test('분야를 고르면 허브가 열리고 돌아올 수 있다', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()

    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await expect(page.getByRole('heading', { name: '한빛정밀' })).toBeVisible()

    await page.getByRole('button', { name: '← 분야 선택' }).click()
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()
  })

  /* 고를 수 있는 발주처는 업무 데이터가 있는 곳뿐이다.
     이 단언이 깨지면 다른 발주처의 문서·수치가 노출되고 있다는 뜻이다. */
  test('업무 데이터가 없는 발주처는 비활성이다', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('button', { name: /한빛정밀/ })).toBeEnabled()
    for (const org of ['한국부동산원', '한성시청', '새빛대학교병원']) {
      await expect(page.getByRole('button', { name: new RegExp(org) })).toBeDisabled()
    }
  })

  test('가로 스크롤이 없다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await expect(page.getByRole('heading', { name: '한빛정밀' })).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('터치 타깃이 충분하다', async ({ page }) => {
    await page.goto('./')
    const box = await page.getByRole('button', { name: /한빛정밀/ }).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })
})
