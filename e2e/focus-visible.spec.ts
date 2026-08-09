import { test, expect } from '@playwright/test'
import { enterDomain } from './shell'

/**
 * 키보드로 도는 사람이 **지금 어디에 서 있는지** 보이는가.
 *
 * 재 보니 없었다. 버튼에 `outline-style: none`이 걸려 있었고, 몇 화면에만
 * `focus-visible:outline-2`를 붙여 뒀는데 그것도 열 곳뿐이었다.
 * 규칙 엔진(axe)은 이걸 못 잡는다 — 포커스가 보이는지는 색을 재 봐야 안다.
 *
 * ⚠️ **`focus()`로 재면 안 된다.** 프로그램 포커스는 `:focus-visible`에 안 걸려
 * 링이 없는 게 정상이고, 그걸 결함으로 읽으면 없는 문제를 고치게 된다.
 * 실제로 탭을 눌러야 한다.
 */

/* locator(':focus-visible')로 잡으면 안 맞을 때마다 5초씩 기다린다 — 12번이면
   검사가 시간 초과로 죽는다. 활성 요소를 바로 읽는다 */
const ring = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const el = document.activeElement
    if (!(el instanceof HTMLElement) || el === document.body) return null
    if (!el.matches(':focus-visible')) return null
    const s = getComputedStyle(el)
    return {
      name: (el.getAttribute('aria-label') ?? el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 24),
      visible: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow.includes('rgb'),
    }
  })

test('탭으로 도는 자리마다 포커스가 보인다 — 사용자 포털', async ({ page }) => {
  await enterDomain(page)

  const bad: string[] = []
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab')
    const r = await ring(page)
    if (r === null) continue
    if (!r.visible) bad.push(r.name)
  }
  expect(bad, '포커스 표시가 없는 자리 — 키보드로는 어디 있는지 알 수 없다').toEqual([])
})

test('탭으로 도는 자리마다 포커스가 보인다 — 관리자', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()

  const bad: string[] = []
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab')
    const r = await ring(page)
    if (r === null) continue
    if (!r.visible) bad.push(r.name)
  }
  expect(bad, '포커스 표시가 없는 자리 — 키보드로는 어디 있는지 알 수 없다').toEqual([])
})
