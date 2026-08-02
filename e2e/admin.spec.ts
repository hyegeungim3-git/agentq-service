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
    await expect(nav.getByText(/화면 12개 사용 가능 · 18개 준비 중/)).toBeVisible()

    await nav.getByRole('button', { name: /HR 연계·그룹 관리/ }).click()
    await expect(page.getByRole('heading', { name: 'HR 연계·그룹 관리' })).toBeVisible()
    await expect(page.getByText('인사 시스템 연동과 조직 그룹')).toBeVisible()
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

  /* 상위 항목은 묶음일 뿐 화면이 아니다 — 첫 하위 메뉴로 보낸다 */
  test('사용자 관리는 하위 메뉴로 펼쳐지고 첫 화면으로 간다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    await expect(page.getByRole('heading', { name: '사용자 목록', level: 1 })).toBeVisible()

    nav = await adminNav(page)
    for (const label of ['승인 관리', '할당량', '접근 로그', '접근권한·차단']) {
      await expect(nav.getByRole('button', { name: label })).toBeVisible()
    }
  })

  test('사용자 검색이 서버 조건으로 목록을 좁힌다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    await expect(page.getByText('10명')).toBeVisible()

    await page.getByLabel(/이름 · 부서 · 메일/).fill('협력사')
    await expect(page.getByText('1명')).toBeVisible()
    await expect(page.getByText('박태윤')).toHaveCount(0)
  })

  /* 화면에서만 바꾸면 정지시킨 줄 알고 닫는데 그 계정은 살아 있다 */
  test('계정 상태 변경은 성공한 척하지 않는다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    await page.getByRole('button', { name: '정지' }).first().click()
    await expect(page.getByRole('alert')).toContainText(/변경을 저장할 곳이 없습니다/)
  })

  test('오래 기다린 승인 신청이 맨 위로 온다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '승인 관리' }).click()
    await expect(page.getByText(/3일 이상 기다린 신청 2건/)).toBeVisible()
    await expect(page.getByRole('main').getByRole('listitem').first()).toContainText('8일 대기')
  })

  /* 목록만 보여 주면 '여기 있는 게 전부'로 읽힌다 */
  test('접근 로그가 남지 않는 것을 함께 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '접근 로그' }).click()
    await expect(page.getByText('이 목록에 남지 않는 것')).toBeVisible()
    await expect(page.getByText(/보관 기간이 정해지지 않아/)).toBeVisible()
  })

  /* 만료된 규칙을 '차단 중'으로 그리면 막고 있다고 믿게 된다 */
  test('만료된 차단 규칙을 가려서 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '접근권한·차단' }).click()
    await expect(page.getByText(/차단 중 2건/)).toBeVisible()
    await expect(page.getByText(/만료돼 더 이상 막지 않는 규칙 1건/)).toBeVisible()
  })


  test('LLM 설정 — 모델을 고르면 맡은 업무와 중지 사유가 나온다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: 'LLM 운영' }).click()
    await expect(page.getByRole('heading', { name: 'LLM 설정', level: 1 })).toBeVisible()

    await page.getByRole('button', { name: /Solar-10.7B/ }).click()
    await expect(page.getByText(/수치 인용 오류가 반복돼 중지했습니다/)).toBeVisible()
    await expect(page.getByText(/지금 이 모델로 나가는 답변은 없습니다/)).toBeVisible()

    nav = await adminNav(page)
    for (const label of ['신뢰성 관리', 'AI 품질 관리']) {
      await expect(nav.getByRole('button', { name: label })).toBeVisible()
    }
  })

  /* 안 잰 것을 0으로 세면 효과가 없어 보이고 평균이 무너진다 */
  test('신뢰성 관리 — 측정 전 항목을 평균에서 빼고 탭이 실제로 바뀐다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: 'LLM 운영' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '신뢰성 관리' }).click()

    await expect(page.getByText(/위 평균에 포함하지 않았습니다/)).toBeVisible()
    await expect(page.getByText('측정 전')).toBeVisible()

    await page.getByRole('tab', { name: '출력 가드레일' }).click()
    await expect(page.getByText(/문서에 있던 개인정보가 답변에 그대로 실려 나갑니다/)).toBeVisible()
    await expect(page.getByText('Top-K')).toHaveCount(0)
  })

  /* 포털에서 누른 피드백이 관리자 화면으로 이어진다 */
  test('AI 품질 관리 — 포털 피드백이 집계되고 한계를 밝힌다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await page.getByRole('button', { name: /금형 교체 주기가 어떻게 되나요/ }).click()
    await expect(page.getByText(/타수 50만 타/)).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: '도움이 안 됐어요' }).click()
    await page.getByRole('button', { name: '근거가 부족하다' }).click()

    // 사이드바가 좁은 화면에서 오버레이라 UI로 되돌아가지 않고 다시 연다
    // (피드백은 브라우저에 남으므로 새로 열어도 그대로다)
    await page.goto('./')
    await page.getByRole('button', { name: /관리자 시스템/ }).click()
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: 'LLM 운영' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: 'AI 품질 관리' }).click()

    const box = page.getByRole('region', { name: '사용자 피드백' })
    await expect(box).toContainText('이 브라우저에 남은 것만')
    await expect(box).toContainText('근거가 부족하다')
    await expect(box).toContainText(/어떤 질문이었는지도 이어 붙일 수 없습니다/)
  })

})
