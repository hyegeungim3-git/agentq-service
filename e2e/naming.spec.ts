import { test, expect } from '@playwright/test'
import { adminScreenLabels, walkAdminScreens } from './shell'

/**
 * 메뉴 이름과 화면 제목이 같은지 전수로 본다.
 *
 * 같은 것을 두 번 쓰면 갈라진다. 실제로 네 번 갈라졌다 —
 * 접근권한·차단, HR 연계·그룹 관리, 데이터셋, 평가 결과.
 * 매번 다른 테스트가 우연히 잡았으므로, 전수로 보는 검사를 따로 둔다.
 *
 * 그룹 메뉴(하위가 있는 것)는 첫 하위 화면으로 가므로 제목이 다를 수 있다.
 * 그 경우 제목이 **다른 메뉴 라벨과 같으면** 통과로 본다.
 *
 * 메뉴를 전부 도는 순회 자체는 `shell.ts`에 있다 — 접근성 전수 검사도 같은 것을
 * 쓴다. 두 곳에 복사해 두면 한쪽이 조용히 덜 도는 것을 아무도 모른다.
 */
/**
 * 56화면을 하나씩 열어 보는 검사라 기본 30초로는 모자라다.
 *
 * 병렬로 돌 때만 넘치기 시작했다 — 혼자 돌리면 통과하고 전체 실행에서만 깨져서
 * 화면이 고장 난 것처럼 보였다. **느린 것과 깨진 것은 다르다.**
 * 도는 화면을 줄여 빠르게 만들면 그때부터는 전수가 아니다.
 */
test.setTimeout(120_000)

test('메뉴 이름과 화면 제목이 같다', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()

  const { labels } = await adminScreenLabels(page)
  const known = new Set(labels)

  const mismatched: string[] = []
  const { visited, unreachable } = await walkAdminScreens(page, async (label) => {
    const heading = await page.getByRole('heading', { level: 1 }).first().innerText()
    if (heading !== label && !known.has(heading)) mismatched.push(`${label} → ${heading}`)
  })

  // 건너뛴 것이 있으면 검사가 통과해도 믿을 수 없다
  expect(unreachable, '눌러 볼 수 없어 검사하지 못한 메뉴가 있습니다').toEqual([])
  expect(visited.length, '메뉴를 거의 못 돌았다면 이 검사는 전수가 아니다').toBeGreaterThan(40)
  expect(mismatched, '메뉴 이름과 화면 제목이 다릅니다').toEqual([])
})
