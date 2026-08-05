import { test, expect } from '@playwright/test'
import { openTab } from './shell'

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

  /* 본문·탐색이 있어야 '본문으로 건너뛰기'가 성립한다 */
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
