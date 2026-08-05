import { test, expect } from '@playwright/test'
import { openSidebar, openTab } from './shell'

/**
 * 발주처를 갈아끼우면 **내용이 실제로 바뀌는가.**
 *
 * 이 제품의 핵심 주장이다. 이전 데모는 공공을 골라도 제조 문서가 그대로 떠서
 * 고르는 행위에 의미가 없었다 — 그래서 아예 못 고르게 막아 두었다.
 *
 * 여기서 보는 것은 두 가지다.
 *  ① 각 발주처가 **자기 데이터**를 보여 준다
 *  ② 상대 발주처의 말이 **한 글자도** 안 나온다
 */

/** 그 발주처에만 있어야 하는 말 */
const HANBIT = ['프레스', '금형', 'PRS-C03']
const REB = ['표준지', '공시지가', '이의신청']

const enter = async (page: import('@playwright/test').Page, org: RegExp) => {
  await page.goto('./')
  await page.getByRole('button', { name: org }).click()
}

const bodyText = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.body.innerText)

test('발주처를 바꾸면 문서 목록이 바뀐다', async ({ page }) => {
  await enter(page, /한빛정밀/)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '문서 요약', exact: true }).click()
  await expect(page.getByText('프레스_작업표준서_SOP-PR-011.pdf')).toBeVisible()

  await enter(page, /한국부동산원/)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '문서 요약', exact: true }).click()
  await expect(page.getByText('표준지공시지가_조사지침_2026.pdf')).toBeVisible()
  await expect(page.getByText('프레스_작업표준서_SOP-PR-011.pdf')).toHaveCount(0)
})

test('공공 포털에 제조의 말이 한 글자도 없다', async ({ page }) => {
  await enter(page, /한국부동산원/)
  await expect(page.getByRole('heading', { name: '업무 챗봇' })).toBeVisible()
  await page.waitForTimeout(800)

  const seen: string[] = []
  for (const word of HANBIT) {
    if ((await bodyText(page)).includes(word)) seen.push(word)
  }
  expect(seen, '공공 화면에 제조의 말이 보인다').toEqual([])

  // 자기 말은 실제로 나와야 한다 — 빈 화면도 '제조 말이 없다'를 통과하기 때문이다
  await expect(page.getByText(/이의신청/).first()).toBeVisible()
})

test('제조 포털에 공공의 말이 한 글자도 없다', async ({ page }) => {
  await enter(page, /한빛정밀/)
  await expect(page.getByRole('heading', { name: '업무 챗봇' })).toBeVisible()
  await page.waitForTimeout(800)

  const seen: string[] = []
  for (const word of REB) {
    if ((await bodyText(page)).includes(word)) seen.push(word)
  }
  expect(seen, '제조 화면에 공공의 말이 보인다').toEqual([])
  await expect(page.getByText(/PRS-C03/).first()).toBeVisible()
})

/* 13종을 첫날부터 쓰는 발주처는 없다 — '안 만든 것'과 '아직 안 산 것'을 구분한다 */
test('도입 전 에이전트를 준비 중과 구분해 말한다', async ({ page }) => {
  await enter(page, /한국부동산원/)
  await openTab(page, /^에이전트/)
  /* 도입 전 카드의 접근성 이름에는 사유가 붙는다('회의록 작성 — 이 발주처 도입 전').
     보조기기가 이유를 읽을 수 있어야 해서다 — 그래서 정확히 같은 이름으로 찾지 않는다 */
  await expect(page.getByRole('button', { name: '문서 요약', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: /^수출 문서 번역/ })).toBeDisabled()
  await expect(page.getByText('도입 전').first()).toBeVisible()
})

test('발주처 색이 실제로 바뀐다', async ({ page }) => {
  await enter(page, /한국부동산원/)
  const nav = await openSidebar(page)
  await expect(nav.getByRole('button', { name: /^일반/ }).first()).toHaveCSS(
    'background-color',
    'rgb(0, 48, 135)',
  )
})

/**
 * 도입한 에이전트가 **그 발주처의 결과**를 낸다.
 *
 * 목록만 바뀌고 결과가 제조 것이면 갈아끼운 게 아니다 — 옵션·결과까지 본다.
 */
