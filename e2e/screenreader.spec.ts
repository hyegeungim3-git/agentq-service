import { test, expect } from '@playwright/test'
import { enterDomain, openSidebar, openTab } from './shell'

/**
 * 화면 낭독기가 **실제로 받는 것**을 본다.
 *
 * ⚠️ 이건 NVDA·VoiceOver를 돌린 게 아니다. 낭독기가 읽는 재료인
 * **접근성 트리**를 그대로 꺼내 본 것이다. 실제 낭독 억양·순서·중복 발화는
 * 사람이 들어 봐야 안다 — 여기서 통과했다고 "낭독기로 확인했다"고 말하면 안 된다.
 *
 * 그래도 자동으로 잡을 수 있는 것이 있다.
 *  ① 화면에 무엇이 있는지 훑을 수 있는가 (랜드마크·제목)
 *  ② 이름이 **읽어서 뜻이 통하는가** (같은 이름이 여러 개면 못 고른다)
 *  ③ 결과가 나온 것을 **말해 주는가** (라이브 리전)
 *  ④ 진행 중임을 말해 주는가
 */

type Node = { role: string; name: string }

/**
 * 접근성 트리를 그대로 꺼낸다.
 *
 * Playwright의 `ariaSnapshot()`은 크로미움이 계산한 **역할과 이름**을 YAML로 준다 —
 * 낭독기가 받는 것과 같은 재료다. (예전 `page.accessibility.snapshot()`은 없어졌다)
 */
const tree = async (page: import('@playwright/test').Page): Promise<Node[]> => {
  const yaml = await page.locator('body').ariaSnapshot()
  const out: Node[] = []
  for (const line of yaml.split('\n')) {
    const m = /^\s*-\s+([a-z]+)(?:\s+"([^"]*)")?/.exec(line)
    if (m && m[1]) out.push({ role: m[1], name: m[2] ?? '' })
  }
  return out
}

test('낭독기가 화면 구조를 훑을 수 있다 @a11y', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /새빛대학교병원/ }).click()
  await expect(page.getByRole('textbox').first()).toBeVisible()

  const nodes = await tree(page)
  const roles = nodes.map((n) => n.role)

  /* ⚠️ 랜드마크가 있다고 '본문으로 건너뛰기'가 되는 것은 아니다. 이 저장소에는
     skip link가 0건이고, 사이드바 정지점 40여 곳을 Tab으로 다 지나야 본문에 닿는다.
     낭독기 사용자는 D(랜드마크 이동)로 우회하지만 키보드만 쓰는 사람에겐 우회로가 없다.
     여기서 보는 것은 '랜드마크로 본문을 찾을 수 있는가'까지다 —
     건너뛰기 링크 자체는 docs/A11Y-SCREENREADER.md의 알려진 결함 15번이다 */
  expect(roles, '본문 랜드마크가 없으면 낭독기가 본문을 못 찾는다').toContain('main')
  expect(roles.filter((r) => r === 'main'), '본문이 둘이면 어느 쪽이 본문인지 알 수 없다').toHaveLength(1)
  /* 좁은 화면에서는 사이드바가 접혀 있어 탐색이 트리에 없다 — 대신 여는 버튼이
     이름을 갖고 있어야 낭독기 사용자가 거기 탐색이 있다는 것을 안다 */
  const hasNav = roles.includes('navigation')
  const opener = nodes.some((n) => n.role === 'button' && /사이드바/.test(n.name))
  expect(hasNav || opener, '탐색도 없고 여는 버튼도 없으면 메뉴에 닿을 길이 없다').toBe(true)

  /* 제목이 하나는 있어야 '이 화면이 무엇인가'를 알 수 있다 */
  expect(nodes.some((n) => n.role === 'heading' && n.name.length > 0)).toBe(true)
})

