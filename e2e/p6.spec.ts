import { test, expect } from '@playwright/test'
import { adminNav } from './shell'

/**
 * P6 네 화면 — 실제 브라우저에서 무엇이 먼저 보이는가.
 *
 * 단위 검사는 함수가 맞는 답을 내는지 본다. 여기서 보는 것은 관리자가 메뉴를 눌렀을 때
 * **표보다 먼저 눈에 들어오는 것**이다. 이 화면들의 값어치는 목록이 아니라
 * 목록만 봐서는 안 보이는 것을 앞에 놓는 데 있다.
 *
 * 하위 메뉴는 상위를 눌러야 드러난다 — `adminNav`가 그 순회를 안다.
 */

type Pg = import('@playwright/test').Page

/**
 * 상위 → 하위로 들어간다.
 *
 * 좁은 화면에서는 **누르면 사이드바가 닫힌다.** 한 번 잡은 nav를 계속 쓰면
 * 하위 메뉴를 못 찾는다 — 클릭마다 다시 연다(`shell.ts`의 순회와 같은 이유).
 */
async function openMenu(page: Pg, parent: string, child: string) {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await (await adminNav(page)).getByRole('button', { name: parent, exact: true }).first().click()
  await (await adminNav(page)).getByRole('button', { name: child, exact: true }).first().click()
}

test('보안 아키텍처 — 정책과 실제가 어긋난 흐름을 찾아 준다', async ({ page }) => {
  await openMenu(page, '시스템 설정', '보안 아키텍처')

  await expect(page.getByRole('heading', { name: '보안 아키텍처', level: 1 })).toBeVisible()
  await expect(page.getByText(/막기로 한 등급이 실제로 경계를 넘고 있습니다/)).toBeVisible()
  await expect(page.getByText(/이 표는 정책이지 실제 통제가 아닙니다/)).toBeVisible()
})

test('지식 증강 전략 — 꺼진 규칙의 질의가 어디로 가는지 말한다', async ({ page }) => {
  await openMenu(page, '지식 관리', '지식 증강 전략')

  await expect(page.getByRole('heading', { name: '지식 증강 전략', level: 1 })).toBeVisible()
  await expect(page.getByText(/1순위 규칙이 꺼져 있습니다/)).toBeVisible()
  await expect(page.getByText(/원문이 바뀌었는데 다시 안 올린 캐시/)).toBeVisible()

  await page.getByRole('button', { name: '다시 올리기' }).first().click()
  await expect(page.getByRole('alert')).toContainText(/서버가 연결되지 않아/)
})

test('카탈로그 · 리니지 — 계보가 없으면 없다고 말한다', async ({ page }) => {
  await openMenu(page, '데이터 관리', '카탈로그 · 리니지')

  await expect(page.getByRole('heading', { name: '카탈로그 · 리니지', level: 1 })).toBeVisible()
  await expect(page.getByText(/수치 집계에 쓰이는데 표준화가/)).toBeVisible()

  await page.getByRole('button', { name: '계보 보기' }).last().click()
  await expect(page.getByText(/계보가 아직 정의되지 않았습니다/)).toBeVisible()
})

test('예측 모델 운영 — 지표 방향이 달라도 여유로 읽힌다', async ({ page }) => {
  await openMenu(page, '모델 평가', '예측 모델 운영')

  await expect(page.getByRole('heading', { name: '예측 모델 운영', level: 1 })).toBeVisible()
  await expect(page.getByText(/\(낮을수록 좋음\)/)).toBeVisible()
  await expect(page.getByText(/\(높을수록 좋음\)/)).toBeVisible()

  await page.getByRole('button', { name: '이 모델로 교체' }).click()
  await expect(page.getByRole('alert')).toContainText(/서비스 중인 모델을 바꾸는 일이라/)
})
