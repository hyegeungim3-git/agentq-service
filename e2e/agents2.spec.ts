import { test, expect } from '@playwright/test'
import { AGENTS, READY_AGENTS } from '../src/entities/agent/model'

async function openAgent(page: import('@playwright/test').Page, name: RegExp) {
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()
  await page.getByRole('button', { name }).click()
}

test.describe('신규 에이전트 3종 (2차)', () => {
  test('지식 검색 — 유사도 근거를 속성 대조로 보여준다', async ({ page }) => {
    await openAgent(page, /지식 검색/)
    await page.getByRole('searchbox').fill('브래킷 굽힘 금형')
    await page.getByRole('button', { name: /검색 시작/ }).click()
    const r = page.getByRole('region', { name: /HBM-2211/ })
    await expect(r).toBeVisible({ timeout: 10_000 })
    await expect(r).toContainText('확인 필요 · 홀 피치')
  })

  /* 필터에 걸려 빠진 문서를 감추면 '없다'로 읽힌다 */
  test('지식 검색 — 보안 등급으로 빠진 건수를 밝힌다', async ({ page }) => {
    await openAgent(page, /지식 검색/)
    await page.getByRole('searchbox').fill('브래킷 굽힘 금형')
    // 라디오는 sr-only라 사용자와 같은 방식으로 라벨을 누른다
    await page.locator('label').filter({ hasText: /^일반$/ }).click()
    await expect(page.getByRole('radio', { name: '일반', exact: true })).toBeChecked()
    await page.getByRole('button', { name: /검색 시작/ }).click()
    const summary = page.getByRole('region', { name: /검색 결과/ })
    await expect(summary).toContainText('보안 등급 필터로', { timeout: 10_000 })
    await expect(page.getByRole('region', { name: /HBM-2211/ })).toHaveCount(0)
  })

  test('OCR — 못 읽은 줄과 마스킹 기록을 함께 보여준다', async ({ page }) => {
    await openAgent(page, /문서 인식/)
    await page.getByRole('button', { name: '문서 인식' }).click()
    await expect(page.getByRole('region', { name: '인식 결과' })).toContainText('미만인 줄이 2개', {
      timeout: 10_000,
    })
    await expect(page.getByRole('region', { name: '개인정보 마스킹' })).toContainText('010-****-7734')
  })

  test('안전계획 — 1인 작업이면 대책과 권고가 달라진다', async ({ page }) => {
    await openAgent(page, /안전관리계획 수립/)
    await page.getByLabel('작업 인원').selectOption('1')
    await page.getByRole('button', { name: '위험성평가 실시' }).click()
    await expect(page.getByRole('region', { name: /위험요인/ })).toContainText('2인 배치를 권고한다', {
      timeout: 10_000,
    })
  })

  /* 숫자를 하드코딩하면 에이전트를 추가할 때마다 테스트를 고쳐야 한다.
     카탈로그에서 계산해 '화면과 카탈로그가 일치하는가'를 본다. */
  test('허브 진척이 카탈로그와 일치한다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await expect(page.getByText(`(이식 ${READY_AGENTS.length}/${AGENTS.length}종)`)).toBeVisible()
  })
})
