import { test, expect } from '@playwright/test'
import { openTab } from './shell'
import { AGENTS, READY_AGENTS } from '../src/entities/agent/model'

async function openAgent(page: import('@playwright/test').Page, name: RegExp) {
  await page.goto('./')
  await page.getByRole('button', { name: /한빛정밀/ }).click()
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name }).click()
}

test.describe('기준정보 표준화 · 챗봇', () => {
  test('표준화 — AI로 안 되는 건수와 상한을 밝힌다', async ({ page }) => {
    await openAgent(page, /기준정보 표준화/)
    await page.getByRole('button', { name: '태그·코드 매핑 분석' }).click()
    const s = page.getByRole('region', { name: '표준화 현황' })
    await expect(s).toBeVisible({ timeout: 10_000 })
    await expect(s).toContainText('660개는 AI로 해결되지 않습니다')
    await expect(s).toContainText('86%가 상한')
  })

  test('표준화 — 자동 확정 반영이 집계값으로 계산된다', async ({ page }) => {
    await openAgent(page, /기준정보 표준화/)
    await page.getByRole('button', { name: '태그·코드 매핑 분석' }).click()
    await page.getByRole('button', { name: /자동 확정 1,172건 반영/ }).click()
    await expect(page.getByText(/표준화 62% → 86%/)).toBeVisible()
  })

  test('챗봇 — 모르는 질문은 지어내지 않는다', async ({ page }) => {
    await openAgent(page, /업무 챗봇/)
    await page.getByLabel('질문 입력').fill('사내 동호회 지원금 얼마야')
    await page.getByRole('button', { name: '전송' }).click()
    await expect(page.getByText('근거 문서 없음 · 담당 부서 확인 필요')).toBeVisible({ timeout: 10_000 })
  })

  test('챗봇 — 답변에 근거를 붙인다', async ({ page }) => {
    await openAgent(page, /업무 챗봇/)
    await page.getByLabel('질문 입력').fill('금형 교체 주기 알려줘')
    await page.getByRole('button', { name: '전송' }).click()
    await expect(page.getByText(/SOP-PR-011 · 제4장/)).toBeVisible({ timeout: 10_000 })
  })

  test('13종이 모두 열린다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await openTab(page, /^에이전트/)
    await expect(page.getByText(`(이식 ${READY_AGENTS.length}/${AGENTS.length}종)`)).toBeVisible()
    // 비활성 버튼이 하나도 없어야 한다
    await expect(page.getByRole('button', { disabled: true })).toHaveCount(0)
  })
})
