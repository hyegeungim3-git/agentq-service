import { test, expect } from '@playwright/test'

async function openAgent(page: import('@playwright/test').Page, name: RegExp) {
  await page.goto('/')
  await page.getByRole('button', { name: /한빛정밀/ }).click()
  await page.getByRole('button', { name }).click()
}

test.describe('데이터 조회·분석', () => {
  test('조회 — 가정한 조건과 변환 실패를 밝힌다', async ({ page }) => {
    await openAgent(page, /데이터 조회/)
    await page.getByRole('button', { name: '조회 실행' }).click()
    const basis = page.getByRole('region', { name: '질의 해석 근거' })
    await expect(basis).toBeVisible({ timeout: 10_000 })
    await expect(basis).toContainText('질의에 없어 AI가 가정한 조건')
    await expect(basis).toContainText('변환하지 못한 표현')
  })

  test('조회 — 생성된 SQL을 펼쳐 볼 수 있다', async ({ page }) => {
    await openAgent(page, /데이터 조회/)
    await page.getByRole('button', { name: '조회 실행' }).click()
    await expect(page.getByRole('region', { name: '질의 해석 근거' })).toBeVisible({ timeout: 10_000 })
    await page.getByText('생성된 SQL 보기').click()
    await expect(page.getByText('FROM mes.equipment')).toBeVisible()
  })

  test('분석 — 차트가 지연 로딩되고 표도 함께 나온다', async ({ page }) => {
    await openAgent(page, /데이터 분석/)
    await page.getByRole('button', { name: '분석 실행' }).click()
    await expect(page.getByRole('table', { name: '추이 분석 데이터' })).toBeVisible({ timeout: 10_000 })
    // 지연 로딩된 차트가 실제로 그려졌는지 — SVG 존재로 판정
    await expect(page.locator('svg.recharts-surface').first()).toBeVisible({ timeout: 10_000 })
  })

  test('분석 — 부분 결론임을 알린다', async ({ page }) => {
    await openAgent(page, /데이터 분석/)
    await page.getByRole('button', { name: '분석 실행' }).click()
    await expect(page.getByText(/전체의 71%입니다/)).toBeVisible({ timeout: 10_000 })
  })
})