test('같은 이름의 조작 요소가 겹치지 않는다 @a11y', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /새빛대학교병원/ }).click()
  await openTab(page, /^에이전트/)
  await expect(page.getByRole('button', { name: '문서 요약', exact: true })).toBeVisible()

  const nodes = await tree(page)
  const buttons = nodes.filter((n) => n.role === 'button' && n.name.trim())
  const seen = new Map<string, number>()
  for (const b of buttons) {
    const k = b.name.trim()
    seen.set(k, (seen.get(k) ?? 0) + 1)
  }
  /* 같은 이름이 둘 이상이면 낭독기 사용자는 "버튼, 시작하기"를 열세 번 듣고도
     어느 것이 무엇인지 모른다 */
  const dup = [...seen.entries()].filter(([, n]) => n > 1).map(([k, n]) => `${k} ×${n}`)
  expect(dup, '이름이 같은 버튼이 여럿이면 골라 누를 수 없다').toEqual([])
})

test('결과가 나오면 낭독기에 알린다 @a11y', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /새빛대학교병원/ }).click()
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: '문서 요약', exact: true }).click()

  /* 실행 전에는 진행 상태를 알리는 자리가 없다 */
  const liveBefore = await page.locator('[aria-live], [role=status], [role=alert]').count()

  await page.getByRole('button', { name: /요약/ }).last().click()

  /* 진행 중임을 말한다 — 화면만 보고 있지 않은 사람에게는 이게 유일한 신호다 */
  await expect(page.locator('[role=status], [aria-live=polite]').first()).toBeVisible({
    timeout: 10_000,
  })

  await expect(page.getByRole('region').first()).toBeVisible({ timeout: 15_000 })

  /* 결과 영역에 이름이 있어야 낭독기가 "무슨 영역"인지 말할 수 있다.
     이름은 `aria-label`일 수도 `aria-labelledby`일 수도 있으므로
     속성이 아니라 **계산된 이름**을 본다 */
  const nodes = await tree(page)
  const regions = nodes.filter((n) => n.role === 'region')
  expect(regions.length, '결과가 영역으로 묶여 있지 않다').toBeGreaterThan(0)
  const unnamed = regions.filter((r) => !r.name.trim()).length
  expect(unnamed, '이름 없는 region은 "영역"이라고만 읽힌다').toBe(0)

  /* 실행 전에도 라이브 리전 자리는 있어야 한다 — 없으면 늦게 만들어져 첫 알림을 놓친다 */
  expect(liveBefore).toBeGreaterThan(0)
})

/**
 * 화면이 바뀌면 **낭독기가 알 수 있는가.**
 *
 * 라우터가 없어 주소가 안 바뀌므로, 창 제목·라이브 리전·포커스 셋 중
 * 하나라도 없으면 낭독기 사용자는 화면이 바뀐 것을 모른다.
 */
