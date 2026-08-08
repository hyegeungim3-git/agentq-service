import { test, expect } from '@playwright/test'
import { adminNav } from './shell'

/**
 * 관리자 표가 **이름을 갖고 화면에 실제로 나오는지**.
 *
 * 소스 검사(`scripts/admin-table.test.ts`)는 부품을 썼는지만 본다. 부품이
 * 이름을 붙이는 데 실패하면(오타 하나로 `aria-label`이 빠지는 식) 소스는 통과하고
 * 화면만 조용히 망가진다 — 그 갈라짐을 여기서 막는다.
 */

const enterAdmin = async (page: import('@playwright/test').Page) => {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()
}

test('관리자 표는 이름으로 찾을 수 있다', async ({ page }) => {
  await enterAdmin(page)

  /* 첫 화면의 표 둘이 서로 다른 이름을 갖는다 — 예전에는 둘 다 '표'였다 */
  await expect(page.getByRole('table', { name: '노드 정보' })).toBeVisible()
  await expect(page.getByRole('table', { name: '파드 정보' })).toBeVisible()

  /* 가로 스크롤 정지점도 각자 이름을 갖는다 */
  await expect(page.getByRole('region', { name: /노드 정보 표/ })).toBeVisible()
  await expect(page.getByRole('region', { name: /파드 정보 표/ })).toBeVisible()
})

test('다른 화면의 표도 제 이름으로 나온다', async ({ page }) => {
  await enterAdmin(page)
  const nav = await adminNav(page)
  await nav.getByRole('button', { name: '사용자 관리', exact: true }).click()
  await expect(page.getByRole('table', { name: '사용자 목록' })).toBeVisible()
})
