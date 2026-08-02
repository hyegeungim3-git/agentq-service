import { test, expect } from '@playwright/test'

async function openOcr(page: import('@playwright/test').Page) {
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()
  await page.getByRole('button', { name: /문서 인식/ }).click()
}

test.describe('문서 인식 설정', () => {
  test('설정을 켜면 결과에 항목이 늘어난다', async ({ page }) => {
    await openOcr(page)
    await page.getByRole('checkbox', { name: /표 추출/ }).check()
    await page.getByRole('radio', { name: /도면·성적서 특화/ }).check()
    await page.getByRole('button', { name: '문서 인식' }).click()

    await expect(page.getByRole('table', { name: '추출한 표' })).toBeVisible({ timeout: 10_000 })
    const spec = page.getByRole('region', { name: '규격 대비 판정' })
    await expect(spec).toContainText('58.0 HRC 이상')
    await expect(spec).toContainText('규격 내')
  })

  /* 설정을 잘못 고르면 결과가 나빠진다 — 그 사실을 화면이 말한다 */
  test('언어를 잘못 고르면 신뢰도가 떨어지고 이유를 말한다', async ({ page }) => {
    await openOcr(page)
    await page.getByRole('radio', { name: /영어만/ }).check()
    await page.getByRole('button', { name: '문서 인식' }).click()
    const r = page.getByRole('region', { name: '인식 결과' })
    await expect(r).toContainText('영어만으로 인식해', { timeout: 10_000 })
    await expect(r).toContainText('언어 설정을 확인하십시오')
  })

  test('결과 형식이 내보내기 본문을 바꾼다', async ({ page }) => {
    await openOcr(page)
    await page.getByRole('radio', { name: /마크다운/ }).check()
    await page.getByRole('button', { name: '문서 인식' }).click()
    await expect(page.getByRole('region', { name: '내보내기 미리보기' })).toContainText(
      '# 수입검사 성적서',
      { timeout: 10_000 },
    )
  })
})