test('화면이 바뀌면 제목·알림·포커스가 함께 움직인다 @a11y', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('button', { name: /새빛대학교병원/ })).toBeVisible()
  const portalTitle = await page.title()

  await page.getByRole('button', { name: /새빛대학교병원/ }).click()
  await expect(page.getByRole('textbox').first()).toBeVisible()

  /* ① 창 제목이 바뀌고 어느 발주처인지 들어 있다 */
  const chatTitle = await page.title()
  expect(chatTitle).not.toBe(portalTitle)
  expect(chatTitle).toContain('새빛대학교병원')

  /* ② 바뀌었다고 한 번 말한다 */
  await expect(page.locator('#screen-change-announcer')).toHaveText(/화면입니다/)

  /**
   * ③ 포커스가 새 화면의 제목으로 가고 **거기 머무는가.**
   *
   * ⚠️ 이 단언은 한 번 물러 있었다. '지금 활성 요소의 태그가 H1인가'만 봤더니
   * 검사는 통과하는데 **배포본에서는 끝까지 body에 남아 있었다.** 발주처 자료가
   * 늦게 도착하면서 화면이 한 번 더 갈리고, 먼저 포커스를 준 제목 노드가 통째로
   * 교체되기 때문이다. 검사 환경에서는 자료가 먼저 와서 그 갈림이 없었다.
   *
   * 그래서 두 가지를 바꿨다.
   *  - **다 갈린 뒤에** 본다: 발주처 이름이 제목에 들어온 시점이 최종 화면이다
   *  - **머무는지** 본다: 1초 뒤에도 같은 자리인가. 놓았다 뺏기는 것을 잡는 유일한 방법이다
   */
  const settled = async () =>
    page.evaluate(() => {
      const el = document.activeElement
      const h1 = document.querySelector('main h1')
      return {
        tag: el?.tagName ?? '',
        isMainHeading: !!h1 && el === h1,
        tabindex: h1?.getAttribute('tabindex') ?? null,
      }
    })

  await expect
    .poll(async () => (await settled()).isMainHeading, {
      message: '포커스가 본문 제목으로 가지 않으면 가상 커서가 문서 맨 위로 리셋된다',
      timeout: 5000,
    })
    .toBe(true)

  /* 화면이 한 번 더 갈려도 되돌아와야 한다 — 놓았다 뺏기면 결과는 body와 같다 */
  await page.waitForTimeout(1200)
  const after = await settled()
  expect(after.isMainHeading, '포커스를 줬다가 화면이 갈리며 잃으면 고친 것이 아니다').toBe(true)
  expect(after.tabindex, 'tabindex="-1"이 없으면 제목은 포커스를 받을 수 없다').toBe('-1')

  /* 발주처가 다르면 제목도 다르다 — 소리로 구분되는지가 핵심이다 */
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()
  await expect(page.getByRole('textbox').first()).toBeVisible()
  expect(await page.title()).toContain('한빛정밀')
})

/**
 * 화면을 바꾼 버튼이 **사라지지 않는 경우**도 포커스가 따라가는가.
 *
 * 발주처 카드는 눌리는 순간 사라지므로 포커스가 body로 떨어진다. 그런데 사이드바
 * 탭은 남는다 — 포커스가 그 버튼에 그대로 있고, 본문만 통째로 바뀐다. 낭독기로는
 * 아무 일도 안 일어난 것과 구분되지 않는다(대본 흐름 1의 6번이 이 자리다).
 */
test('사이드바로 화면을 바꿔도 포커스가 본문으로 간다 @a11y', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /새빛대학교병원/ }).click()
  await expect(page.getByRole('textbox').first()).toBeVisible()

  await openTab(page, /^에이전트/)
  await expect(page.getByRole('button', { name: '문서 요약', exact: true })).toBeVisible()

  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const h1 = document.querySelector('main h1')
          return !!h1 && document.activeElement === h1
        }),
      { message: '누른 버튼이 남아 있으면 포커스도 거기 남는다 — 본문이 바뀐 것을 알 수 없다', timeout: 5000 },
    )
    .toBe(true)
})

/**
 * 결과가 **도착했다는 것**을 말하는가.
 *
 * 전에는 '작성 중' 리전이 답이 오는 순간 통째로 사라지고 목록에 항목만
 * 추가돼, 낭독기에는 완전한 침묵이었다. 화면에서는 말풍선이 눈에 띈다.
 */
test('챗봇 답변이 도착한 것을 말한다 @a11y', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /새빛대학교병원/ }).click()
  const status = page.locator('p[role="status"]').first()

  /* 자리는 물어보기 전에도 있어야 한다 — 그때 만들면 첫 변화를 놓친다 */
  await expect(status).toHaveCount(1)

  await page.getByRole('button', { name: /사전점검에서 무엇을 보나요/ }).click()
  await expect(status).toHaveText(/답변이 도착했습니다/, { timeout: 15_000 })
  /* 근거가 있는 답인지 없는 답인지가 소리로 갈려야 한다 */
  await expect(status).toHaveText(/근거 \d+건/)
})

