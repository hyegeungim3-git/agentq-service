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
/* ⚠️ 업무 용어는 도메인 사이에 공유된다. '이의신청'은 공시에도 심사에도 있어
   네 번째 발주처를 넣자 오탐이 났다 — 마커는 그 발주처에서만 쓰는 좁은 말로 고른다 */
const REB = ['표준지', '공시지가', '괴리율']

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
  await expect(page.getByRole('button', { name: /^문서 번역/ })).toBeDisabled()
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
  for (const name of [/^문서 번역/, /^기준정보 표준화/]) {
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

/* 세 번째 발주처 — 팩 구조가 실제로 반복 가능한지 본다 */

test('행정 포털에 앞선 두 발주처의 말이 없다', async ({ page }) => {
  await enter(page, /한성시청/)
  await expect(page.getByRole('heading', { name: '업무 챗봇' })).toBeVisible()
  await page.waitForTimeout(800)
  const body = await bodyText(page)
  expect(
    [...HANBIT, ...REB].filter((w) => body.includes(w)),
    '행정 화면에 다른 발주처의 말이 보인다',
  ).toEqual([])
  // 빈 화면도 '다른 발주처 말이 없다'를 통과하므로 자기 말이 실제로 나오는지 함께 본다
  await expect(page.getByText('법정 기한 도과 민원 118건')).toBeVisible()
})

test('세 발주처가 서로 다른 색·문서·에이전트를 쓴다', async ({ page }) => {
  const cases: [RegExp, string, string][] = [
    [/한빛정밀/, 'rgb(15, 118, 110)', '프레스_작업표준서_SOP-PR-011.pdf'],
    [/한국부동산원/, 'rgb(0, 48, 135)', '표준지공시지가_조사지침_2026.pdf'],
    [/한성시청/, 'rgb(22, 101, 52)', '민원사무_처리지침_2026.pdf'],
    [/새빛대학교병원/, 'rgb(124, 58, 237)', '진료비청구_심사지침_2026.pdf'],
  ]
  for (const [org, color, doc] of cases) {
    await enter(page, org)
    const nav = await openSidebar(page)
    await expect(nav.getByRole('button', { name: /^일반/ }).first()).toHaveCSS(
      'background-color',
      color,
    )
    await openTab(page, /^에이전트/)
    await page.getByRole('button', { name: '문서 요약', exact: true }).click()
    await expect(page.getByText(doc)).toBeVisible()
  }
})

test('의료 포털에 앞선 세 발주처의 말이 없다', async ({ page }) => {
  await enter(page, /새빛대학교병원/)
  await expect(page.getByRole('heading', { name: '업무 챗봇' })).toBeVisible()
  await page.waitForTimeout(800)
  const body = await bodyText(page)
  expect(
    [...HANBIT, ...REB, '옥외광고', '강변동'].filter((w) => body.includes(w)),
    '의료 화면에 다른 발주처의 말이 보인다',
  ).toEqual([])
  await expect(page.getByText('응급의료센터 가동률 92.1%')).toBeVisible()
})

test('의료 에이전트가 의료 결과를 낸다', async ({ page }) => {
  await enter(page, /새빛대학교병원/)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '문서 사전 검토', exact: true }).click()
  await expect(page.getByText('청구 심사지침')).toBeVisible()
  await page.getByRole('button', { name: '사전 검토 시작' }).click()
  const result = page.getByRole('region', { name: /검토 결과/ })
  await expect(result).toBeVisible({ timeout: 10_000 })
  await expect(result).toContainText('진료기록 근거 없이 기준 초과 산정')
  await expect(result).not.toContainText('표준지')
})

test('행정 에이전트가 행정 결과를 낸다', async ({ page }) => {
  await enter(page, /한성시청/)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '문서 사전 검토', exact: true }).click()
  await expect(page.getByText('민원사무 처리지침')).toBeVisible()
  await page.getByRole('button', { name: '사전 검토 시작' }).click()
  const result = page.getByRole('region', { name: /검토 결과/ })
  await expect(result).toBeVisible({ timeout: 10_000 })
  await expect(result).toContainText('연장 통지 없이 기한 도과')
  await expect(result).not.toContainText('표준지')
})

/**
 * 허브 카드의 **단계**가 그 발주처 것인가.
 *
 * 배포본을 눈으로 보다 찾은 결함이다 — 병원 허브의 '데이터 조회' 카드에
 * `MES 조회`, '데이터 분석'에 `센서 이력 결합`, '안전관리계획 수립'에
 * `설비 상태 조회`가 떠 있었다. 정의가 코어에 하나뿐이었기 때문이다.
 */
test('허브 카드의 단계가 발주처마다 다르다', async ({ page }) => {
  await enter(page, /한빛정밀/)
  await openTab(page, /^에이전트/)
  await expect(page.getByText('MES 조회').first()).toBeVisible()

  await enter(page, /새빛대학교병원/)
  await openTab(page, /^에이전트/)
  await expect(page.getByText('점검·운영 자료 조회').first()).toBeVisible()
  for (const word of ['MES 조회', '센서 이력 결합', '설비 상태 조회']) {
    await expect(page.getByText(word)).toHaveCount(0)
  }
})

/**
 * 대화 화면 오른쪽의 **연동 도구**도 그 발주처 것인가.
 *
 * 도구 목록이 플랫폼에 하나뿐이던 때는 어느 발주처를 골라도 `MES 조회`가 떴다.
 */
/* 좁은 화면에서는 근거 패널이 오버레이라 먼저 열어야 한다 */
const openTools = async (page: import('@playwright/test').Page) => {
  if ((page.viewportSize()?.width ?? 0) < 1280) {
    await openTab(page, /^일반/)
    await page.getByRole('button', { name: '답변 근거' }).click()
  }
  await page.getByRole('button', { name: '연동 도구' }).click()
}

test('연동 도구 패널이 발주처마다 다르다', async ({ page }) => {
  await enter(page, /한빛정밀/)
  await openTools(page)
  await expect(page.getByText('MES 조회')).toBeVisible()

  await enter(page, /새빛대학교병원/)
  await openTools(page)
  await expect(page.getByText('청구 자료 조회')).toBeVisible()
  await expect(page.getByText('MES 조회')).toHaveCount(0)
})

/**
 * '답변 근거 > 지식 영역'도 그 발주처 것인가.
 *
 * 도구를 옮기고 배포본을 보다 찾았다 — 병원 대화 화면에 `작업표준·공정 문서`,
 * `설비 대장·정비 이력`이 떠 있었다. 지식 영역이 플랫폼에 하나뿐이었기 때문이다.
 */
test('답변 근거의 지식 영역이 발주처마다 다르다', async ({ page }) => {
  const openAreas = async () => {
    if ((page.viewportSize()?.width ?? 0) < 1280) {
      await openTab(page, /^일반/)
      await page.getByRole('button', { name: '답변 근거' }).click()
    }
    await page.getByRole('button', { name: '지식 영역' }).click()
  }

  /* 좁은 화면에서는 패널이 오버레이라 화면 전체가 아니라 패널을 본다 */
  const panel = page.getByRole('complementary', { name: '답변 근거' })

  await enter(page, /한빛정밀/)
  await openAreas()
  await expect(panel).toContainText('설비 대장·정비 이력')

  await enter(page, /새빛대학교병원/)
  await openAreas()
  await expect(panel).toContainText('심사지침·급여 기준')
  for (const word of ['설비 대장·정비 이력', '작업표준·공정 문서', '협력사 공유 문서']) {
    await expect(panel).not.toContainText(word)
  }
})
