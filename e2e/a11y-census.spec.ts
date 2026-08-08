import { test, expect, type Page } from '@playwright/test'
import { adminNav, enterDomain, openTab, walkAdminScreens } from './shell'

/** 첫 화면이 두 단계가 됐다(D-014) — 스위처로 고르고 카드로 들어간다 */
async function enterPicked(page: import('@playwright/test').Page, org: string) {
  await page
    .getByRole('navigation', { name: '발주처 선택' })
    .getByRole('button', { name: org, exact: true })
    .click()
  await page.getByRole('button', { name: /사용자 포털 입장/ }).click()
}

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
      /* 첫 화면이 두 단계가 됐다(D-014) — 스위처로 고르고 카드로 들어간다 */
      const pill = page
        .getByRole('navigation', { name: '발주처 선택' })
        .getByRole('button', { name: org, exact: true })
      if ((await pill.count()) === 0 || (await pill.isDisabled())) {
        missed.push(org)
        continue
      }
      await pill.click()
      await page.getByRole('button', { name: /사용자 포털 입장/ }).click()
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
      await enterPicked(page, org)
      await expect(page.getByRole('textbox').first()).toBeVisible()

      /* `liveMetric`은 팩의 **필수 항목**이다(`DomainPackData`). 그러니 안 보이면
         건너뛸 일이 아니라 결함이다 — '없으면 넘어간다'로 두면 카드가 통째로 사라져도
         초록불이 된다 */
      /* 카드는 업무 데이터(팩)가 도착한 뒤에 뜬다 — 고를 때 받기 때문이다.
         기다리지 않고 세면 첫 발주처만 잡힌다 */
      const speed = page.locator('label').filter({ hasText: '60×' })
      await expect(speed).toBeVisible({ timeout: 10_000 })
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

/**
 * **관리자 56화면 전수.**
 *
 * 그동안 관리자를 훑던 것은 axe 검사 하나였고, 거기서 여는 화면은 **다섯 개**였다
 * (관리 홈 + 메뉴 4개). 나머지 50여 화면은 표도 스크롤 상자도 검사된 적이 없다 —
 * 사용자 포털에서 잡힌 결함(행 머리글·이름 없는 정지점)이 관리자에 그대로 남아 있어도
 * 알 방법이 없었다.
 *
 * 여기서는 화면마다 **소리로 쓸 수 있는지**의 최소 조건만 본다. 규칙 엔진(axe)이 아니라
 * 이 저장소가 실제로 밟은 결함들이다.
 *  ① 제목이 하나 있는가 — 없으면 '여기가 어디'인지 알 수 없다
 *  ② Tab이 멈추는데 이름이 없는 자리가 있는가
 *  ③ 표의 행 머리글이 빠진 행이 있는가
 *
 * 느리다(56화면). 그래도 화면 다섯 개만 보고 '관리자도 됐다'고 적는 것보다 낫다.
 */
test('관리자 화면 전수 — 제목·정지점 이름·행 머리글 @a11y', async ({ page }) => {
  test.setTimeout(180_000)

  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()

  const noHeading: string[] = []
  const unnamedStops: string[] = []
  const rowsWithoutHeader: string[] = []

  const { visited, unreachable } = await walkAdminScreens(page, async (label) => {
    const found = await page.evaluate(() => {
      const main = document.querySelector('main')
      if (!main) return { heading: 0, stops: 0, rows: 0 }

      /* Tab이 멈추는데 이름이 없는 자리 */
      const stops = Array.from(main.querySelectorAll('[tabindex="0"]')).filter(
        (el) => !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'),
      ).length

      /* 행 머리글이 없는 행 — 헤더 전용 행(모두 th)은 제외한다 */
      let rows = 0
      for (const tbody of Array.from(main.querySelectorAll('tbody'))) {
        for (const tr of Array.from(tbody.querySelectorAll('tr'))) {
          if (tr.querySelector('td') && !tr.querySelector('th[scope="row"]')) rows += 1
        }
      }

      return { heading: main.querySelectorAll('h1').length, stops, rows }
    })

    if (found.heading === 0) noHeading.push(label)
    if (found.stops > 0) unnamedStops.push(`${label} (${found.stops})`)
    if (found.rows > 0) rowsWithoutHeader.push(`${label} (${found.rows})`)
  })

  expect(unreachable, '눌러 볼 수 없어 검사하지 못한 메뉴 — 안 본 화면을 통과로 세면 안 된다').toEqual([])
  expect(visited.length, '관리자 화면을 다섯 개만 보고 전수라고 할 수 없다').toBeGreaterThan(40)
  expect(noHeading, '제목이 없는 화면 — 여기가 어디인지 알 수 없다').toEqual([])
  expect(unnamedStops, 'Tab이 멈추는데 이름이 없는 자리').toEqual([])
  expect(rowsWithoutHeader, '행 머리글이 없는 행 — 어느 줄의 값인지 안 붙는다').toEqual([])
})