/* 릴레이가 끝났다는 것과 남은 확인 지점을 말하는가 */
test('릴레이가 끝난 것을 말한다 @a11y', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /새빛대학교병원/ }).click()
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: /청구 보류 건 회신 처리/ }).click()
  await page.getByRole('button', { name: '릴레이 실행' }).click()

  await expect(page.locator('p[role="status"]').first()).toHaveText(
    /릴레이가 끝났습니다.*확인해야 하는 지점이 \d+건/,
    { timeout: 30_000 },
  )
})

/**
 * 관리 기준을 **넘는 순간**을 말하는가.
 *
 * 값 자체는 `aria-live="off"`가 맞다 — 1초마다 숫자를 읽으면 아무것도 못 한다.
 * 그 탓에 넘는 순간에도 끝까지 조용했다: 화면은 빨개지고 경고가 나타나는데
 * 소리로는 아무 일도 없었다. 문장 자체를 `role="alert"`로 삼아, 상태가
 * 뒤집힐 때만 말하게 했다.
 */
test('라이브 지표가 관리 기준을 넘는 순간을 말한다 @a11y', async ({ page }) => {
  await enterDomain(page)
  const alert = page.getByRole('alert').filter({ hasText: /관리 기준/ })
  await expect(alert).toHaveText(/관리 기준 이내입니다/)

  /* 예시 구간을 빨리 감는다 — 실시간으로 기다리면 검사가 몇 분이 된다.
     라디오 자체는 sr-only라 보이는 라벨을 누른다: 사람이 하는 것과 같은 조작이다 */
  await page.locator('label').filter({ hasText: '60×' }).click()
  await expect(page.getByRole('radio', { name: '60×' })).toBeChecked()
  await expect(alert).toHaveText(/관리 기준 .*를 넘었습니다/, { timeout: 30_000 })

  /* 넘은 뒤에 무엇을 해야 하는지까지 한 문장에 있어야 한다 —
     '넘었습니다'만 들리면 소리로 쓰는 사람은 다음 행동을 알 수 없다 */
  await expect(alert).toHaveText(/보전 진단|정지|확인/)

  /* 넘은 뒤 매초 다시 말하면 못 쓴다. 문장이 그대로 머무는지 본다 */
  const first = await alert.textContent()
  await page.waitForTimeout(3000)
  expect(await alert.textContent()).toBe(first)
})

/**
 * **본문에 몇 번 만에 닿는가.**
 *
 * axe의 `bypass` 규칙은 skip link·랜드마크·제목 중 하나라도 있으면 통과다 —
 * 이 앱에는 `<main>`이 있으므로 건너뛰기가 0건이어도 초록불이었다. 규칙 엔진이
 * '있다'고 말한 게 아니라 '판정을 포기했다'는 뜻이다. 그래서 여기서는 규칙이
 * 아니라 **횟수**를 센다.
 */
