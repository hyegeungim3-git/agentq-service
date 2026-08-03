import { test, expect, type Page } from '@playwright/test'
import { openTab } from './shell'

/** 관리자 메뉴는 좁은 화면에서 오버레이라 먼저 연다 */
async function adminNav(page: Page) {
  const nav = page.getByRole('navigation', { name: '관리자 메뉴' })
  if (!(await nav.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: '메뉴 열기' }).click()
    await expect(nav).toBeVisible()
  }
  return nav
}

async function enterAdmin(page: Page) {
  await page.goto('./')
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  await expect(page.getByRole('heading', { name: '시스템 현황' })).toBeVisible()
}

const pickLabel = (page: Page, text: string) =>
  page.getByRole('main').locator('label').filter({ hasText: text }).first().click()

test.describe('관리자 셸', () => {
  test('포털에서 관리자로 들어가고 돌아온다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '포털 선택으로' }).click()
    await expect(page.getByRole('heading', { name: 'AgentQ' })).toBeVisible()
  })

  /* 감추면 '이 제품에는 사용자 관리가 없다'로 읽힌다 */
  test('아직 안 만든 메뉴를 감추지 않고 준비 중으로 표시한다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await expect(nav.getByText(/화면 28개 사용 가능 · 7개 준비 중/)).toBeVisible()

    await nav.getByRole('button', { name: /도구 · 배포/ }).click()
    await expect(page.getByRole('heading', { name: '도구 · 배포' })).toBeVisible()
    await expect(page.getByText('도구 등록과 배포 대상 관리')).toBeVisible()
    await expect(page.getByText(/AI 서비스 단계에서 만듭니다/)).toBeVisible()
  })

  /* 인프라 수치는 로직이 없다 — 지어낸 값을 실측처럼 그리면 거짓 계기판이 된다 */
  test('대시보드 4종이 모두 예시 값임을 먼저 말한다', async ({ page }) => {
    await enterAdmin(page)
    for (const [menu, heading] of [
      ['시스템 현황', '시스템 현황'],
      ['서비스 현황', '서비스 현황'],
      ['GPU 현황', 'GPU 현황'],
      ['트레이너 현황', '트레이너 현황'],
    ]) {
      const nav = await adminNav(page)
      await nav.getByRole('button', { name: menu as string }).click()
      await expect(page.getByRole('heading', { name: heading as string, level: 1 })).toBeVisible()
      await expect(page.getByText(/서버 미연결 — 예시 값/).first()).toBeVisible()
    }
  })

  test('파드 구간을 바꾸면 목록이 실제로 달라진다', async ({ page }) => {
    await enterAdmin(page)
    await expect(page.getByText(/24h 구간 7건/)).toBeVisible()
    await expect(page.getByText('notify-relay-6d4f2')).toBeVisible()

    await pickLabel(page, '1h')
    await expect(page.getByText(/1h 구간 3건/)).toBeVisible()
    await expect(page.getByText('notify-relay-6d4f2')).toHaveCount(0)
  })

  /* 상태를 아는 것과 조치할 수 있는 것은 다르다 */
  test('주의 상태 서비스는 사유와 조치를 함께 준다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '서비스 현황' }).click()
    await expect(page.getByText(/학습 실패 알림 3건이 전송되지 않았습니다/)).toBeVisible()
    await expect(page.getByText(/조치 · 시스템 현황에서 notify-relay/)).toBeVisible()
  })

  test('학습 구간을 바꾸면 집계와 실패 사유가 바뀐다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '트레이너 현황' }).click()
    await expect(page.getByText('실패한 작업 2건')).toBeVisible()
    await expect(page.getByText(/genos-ai-01 GPU 2 과열로 중단/)).toBeVisible()

    await pickLabel(page, '일간')
    await expect(page.getByText('실패한 작업 1건')).toBeVisible()
  })

  /* 상위 항목은 묶음일 뿐 화면이 아니다 — 첫 하위 메뉴로 보낸다 */
  test('사용자 관리는 하위 메뉴로 펼쳐지고 첫 화면으로 간다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    await expect(page.getByRole('heading', { name: '사용자 목록', level: 1 })).toBeVisible()

    nav = await adminNav(page)
    for (const label of ['승인 관리', '할당량', '접근 로그', '접근권한·차단']) {
      await expect(nav.getByRole('button', { name: label })).toBeVisible()
    }
  })

  test('사용자 검색이 서버 조건으로 목록을 좁힌다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    await expect(page.getByText('10명')).toBeVisible()

    await page.getByLabel(/이름 · 부서 · 메일/).fill('협력사')
    await expect(page.getByText('1명')).toBeVisible()
    await expect(page.getByText('박태윤')).toHaveCount(0)
  })

  /* 화면에서만 바꾸면 정지시킨 줄 알고 닫는데 그 계정은 살아 있다 */
  test('계정 상태 변경은 성공한 척하지 않는다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    await page.getByRole('button', { name: '정지' }).first().click()
    await expect(page.getByRole('alert')).toContainText(/변경을 저장할 곳이 없습니다/)
  })

  test('오래 기다린 승인 신청이 맨 위로 온다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '승인 관리' }).click()
    await expect(page.getByText(/3일 이상 기다린 신청 2건/)).toBeVisible()
    await expect(page.getByRole('main').getByRole('listitem').first()).toContainText('8일 대기')
  })

  /* 목록만 보여 주면 '여기 있는 게 전부'로 읽힌다 */
  test('접근 로그가 남지 않는 것을 함께 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '접근 로그' }).click()
    await expect(page.getByText('이 목록에 남지 않는 것')).toBeVisible()
    await expect(page.getByText(/보관 기간이 정해지지 않아/)).toBeVisible()
  })

  /* 만료된 규칙을 '차단 중'으로 그리면 막고 있다고 믿게 된다 */
  test('만료된 차단 규칙을 가려서 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '접근권한·차단' }).click()
    await expect(page.getByText(/차단 중 2건/)).toBeVisible()
    await expect(page.getByText(/만료돼 더 이상 막지 않는 규칙 1건/)).toBeVisible()
  })


  test('LLM 설정 — 모델을 고르면 맡은 업무와 중지 사유가 나온다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: 'LLM 운영' }).click()
    await expect(page.getByRole('heading', { name: 'LLM 설정', level: 1 })).toBeVisible()

    await page.getByRole('button', { name: /Solar-10.7B/ }).click()
    await expect(page.getByText(/수치 인용 오류가 반복돼 중지했습니다/)).toBeVisible()
    await expect(page.getByText(/지금 이 모델로 나가는 답변은 없습니다/)).toBeVisible()

    nav = await adminNav(page)
    for (const label of ['신뢰성 관리', 'AI 품질 관리']) {
      await expect(nav.getByRole('button', { name: label })).toBeVisible()
    }
  })

  /* 안 잰 것을 0으로 세면 효과가 없어 보이고 평균이 무너진다 */
  test('신뢰성 관리 — 측정 전 항목을 평균에서 빼고 탭이 실제로 바뀐다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: 'LLM 운영' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '신뢰성 관리' }).click()

    await expect(page.getByText(/위 평균에 포함하지 않았습니다/)).toBeVisible()
    await expect(page.getByText('측정 전')).toBeVisible()

    await page.getByRole('tab', { name: '출력 가드레일' }).click()
    await expect(page.getByText(/문서에 있던 개인정보가 답변에 그대로 실려 나갑니다/)).toBeVisible()
    await expect(page.getByText('Top-K')).toHaveCount(0)
  })

  /* 포털에서 누른 피드백이 관리자 화면으로 이어진다 */
  test('AI 품질 관리 — 포털 피드백이 집계되고 한계를 밝힌다', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await page.getByRole('button', { name: /금형 교체 주기가 어떻게 되나요/ }).click()
    await expect(page.getByText(/타수 50만 타/)).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: '도움이 안 됐어요' }).click()
    await page.getByRole('button', { name: '근거가 부족하다' }).click()

    // 사이드바가 좁은 화면에서 오버레이라 UI로 되돌아가지 않고 다시 연다
    // (피드백은 브라우저에 남으므로 새로 열어도 그대로다)
    await page.goto('./')
    await page.getByRole('button', { name: /관리자 시스템/ }).click()
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: 'LLM 운영' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: 'AI 품질 관리' }).click()

    const box = page.getByRole('region', { name: '사용자 피드백' })
    await expect(box).toContainText('이 브라우저에 남은 것만')
    await expect(box).toContainText('근거가 부족하다')
    await expect(box).toContainText(/어떤 질문이었는지도 이어 붙일 수 없습니다/)
  })


  /* 두 화면이 다른 말을 하면 어느 쪽이 사실인지 알 수 없다 */
  test('이용 이력과 접근 로그가 본문 보관에 대해 같은 말을 한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용자 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '접근 로그' }).click()
    await expect(page.getByText(/챗봇 질문 본문은 남기지 않습니다/)).toBeVisible()

    nav = await adminNav(page)
    await nav.getByRole('button', { name: '서비스 분석' }).click()
    await expect(page.getByRole('heading', { name: '이용 이력', level: 1 })).toBeVisible()
    await expect(page.getByText('질의 본문은 이 목록에 없습니다')).toBeVisible()
    await expect(page.getByText(/접근 로그와 같은 기준입니다/)).toBeVisible()
  })

  /* '평균 4.2점'만 크게 띄우면 전체가 4.2점이라고 읽는다 */
  test('만족도는 답한 사람만의 평균이라고 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '서비스 분석' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '이용만족도' }).click()
    await expect(page.getByText('4.2점')).toBeVisible()
    await expect(page.getByText(/전사 만족도로 읽으면 안 됩니다/)).toBeVisible()
    // 카드와 설명 문단 두 곳에 나오므로 카드 쪽(dd)으로 좁힌다
    await expect(page.getByText('161명', { exact: true }).first()).toBeVisible()
  })

  test('이용 통계 구간을 바꾸면 집계가 달라진다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '서비스 분석' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '이용 통계' }).click()
    await expect(page.getByText('1,842')).toBeVisible()
    await pickLabel(page, '분기')
    await expect(page.getByText('21,470')).toBeVisible()
    await expect(page.getByText('성공한 요청만', { exact: true })).toBeVisible()
  })

  /* 목록에서 빼면 애초에 없는 지표로 읽힌다 */
  test('리포트는 못 만드는 항목을 감추지 않는다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '서비스 분석' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '서비스 통계 리포트' }).click()
    await expect(page.getByText(/지금 넣을 수 없는 항목 2개/)).toBeVisible()
    await expect(page.getByText(/과금 단가가 정해지지 않아/)).toBeVisible()

    await page.getByRole('checkbox').first().check()
    await page.getByRole('button', { name: '리포트 만들기' }).click()
    await expect(page.getByRole('alert')).toContainText(/지금은 내려받을 것이 없습니다/)
  })


  test('통합 로그는 반출 기록을 먼저 보여 주고 접근 로그와의 관계를 밝힌다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '로그·모니터링' }).click()
    await expect(page.getByRole('heading', { name: '통합 로그 관리', level: 1 })).toBeVisible()
    await expect(page.getByText(/수입검사성적서 SPCC-2211/)).toBeVisible()

    await page.getByRole('tab', { name: '접속 로그' }).click()
    await expect(page.getByText(/사용자 관리 > 접근 로그와 같은 데이터입니다/)).toBeVisible()
  })

  /* '80% 소비'만 보여 주면 남은 날짜를 머리로 계산해야 한다 */
  test('사용량은 한도 초과분과 금액이 없는 이유를 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '로그·모니터링' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '사용량 모니터링' }).click()
    await expect(page.getByText(/한도를 40,000토큰 넘겼습니다/)).toBeVisible()
    await expect(page.getByText(/과금 단가가 정해지지 않아/)).toBeVisible()
  })

  /* 관리자가 따로 목록을 갖고 있으면 '여기서 고쳤는데 포털에 안 나오는' 상태가 생긴다 */
  test('콘텐츠 관리가 사용자 포털과 같은 공지를 보여 준다', async ({ page }) => {
    // 먼저 포털에서 공지 제목을 확인한다
    await page.goto('./')
    await page.getByRole('button', { name: /한빛정밀/ }).click()
    await openTab(page, /^공지사항/)
    const portalTitle = await page
      .getByRole('main')
      .getByRole('heading', { level: 2 })
      .first()
      .innerText()

    await page.goto('./')
    await page.getByRole('button', { name: /관리자 시스템/ }).click()
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '콘텐츠 관리' }).click()
    await expect(page.getByText(/사용자 포털에 그대로 보입니다/)).toBeVisible()
    await expect(page.getByRole('main').getByText(portalTitle)).toBeVisible()

    await page.getByRole('button', { name: '등록' }).isDisabled()
  })


  /* '842명 동기화 완료'만 보여 주면 잘 돌고 있는 것처럼 보인다 */
  test('HR 연계는 처리 못 한 퇴직을 경고로 올린다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: 'HR 연계·그룹 관리' }).click()
    await expect(page.getByText(/계정이 열린 채로 남은 변경 1건/)).toBeVisible()
    await expect(page.getByText(/자동 처리를 기다리면 그동안 접속이 가능합니다/)).toBeVisible()
  })

  /* 목록에 있으면 언젠가 캡처되고 공유된다 */
  test('API 화면에 키를 표시하지 않고 이유를 적는다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: 'API·프롬프트' }).click()
    await expect(page.getByText(/API 키는 이 화면에 표시하지 않습니다/)).toBeVisible()

    await page.getByRole('tab', { name: '프롬프트 관리' }).click()
    await expect(page.getByText(/근거 없는 질문에 답을 지어내기 시작할 수 있습니다/)).toBeVisible()
  })

  test('시스템 설정 — 관리 홈 카드가 실제 화면으로 간다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '시스템 설정' }).click()
    await expect(page.getByRole('heading', { name: '관리 홈', level: 1 })).toBeVisible()
    await expect(page.getByText(/같은 화면을 두 벌 만들지 않았습니다/)).toBeVisible()

    await page.getByRole('button', { name: /사용자 목록/ }).click()
    await expect(page.getByRole('heading', { name: '사용자 목록', level: 1 })).toBeVisible()

    nav = await adminNav(page)
    await nav.getByRole('button', { name: '시스템 설정' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '연계 SW 모니터링' }).click()
    await expect(page.getByText(/진동 알람이 오지 않습니다/)).toBeVisible()
  })


  /* 경고만 한 건은 실제로는 나갔다 — 합계에 섞으면 다 막은 것처럼 읽힌다 */
  test('가드레일은 경고만 한 건을 차단과 따로 세고 규칙 설정 위치를 밝힌다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '가드레일' }).click()
    await expect(page.getByText('경고만 — 나갔음')).toBeVisible()
    await expect(page.getByText(/실제로 사용자에게 나갔습니다/)).toBeVisible()
    await expect(page.getByText(/같은 목록을 두 화면에 두지 않았습니다/)).toBeVisible()
  })

  /* 화면이 판정하는 것처럼 보이면 의무를 화면에 넘기게 된다 */
  test('AI 기본법 화면은 법적 판단을 내리지 않는다고 먼저 말한다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: 'AI 기본법 대응' }).click()
    await expect(page.getByText(/이 화면은 법적 판단을 내리지 않습니다/)).toBeVisible()
    await expect(page.getByText(/고영향인데 책무를 다 못 채운 시스템 2건/)).toBeVisible()
    await expect(page.getByText(/해당 여부를 확인 중인데 이미 운영 중인 시스템 1건/)).toBeVisible()

    await page.getByRole('tab', { name: '생성물 표시' }).click()
    await expect(page.getByText(/제31조 표시 의무를 지금 채우지 못하고 있습니다/)).toBeVisible()
  })


  /* 등록 건수만 보면 다 찾을 수 있다고 믿는다 */
  test('지식 관리는 등록됐지만 못 찾는 문서를 드러낸다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '지식 관리' }).click()
    await expect(page.getByText(/오류가 나지 않으므로 화면이 말하지 않으면/)).toBeVisible()

    await page.getByRole('tab', { name: '못 찾는 문서' }).click()
    await expect(page.getByText(/도면 PDF에서 글자를 뽑지 못했습니다/)).toBeVisible()
    await expect(page.getByText(/비상 대피도/)).toBeVisible()

    await page.getByLabel('지식영역').selectOption('k-safety')
    await expect(page.getByText(/6건 · 실패 2건/)).toBeVisible()

    await page.getByRole('tab', { name: 'RAG 설정' }).click()
    await expect(page.getByText(/검색 품질이 조용히 나빠집니다/)).toBeVisible()
  })


  /* 답이 부실한 원인은 대개 에이전트가 아니라 그 아래 데이터에 있다 */
  test('에이전트 화면이 근거 문서 빈틈을 지식 관리와 이어 준다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '에이전트' }).click()
    await expect(page.getByText(/포털이 그리는 목록과 같은 카탈로그입니다/)).toBeVisible()
    await expect(page.getByText(/근거 문서에 빈틈이 있는 에이전트/)).toBeVisible()
    await expect(page.getByText(/에이전트보다 먼저 지식 관리를 보십시오/)).toBeVisible()

    // 실패율이 가장 높은 것이 맨 위
    await expect(page.getByRole('row').nth(1)).toContainText('안전관리계획 수립')
  })

  /* 관리자에서만 열려 있는 것처럼 보이면 안 된다 */
  test('애플리케이션의 발주처 노출이 포털과 같은 기준이다', async ({ page }) => {
    await page.goto('./')
    // 포털에서 고를 수 없는 곳이 있는지 먼저 본다
    await expect(page.getByText(/업무 데이터가 준비된 발주처만 선택할 수 있습니다/)).toBeVisible()

    await page.getByRole('button', { name: /관리자 시스템/ }).click()
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '애플리케이션' }).click()
    await expect(page.getByText(/여기서만 열려 있는 것처럼 보이면/)).toBeVisible()
    await expect(page.getByText(/인증 방식이 정해지지 않아 열 수 없습니다/)).toBeVisible()
    await expect(page.getByText('0종')).toHaveCount(3)
  })

})
