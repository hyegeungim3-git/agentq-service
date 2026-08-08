import { test, expect } from '@playwright/test'
import { openTab, enterDomain } from './shell'

async function openAgent(page: import('@playwright/test').Page, name: string) {
  await enterDomain(page)
  await openTab(page, /^에이전트/)
  /* 카드 버튼의 이름은 **에이전트 이름 그대로**다. 최근 사용 칩·활동 패널에는
     자리를 덧붙인 이름이 있으므로 exact로 집으면 카드만 걸린다 */
  await page.getByRole('main').getByRole('button', { name, exact: true }).click()
}

test.describe('데이터 조회·분석', () => {
  test('조회 — 가정한 조건과 변환 실패를 밝힌다', async ({ page }) => {
    await openAgent(page, '데이터 조회')
    await page.getByRole('button', { name: '조회 실행' }).click()
    const basis = page.getByRole('region', { name: '질의 해석 근거' })
    await expect(basis).toBeVisible({ timeout: 10_000 })
    await expect(basis).toContainText('질의에 없어 AI가 가정한 조건')
    await expect(basis).toContainText('변환하지 못한 표현')
  })

  test('조회 — 생성된 SQL을 펼쳐 볼 수 있다', async ({ page }) => {
    await openAgent(page, '데이터 조회')
    await page.getByRole('button', { name: '조회 실행' }).click()
    await expect(page.getByRole('region', { name: '질의 해석 근거' })).toBeVisible({ timeout: 10_000 })
    await page.getByText('생성된 SQL 보기').click()
    await expect(page.getByText('FROM mes.equipment')).toBeVisible()
  })

  test('분석 — 차트가 지연 로딩되고 표도 함께 나온다', async ({ page }) => {
    await openAgent(page, '데이터 분석')
    await page.getByRole('button', { name: '분석 실행' }).click()
    await expect(page.getByRole('table', { name: '추이 분석 데이터' })).toBeVisible({ timeout: 10_000 })
    /* 지연 로딩된 차트가 실제로 그려졌는지. 차트는 aria-hidden이라 역할로는 못 찾고,
       라이브러리 클래스명에 기대면 그리는 방법을 바꿀 때마다 깨진다 —
       **그림 자체**(figure 안의 꺾은선)가 있는지로 판정한다 */
    const plot = page.locator('figure[aria-hidden="true"] polyline')
    await expect(plot.first()).toBeAttached({ timeout: 10_000 })
  })

  test('분석 — 부분 결론임을 알린다', async ({ page }) => {
    await openAgent(page, '데이터 분석')
    await page.getByRole('button', { name: '분석 실행' }).click()
    await expect(page.getByText(/전체의 71%입니다/)).toBeVisible({ timeout: 10_000 })
  })

  /**
   * 이상치 탐지 — 이전 데모에 있던 유형이다.
   *
   * 목록만 있고 기준이 없으면 사용자는 '왜 이건 빠졌지'를 물을 수 없다.
   * 그래서 판정 규칙이 화면에 있는지까지 본다.
   */
  test('분석 — 이상치는 무엇을 기준으로 골랐는지 함께 말한다', async ({ page }) => {
    await openAgent(page, '데이터 분석')
    await page.getByRole('radio', { name: /이상치 탐지/ }).click()
    await page.getByRole('button', { name: '분석 실행' }).click()

    const table = page.getByRole('table', { name: '이상으로 본 항목' })
    await expect(table).toBeVisible({ timeout: 15_000 })
    /* 추이의 기준 초과 구간과 분포의 최다 항목이 한 표에 모인다 */
    await expect(table).toContainText('관리 기준')
    await expect(table).toContainText('평균의')
    await expect(page.getByText(/표준편차 기준은 쓰지 않습니다/)).toBeVisible()
  })

  /* 고른 데이터가 결과를 바꾸지 않으면 고르는 행위에 의미가 없다 */
  test('분석 — 데이터를 바꾸면 단위와 지표가 달라진다', async ({ page }) => {
    await openAgent(page, '데이터 분석')
    await page.getByRole('radio', { name: /침탄로3호기_온도프로파일/ }).click()
    await page.getByRole('button', { name: '분석 실행' }).click()
    const table = page.getByRole('table', { name: '추이 분석 데이터' })
    await expect(table).toBeVisible({ timeout: 10_000 })
    await expect(table).toContainText('7.8℃')
    await expect(table).not.toContainText('0.42%')
    await expect(page.getByText(/빠진 데이터가 없습니다/)).toBeVisible()
  })
})