for (const where of ['portal', 'admin'] as const) {
  test(`첫 Tab에서 본문으로 건너뛸 수 있다 — ${where} @a11y`, async ({ page }) => {
    await page.goto('./')
    if (where === 'portal') {
      await page.getByRole('button', { name: /한빛정밀/ }).click()
      await expect(page.getByRole('textbox').first()).toBeVisible()
    } else {
      await page.getByRole('button', { name: /관리자 시스템/ }).click()
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }

    /* 화면 전환 훅이 이미 포커스를 본문으로 옮겨 놓았다. 건너뛰기가 필요한 사람은
       **문서 맨 위에서 시작하는 사람**이므로 그 상태로 되돌린다.
       blur()만으로는 안 된다 — 크로미움은 '다음 Tab이 시작할 자리'를 blur 뒤에도
       그대로 들고 있어서 방금 있던 곳부터 이어 간다. body에 포커스를 줘야 자리가 옮겨진다 */
    await page.evaluate(() => {
      document.body.setAttribute('tabindex', '-1')
      document.body.focus()
      document.body.removeAttribute('tabindex')
    })

    /* 첫 정지점이어야 한다 — 사이드바 뒤에 있으면 40번을 눌러야 닿는다 */
    await page.keyboard.press('Tab')
    const first = page.locator(':focus')
    await expect(first).toHaveText(/본문으로 건너뛰기/)

    /* 보이지 않는 채로 눌리면 키보드 사용자는 자기가 어디 있는지 모른다 */
    await expect(first).toBeVisible()

    await page.keyboard.press('Enter')
    const focused = await page.evaluate(() => document.activeElement?.tagName ?? '')
    expect(focused).toBe('MAIN')

    /* 눌렀는데 다음 Tab이 사이드바로 되돌아가면 건너뛴 것이 아니다 */
    await page.keyboard.press('Tab')
    const inMain = await page.evaluate(
      () => !!document.activeElement?.closest('main'),
    )
    expect(inMain).toBe(true)
  })
}

/**
 * 화면 틀을 English로 바꾸면 **한국어 콘텐츠에 표시가 붙는가.**
 *
 * 이 앱은 화면 틀만 번역하고 업무 콘텐츠는 원문 그대로 둔다(strings.ts의 결정).
 * 결정은 옳은데 표시를 안 하면 한국어가 `lang="en"` 아래 놓여, 영어 음성 엔진이
 * 뭉갠 발음을 내거나 통째로 건너뛴다(WCAG 3.1.2).
 *
 * ⚠️ axe는 이걸 못 잡는다 — `lang="en"`은 문법적으로 완벽히 유효한 값이고,
 * 글자가 실제로 무슨 언어인지는 규칙 엔진이 판단하지 않는다. 그래서 여기서는
 * **한글이 들어 있는 요소마다 가장 가까운 lang**을 직접 본다.
 */
