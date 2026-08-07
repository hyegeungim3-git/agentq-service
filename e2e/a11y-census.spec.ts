import { test, expect, type Page } from '@playwright/test'
import { enterDomain, openTab } from './shell'

/**
 * **전수를 센다.** 한 화면에서 되는 것을 보고 '전부 된다'고 적지 않기 위해서다.
 *
 * 이 파일이 있는 이유는 실패 기록이다. 결함 15건을 고쳤다고 보고한 뒤 반증 검수를
 * 붙였더니 세 건이 과장이었고, 셋 다 같은 모양이었다 — **공용 컴포넌트 한 곳을 고치고
 * 전부라고 적었는데 같은 일을 하는 다른 경로가 남아 있었다.** 8/13, 8/13, 그리고 화면 하나.
 *
 * 기존 검사는 대표 화면 하나(문서 요약)만 열어 봤다. 그래서 나머지 12종에서
 * 옛 패턴이 살아 있어도 초록불이었다.
 *
 * 규칙: **못 연 것은 조용히 넘기지 않는다.** 못 열면 그만큼 안 본 것이므로,
 * 건너뛴 목록을 모아 비어 있는지 단언한다. 안 그러면 셀렉터가 어긋나는 순간
 * 아무것도 안 훑고도 통과한다(이 저장소에서 실제로 두 번 났다).
 */

/** 카탈로그와 같은 순서 — `src/entities/agent/model.ts` */
const AGENTS = [
  '문서 요약',
  '문서 번역',
  '문서 사전 검토',
  '업무 챗봇',
  '표준 보고서 작성',
  '회의록 작성',
  '지식 검색',
  '내규·규정 조회',
  '문서 인식(OCR)',
  '데이터 조회',
  '기준정보 표준화',
  '데이터 분석',
  '안전관리계획 수립',
]

const openHub = async (page: Page) => {
  await enterDomain(page)
  await openTab(page, /^에이전트/)
  await expect(page.getByRole('button', { name: '문서 요약', exact: true })).toBeVisible()
}

