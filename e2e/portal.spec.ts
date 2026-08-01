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

  test('준비 중인 에이전트는 비활성이다 — 죽은 버튼을 두지 않는다', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await expect(page.getByRole('button', { name: /업무 챗봇/ })).toBeDisabled()
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
