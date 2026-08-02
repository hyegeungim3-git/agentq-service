import { test, expect } from '@playwright/test'
import { openTab } from './shell'

async function openAgent(page: import('@playwright/test').Page, name: RegExp) {
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name }).click()
}

test.describe('파일 업로드', () => {
  test('문서 에이전트에 업로드 자리가 있고 받는 형식을 알려준다', async ({ page }) => {
    await openAgent(page, /문서 요약/)
    await expect(page.getByText('파일 선택 또는 끌어다 놓기')).toBeVisible()
    await expect(page.getByText(/PDF · DOCX · HWP · PPTX · TXT · 최대 50MB/)).toBeVisible()
  })

  /* 에이전트마다 받는 것이 다르다 — 회의록은 음성, 분석은 데이터 파일 */
  test('에이전트마다 받는 형식이 다르다', async ({ page }) => {
    await openAgent(page, /회의록 작성/)
    await expect(page.getByText(/MP3 · WAV · M4A · OGG/)).toBeVisible()

    await openAgent(page, /데이터 분석/)
    await expect(page.getByText(/CSV · XLSX · 최대 100MB/)).toBeVisible()
  })

  /* 서버가 없으면 성공한 척하지 않는다 */
  test('서버가 붙기 전에는 실패를 그대로 알린다', async ({ page }) => {
    await openAgent(page, /문서 요약/)
    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: '계약서.pdf', mimeType: 'application/pdf', buffer: Buffer.from('x') })
    await expect(page.getByRole('alert')).toContainText('서버에 연결된 뒤에 동작합니다')
  })

  test('받지 않는 형식은 서버에 보내기 전에 막는다', async ({ page }) => {
    await openAgent(page, /문서 요약/)
    await page.locator('input[type="file"]').setInputFiles({
      name: '설치본.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('x'),
    })
    await expect(page.getByRole('alert')).toContainText('EXE 형식은')
  })

  /* 조회형 화면에는 올릴 파일이 없다 */
  test('조회형 에이전트에는 업로드 자리가 없다', async ({ page }) => {
    await openAgent(page, /내규·규정 조회/)
    await expect(page.locator('input[type="file"]')).toHaveCount(0)
  })
})
