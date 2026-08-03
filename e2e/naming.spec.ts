import { test, expect, type Page } from '@playwright/test'

/**
 * 메뉴 이름과 화면 제목이 같은지 전수로 본다.
 *
 * 같은 것을 두 번 쓰면 갈라진다. 실제로 네 번 갈라졌다 —
 * 접근권한·차단, HR 연계·그룹 관리, 데이터셋, 평가 결과.
 * 매번 다른 테스트가 우연히 잡았으므로, 전수로 보는 검사를 따로 둔다.
 *
 * 그룹 메뉴(하위가 있는 것)는 첫 하위 화면으로 가므로 제목이 다를 수 있다.
 * 그 경우 제목이 **다른 메뉴 라벨과 같으면** 통과로 본다.
 */

async function adminNav(page: Page) {
  const nav = page.getByRole('navigation', { name: '관리자 메뉴' })
  if (!(await nav.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: '메뉴 열기' }).click()
    await expect(nav).toBeVisible()
  }
  return nav
}

const clean = (t: string): string => t.replace('준비 중', '').trim()
const SKIP = ['사용자 포털로', '포털 선택으로']

test('메뉴 이름과 화면 제목이 같다', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()

  const nav = await adminNav(page)
  const tops = (await nav.getByRole('button').allInnerTexts())
    .map(clean)
    .filter((t) => t !== '' && !SKIP.includes(t))

  // 상위를 모두 눌러 하위까지 드러낸 뒤 전체 라벨을 모은다
  const labels = new Set(tops)
  for (const t of tops) {
    const n = await adminNav(page)
    await n.getByRole('button', { name: t, exact: true }).first().click()
    // 좁은 화면에서는 누르면 사이드바가 닫힌다. 닫힌 요소의 innerText는 빈 문자열이라
    // 그대로 읽으면 하위 라벨을 하나도 못 모은다 — 다시 열고 읽는다.
    const reopened = await adminNav(page)
    for (const l of await reopened.getByRole('button').allInnerTexts()) {
      const c = clean(l)
      if (c !== '' && !SKIP.includes(c)) labels.add(c)
    }
  }

  const mismatched: string[] = []
  const unreachable: string[] = []
  for (const label of labels) {
    let n = await adminNav(page)
    // 하위 메뉴는 부모가 열려 있을 때만 보인다. 못 찾았다고 그냥 넘어가면
    // **검사가 조용히 통과한다** — 실제로 하위 메뉴 대부분이 검사되지 않고 있었다.
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
    const heading = await page.getByRole('heading', { level: 1 }).first().innerText()
    if (heading !== label && !labels.has(heading)) mismatched.push(`${label} → ${heading}`)
  }

  // 건너뛴 것이 있으면 검사가 통과해도 믿을 수 없다
  expect(unreachable, '눌러 볼 수 없어 검사하지 못한 메뉴가 있습니다').toEqual([])
  expect(mismatched, '메뉴 이름과 화면 제목이 다릅니다').toEqual([])
})
