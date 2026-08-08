import { test, expect } from '@playwright/test'
import { enterDomain, openSidebar } from './shell'

/**
 * 현장 업무 — 교대 인수인계와 작업지시.
 *
 * 여기서 보는 것은 **닫히지 않은 것이 먼저 보이는가**다. 목록만 있으면 사람이
 * 훑어야 하고, 훑는 일은 교대 시간에 가장 안 된다.
 */

async function openField(page: import('@playwright/test').Page, name: string) {
  await enterDomain(page)
  const nav = await openSidebar(page)
  await nav.getByRole('button', { name }).click()
}

test('교대 인수인계 — 확인 없이 넘어온 미결을 먼저 말한다', async ({ page }) => {
  await openField(page, '교대 인수인계')

  await expect(page.getByRole('heading', { name: '교대 인수인계', level: 1 })).toBeVisible()
  await expect(page.getByText(/확인 없이 넘어온 미결 2건/)).toBeVisible()

  /* 확인이 화면에만 남으면 다음 조가 열었을 때 그대로다 */
  await page.getByRole('checkbox').first().check()
  await page.getByRole('button', { name: /확인 1건 저장/ }).click()
  await expect(page.getByRole('alert')).toContainText(/다음 조가 볼 수 있게 서버에 남아야/)
})

test('작업지시 추적 — 늦은 것과 기한 없는 것을 갈라 말한다', async ({ page }) => {
  await openField(page, '작업지시 추적')

  await expect(page.getByRole('heading', { name: '작업지시 추적', level: 1 })).toBeVisible()
  await expect(page.getByText(/기한이 지났는데 안 끝난 지시/)).toBeVisible()
  await expect(page.getByText(/기한이 없는 지시/)).toBeVisible()

  await page.getByRole('button', { name: '작업 착수' }).click()
  await expect(page.getByRole('alert')).toContainText(/현장 기록이라 서버에 남아야/)
})
