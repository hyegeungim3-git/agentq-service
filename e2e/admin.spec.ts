import { test, expect, type Page } from '@playwright/test'

/** 관리자 메뉴는 좁은 화면에서 오버레이라 먼저 연다 */
async function adminNav(page: Page) {
  const nav = page.getByRole('navigation', { name: '관리자 메뉴' })
  if (!(await nav.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: '메뉴 열기' }).click()
    await expect(nav).toBeVisible()
  }
  return nav
}

async function enterAdmin(page: Page) {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()
}

const pickLabel = (page: Page, text: string) =>
  page.getByRole('main').locator('label').filter({ hasText: text }).first().click()

test.describe('관리자 셸', () => {
  test('포털에서 관리자로 들어가고 돌아온다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '포털 선택으로' }).click()
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()
  })

  /* 감추면 '이 제품에는 사용자 관리가 없다'로 읽힌다 */
  test('아직 안 만든 메뉴를 감추지 않고 준비 중으로 표시한다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await expect(nav.getByText(/화면 4개 사용 가능 · 20개 준비 중/)).toBeVisible()

    await nav.getByRole('button', { name: /사용자 관리/ }).click()
    await expect(page.getByRole('heading', { name: '사용자 관리' })).toBeVisible()
    await expect(page.getByText('계정·승인·권한 부여')).toBeVisible()
    await expect(page.getByText(/운영·관리 단계에서 만듭니다/)).toBeVisible()
  })

  /* 인프라 수치는 로직이 없다 — 지어낸 값을 실측처럼 그리면 거짓 계기판이 된다 */
  test('대시보드 4종이 모두 예시 값임을 먼저 말한다', async ({ page }) => {
    await enterAdmin(page)
    for (const [menu, heading] of [
      ['시스템 현황', '시스템 현황'],
      ['서비스 현황', '서비스 현황'],
      ['GPU 현황', 'GPU 현황'],
      ['트레이너 현황', '트레이너 현황'],
    ]) {
      const nav = await adminNav(page)
      await nav.getByRole('button', { name: menu as string }).click()
      await expect(page.getByRole('heading', { name: heading as string, level: 1 })).toBeVisible()
      await expect(page.getByText(/서버 미연결 — 예시 값/).first()).toBeVisible()
    }
  })

  test('파드 구간을 바꾸면 목록이 실제로 달라진다', async ({ page }) => {
    await enterAdmin(page)
    await expect(page.getByText(/24h 구간 7건/)).toBeVisible()
    await expect(page.getByText('notify-relay-6d4f2')).toBeVisible()

    await pickLabel(page, '1h')
    await expect(page.getByText(/1h 구간 3건/)).toBeVisible()
    await expect(page.getByText('notify-relay-6d4f2')).toHaveCount(0)
  })

  /* 상태를 아는 것과 조치할 수 있는 것은 다르다 */
  test('주의 상태 서비스는 사유와 조치를 함께 준다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '서비스 현황' }).click()
    await expect(page.getByText(/학습 실패 알림 3건이 전송되지 않았습니다/)).toBeVisible()
    await expect(page.getByText(/조치 · 시스템 현황에서 notify-relay/)).toBeVisible()
  })

  test('학습 구간을 바꾸면 집계와 실패 사유가 바뀐다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '트레이너 현황' }).click()
    await expect(page.getByText('실패한 작업 2건')).toBeVisible()
    await expect(page.getByText(/genos-ai-01 GPU 2 과열로 중단/)).toBeVisible()

    await pickLabel(page, '일간')
    await expect(page.getByText('실패한 작업 1건')).toBeVisible()
  })
})
