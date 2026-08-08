import { test, expect } from '@playwright/test'
import { openTab, enterDomain } from './shell'

async function openReview(page: import('@playwright/test').Page) {
  await enterDomain(page)
  await openTab(page, /^에이전트/)
  await page.getByRole('main').getByRole('button', { name: /문서 사전 검토/ }).click()
  await expect(page.getByRole('heading', { name: '문서 사전 검토 에이전트' })).toBeVisible()
}

test.describe('문서 사전 검토', () => {
  test('조항 근거와 조치 사항이 함께 나온다', async ({ page }) => {
    await openReview(page)
    await page.getByRole('button', { name: '사전 검토 시작' }).click()

    const result = page.getByRole('region', { name: /검토 결과/ })
    await expect(result).toBeVisible({ timeout: 10_000 })
    await expect(result).toContainText('취업규칙 제23조 제2항')
    await expect(result).toContainText('조치 ·')
  })

  test('심각도 높음이 있으면 상신을 권하지 않는다', async ({ page }) => {
    await openReview(page)
    await page.getByRole('button', { name: '사전 검토 시작' }).click()
    await expect(page.getByText(/상신을 권하지 않습니다/)).toBeVisible({ timeout: 10_000 })
  })

  test('규정을 모두 해제하면 실행할 수 없다', async ({ page }) => {
    await openReview(page)
    await page.getByRole('checkbox', { name: '취업규칙·복무규정' }).uncheck()
    await page.getByRole('checkbox', { name: '구매·계약 규정' }).uncheck()
    await expect(page.getByRole('button', { name: '사전 검토 시작' })).toBeDisabled()
  })
})
