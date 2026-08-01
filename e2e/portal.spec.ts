import { test, expect } from '@playwright/test'

test.describe('포털 선택', () => {
  test('분야를 선택하면 요약 화면으로 가고 돌아올 수 있다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()

    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await expect(page.getByRole('heading', { name: '문서 요약 에이전트' })).toBeVisible()

    await page.getByRole('button', { name: '← 돌아가기' }).click()
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()
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
