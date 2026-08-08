import { test, expect } from '@playwright/test'
import { enterDomain, openTab } from './shell'

/**
 * 새로고침해도 보던 화면에 남는가.
 *
 * 이전에는 메모리에만 있어서 새로고침하면 첫 화면으로 돌아갔다. 회의 중에
 * "여기 보세요"라고 링크를 줄 수도 없었다.
 *
 * 여기서 보는 것은 **주소가 화면을 정말로 되살리는가**다 — 주소만 바뀌고 화면이
 * 안 따라오면 링크를 받은 사람은 엉뚱한 곳을 본다.
 */

test('발주처 안에서 새로고침하면 그 자리에 남는다', async ({ page }) => {
  await enterDomain(page)
  await openTab(page, /^보안/)
  await expect(page).toHaveURL(/#\/d\/manufacturing\/security/)

  await page.reload()
  await expect(page.getByRole('heading', { name: /데이터 취급/ })).toBeVisible()
})

test('에이전트 안쪽까지 주소에 남는다', async ({ page }) => {
  await enterDomain(page)
  await openTab(page, /^에이전트/)
  await page.getByRole('main').getByRole('button', { name: '문서 요약', exact: true }).click()
  await expect(page).toHaveURL(/#\/d\/manufacturing\/agents\/summary/)

  await page.reload()
  await expect(page.getByRole('heading', { name: '문서 요약' })).toBeVisible()
})

test('주소를 직접 열어도 그 화면이 뜬다', async ({ page }) => {
  await page.goto('./#/admin/users.list')
  await expect(page.getByRole('heading', { name: '사용자 목록', level: 1 })).toBeVisible()
})

/* 비슷한 것으로 넘겨짚으면 남의 발주처를 열어 줄 수 있다 */
test('모르는 주소는 첫 화면으로 보낸다', async ({ page }) => {
  await page.goto('./#/d/없는발주처/general')
  await expect(page.getByRole('navigation', { name: '발주처 선택' })).toBeVisible()
})

test('뒤로가기가 실제로 뒤로 간다', async ({ page }) => {
  await enterDomain(page)
  await openTab(page, /^보안/)
  await page.goBack()
  await expect(page).toHaveURL(/#\/d\/manufacturing\/general/)
})

/**
 * 링크로 바로 들어와도 **그 발주처의 데이터**를 본다.
 *
 * 주소로 화면을 기억하게 되자 포털을 안 거치는 길이 생겼고, 그때 발주처가 경계에
 * 안 꽂혀 대화 목록이 비었다. 화면이 뜨는 것과 그 발주처의 데이터가 오는 것은 다르다.
 */
test('링크로 바로 들어와도 그 발주처의 문서가 뜬다', async ({ page }) => {
  await page.goto('./#/d/public/agents/summary')
  await expect(page.getByText('표준지공시지가_조사지침_2026.pdf')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('프레스_작업표준서_SOP-PR-011.pdf')).toHaveCount(0)
})
