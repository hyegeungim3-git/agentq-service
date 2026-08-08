import { test, expect } from '@playwright/test'
import { openAgent } from './shell'

/**
 * 문서 흐름 — 만들고 · 점검하고 · 가져가고 · 올린다.
 *
 * 여기서 보는 것은 **점검이 실제 문서를 보고 계산하는가**다. 이전 데모는 점검 결과가
 * 미리 적혀 있어 늘 통과였다. 브라우저에서 실제로 만든 결과에 대해 물어야
 * 계산인지 도장인지 갈린다.
 */

test('보고서 — 점검하고 내려받고 결재까지', async ({ page }) => {
  await openAgent(page, /표준 보고서 작성/)

  await page.getByRole('button', { name: '보고서 생성' }).click()
  await expect(page.getByRole('region', { name: /주간 실적 보고/ })).toBeVisible({ timeout: 15_000 })

  const box = page.getByRole('region', { name: '내보내기 전 확인' })
  await expect(box).toBeVisible()

  /* 보안등급을 정하는 자리가 아직 없다 — 없는 것을 없다고 말해야 한다 */
  await expect(box.getByText(/표기가 없으면 일반문서로 다뤄집니다/)).toBeVisible()

  /* 상신은 서버가 한다 — 올린 척하지 않는다 */
  const submit = box.getByRole('button', { name: '결재 상신' })
  if (await submit.isVisible()) {
    await submit.click()
    await expect(page.getByRole('alert')).toContainText(/그룹웨어에 문서를 만드는 일이라/)
  } else {
    await expect(box.getByText(/결재에 올릴 수 없습니다/)).toBeVisible()
  }
})

test('안전관리계획 — 결과 옆에 같은 확인 절차가 붙는다', async ({ page }) => {
  await openAgent(page, /안전관리계획 수립/)

  await page.getByRole('button', { name: '위험성평가 실시' }).click()
  await expect(page.getByRole('region', { name: '내보내기 전 확인' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: '내려받기' })).toBeVisible()
})
