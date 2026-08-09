import { test, expect } from '@playwright/test'
import { enterDomain } from './shell'

/**
 * 모션 줄이기 설정을 존중하는가, 그리고 **스스로 움직이는 것을 멈출 수 있는가.**
 *
 * 재 보니 `prefers-reduced-motion: reduce`를 켜도 로딩 자리의 맥박과 색 전환이
 * 그대로 돌았고, 라이브 지표는 멈출 방법이 없었다. 규칙 엔진은 둘 다 못 잡는다.
 *
 * ⚠️ **지속시간으로 재야 한다.** 처음에는 `animationName`이 있는지로 쟀는데,
 * 이름은 그대로 남고 시간만 0이 되므로 고쳐 놓고도 계속 실패로 나왔다.
 */

const moving = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const out: string[] = []
    const ms = (v: string) =>
      v.split(',').map((x) => (x.includes('ms') ? parseFloat(x) : parseFloat(x) * 1000))
    for (const el of Array.from(document.querySelectorAll('*'))) {
      const s = getComputedStyle(el)
      if (s.animationName !== 'none' && ms(s.animationDuration).some((d) => d > 50))
        out.push(`${s.animationName} ${s.animationDuration}`)
      if (s.transitionProperty !== 'none' && ms(s.transitionDuration).some((d) => d > 50))
        out.push(`transition ${s.transitionDuration}`)
    }
    return [...new Set(out)]
  })

test('모션 줄이기를 켜면 애니메이션이 멈춘다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await enterDomain(page)
  expect(await moving(page), '모션을 줄여 달라고 했는데 계속 움직인다').toEqual([])
})

/* 끄면 원래대로 — 규칙이 늘 켜져 있으면 그건 그냥 애니메이션을 없앤 것이다 */
test('설정을 안 켜면 애니메이션은 그대로다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await enterDomain(page)
  expect((await moving(page)).length, '평소에는 움직여야 한다').toBeGreaterThan(0)
})

test('라이브 지표는 멈출 수 있고 멈추면 값이 안 변한다', async ({ page }) => {
  await enterDomain(page)

  const value = page.getByRole('button', { name: '멈춤' })
  await expect(value).toBeVisible()

  /* 1배속은 2초 동안 소수 둘째 자리가 안 바뀔 만큼 느리다 — 빠르게 돌려 놓고 잰다 */
  /* 라디오는 sr-only라 라벨을 눌러야 한다 — 입력을 직접 누르면 라벨이 가로챈다 */
  await page.getByText('60×', { exact: true }).click()

  /* 멈추기 전에 실제로 움직이는지부터 — 안 움직이면 이 검사는 아무것도 안 본다 */
  /* 값은 <output> — 역할은 status지만 화면에 다른 status도 있어 자리로 집는다 */
  const read = () => page.locator('output').first().innerText()
  const a = await read()
  await page.waitForTimeout(2500)
  const b = await read()
  expect(b, '멈추기 전에는 값이 변해야 한다').not.toBe(a)

  await value.click()
  await expect(page.getByRole('button', { name: '이어서 보기' })).toBeVisible()
  const c = await read()
  await page.waitForTimeout(2500)
  expect(await read(), '멈췄는데 값이 계속 변한다').toBe(c)
})
