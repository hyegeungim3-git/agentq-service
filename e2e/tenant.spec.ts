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
  await expect(page.getByRole('button', { name: /^회의록 작성/ })).toBeDisabled()
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
