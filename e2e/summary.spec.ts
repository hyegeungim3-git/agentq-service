import { test, expect } from '@playwright/test'
import { openTab } from './shell'

/** 포털을 거쳐 요약 화면으로 들어간다 — 실제 사용자 동선을 그대로 탄다. */
async function openSummary(page: import('@playwright/test').Page) {
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: /문서 요약/ }).click()
  await expect(page.getByRole('heading', { name: '문서 요약 에이전트' })).toBeVisible()
}

test.describe('문서 요약', () => {
  test('요약을 생성하면 결과·통계·키워드가 나온다', async ({ page }) => {
    await openSummary(page)
    await page.getByRole('button', { name: '요약 생성' }).click()

    const result = page.getByRole('region', { name: /요약 결과/ })
    await expect(result).toBeVisible({ timeout: 10_000 })
    await expect(result).toContainText('적용 범위')
    await expect(result).toContainText('압축률')
    await expect(result).toContainText('금형 교체')
  })

  test('요약 방식을 바꾸면 결과가 달라진다', async ({ page }) => {
    await openSummary(page)
    await page.getByRole('radio', { name: /핵심 요약/ }).check()
    await page.getByRole('button', { name: '요약 생성' }).click()

    const result = page.getByRole('region', { name: /요약 결과/ })
    await expect(result).toBeVisible({ timeout: 10_000 })
    await expect(result).toContainText('핵심 요약')
    // 상세 요약에만 있는 소제목은 없어야 한다
    await expect(result.getByRole('heading', { name: '작업 전 점검' })).toHaveCount(0)
  })

  test('AI 생성물 고지를 붙인다', async ({ page }) => {
    await openSummary(page)
    await page.getByRole('button', { name: '요약 생성' }).click()
    await expect(page.getByText(/AI가 생성한 요약입니다/)).toBeVisible({ timeout: 10_000 })
  })

  test('요약 중에는 진행 상태를 알린다', async ({ page }) => {
    await openSummary(page)
    await page.getByRole('button', { name: '요약 생성' }).click()
    /* 지연 동안 로딩 상태가 실제로 보여야 한다 — 보이지 않으면 상태 설계가 죽은 코드다.
       `role=status`로 찾지 않는다: 화면 전환 알림용 전역 리전이 생겨 둘이 됐다.
       여기서 보려는 것은 **눈에 보이는** 진행 표시다 */
    /* 눈에 보이는 진행 카드(낭독기용 sr-only 리전과 같은 문장을 쓰므로 그쪽과 구분한다) */
    await expect(
      page.locator('[aria-hidden="true"]').filter({ hasText: '문서를 요약하고 있습니다…' }),
    ).toBeVisible()
    /* 낭독기에도 같은 사실이 전달돼야 한다 */
    await expect(page.locator('p[role="status"]')).toHaveText('문서를 요약하고 있습니다…')
  })

  test('가로 스크롤이 없다', async ({ page }) => {
    await openSummary(page)
    await page.getByRole('button', { name: '요약 생성' }).click()
    await expect(page.getByRole('region', { name: /요약 결과/ })).toBeVisible({ timeout: 10_000 })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
})
