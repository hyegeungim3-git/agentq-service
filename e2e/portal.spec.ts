import { test, expect } from '@playwright/test'
import { enterDomain, openSidebar, openTab } from './shell'

test.describe('포털 · 셸', () => {
  /* 분야를 고르면 셸이 열리고 '일반' 탭(챗봇)이 먼저 보인다 */
  test('분야를 고르면 셸이 열리고 돌아올 수 있다', async ({ page }) => {
    await page.goto('./')
    /* 첫 화면 제목은 고른 발주처의 플랫폼 이름이다(D-014) */
    await expect(page.getByRole('heading', { level: 1 })).toContainText('한빛정밀')

    await page.getByRole('button', { name: /사용자 포털 입장/ }).click()
    await expect(page.getByRole('heading', { name: '업무 챗봇' })).toBeVisible()

    const nav = await openSidebar(page)
    await expect(nav).toContainText('한빛정밀')
    await nav.getByRole('button', { name: '분야 선택으로' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('한빛정밀')
  })

  /* 탭이 실제로 화면을 바꾼다 */
  test('탭을 옮기면 본문이 바뀐다', async ({ page }) => {
    await enterDomain(page)

    await openTab(page, /^에이전트/)
    await expect(page.getByRole('heading', { name: '한빛정밀' })).toBeVisible()

    await openTab(page, /^보안/)
    await expect(page.getByRole('heading', { name: '데이터 취급 현황' })).toBeVisible()
  })

  /* 고를 수 있는 발주처는 업무 데이터가 있는 곳뿐이다.
     지금은 네 곳 모두 팩이 있어 전부 열려 있다. 팩 없이 열린 곳이 생기면
     `src/fixtures/packs.test.ts`가 먼저 깨진다. */
  test('팩이 있는 발주처는 모두 고를 수 있다', async ({ page }) => {
    await page.goto('./')
    for (const org of ['한빛정밀', '한국부동산원', '한성시청', '새빛대학교병원']) {
      await expect(page.getByRole('button', { name: new RegExp(org) })).toBeEnabled()
    }
    await expect(page.getByText('업무 데이터 준비 중')).toHaveCount(0)
  })

  test('가로 스크롤이 없다', async ({ page }) => {
    await enterDomain(page)
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
    await enterDomain(page)

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
    await enterDomain(page)

    await page.getByRole('button', { name: /금형 교체 주기가 어떻게 되나요/ }).click()
    await expect(page.getByText(/타수 50만 타/)).toBeVisible({ timeout: 10_000 })

    let nav = await openSidebar(page)
    await expect(nav).toContainText('금형 교체 주기가 어떻게 되나요')

    /* 워크스페이스는 접힌 셀렉트가 아니라 목록이다(D-014) — 몇 개가 있는지,
       지금 어디인지가 열어 보지 않아도 보여야 한다 */
    const rooms = nav.getByRole('button', { name: /TF$|업무반$|팀$/ })
    const second = rooms.nth(1)
    const secondName = ((await second.textContent()) ?? '').trim()
    await second.click()
    nav = await openSidebar(page)
    await expect(nav).toContainText('이 워크스페이스에는 아직 없습니다')

    await nav.getByRole('button', { name: secondName }).click()
    await nav.getByRole('button', { name: /TF$|업무반$|팀$/ }).first().click()
    nav = await openSidebar(page)
    await expect(nav).toContainText('금형 교체 주기가 어떻게 되나요')
  })

  /* 새로고침해도 남아야 '저장'이라고 말할 수 있다 */
  test('대화가 새로고침 뒤에도 남는다', async ({ page }) => {
    await enterDomain(page)
    await page.getByRole('button', { name: /출장 여비 기준 알려줘/ }).click()
    await expect(page.getByText(/일 60,000원/)).toBeVisible({ timeout: 10_000 })

    await page.reload()
    /* 이제는 새로고침해도 보던 자리에 남는다 — 포털을 다시 거치지 않는다 */
    const nav = await openSidebar(page)
    await expect(nav).toContainText('출장 여비 기준 알려줘')
  })

  test('공지와 사용 가이드가 실제 내용을 보여준다', async ({ page }) => {
    await enterDomain(page)

    await openTab(page, /^공지사항/)
    await expect(page.getByRole('heading', { name: '공지사항' })).toBeVisible()

    await openTab(page, /^사용 가이드/)
    await expect(page.getByRole('heading', { name: '사용 가이드' })).toBeVisible()
  })
})

test.describe('셸 — 알림·브리핑', () => {
  /* 눌러도 아무 데도 못 가면 읽음 처리 버튼일 뿐이다 */
  test('브리핑에서 릴레이로, 알림에서 에이전트로 이어진다', async ({ page }) => {
    await enterDomain(page)

    // 빈 화면 브리핑
    await expect(page.getByRole('region', { name: '오늘의 업무 브리핑' })).toContainText(
      '지금 처리해야 하는 일이 2건 있습니다',
    )
    await page.getByRole('button', { name: /접수 처리 릴레이 열기/ }).click()
    await expect(page.getByRole('heading', { name: '수입검사 성적서 접수 처리' })).toBeVisible()

    // 알림 센터
    await page.getByRole('button', { name: /^알림/ }).click()
    const box = page.getByRole('region', { name: /업무 알림 \d+건/ })
    await expect(box).toContainText('출처 · PdM 센서 알람')
    await box.getByRole('button', { name: /설비 이력 조회 →/ }).click()
    await expect(page.getByRole('heading', { name: '데이터 조회 에이전트' })).toBeVisible()
  })
})

test.describe('셸 — 라이브 지표·판단 근거·피드백', () => {
  /* 계기판처럼 보이는데 지어낸 숫자면 그게 제일 위험하다 */
  test('라이브 지표는 예시 값임을 먼저 말하고 배속이 동작한다', async ({ page }) => {
    await enterDomain(page)

    const card = page.getByRole('region', { name: 'PRS-C03 진동 RMS' })
    await expect(card).toContainText('서버 미연결 — 예시 값')
    await expect(card).toContainText('관리 기준 3.5mm/s')

    // 60배속으로 돌리면 곡선 끝(4.2)까지 간다
    await card.locator('label').filter({ hasText: '60×' }).click()
    await expect(card).toContainText('4.20', { timeout: 20_000 })
    await expect(card).toContainText('관리 기준 3.5mm/s를 넘었습니다')
  })

  test('판단 근거와 피드백이 답변에 붙는다', async ({ page }) => {
    await enterDomain(page)
    await page.getByRole('button', { name: /금형 교체 주기가 어떻게 되나요/ }).click()
    await expect(page.getByText(/타수 50만 타/)).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: '왜 이 답변인가' }).click()
    await expect(page.getByText('작업표준 조항 직접 일치')).toBeVisible()
    await expect(page.getByText(/확인할 것 · 타수 기준은 설비별 예외/)).toBeVisible()

    await page.getByRole('button', { name: '도움이 안 됐어요' }).click()
    await expect(page.getByRole('button', { name: '근거가 부족하다' })).toBeVisible()
    await expect(page.getByText(/서버로 보내지 않습니다/)).toBeVisible()
  })

  test('사업장별 지표는 도식임을 밝히고 값 없는 곳을 지우지 않는다', async ({ page }) => {
    await enterDomain(page)
    await page.getByRole('button', { name: /사업장별 가동률 보여줘/ }).click()

    await expect(page.getByText('배치 도식 — 실제 지리 좌표 아님')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/2개 사업장은 값이 없어 평균에서 빠졌습니다/)).toBeVisible()

    await page.getByRole('button', { name: /창원본사/ }).click()
    await expect(page.getByText(/최근 추이 · 88.2% → 81.4%/)).toBeVisible()
  })

  /* 다크는 팔레트 변수만 뒤집는다 — 셸 배경이 실제로 어두워졌는지로 판정한다 */
  test('환경설정 — 다크 스킨과 화면 틀 언어가 실제로 바뀐다', async ({ page }) => {
    await enterDomain(page)
    await openTab(page, /^환경설정/)

    const root = page.locator('html')
    await expect(root).toHaveAttribute('data-theme', 'light')
    /* 카드 배경(bg-white)이 실제로 어두워졌는지로 판정한다 —
       data-theme만 보면 CSS가 안 붙어도 통과한다 */
    const card = page.getByRole('main').locator('section').first()
    const lightBg = await card.evaluate((el) => getComputedStyle(el).backgroundColor)

    /* 라디오는 sr-only라 라벨을 누른다 — 실제 사용자도 라벨을 누른다 */
    await page.getByRole('main').locator('label').filter({ hasText: '어둡게' }).click()
    await expect(root).toHaveAttribute('data-theme', 'dark')
    const darkBg = await card.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(lightBg).toBe('rgb(255, 255, 255)')
    expect(darkBg).not.toBe(lightBg)

    // 화면 틀만 영어로 — 사이드바 탭 이름이 바뀐다
    await page.getByRole('main').locator('label').filter({ hasText: 'English' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings')
    const nav = await openSidebar(page, { nav: 'Work area', open: 'Open sidebar' })
    await expect(nav.getByRole('button', { name: /^Agents/ })).toBeVisible()

    // 새로고침해도 남는다
    await page.reload()
    await expect(root).toHaveAttribute('data-theme', 'dark')
  })

})
