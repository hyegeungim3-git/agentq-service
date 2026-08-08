import { test, expect } from '@playwright/test'
import { enterDomain } from './shell'

/**
 * 현장 입력 — 코드로 찾기와 음성.
 *
 * 실제 브라우저에서 보는 것은 **못 할 때 무엇을 말하는가**다. 카메라도 마이크도
 * 여기서는 없다. 없을 때 조용히 아무 일도 안 하면 현장에서는 고장으로 읽힌다.
 */

test('코드로 찾기 — 카메라가 없어도 목록과 직접 입력이 남는다', async ({ page }) => {
  await enterDomain(page)
  await page.getByRole('button', { name: '코드로 찾기' }).click()

  const dialog = page.getByRole('dialog', { name: '코드로 찾기' })
  await expect(dialog).toBeVisible()

  await dialog.getByLabel('코드 직접 입력').fill('PRS-C99')
  await dialog.getByRole('button', { name: '찾기' }).click()
  await expect(dialog.getByRole('alert')).toContainText(/등록되지 않은 코드입니다/)

  /* 고른 코드는 입력창에 채우기만 한다 */
  await dialog.getByRole('button', { name: /설비 PRS-C03/ }).click()
  await expect(page.getByLabel('질문 입력')).toHaveValue('PRS-C03 진동 추이와 관리 기준 알려줘')
  await expect(page.getByRole('list', { name: '대화' }).getByRole('listitem')).toHaveCount(0)
})

test('음성 입력 — 못 쓰는 브라우저에서는 이유가 이름에 있다', async ({ page }) => {
  await enterDomain(page)
  /* 헤드리스 크로미움에는 음성 인식이 없다 — 그 상태가 화면에 어떻게 보이는지가 이 검사다 */
  const mic = page.getByRole('button', { name: /음성 입력/ })
  await expect(mic).toBeVisible()
  const name = (await mic.getAttribute('aria-label')) ?? ''
  if (name.includes('지원하지 않습니다')) {
    await expect(mic).toBeDisabled()
  } else {
    await expect(mic).toBeEnabled()
  }
})