/**
 * **관리자 코드를 정말 나중에 받는가.**
 *
 * 파일이 나뉘어 있다고 첫 화면이 안 받는 것은 아니다 — 어디선가 정적으로 import하면
 * 나뉜 채로 같이 딸려 온다. 그래서 파일 크기가 아니라 **실제로 받은 요청**을 본다.
 * (`npm run budget`은 크기를, 이 검사는 시점을 본다. 둘은 다른 것을 지킨다)
 */
test('관리자 코드는 관리자에 들어갈 때 받는다', async ({ page }) => {
  /* 개발 서버는 모듈을 그대로 주고(`src/AdminApp.tsx`), 빌드본은 해시 청크로 준다
     (`assets/AdminApp-xxxx.js`). 검사는 둘 다에서 돌아야 하므로 이름만 본다 */
  const chunks: string[] = []
  page.on('request', (r) => {
    const m = /\/(AdminApp|AgentApp)[.-]/.exec(new URL(r.url()).pathname)
    if (m?.[1]) chunks.push(m[1])
  })

  await page.goto('./')
  await expect(page.getByRole('button', { name: /관리자 시스템/ })).toBeVisible()
  expect(chunks, '분야 선택 화면이 관리자·에이전트 코드까지 받고 있다').toEqual([])

  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()
  expect(chunks, '관리자에 들어갔는데 관리자 코드를 안 받았다면 첫 청크에 이미 있던 것이다').toContain(
    'AdminApp',
  )
  expect(chunks, '관리자에 들어갔을 뿐인데 에이전트 코드까지 받았다').not.toContain('AgentApp')
})

/**
 * **관리자 안에서도 섹션을 고를 때 받는가.**
 *
 * 관리자를 통째로 나눠 놓아도 들어가는 순간 44화면을 다 받으면 같은 문제의 축소판이다.
 * 시스템 현황만 보는 사람에게 MLOps·에이전트 정의까지 딸려 오면 안 된다.
 */
test('관리자 섹션은 그 섹션을 열 때 받는다', async ({ page }) => {
  const got: string[] = []
  page.on('request', (r) => {
    const m = /\/(dashboard|ops|ai|infra|knowledge)[.-]/.exec(new URL(r.url()).pathname)
    if (m?.[1]) got.push(m[1])
  })

  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()

  /* 첫 화면(시스템 현황)은 대시보드 섹션이다 */
  expect(got, '들어간 섹션을 안 받았다면 이미 한 덩어리로 들어 있던 것이다').toContain('dashboard')
  expect(got, '대시보드만 열었는데 운영·관리 섹션까지 받았다').not.toContain('ops')

  /* 다른 섹션으로 옮기면 그때 받는다 */
  const nav = await adminNav(page)
  await nav.getByRole('button', { name: '사용자 관리' }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(got, '섹션을 옮겼는데 그 코드를 안 받았다').toContain('ops')
})

/**
 * **한 발주처를 골랐는데 다른 발주처 데이터까지 받는가.**
 *
 * 이 제품의 핵심은 발주처를 갈아 끼우는 것이다. 그런데 넷의 업무 데이터가 첫 화면에
 * 통째로 실려 있었다(gzip 90KB, 첫 화면의 46%). 크기 문제이기 전에 **테넌시 문제**다 —
 * 공공기관 담당자의 브라우저에 병원 데이터가 통째로 내려가 있었다는 뜻이다.
 *
 * 그래서 크기가 아니라 **무엇을 받았는지**를 본다.
 */
test('고른 발주처의 업무 데이터만 받는다', async ({ page }) => {
  const packs: string[] = []
  page.on('request', (r) => {
    const m = /\/(manufacturing|public|civic|medical)[.-]/.exec(new URL(r.url()).pathname)
    if (m?.[1]) packs.push(m[1])
  })

  await page.goto('./')
  await expect(page.getByRole('button', { name: /한빛정밀/ })).toBeVisible()
  expect(packs, '분야를 고르기도 전에 업무 데이터를 받고 있다').toEqual([])

  await page.getByRole('button', { name: /사용자 포털 입장/ }).click()
  await expect(page.getByRole('textbox').first()).toBeVisible()
  await expect(page.locator('label').filter({ hasText: '60×' })).toBeVisible({ timeout: 10_000 })

  expect(packs, '고른 발주처의 데이터를 안 받았다면 첫 청크에 이미 있던 것이다').toContain(
    'manufacturing',
  )
  const others = packs.filter((p) => p !== 'manufacturing')
  expect(others, '고르지 않은 발주처의 업무 데이터까지 받았다').toEqual([])
})
