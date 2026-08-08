import { test, expect } from '@playwright/test'
import { adminNav } from './shell'

/**
 * 중대재해처벌법 대응 — 실제 브라우저에서 무엇이 보이는가.
 *
 * 단위 검사는 함수가 맞는 답을 내는지 본다. 여기서 보는 것은 **관리자가 이 메뉴를
 * 눌렀을 때 눈에 먼저 들어오는 것**이다. 이 화면의 값어치는 이행률 78%가 아니라
 * '초록색인데 주기를 넘긴 호가 있다'를 말하는 데 있다. 그 문장이 표 아래로
 * 밀리면 아무도 안 본다.
 */

test('중대재해처벌법 대응 — 낡은 증빙을 표보다 먼저 말한다', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()

  const nav = await adminNav(page)
  await nav.getByRole('button', { name: '중대재해처벌법 대응' }).click()

  await expect(page.getByRole('heading', { name: '중대재해처벌법 대응', level: 1 })).toBeVisible()

  /* 화면이 판정하는 것처럼 보이면 의무를 화면에 넘기게 된다 */
  await expect(page.getByText(/이 화면은 법적 판단을 내리지 않습니다/)).toBeVisible()

  /* 표만 보면 안 보이는 것 — 이름과 경과 일수까지 */
  const warning = page.getByText(/정한 갱신 주기를 넘긴 호 1건/)
  await expect(warning).toBeVisible()
  await expect(page.getByText(/제6호 안전보건 전문인력 배치/)).toBeVisible()

  /* 경고가 표보다 위에 있어야 한다 — 아래로 밀리면 아무도 안 본다 */
  const warnBox = (await warning.boundingBox()) ?? { y: Number.MAX_SAFE_INTEGER }
  const table = (await page.getByRole('table').first().boundingBox()) ?? { y: 0 }
  expect(warnBox.y, '낡은 증빙 경고가 표 아래로 밀렸습니다').toBeLessThan(table.y)

  /* 탭이 내용을 실제로 바꾼다 */
  await page.getByRole('tab', { name: '위험성평가 이력' }).click()
  await expect(page.getByText(/조치가 남은 평가 2건/)).toBeVisible()

  await page.getByRole('tab', { name: '교육·점검' }).click()
  await expect(page.getByText('8명 미이수')).toBeVisible()
})