test('공공에서 문서 요약이 공공 문서로 돈다', async ({ page }) => {
  await enter(page, /한국부동산원/)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '문서 요약', exact: true }).click()
  await page.getByRole('button', { name: '요약 생성' }).click()
  const result = page.getByRole('region', { name: /요약 결과/ })
  await expect(result).toBeVisible({ timeout: 10_000 })
  await expect(result).toContainText('이의신청')
  await expect(result).not.toContainText('금형')
})

test('공공 사전 검토는 공공 규정 묶음을 대조한다', async ({ page }) => {
  await enter(page, /한국부동산원/)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '문서 사전 검토', exact: true }).click()
  // 묶음 이름도 발주처가 정한다 — '품질경영매뉴얼'은 제조 전용이었다
  await expect(page.getByText('표준지 조사지침')).toBeVisible()
  await expect(page.getByText('품질경영매뉴얼')).toHaveCount(0)

  await page.getByRole('button', { name: '사전 검토 시작' }).click()
  const result = page.getByRole('region', { name: /검토 결과/ })
  await expect(result).toBeVisible({ timeout: 10_000 })
  await expect(result).toContainText('이용상황 변동 사유 미기재')
  // 심각도 높음이 남아 있으면 상신을 권하지 않는다 — 그 경로가 공공에서도 살아야 한다
  await expect(result).toContainText('결재 상신을 권하지 않습니다')
})

test('공공 데이터 조회는 공공 소스를 쓴다', async ({ page }) => {
  await enter(page, /한국부동산원/)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '데이터 조회', exact: true }).click()
  await expect(page.getByRole('radio', { name: '이의신청 대장' })).toBeVisible()
  await expect(page.getByText('설비 대장')).toHaveCount(0)

  await page.getByRole('button', { name: '조회 실행' }).click()
  const basis = page.getByRole('region', { name: '질의 해석 근거' })
  await expect(basis).toBeVisible({ timeout: 10_000 })
  // 말없이 가정하지 않는다 — 공공에서도 같은 값어치가 살아 있어야 한다
  await expect(basis).toContainText('처리 기한 30일의 70%')
})

test('공공 문서 인식은 공공 서식을 읽는다', async ({ page }) => {
  await enter(page, /한국부동산원/)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '문서 인식(OCR)', exact: true }).click()
  await page.getByRole('button', { name: '문서 인식' }).click()
  const result = page.getByRole('region', { name: /인식 결과/ })
  await expect(result).toBeVisible({ timeout: 10_000 })
  await expect(result).toContainText('표준지공시지가 이의신청서')
  await expect(result).not.toContainText('수입검사 성적서')
})

/* 도입 안 한 에이전트는 눌러도 못 들어간다. 억지로 들어가더라도
   경계가 '도입하지 않았습니다'라고 답해야 한다 — 빈 결과를 주면 더 나쁘다 */
test('도입 전 에이전트는 목록에서 막혀 있다', async ({ page }) => {
  await enter(page, /한국부동산원/)
  await openTab(page, /^에이전트/)
  for (const name of [/^수출 문서 번역/, /^기준정보 표준화/]) {
    await expect(page.getByRole('button', { name })).toBeDisabled()
  }
})

test('공공 보고서·회의록이 공공 내용으로 나온다', async ({ page }) => {
  await enter(page, /한국부동산원/)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '표준 보고서 작성', exact: true }).click()
  await page.getByRole('button', { name: '보고서 생성' }).click()
  const report = page.getByRole('region', { name: /보고/ })
  await expect(report).toBeVisible({ timeout: 10_000 })
  await expect(report).toContainText('KREA-부동산공시처')
  await expect(report).not.toContainText('HBP-생산기술')

  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '회의록 작성', exact: true }).click()
  await page.getByRole('button', { name: '회의록 작성' }).click()
  const minutes = page.getByRole('region', { name: /심의회/ })
  await expect(minutes).toBeVisible({ timeout: 10_000 })
  await expect(minutes).toContainText('윤서경')
  await expect(minutes).not.toContainText('박태윤')
})
