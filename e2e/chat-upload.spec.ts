import { test, expect } from '@playwright/test'
import { enterDomain } from './shell'

/**
 * 대화 우측 패널의 '문서 추가' 자리 — 원본에 있던 것.
 *
 * 자리만 두고 눌러도 아무 일 없으면 장식이다. 여기서 보는 것은 두 가지다.
 *  ① 형식·용량 검사가 **실제로 돈다**(서버 없이도 즉시 막는다)
 *  ② 보내는 데서 실패하면 그 문장을 **그대로 보여 준다** — 올린 척하지 않는다
 */

/* 화면에는 다른 알림(라이브 지표)도 있다 — 반드시 이 패널 안에서 찾는다 */
const openDocs = async (page: import('@playwright/test').Page) => {
  await enterDomain(page)
  /* 좁은 화면에서는 패널이 접혀 있다 — 열면 대화상자가 된다.
     그 분기를 안 다루면 모바일에서만 조용히 안 도는 검사가 된다 */
  const wide = page.getByRole('complementary', { name: '답변 근거' })
  if (await wide.isVisible().catch(() => false)) return wide

  await page.getByRole('button', { name: '답변 근거', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '답변 근거' })
  await expect(dialog).toBeVisible()
  return dialog
}

test('받지 않는 형식은 서버에 보내기 전에 막는다', async ({ page }) => {
  const panel = await openDocs(page)

  await panel.getByLabel(/파일 선택 또는 끌어다 놓기/).setInputFiles({
    name: '악성.exe',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('x'),
  })

  const alert = panel.getByRole('alert')
  await expect(alert.first()).toBeVisible()
  await expect(alert.first()).toContainText(/형식|확장자|받지/)
})

test('보내는 데 실패하면 그대로 말한다 — 올린 척하지 않는다', async ({ page }) => {
  const panel = await openDocs(page)

  await panel.getByLabel(/파일 선택 또는 끌어다 놓기/).setInputFiles({
    name: '작업표준서.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4'),
  })

  const alert = panel.getByRole('alert')
  await expect(alert.first()).toBeVisible({ timeout: 10_000 })
  await expect(alert.first()).toContainText(/서버/)
})
