import { test, expect } from '@playwright/test'

/**
 * 상단바의 종과 톱니 — **누르면 실제로 뭔가 일어나는지**.
 *
 * 원본에 있던 아이콘을 그냥 옮기면 장식이 된다. 종은 실제로 센 수를 말하고,
 * 톱니는 실제로 표를 바꾸고 그 선택이 새로고침 뒤에도 남아야 한다.
 */

const enterAdmin = async (page: import('@playwright/test').Page) => {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()
}

test('알림 종이 센 수를 말하고 그 화면으로 데려간다', async ({ page }) => {
  await enterAdmin(page)

  /* 이름에 수가 들어 있어야 한다 — 빨간 점만으로는 낭독기에 아무 일도 안 일어난다 */
  const bell = page.getByRole('button', { name: /확인이 필요한 것 \d+건/ })
  await expect(bell).toBeVisible()

  await bell.click()
  /* 실패한 파드는 시스템 현황 화면에 실제로 있는 값이다 */
  const item = page.getByRole('button', { name: /실패한 파드/ })
  await expect(item).toBeVisible()

  await item.click()
  await expect(page.getByRole('table', { name: '파드 정보' })).toBeVisible()
})

test('표 밀도를 좁게 두면 표가 좁아지고 새로고침해도 남는다', async ({ page }) => {
  await enterAdmin(page)

  const cell = page.getByRole('table', { name: '노드 정보' }).getByRole('cell').first()
  const before = (await cell.boundingBox())?.height ?? 0
  expect(before).toBeGreaterThan(0)

  await page.getByRole('button', { name: '화면 설정' }).click()
  await page.getByRole('radio', { name: '좁게' }).click()

  await expect
    .poll(async () => (await cell.boundingBox())?.height ?? 0)
    .toBeLessThan(before)

  /* 고른 것이 안 남으면 매번 다시 고르게 된다 */
  await page.reload()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()
  const after = (await page.getByRole('table', { name: '노드 정보' }).getByRole('cell').first().boundingBox())?.height ?? 0
  expect(after).toBeLessThan(before)
})
