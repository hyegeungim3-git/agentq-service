import { test, expect } from '@playwright/test'

async function openOcr(page: import('@playwright/test').Page) {
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()
  await page.getByRole('button', { name: /문서 인식/ }).click()
}

test.describe('표준 보고서 설정', () => {
  /* 입력 칸이 결과에 안 들어가면 그건 장식이다 */
  test('직접 입력한 내용이 보고서에 들어가고 확인 필요에서 빠진다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await page.getByRole('button', { name: /표준 보고서 작성/ }).click()

    await page.getByLabel('주요 실적').fill('수출 로트 3건 선적 완료')
    await page.getByRole('radio', { name: /요약체/ }).check()
    await page.getByRole('button', { name: '보고서 생성' }).click()

    const r = page.getByRole('region', { name: /주간 실적 보고/ })
    await expect(r).toContainText('수출 로트 3건 선적 완료', { timeout: 10_000 })
    await expect(r).toContainText('출처 · 직접 입력')
    await expect(page.getByText('주요 실적 — 직접 입력 필요')).toHaveCount(0)
    await expect(page.getByText('다음 계획 — 직접 입력 필요')).toBeVisible()
  })
})

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

test.describe('기준정보 표준화 — 주소 처리', () => {
  async function openMapping(page: import('@playwright/test').Page) {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await page.getByRole('button', { name: /기준정보 표준화/ }).click()
  }

  /* 자동으로 끝나는 건수를 먼저 말한다 */
  test('일괄 처리는 사람 몫이 몇 건인지 먼저 말한다', async ({ page }) => {
    await openMapping(page)
    await page.getByRole('radio', { name: /일괄 처리/ }).check()
    await page.getByRole('button', { name: /주소 표준화$/ }).click()
    const r = page.getByRole('region', { name: /일괄 표준화 결과 6건/ })
    await expect(r).toContainText('6건 중 4건은 사람이 봐야 합니다', { timeout: 10_000 })
    await expect(r).toContainText('2건은 AI로 해결되지 않습니다')
  })

  test('폐지된 코드는 조회되더라도 경고한다', async ({ page }) => {
    await openMapping(page)
    await page.getByRole('radio', { name: /코드 역조회/ }).check()
    await page.getByRole('textbox').fill('4812110100')
    await page.getByRole('button', { name: /코드 조회/ }).click()
    await expect(page.getByRole('region', { name: '코드 역조회 결과' })).toContainText(
      '폐지된 코드입니다',
      { timeout: 10_000 },
    )
  })
})
