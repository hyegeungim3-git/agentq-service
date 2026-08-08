import { test, expect } from '@playwright/test'
import { openTab, enterDomain } from './shell'

async function openOcr(page: import('@playwright/test').Page) {
  await enterDomain(page)
  await openTab(page, /^에이전트/)
  await page.getByRole('button', { name: /문서 인식/ }).click()
}

test.describe('표준 보고서 설정', () => {
  /* 입력 칸이 결과에 안 들어가면 그건 장식이다 */
  test('직접 입력한 내용이 보고서에 들어가고 확인 필요에서 빠진다', async ({ page }) => {
    await enterDomain(page)
    await openTab(page, /^에이전트/)
    await page.getByRole('button', { name: /표준 보고서 작성/ }).click()

    await page.getByLabel('주요 실적').fill('수출 로트 3건 선적 완료')
    await page.getByRole('radio', { name: /요약체/ }).check()
    await page.getByRole('button', { name: '보고서 생성' }).click()

    const r = page.getByRole('region', { name: /주간 실적 보고/ })
    await expect(r).toContainText('수출 로트 3건 선적 완료', { timeout: 10_000 })
    await expect(r).toContainText('출처 · 직접 입력')
    /* 결과 영역 안에서 본다 — 같은 문구가 '내보내기 전 확인'의 점검 목록에도 나온다.
       화면 전체로 세면 두 자리를 합쳐 세게 되고, 그건 이 검사가 묻는 것이 아니다 */
    const pending = r.getByRole('list', { name: '담당자 작성이 필요한 칸' })
    await expect(pending).not.toContainText('주요 실적')
    await expect(pending).toContainText('다음 계획')
  })
})

test.describe('문서 인식 설정', () => {
  test('설정을 켜면 결과에 항목이 늘어난다', async ({ page }) => {
    await openOcr(page)
    await page.getByRole('checkbox', { name: /표 추출/ }).check()
    await page.getByRole('radio', { name: /도면·성적서 특화/ }).check()
    await page.getByRole('button', { name: '문서 인식' }).click()

    await expect(page.getByRole('table', { name: '추출한 표' })).toBeVisible({ timeout: 10_000 })
    const spec = page.getByRole('region', { name: '규격 대비 판정' })
    await expect(spec).toContainText('58.0 HRC 이상')
    await expect(spec).toContainText('규격 내')
  })

  /* 설정을 잘못 고르면 결과가 나빠진다 — 그 사실을 화면이 말한다 */
  test('언어를 잘못 고르면 신뢰도가 떨어지고 이유를 말한다', async ({ page }) => {
    await openOcr(page)
    await page.getByRole('radio', { name: /영어만/ }).check()
    await page.getByRole('button', { name: '문서 인식' }).click()
    const r = page.getByRole('region', { name: '인식 결과' })
    await expect(r).toContainText('영어만으로 인식해', { timeout: 10_000 })
    await expect(r).toContainText('언어 설정을 확인하십시오')
  })

  test('결과 형식이 내보내기 본문을 바꾼다', async ({ page }) => {
    await openOcr(page)
    await page.getByRole('radio', { name: /마크다운/ }).check()
    await page.getByRole('button', { name: '문서 인식' }).click()
    await expect(page.getByRole('region', { name: '내보내기 미리보기' })).toContainText(
      '# 수입검사 성적서',
      { timeout: 10_000 },
    )
  })
})

test.describe('기준정보 표준화 — 주소 처리', () => {
  async function openMapping(page: import('@playwright/test').Page) {
    await enterDomain(page)
    await openTab(page, /^에이전트/)
    await page.getByRole('button', { name: /기준정보 표준화/ }).click()
  }

  /* 자동으로 끝나는 건수를 먼저 말한다 */
  test('일괄 처리는 사람 몫이 몇 건인지 먼저 말한다', async ({ page }) => {
    await openMapping(page)
    await page.getByRole('radio', { name: /일괄 처리/ }).check()
    await page.getByRole('button', { name: /주소 표준화$/ }).click()
    const r = page.getByRole('region', { name: /일괄 표준화 결과 6건/ })
    await expect(r).toContainText('6건 중 4건은 사람이 봐야 합니다', { timeout: 10_000 })
    await expect(r).toContainText('2건은 AI로 해결되지 않습니다')
  })

  test('폐지된 코드는 조회되더라도 경고한다', async ({ page }) => {
    await openMapping(page)
    await page.getByRole('radio', { name: /코드 역조회/ }).check()
    await page.getByRole('textbox').fill('4812110100')
    await page.getByRole('button', { name: /코드 조회/ }).click()
    await expect(page.getByRole('region', { name: '코드 역조회 결과' })).toContainText(
      '폐지된 코드입니다',
      { timeout: 10_000 },
    )
  })
})