test.describe('전수 세기 @a11y', () => {
  /**
   * 결함 6·9 — 에이전트 **13종 전부**에서 되는가.
   *
   * 실제로 8종만 됐다. 공용 셸(`AgentShell`)을 쓰는 화면만 고쳤고, 셸을 안 쓰는
   * 4화면은 옛 패턴 그대로였다 — 실행 순간에 생겨나는 라이브 리전 + 이름이
   * '돌아가기'뿐인 뒤로가기.
   */
  test('에이전트 13종 모두 상주 알림 자리와 목적지 있는 뒤로가기를 갖는다', async ({ page }) => {
    const noRegion: string[] = []
    const vagueBack: string[] = []
    const unreachable: string[] = []
    let opened = 0

    for (const name of AGENTS) {
      await openHub(page)
      const card = page.getByRole('button', { name, exact: true })
      if ((await card.count()) === 0 || (await card.isDisabled())) {
        unreachable.push(name)
        continue
      }
      await card.click()
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      opened += 1

      /* ① 실행하기 전에 이미 알릴 자리가 있는가 — 실행할 때 만들면 첫 변화를 놓친다 */
      if ((await page.locator('p[role="status"]').count()) === 0) noRegion.push(name)

      /* ② 되돌아가는 버튼 이름이 **어디로 가는지** 말하는가.
         업무 챗봇만은 자체 헤더에 보이는 글자 '← 돌아가기'를 쓴다 — 눈으로도 읽히므로
         이름과 글자가 어긋나지 않는다. 나머지는 아이콘 버튼이라 이름이 전부다 */
      if (name !== '업무 챗봇') {
        const labels = await page
          .locator('button[aria-label*="돌아가기"]')
          .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''))
        if (labels.length === 0 || labels.some((l) => l === '돌아가기')) vagueBack.push(name)
      }
    }

    expect(unreachable, '못 연 에이전트가 있으면 그만큼 안 본 것이다').toEqual([])
    expect(opened, '13종을 다 열지 못했으면 이 검사는 전수가 아니다').toBe(AGENTS.length)
    expect(noRegion, '실행 전에 알림 자리가 없는 화면 — 첫 변화를 놓친다').toEqual([])
    expect(vagueBack, "이름이 '돌아가기'뿐이면 어디로 가는지 안 들린다").toEqual([])
  })

  /**
   * 결함 11 — 허브 카드 **13장 전부**가 '사람 확인 지점'을 설명에 갖는가.
   *
   * 이 제품이 강조하는 판단 근거인데, Tab으로 도는 사람은 배지를 못 본다.
   */
  test('허브 카드 13장 모두 사람 확인 지점을 이름 옆에서 말한다', async ({ page }) => {
    await openHub(page)

    const missing = await page.evaluate(() => {
      const out: string[] = []
      for (const b of Array.from(document.querySelectorAll('button[aria-describedby]'))) {
        const ids = (b.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
        const text = ids
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ')
        if (!/사람 확인/.test(text)) out.push(b.textContent?.trim().slice(0, 20) ?? '(이름 없음)')
      }
      return out
    })

    const described = await page.locator('button[aria-describedby]').count()
    expect(described, '설명이 붙은 카드를 못 찾았다면 이 검사는 아무것도 보지 않았다').toBeGreaterThanOrEqual(
      AGENTS.length,
    )
    expect(missing, '설명에 사람 확인 지점이 없는 카드 — 소리로는 그 정보가 통째로 빠진다').toEqual([])
  })

  /**
   * 결함 13 — 발주처 **네 곳 전부**가 소리로 구분되는가.
   *
   * 기존 검사는 두 곳만 봤다. 넷의 제목이 서로 달라야 '지금 어느 발주처인지'를
   * 창 제목 읽기로 알 수 있다.
   */
  test('발주처 네 곳의 창 제목이 서로 다르고 기관명을 담는다', async ({ page }) => {
    const orgs = ['한빛정밀', '한국부동산원', '한성시청', '새빛대학교병원']
    const titles: string[] = []
    const missed: string[] = []

    for (const org of orgs) {
      await page.goto('./')
      const card = page.getByRole('button', { name: new RegExp(org) })
      if ((await card.count()) === 0 || (await card.isDisabled())) {
        missed.push(org)
        continue
      }
      await card.click()
      await expect(page.getByRole('textbox').first()).toBeVisible()
      await expect(page).toHaveTitle(new RegExp(org))
      titles.push(await page.title())
    }

    expect(missed, '못 연 발주처가 있으면 그만큼 안 본 것이다').toEqual([])
    expect(new Set(titles).size, '제목이 겹치면 소리로 어느 발주처인지 구분되지 않는다').toBe(orgs.length)
  })

  /**
   * 결함 4 — 덮어 여는 패널 **셋 전부**가 대화상자인가.
   *
   * 기존 검사는 둘(사용자 사이드바·답변 근거)만 봤다. 관리자 메뉴가 빠져 있었다.
   */
  test.describe('좁은 화면', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('덮어 여는 패널 셋 모두 대화상자다', async ({ page }) => {
      const notModal: string[] = []

      const cases: [string, () => Promise<void>][] = [
        [
          '사용자 사이드바',
          async () => {
            await enterDomain(page)
            await page.getByRole('button', { name: '사이드바 열기' }).click()
          },
        ],
        [
          '답변 근거',
          async () => {
            await enterDomain(page)
            await page.getByRole('button', { name: '답변 근거', exact: true }).click()
          },
        ],
        [
          '관리자 메뉴',
          async () => {
            await page.goto('./')
            await page.getByRole('button', { name: /관리자 시스템/ }).click()
            await page.getByRole('button', { name: '메뉴 열기' }).click()
          },
        ],
      ]

      for (const [what, open] of cases) {
        await open()
        const dialog = page.getByRole('dialog')
        const ok =
          (await dialog.count()) === 1 &&
          (await dialog.getAttribute('aria-modal')) === 'true' &&
          (await page.locator('[inert]').count()) > 0 &&
          (await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')))
        if (!ok) notModal.push(what)
        await page.keyboard.press('Escape')
      }

      expect(notModal, '덮고 있는데 대화상자가 아니면 뒤 화면이 그대로 읽힌다').toEqual([])
    })
  })

  /**
   * 결함 12 — 라이브 지표를 가진 **발주처마다** 임계 문장이 알림인가.
   */
  test('라이브 지표가 있는 발주처마다 임계 문장이 알림이다', async ({ page }) => {
    const orgs = ['한빛정밀', '한국부동산원', '한성시청', '새빛대학교병원']
    const notAlert: string[] = []
    let withMetric = 0

    for (const org of orgs) {
      await page.goto('./')
      await page.getByRole('button', { name: new RegExp(org) }).click()
      await expect(page.getByRole('textbox').first()).toBeVisible()

      /* `liveMetric`은 팩의 **필수 항목**이다(`DomainPackData`). 그러니 안 보이면
         건너뛸 일이 아니라 결함이다 — '없으면 넘어간다'로 두면 카드가 통째로 사라져도
         초록불이 된다 */
      const speed = page.locator('label').filter({ hasText: '60×' })
      if ((await speed.count()) === 0) continue
      withMetric += 1

      const alert = page.getByRole('alert').filter({ hasText: /관리 기준/ })
      if ((await alert.count()) === 0) notAlert.push(org)
    }

    expect(withMetric, '발주처마다 라이브 지표가 하나씩 있어야 한다 — 안 보이면 카드가 사라진 것이다').toBe(
      orgs.length,
    )
    expect(notAlert, '임계 문장이 알림이 아니면 넘는 순간에 아무 말도 안 한다').toEqual([])
  })

  /**
   * 결함 15 — 셸 **둘 다** 첫 정지점이 건너뛰기인가. (이미 있는 검사의 전수 판)
   * 여기서는 두 셸을 한 검사에서 세어, 한쪽만 되는 상태를 못 지나가게 한다.
   */
  test('셸 두 곳 모두 첫 정지점이 건너뛰기다', async ({ page }) => {
    const bad: string[] = []

    for (const [what, go] of [
      ['사용자 포털', async () => enterDomain(page)],
      [
        '관리자',
        async () => {
          await page.goto('./')
          await page.getByRole('button', { name: /관리자 시스템/ }).click()
        },
      ],
    ] as [string, () => Promise<unknown>][]) {
      await go()
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      /* 문서 맨 위에서 시작하는 사람을 재현한다 — blur()만으로는 크로미움이
         '다음 Tab이 시작할 자리'를 그대로 들고 있다 */
      await page.evaluate(() => {
        document.body.setAttribute('tabindex', '-1')
        document.body.focus()
        document.body.removeAttribute('tabindex')
      })
      await page.keyboard.press('Tab')
      const name = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
      if (!/본문으로 건너뛰기/.test(name)) bad.push(`${what} — ${name || '(이름 없음)'}`)
    }

    expect(bad, '첫 정지점이 건너뛰기가 아니면 사이드바를 다 지나야 본문에 닿는다').toEqual([])
  })

  /**
   * 결함 10 — 라디오 묶음마다 이름이 있는가. 문서 선택을 가진 **모든 에이전트**에서.
   */
  test('문서 선택 라디오 묶음마다 이름이 있다', async ({ page }) => {
    const unnamed: string[] = []
    let groups = 0

    for (const name of ['문서 요약', '문서 번역', '문서 사전 검토', '문서 인식(OCR)']) {
      await openHub(page)
      await page.getByRole('button', { name, exact: true }).click()
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      const found = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[role="radiogroup"]')).map((g) => {
          const by = g.getAttribute('aria-labelledby')
          const label = by
            ? (document.getElementById(by)?.textContent ?? '')
            : (g.getAttribute('aria-label') ?? '')
          return label.trim()
        }),
      )
      groups += found.length
      if (found.length === 0 || found.some((l) => !l)) unnamed.push(name)
    }

    expect(groups, '라디오 묶음을 못 찾았다면 이 검사는 아무것도 보지 않았다').toBeGreaterThan(0)
    expect(unnamed, "이름 없는 묶음은 '4개 중 1'이라고만 들린다").toEqual([])
  })
})

/**
 * 결함 1·2 — 상주 알림 자리가 **비어 있다가 채워지는가.**
 *
 * 자리만 있고 내용이 안 바뀌면 아무 말도 안 하는 것과 같다. 대표 화면에서
 * 실제로 값이 채워지는 것까지 본다(전수는 위에서, 동작은 여기서).
 */
test('상주 알림 자리가 실제로 채워진다 @a11y', async ({ page }) => {
  await enterDomain(page)
  const status = page.locator('p[role="status"]').first()
  await expect(status, '물어보기 전에는 조용해야 한다').toHaveText('')

  /* FAQ 버튼은 본문에 있다. 사이드바를 열면 안 된다 — 좁은 화면에서는 그게 본문을
     덮는 대화상자라서(결함 4를 고친 결과) 뒤에 있는 버튼을 가린다 */
  await page.getByRole('button', { name: /금형 교체 주기/ }).first().click()
  await expect(status).toHaveText(/답변이 도착했습니다/, { timeout: 15_000 })
})
