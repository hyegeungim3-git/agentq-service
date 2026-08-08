import { test, expect } from '@playwright/test'
import { enterDomain, openSidebar } from './shell'

/**
 * 사이드바가 세로로 모자랄 때.
 *
 * 2026-08-08에 '현장' 묶음을 더하면서 사이드바가 길어졌고, 세로가 모자라자
 * 아래 묶음이 **대화 목록 위로 넘쳐** 목록 버튼이 눌리지 않았다.
 * 로컬에서는 통과하고 CI(리눅스)에서만 깨졌다 — 글꼴이 달라 높이가 달랐기 때문이다.
 *
 * 글꼴에 기대지 않으려면 **일부러 낮은 창**에서 봐야 한다. 여기서는 클릭이
 * 실제로 닿는지까지 확인한다 — 보이는 것과 눌리는 것은 다르다.
 */
test('세로가 모자라도 대화 목록이 덮이지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 560 })
  await enterDomain(page)

  await page.getByLabel('질문 입력').fill('금형 교체 주기가 어떻게 되나요?')
  await page.getByRole('button', { name: '전송' }).click()
  await expect(page.getByText(/타수 50만 타/)).toBeVisible({ timeout: 10_000 })

  const nav = await openSidebar(page)
  /* 목록 항목과 그 아래 '이 대화 삭제'가 같은 이름을 갖는 구조라 첫 번째를 집는다 */
  const item = nav.getByRole('button', { name: '금형 교체 주기가 어떻게 되나요?' }).first()
  await expect(item).toBeVisible()

  /* 덮여 있으면 여기서 시간 초과가 난다 — 그것이 이 검사가 잡는 것이다 */
  await item.click({ timeout: 5_000 })
})