test.describe('회의록 — 자료·참석자·안건', () => {
  /* 논의되지 않은 안건과 명단 밖 발언자를 드러내는 것이 회의록의 실무 가치다 */
  test('안건 논의 여부와 자료 근거가 결과에 반영된다', async ({ page }) => {
    await enterDomain(page)
    await openTab(page, /^에이전트/)
    await page.getByRole('button', { name: /회의록 작성/ }).click()

    await page.getByRole('checkbox', { name: /작업표준서/ }).check()
    await page.getByRole('button', { name: '회의록 작성' }).click()

    const r = page.getByRole('region', { name: /공정회의/ })
    await expect(r).toContainText('근거 · 프레스_작업표준서_SOP-PR-011.pdf 제5장', { timeout: 10_000 })
    await expect(r).toContainText('논의되지 않은 안건이 1건 있습니다 (설비 투자 계획)')
    await expect(r).toContainText('발언 기록 없음 · 이서준')
  })
})

test.describe('챗봇 — FAQ·출처 원문', () => {
  test('범주로 거르고, 목록에서 바로 물어보고, 출처 원문을 펼친다', async ({ page }) => {
    await enterDomain(page)
    await openTab(page, /^에이전트/)
    await page.getByRole('button', { name: /업무 챗봇/ }).click()

    const faq = page.getByRole('region', { name: '자주 묻는 질문' })
    await expect(faq).toContainText('출장 여비 기준 알려줘')
    // 라디오는 sr-only라 사용자와 같은 방식으로 라벨을 누른다
    await page.locator('label').filter({ hasText: /^업무기준$/ }).click()
    await expect(faq).not.toContainText('출장 여비 기준 알려줘')

    await page.getByRole('button', { name: /초품 검사는 언제 실시하나요/ }).first().click()
    await expect(page.getByText(/초품 검사는 금형 교체 직후에 실시합니다/)).toBeVisible({
      timeout: 10_000,
    })

    await page.getByRole('button', { name: /제3장 금형 교체/ }).click()
    await expect(page.getByText(/SMED 절차를 따르며 표준 소요 시간은 25분/)).toBeVisible()
  })

  /* 목록에 있어도 근거가 없으면 없다고 말한다 */
  test('FAQ에 있어도 근거가 없으면 지어내지 않는다', async ({ page }) => {
    await enterDomain(page)
    await openTab(page, /^에이전트/)
    await page.getByRole('button', { name: /업무 챗봇/ }).click()
    await page.getByRole('button', { name: /기밀 기술자료는 어떻게 처리하나요/ }).click()
    await expect(page.getByText('근거 문서 없음 · 담당 부서 확인 필요')).toBeVisible({
      timeout: 10_000,
    })
  })
})

test.describe('번역 — 방향·직접 입력·요약', () => {
  async function openTranslate(page: import('@playwright/test').Page) {
    await enterDomain(page)
    await openTab(page, /^에이전트/)
    await page.getByRole('button', { name: /문서 번역/ }).click()
  }

  /* 목표 언어를 바꿔도 같은 문장이 나오면 그 선택은 장식이다 */
  test('방향을 바꾸면 번역문이 실제로 달라진다', async ({ page }) => {
    await openTranslate(page)
    await page.getByLabel('번역 방향').selectOption('ko-ja')
    await page.getByRole('button', { name: '번역 실행' }).click()
    const r = page.getByRole('region', { name: /번역 결과/ })
    await expect(r).toContainText('本検査成績書は', { timeout: 10_000 })
    await expect(r).not.toContainText('This inspection certificate records')
  })

  test('영→한은 사내 문서를 쓸 수 없다고 미리 말한다', async ({ page }) => {
    await openTranslate(page)
    await page.getByLabel('번역 방향').selectOption('en-ko')
    await expect(page.getByRole('radio', { name: '사내 문서' })).toBeDisabled()
    await expect(page.getByText(/사내 문서는 한국어라/)).toBeVisible()

    await page.getByRole('button', { name: '번역 실행' }).click()
    await expect(page.getByRole('region', { name: /번역 결과/ })).toContainText(
      '본 검사성적서는 냉간압연강판',
      { timeout: 10_000 },
    )
  })
})

test.describe('복합 업무 오케스트레이션', () => {
  /* 끝까지 갔다고 다 된 게 아니다 */
  test('릴레이가 완주하고 사람 확인 지점을 합계로 먼저 말한다', async ({ page }) => {
    await enterDomain(page)
    await openTab(page, /^에이전트/)
    await page.getByRole('button', { name: /수입검사 성적서 접수 처리/ }).click()

    await expect(page.getByRole('heading', { name: '성적서 인식' })).toBeVisible()
    await page.getByRole('button', { name: '릴레이 실행' }).click()

    await expect(page.getByText(/HBP-보전-2026-102 초안 작성/)).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(/사람이 확인해야 하는 지점이 \d+건 남았습니다/).last()).toBeVisible()
    await expect(page.getByText(/인식 신뢰도가 낮아 표준화하지 못함/)).toBeVisible()
  })
})
