import { expect, type Page } from '@playwright/test'

/**
 * 셸 조작 헬퍼.
 *
 * 분야를 고르면 '일반' 탭(챗봇)이 먼저 열린다. 에이전트를 열려면 탭을 옮겨야 한다.
 * 모바일에서는 사이드바가 오버레이라 먼저 열어야 하는데, 그 분기를 테스트마다
 * 복사하면 20곳이 된다. 여기 한 곳에 둔다.
 */
export function sidebar(page: Page) {
  return page.getByRole('navigation', { name: '작업 영역' })
}

/**
 * 사이드바를 쓸 수 있는 상태로 만든다 — 좁은 화면이면 연다.
 *
 * 화면 틀 언어를 바꾸면 여는 버튼과 사이드바 이름도 함께 바뀐다.
 * 그래서 이름을 받는다 — 기본값은 한국어다.
 */
export async function openSidebar(page: Page, names = { nav: '작업 영역', open: '사이드바 열기' }) {
  const nav = page.getByRole('navigation', { name: names.nav })
  if (!(await nav.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: names.open }).click()
    await expect(nav).toBeVisible()
  }
  return nav
}

export async function openTab(page: Page, name: RegExp) {
  const nav = await openSidebar(page)
  await nav.getByRole('button', { name }).click()
}

/**
 * 포털에서 발주처 안으로 들어간다.
 *
 * 첫 화면은 두 단계다(D-014) — 위쪽 스위처에서 **발주처를 고르고**, 카드에서
 * **역할을 고른다**. 한 번에 되던 것이 두 번이 됐으므로 여기 한 곳에서만 안다.
 */
export async function enterDomain(page: Page, org = '한빛정밀') {
  await page.goto('./')
  const nav = page.getByRole('navigation', { name: '발주처 선택' })
  await nav.getByRole('button', { name: org, exact: true }).click()
  await page.getByRole('button', { name: /사용자 포털 입장/ }).click()
}

/** 분야 선택 → 에이전트 탭 → 해당 에이전트 */
export async function openAgent(page: Page, name: RegExp) {
  await enterDomain(page)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name }).click()
}

/* ─── 관리자 메뉴 전수 순회 ────────────────────────────────────────────────
   메뉴가 56개고 하위 메뉴는 부모를 눌러야 드러난다. 이 순회를 검사마다 다시 쓰면
   갈라지고, 갈라진 쪽이 **조용히 덜 도는** 것을 아무도 모른다(이 저장소가 이미
   그 실수를 했다 — 하위 메뉴 대부분이 검사되지 않고 있었다). 한 곳에 둔다. */

export async function adminNav(page: Page) {
  const nav = page.getByRole('navigation', { name: '관리자 메뉴' })
  const opener = page.getByRole('button', { name: '메뉴 열기' })
  /* 관리자 코드는 **따로 내려받는다.** 받는 동안에는 메뉴도 여는 버튼도 아직 없다 —
     기다리지 않고 누르면 그냥 시간이 다 간다(코드를 나눈 직후 검사 둘이 그렇게 깨졌다).
     둘 중 하나가 보이면 도착한 것이다 */
  await expect(nav.or(opener).first()).toBeVisible()
  if (!(await nav.isVisible().catch(() => false))) {
    await opener.click()
    await expect(nav).toBeVisible()
  }
  return nav
}

const cleanLabel = (t: string): string => t.replace('준비 중', '').trim()
/** 메뉴가 아니라 나가는 길 — 화면이 아니므로 순회 대상이 아니다 */
const NOT_A_SCREEN = ['사용자 포털로', '포털 선택으로']

/** 상위를 모두 눌러 하위까지 드러낸 뒤, 화면 라벨 전체를 모은다 */
export async function adminScreenLabels(page: Page): Promise<{ tops: string[]; labels: string[] }> {
  const nav = await adminNav(page)
  const tops = (await nav.getByRole('button').allInnerTexts())
    .map(cleanLabel)
    .filter((t) => t !== '' && !NOT_A_SCREEN.includes(t))

  const labels = new Set(tops)
  for (const t of tops) {
    const n = await adminNav(page)
    await n.getByRole('button', { name: t, exact: true }).first().click()
    /* 좁은 화면에서는 누르면 사이드바가 닫힌다. 닫힌 요소의 innerText는 빈 문자열이라
       그대로 읽으면 하위 라벨을 하나도 못 모은다 — 다시 열고 읽는다 */
    const reopened = await adminNav(page)
    for (const l of await reopened.getByRole('button').allInnerTexts()) {
      const c = cleanLabel(l)
      if (c !== '' && !NOT_A_SCREEN.includes(c)) labels.add(c)
    }
  }
  return { tops, labels: [...labels] }
}

/**
 * 관리자 화면을 **전부** 열고 화면마다 `visit`을 부른다.
 *
 * 못 연 메뉴는 `unreachable`로 돌려준다 — 부르는 쪽이 그것을 반드시 단언해야 한다.
 * 조용히 넘기면 안 본 화면이 통과한 화면처럼 보인다.
 */
export async function walkAdminScreens(
  page: Page,
  visit: (label: string) => Promise<void>,
): Promise<{ visited: string[]; unreachable: string[] }> {
  const { tops, labels } = await adminScreenLabels(page)
  const visited: string[] = []
  const unreachable: string[] = []

  for (const label of labels) {
    let n = await adminNav(page)
    /* 하위 메뉴는 부모가 열려 있을 때만 보인다 — 안 보이면 부모를 하나씩 열어 본다 */
    if ((await n.getByRole('button', { name: label, exact: true }).count()) === 0) {
      for (const t of tops) {
        n = await adminNav(page)
        await n.getByRole('button', { name: t, exact: true }).first().click()
        n = await adminNav(page)
        if ((await n.getByRole('button', { name: label, exact: true }).count()) > 0) break
      }
    }
    const btn = (await adminNav(page)).getByRole('button', { name: label, exact: true }).first()
    if ((await btn.count()) === 0) {
      unreachable.push(label)
      continue
    }
    await btn.click()
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await visit(label)
    visited.push(label)
  }

  return { visited, unreachable }
}
