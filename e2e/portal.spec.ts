import { test, expect } from '@playwright/test'

test.describe('포털 · 허브', () => {
  test('분야를 고르면 허브가 열리고 돌아올 수 있다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()

    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await expect(page.getByRole('heading', { name: '한빛정밀' })).toBeVisible()

    await page.getByRole('button', { name: '← 분야 선택' }).click()
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()
  })


  test('가로 스크롤이 없다', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await expect(page.getByRole('heading', { name: '한빛정밀' })).toBeVisible()
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
