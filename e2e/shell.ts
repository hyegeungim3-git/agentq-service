import { expect, type Page } from '@playwright/test'

/**
 * 셸 조작 헬퍼.
 *
 * 분야를 고르면 '일반' 탭(챗봇)이 먼저 열린다. 에이전트를 열려면 탭을 옮겨야 한다.
 * 모바일에서는 사이드바가 오버레이라 먼저 열어야 하는데, 그 분기를 테스트마다
 * 복사하면 20곳이 된다. 여기 한 곳에 둔다.
 */
export function sidebar(page: Page) {
  return page.getByRole('navigation', { name: '작업 영역' })
}

/** 사이드바를 쓸 수 있는 상태로 만든다 — 좁은 화면이면 연다 */
export async function openSidebar(page: Page) {
  const nav = sidebar(page)
  if (!(await nav.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: '사이드바 열기' }).click()
    await expect(nav).toBeVisible()
  }
  return nav
}

export async function openTab(page: Page, name: RegExp) {
  const nav = await openSidebar(page)
  await nav.getByRole('button', { name }).click()
}

/** 포털에서 제조 분야로 들어간다 */
export async function enterDomain(page: Page) {
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()
}

/** 분야 선택 → 에이전트 탭 → 해당 에이전트 */
export async function openAgent(page: Page, name: RegExp) {
  await enterDomain(page)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name }).click()
}
