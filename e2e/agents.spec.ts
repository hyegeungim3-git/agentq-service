import { test, expect } from '@playwright/test'
import { openTab, enterDomain } from './shell'

async function openAgent(page: import('@playwright/test').Page, name: string) {
  await enterDomain(page)
  await openTab(page, /^에이전트/)
  /* 카드 버튼의 이름은 **에이전트 이름 그대로**다. 최근 사용 칩·활동 패널에는
     자리를 덧붙인 이름이 있으므로 exact로 집으면 카드만 걸린다 */
  await page.getByRole('main').getByRole('button', { name, exact: true }).click()
}

test.describe('신규 에이전트 3종', () => {
  test('보고서 — 출처와 미작성 칸을 함께 보여준다', async ({ page }) => {
    await openAgent(page, '표준 보고서 작성')
    await page.getByRole('button', { name: '보고서 생성' }).click()
    await expect(page.getByRole('region', { name: /주간 실적 보고/ })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('담당자 작성이 필요한 칸')).toBeVisible()
  })

  test('회의록 — 미정 항목 건수를 알린다', async ({ page }) => {
    await openAgent(page, '회의록 작성')
    await page.getByRole('main').getByRole('button', { name: '회의록 작성' }).click()
    await expect(page.getByText(/정해지지 않은 항목이 2건/)).toBeVisible({ timeout: 10_000 })
  })

  test('내규 조회 — 근거를 못 찾으면 지어내지 않는다', async ({ page }) => {
    await openAgent(page, '내규·규정 조회')
    await page.getByLabel(/무엇이 궁금하신가요/).fill('사내 동호회 지원금')
    await page.getByRole('main').getByRole('button', { name: '규정 조회' }).click()
    await expect(page.getByText(/근거 조항을 찾지 못했습니다/)).toBeVisible({ timeout: 10_000 })
  })

})
