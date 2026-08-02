import { test, expect } from '@playwright/test'
import { openSidebar, openTab } from './shell'

test.describe('포털 · 셸', () => {
  /* 분야를 고르면 셸이 열리고 '일반' 탭(챗봇)이 먼저 보인다 */
  test('분야를 고르면 셸이 열리고 돌아올 수 있다', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()

    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await expect(page.getByRole('heading', { name: '업무 챗봇' })).toBeVisible()

    const nav = await openSidebar(page)
    await expect(nav).toContainText('한빛정밀')
    await nav.getByRole('button', { name: '분야 선택으로' }).click()
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()
  })

  /* 탭이 실제로 화면을 바꾼다 */
  test('탭을 옮기면 본문이 바뀐다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()

    await openTab(page, /^에이전트/)
    await expect(page.getByRole('heading', { name: '한빛정밀' })).toBeVisible()

    await openTab(page, /^보안/)
    await expect(page.getByRole('heading', { name: '데이터 취급 현황' })).toBeVisible()
  })

  /* 고를 수 있는 발주처는 업무 데이터가 있는 곳뿐이다.
     이 단언이 깨지면 다른 발주처의 문서·수치가 노출되고 있다는 뜻이다. */
  test('업무 데이터가 없는 발주처는 비활성이다', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('button', { name: /한빛정밀/ })).toBeEnabled()
    for (const org of ['한국부동산원', '한성시청', '새빛대학교병원']) {
      await expect(page.getByRole('button', { name: new RegExp(org) })).toBeDisabled()
    }
  })

  test('가로 스크롤이 없다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await expect(page.getByRole('heading', { name: '업무 챗봇' })).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('터치 타깃이 충분하다', async ({ page }) => {
    await page.goto('./')
    const box = await page.getByRole('button', { name: /한빛정밀/ }).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('셸 — 최근 대화', () => {
  /* 목록이 실제로 대화를 오갈 수 있어야 한다 */
  test('질문하면 목록에 남고, 새 대화로 갈랐다가 되돌아올 수 있다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()

    await page.getByRole('button', { name: /금형 교체 주기가 어떻게 되나요/ }).click()
    await expect(page.getByText(/타수 50만 타/)).toBeVisible({ timeout: 10_000 })

    let nav = await openSidebar(page)
    await expect(nav).toContainText('금형 교체 주기가 어떻게 되나요')

    await nav.getByRole('button', { name: '+ 새 대화' }).click()
    await expect(page.getByText(/타수 50만 타/)).toHaveCount(0)

    nav = await openSidebar(page)
    // 삭제(✕) 버튼도 제목을 aria-label에 갖고 있어 정확한 이름으로 좁힌다
    await nav.getByRole('button', { name: '금형 교체 주기가 어떻게 되나요?', exact: true }).click()
    await expect(page.getByText(/타수 50만 타/)).toBeVisible()
  })
})

test.describe('셸 — 워크스페이스·공지·가이드', () => {
  /* 워크스페이스가 대화를 실제로 나누지 않으면 이름표에 불과하다 */
  test('워크스페이스를 바꾸면 대화 목록이 갈린다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()

    await page.getByRole('button', { name: /금형 교체 주기가 어떻게 되나요/ }).click()
    await expect(page.getByText(/타수 50만 타/)).toBeVisible({ timeout: 10_000 })

    let nav = await openSidebar(page)
    await expect(nav).toContainText('금형 교체 주기가 어떻게 되나요')

    await nav.getByRole('combobox', { name: '워크스페이스' }).selectOption({ index: 1 })
    nav = await openSidebar(page)
    await expect(nav).toContainText('이 워크스페이스에는 아직 없습니다')

    await nav.getByRole('combobox', { name: '워크스페이스' }).selectOption({ index: 0 })
    nav = await openSidebar(page)
    await expect(nav).toContainText('금형 교체 주기가 어떻게 되나요')
  })

  /* 새로고침해도 남아야 '저장'이라고 말할 수 있다 */
  test('대화가 새로고침 뒤에도 남는다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await page.getByRole('button', { name: /출장 여비 기준 알려줘/ }).click()
    await expect(page.getByText(/일 60,000원/)).toBeVisible({ timeout: 10_000 })

    await page.reload()
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    const nav = await openSidebar(page)
    await expect(nav).toContainText('출장 여비 기준 알려줘')
  })

  test('공지와 사용 가이드가 실제 내용을 보여준다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()

    await openTab(page, /^공지사항/)
    await expect(page.getByRole('heading', { name: '공지사항' })).toBeVisible()

    await openTab(page, /^사용 가이드/)
    await expect(page.getByRole('heading', { name: '사용 가이드' })).toBeVisible()
  })
})
