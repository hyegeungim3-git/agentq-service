import { test, expect } from '@playwright/test'
import { adminNav } from './shell'

/**
 * 답변 재현성 — 실제 브라우저에서.
 *
 * 여기서 보는 것은 **재현 버튼을 눌렀을 때 무엇이 보이는가**다.
 * 이전 데모는 1.8초 뒤 '결과 일치'를 띄웠다. 서버가 없는데 그 문장이 뜨면
 * 심사에서 재현해 봤다고 말하게 된다.
 */

test('답변 재현성 — 재현 버튼이 성공한 척하지 않는다', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()

  const nav = await adminNav(page)
  await nav.getByRole('button', { name: '답변 재현성' }).click()

  await expect(page.getByRole('heading', { name: '답변 재현성', level: 1 })).toBeVisible()
  await expect(page.getByText(/질의·답변 원문은 보관하지 않습니다/)).toBeVisible()

  await page.getByRole('button', { name: '이 구성으로 재현' }).first().click()

  const alert = page.getByRole('alert')
  await expect(alert).toBeVisible()
  await expect(alert).toContainText(/서버가 연결되지 않아 실행하지 못했습니다/)
  await expect(page.getByText(/결과 일치/)).toHaveCount(0)

  /* 구성 상세를 펴면 그때 값과 지금 값이 함께 보인다 */
  await page.getByRole('button', { name: '구성 상세 보기' }).nth(1).click()
  await expect(page.getByText(/그때 p-2.0 → 지금 p-2.1/)).toBeVisible()
})
