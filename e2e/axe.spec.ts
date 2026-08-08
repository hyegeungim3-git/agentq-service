import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { openTab, adminNav } from './shell'

/** 첫 화면이 두 단계가 됐다(D-014) — 스위처로 고르고 카드로 들어간다 */
async function enterPicked(page: import('@playwright/test').Page, org: string) {
  await page
    .getByRole('navigation', { name: '발주처 선택' })
    .getByRole('button', { name: org, exact: true })
    .click()
  await page.getByRole('button', { name: /사용자 포털 입장/ }).click()
}

/**
 * 규칙 엔진(axe) 검사.
 *
 * 직접 만든 훑기(`a11y-scan.spec.ts`)는 **내가 고른 항목만** 본다.
 * 여기는 반대로 규칙 엔진이 아는 것을 다 본다 — 내가 생각 못 한 것을 잡으라고 둔다.
 * 둘 다 남긴다: 직접 만든 쪽이 우리 화면의 규칙(발주처 전환·다크 팔레트)을 알고,
 * 엔진 쪽이 일반 규칙을 안다.
 *
 * ⚠️ **새 화면을 만들면 여기 목록에도 추가해야 한다.** 안 그러면 안 본 화면이
 * 통과한 화면처럼 보인다.
 *
 * ⚠️ 이 검사가 실제로 훑는 것은 포털·대화·허브·에이전트 5종·보안·관리 홈·
 * 관리자 메뉴 4개다. **관리자 화면은 44종, 에이전트는 13종이므로 전수가 아니다.**
 * '접근성 통과'라고 읽지 말 것 — '여기 적힌 화면에서 규칙 위반이 없다'는 뜻이다.
 */

const RULES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

type Violation = { id: string; impact?: string | undefined; nodes: number; where: string; help: string }

/**
 * ⚠️ **전환이 끝난 뒤에 재야 한다.** 탭 전환 애니메이션 중간값이 명암비 위반으로
 * 잡혀 없는 결함을 두 건 만들어 냈다(흰 글자 대 브랜드 색 4.43:1 → 실제 5.70:1).
 * 직접 만든 훑기에서 이미 밟은 함정을 엔진 쪽에서 한 번 더 밟았다.
 */
const freeze = (page: import('@playwright/test').Page) =>
  page.addStyleTag({
    content: '*,*::before,*::after{transition:none !important;animation:none !important}',
  })

const scan = async (page: import('@playwright/test').Page, where: string): Promise<Violation[]> => {
  await freeze(page)
  const res = await new AxeBuilder({ page }).withTags(RULES).analyze()
  return res.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? undefined,
    nodes: v.nodes.length,
    where,
    help: `${v.help} · ${v.nodes[0]?.target.join(' ') ?? ''}`,
  }))
}

test('규칙 엔진이 아는 위반이 없다 — 사용자 포털 @a11y', async ({ page }) => {
  const all: Violation[] = []

  await page.goto('./')
  await expect(
    page.getByRole('navigation', { name: '발주처 선택' }).getByRole('button', { name: '새빛대학교병원', exact: true }),
  ).toBeVisible()
  all.push(...(await scan(page, '포털')))

  await enterPicked(page, '새빛대학교병원')
  await expect(page.getByRole('textbox').first()).toBeVisible()
  all.push(...(await scan(page, '대화')))

  await openTab(page, /^에이전트/)
  await expect(page.getByRole('main').getByRole('button', { name: '문서 요약', exact: true })).toBeVisible()
  all.push(...(await scan(page, '허브')))

  for (const agent of ['문서 요약', '기준정보 표준화', '문서 번역', '데이터 분석', '안전관리계획 수립']) {
    await page.getByRole('button', { name: agent, exact: true }).click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    all.push(...(await scan(page, agent)))
    await openTab(page, /^에이전트/)
  }

  await openTab(page, /^보안/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  all.push(...(await scan(page, '보안')))

  console.log(JSON.stringify(all, null, 1))
  expect(all).toEqual([])
})

test('규칙 엔진이 아는 위반이 없다 — 관리자 @a11y', async ({ page }) => {
  const all: Violation[] = []

  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()

  /* 좁은 화면에서는 메뉴가 오버레이라 **한 번 고르면 닫힌다.** 매번 다시 연다 —
     처음엔 한 번만 열고 넷을 돌렸더니 모바일에서 셋을 조용히 건너뛰고 있었다.
     여는 절차 자체는 `shell.ts`에 한 곳만 둔다(코드를 나눈 뒤 기다림이 필요해졌는데,
     복사본이 셋이라 한 곳만 고치면 나머지가 조용히 깨진다) */
  const openNav = () => adminNav(page)

  await openNav()
  all.push(...(await scan(page, '관리 홈')))

  /* ⚠️ 못 찾은 메뉴를 `continue`로 넘기면 **안 본 화면이 통과한 화면처럼 보인다.**
     이 저장소가 이름 검사에서 이미 밟은 함정이라, 못 찾은 것을 모아 함께 실패시킨다 */
  const unreachable: string[] = []
  /* '시나리오 빌더'는 '에이전트'의 하위 메뉴라 부모를 연 직후에만 보인다.
     다른 그룹을 먼저 열면 접혀서 사라진다 — 순서가 곧 도달 가능성이다.
     (처음엔 맨 뒤에 뒀다가 위 검사에 걸렸다. 그 전까지는 조용히 건너뛰고 있었다) */
  for (const menu of ['에이전트', '시나리오 빌더', '지식 관리', '도구 · 배포']) {
    const nav = await openNav()
    const b = nav.getByRole('button', { name: menu })
    if (!(await b.count())) {
      unreachable.push(menu)
      continue
    }
    await b.first().click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    all.push(...(await scan(page, `관리자 · ${menu}`)))
  }

  console.log(JSON.stringify(all, null, 1))
  expect(unreachable, '메뉴를 못 찾아 안 본 화면 — 통과로 세면 안 된다').toEqual([])
  expect(all).toEqual([])
})

/* 팔레트를 뒤집으면 대비만 바뀌는 게 아니다 — 엔진에게 한 번 더 물어본다 */
test('다크 스킨도 규칙 엔진을 통과한다 @a11y', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  await expect(
    page.getByRole('navigation', { name: '발주처 선택' }).getByRole('button', { name: '새빛대학교병원', exact: true }),
  ).toBeVisible()
  const portal = await scan(page, '포털(다크)')

  await enterPicked(page, '새빛대학교병원')
  await expect(page.getByRole('textbox').first()).toBeVisible()
  const chat = await scan(page, '대화(다크)')

  const all = [...portal, ...chat]
  console.log(JSON.stringify(all, null, 1))
  expect(all).toEqual([])
})