test('영어 화면 틀 아래 한국어 콘텐츠에 lang 표시가 있다 @a11y', async ({ page }) => {
  await enterDomain(page)
  await openTab(page, /설정|Settings/)
  await page.locator('label').filter({ hasText: 'English' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')

  /**
   * ⚠️ **훑는 화면을 한 곳으로 두면 안 된다.** 처음에는 English로 바꾼 뒤 곧바로
   * 대화 탭으로 옮겨서 훑었는데, 그 바람에 **누수가 확정적으로 있던 환경설정 화면**이
   * 스캔에서 빠졌다(언어 선택의 '한국어'가 `lang={uiLang}` 아래 놓여 있었다).
   * 검사가 결함이 있는 자리를 떠난 뒤에 훑고 있었던 것이다.
   */
  const scan = () =>
    page.evaluate(() => {
      const hangul = /[가-힣]/
      const out: string[] = []
      for (const el of Array.from(document.querySelectorAll('body *'))) {
        /* 자기 자신이 직접 들고 있는 글자만 본다 — 부모까지 세면 전부 걸린다 */
        const own = Array.from(el.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent ?? '')
          .join('')
        if (!hangul.test(own)) continue
        const near = el.closest('[lang]')?.getAttribute('lang') ?? ''
        if (near !== 'ko') out.push(`${near || '(없음)'} · ${own.trim().slice(0, 24)}`)
      }
      return out
    })

  /* ① 지금 있는 환경설정 화면부터 — 여기가 결함이 있던 자리다 */
  expect(await scan(), '환경설정: 한국어인데 영어로 표시된 자리').toEqual([])

  /* ② 사용자 포털의 나머지 탭도 같은 눈으로 본다.
     못 찾은 탭은 **조용히 넘기지 않는다** — 이름이 바뀌어 안 눌리면 검사가 아무것도
     안 훑고도 초록불이 된다. 실제로 이 저장소에서 그 실수를 한 번 했다 */
  const nav = await openSidebar(page, { nav: 'Work area', open: 'Open sidebar' })
  const missed: string[] = []
  let visited = 0
  for (const tab of ['Chat', 'Agents', 'Security', 'Notices', 'Guide']) {
    /* 이름 앞부분으로 찾는다 — 공지 탭은 안 읽은 건수가 이름에 붙어 exact가 안 맞는다 */
    const button = nav.getByRole('button', { name: new RegExp(`^${tab}`) })
    if ((await button.count()) === 0) {
      missed.push(tab)
      continue
    }
    await button.click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await scan(), `${tab}: 한국어인데 영어로 표시된 자리`).toEqual([])
    visited += 1
    await openSidebar(page, { nav: 'Work area', open: 'Open sidebar' })
  }
  expect(missed, '못 연 탭이 있으면 그만큼 안 훑은 것이다').toEqual([])
  expect(visited, '한 탭도 못 열었으면 이 검사는 아무것도 보지 않았다').toBe(5)

  /* ③ 관리자는 아예 번역 대상이 아니다 — 통째로 한국어라고 말해야 한다 */
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(await scan(), '관리자: 한국어인데 영어로 표시된 자리').toEqual([])
})

/**
 * 좁은 화면에서 덮어 여는 패널이 **진짜 대화상자인가.**
 *
 * ⚠️ axe의 대화상자 규칙은 `role="dialog"`가 **있을 때만** 돈다 — 역할을 안 붙이면
 * 검사 대상 자체가 아니다. 틀린 dialog는 잡히지만 dialog가 아닌 dialog는 안 잡힌다.
 * 그래서 여기서는 규칙이 아니라 **동작**을 본다.
 */
test.describe('덮어 여는 패널은 대화상자다 @a11y', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  type Page = import('@playwright/test').Page

  /* 여는 버튼을 돌려준다 — 닫은 뒤 **그 버튼으로** 포커스가 돌아왔는지 봐야 한다.
     아이콘 버튼이라 글자가 없으므로 '무언가에 포커스가 있다'로는 판정할 수 없다 */
  const CASES: [string, (page: Page) => Promise<ReturnType<Page['getByRole']>>][] = [
    [
      '사이드바',
      async (page) => {
        await enterDomain(page)
        const opener = page.getByRole('button', { name: '사이드바 열기' })
        await opener.click()
        return opener
      },
    ],
    [
      '답변 근거',
      async (page) => {
        await enterDomain(page)
        const opener = page.getByRole('button', { name: '답변 근거', exact: true })
        await opener.click()
        return opener
      },
    ],
  ]

  for (const [what, open] of CASES) {
    test(`${what} @a11y`, async ({ page }) => {
      const opener = await open(page)

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()

      /* ① 포커스가 패널 안으로 들어간다 — 밖에 남으면 낭독기는 뒤 화면을 읽는다 */
      expect(
        await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')),
        '포커스가 밖에 남으면 스와이프가 뒤 화면부터 읽는다',
      ).toBe(true)

      /* ② 뒤 화면은 없는 것으로 친다 */
      expect(
        await page.evaluate(() => document.querySelectorAll('[inert]').length),
        '뒤 화면이 살아 있으면 화면에 보이지도 않는 것이 읽힌다',
      ).toBeGreaterThan(0)

      /* ③ Tab을 돌려도 밖으로 안 나간다 */
      for (let i = 0; i < 25; i += 1) await page.keyboard.press('Tab')
      expect(
        await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')),
        'Tab이 패널 밖으로 새면 뒤 화면 버튼을 누르게 된다',
      ).toBe(true)

      /* ④ Esc로 닫히고 ⑤ 연 사람에게 포커스가 돌아온다 */
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(opener, '닫은 뒤 포커스가 사라지면 이어 읽기가 문서 맨 위로 리셋된다').toBeFocused()
    })
  }
})
