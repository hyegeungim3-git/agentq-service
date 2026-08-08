import { test, expect } from '@playwright/test'
import { openTab, enterDomain } from './shell'

async function openTranslate(page: import('@playwright/test').Page) {
  await enterDomain(page)
  await openTab(page, /^에이전트/)
  await page.getByRole('main').getByRole('button', { name: '문서 번역', exact: true }).click()
  await expect(page.getByRole('heading', { name: '문서 번역 에이전트' })).toBeVisible()
}

test.describe('문서 번역', () => {
  test('번역하면 문장·역번역·용어집이 나온다', async ({ page }) => {
    await openTranslate(page)
    await page.getByRole('button', { name: '번역 실행' }).click()

    await expect(page.getByRole('region', { name: /번역 결과/ })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('region', { name: '역번역 검증' })).toBeVisible()
    await expect(page.getByRole('region', { name: '적용된 용어집' })).toBeVisible()
    // 번역문 본문에도 같은 문구가 나오므로 용어집 영역으로 좁힌다(strict mode 위반 회피)
    await expect(
      page.getByRole('region', { name: '적용된 용어집' }).getByText('Carburizing heat treatment'),
    ).toBeVisible()
  })

  test('신뢰도가 낮은 문장에 검토 권장을 붙인다', async ({ page }) => {
    await openTranslate(page)
    await page.getByRole('button', { name: '번역 실행' }).click()
    await expect(page.getByText('담당자 검토 권장').first()).toBeVisible({ timeout: 10_000 })
  })

  test('용어집을 끄면 적용된 용어집 영역이 사라진다', async ({ page }) => {
    await openTranslate(page)
    await page.getByRole('checkbox', { name: /사내 용어집 적용/ }).uncheck()
    await page.getByRole('button', { name: '번역 실행' }).click()
    await expect(page.getByRole('region', { name: /번역 결과/ })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('region', { name: '적용된 용어집' })).toHaveCount(0)
  })

  test('AI 생성물 고지를 붙인다', async ({ page }) => {
    await openTranslate(page)
    await page.getByRole('button', { name: '번역 실행' }).click()
    await expect(page.getByText(/AI가 생성한 번역입니다/)).toBeVisible({ timeout: 10_000 })
  })
})
