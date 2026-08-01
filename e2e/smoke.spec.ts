import { test, expect } from '@playwright/test'

/* 첫 E2E — 화면이 뜨는지가 아니라 '가로 스크롤 없이' 뜨는지까지 본다.
   agent-rules §8: 지원하는 최소 모바일 너비에서 잘림과 가로 스크롤이 없어야 한다. */
test('앱이 렌더되고 가로 스크롤이 없다', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
