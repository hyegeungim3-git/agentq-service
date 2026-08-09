import { test, expect } from '@playwright/test'
import { adminNav } from './shell'

/**
 * 탭이라고 말했으면 탭처럼 움직여야 한다.
 *
 * `role="tab"`을 들은 낭독기 사용자는 좌우 화살표로 옮겨 다닌다. 화살표를 안 받으면
 * 아무 일도 안 일어나고, 그때부터 이 묶음은 '고장 난 탭'이다.
 */
test('관리자 탭은 좌우 화살표로 옮겨진다', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()

  const nav = await adminNav(page)
  await nav.getByRole('button', { name: '콘텐츠 관리', exact: true }).click()

  const list = page.getByRole('tablist', { name: '콘텐츠 종류' })
  const first = list.getByRole('tab').first()
  await first.click()
  await expect(first).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowRight')
  await expect(first).toHaveAttribute('aria-selected', 'false')
  await expect(list.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true')

  /* 끝에서 반대편으로 돈다 */
  await page.keyboard.press('ArrowLeft')
  await expect(first).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(list.getByRole('tab').last()).toHaveAttribute('aria-selected', 'true')
})
