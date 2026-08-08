import { test, expect, type Page } from '@playwright/test'
/* 메뉴 여는 절차는 `shell.ts` 한 곳에 있다. 여기 복사본을 두었더니, 관리자 코드를
   따로 내려받게 되면서 '도착할 때까지 기다리기'가 필요해졌을 때 이 파일만 깨졌다 */
import { adminNav, openTab, enterDomain } from './shell'

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
    /* 첫 화면 제목은 고른 발주처의 플랫폼 이름이다(D-014) */
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AI 플랫폼')
  })

  /* 감추면 '이 제품에는 사용자 관리가 없다'로 읽힌다.
     전부 만들고 나면 준비 중이 0개가 되므로, 남아 있으면 준비 중 화면을 확인하고
     하나도 없으면 그 사실을 확인한다 — '하나는 준비 중이어야 한다'로 쓰면
     완성되는 순간 테스트가 거짓으로 깨진다 */
  test('준비 중 메뉴는 무엇이 언제 오는지 말한다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    const planned = nav.getByRole('button').filter({ hasText: '준비 중' })
    const count = await planned.count()

    if (count === 0) {
      await expect(nav.getByText(/0개 준비 중/)).toBeVisible()
      return
    }
    const first = planned.first()
    const label = (await first.innerText()).replace('준비 중', '').trim()
    await first.click()
    await expect(page.getByRole('heading', { name: label, level: 1 })).toBeVisible()
    await expect(page.getByText('아직 만들지 않았습니다', { exact: false })).toBeVisible()
    await expect(page.getByText(/눌러도 아무 일이 없는 껍데기 화면을 두지 않습니다/)).toBeVisible()
  })

  /* 관리자 화면이 전부 열렸는지 — 메뉴를 눌렀는데 빈 화면이 나오면 안 된다 */
  test('모든 메뉴가 실제 화면을 연다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    const labels = await nav.getByRole('button').allInnerTexts()
    const menus = labels
      .map((t) => t.replace('준비 중', '').trim())
      .filter((t) => t !== '' && !['사용자 포털로', '포털 선택으로'].includes(t))

    for (const label of menus) {
      const n = await adminNav(page)
      await n.getByRole('button', { name: label, exact: true }).first().click()
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
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
    await enterDomain(page)
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
    await enterDomain(page)
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

  /* 관리자에서만 열려 있는 것처럼 보이면 안 된다.
     예전에는 포털의 '준비 중' 안내와 관리자의 0종을 각각 확인했는데, 팩이 늘자
     두 숫자를 손으로 맞춰야 했다. 지금은 **두 화면이 같은 말을 하는지**만 본다 */
  test('애플리케이션의 발주처 노출이 포털과 같은 기준이다', async ({ page }) => {
    await page.goto('./')
    /* 첫 화면에서 고를 수 있는 발주처는 위쪽 스위처에 있다(D-014) */
    const openInPortal = await page
      .getByRole('navigation', { name: '발주처 선택' })
      .getByRole('button')
      .evaluateAll((els) => els.filter((e) => !(e as HTMLButtonElement).disabled).length)

    await page.getByRole('button', { name: /관리자 시스템/ }).click()
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '애플리케이션' }).click()
    await expect(page.getByText(/여기서만 열려 있는 것처럼 보이면/)).toBeVisible()
    await expect(page.getByText(/인증 방식이 정해지지 않아 열 수 없습니다/)).toBeVisible()

    // 포털에서 고를 수 있는 수와 관리자에서 '데이터 준비됨'인 수가 같아야 한다
    const readyInAdmin = await page.getByText('준비됨', { exact: true }).count()
    expect(readyInAdmin).toBe(openInPortal)
  })


  /* 저기는 결과(열린 종수), 여기는 이유(무엇이 비었나).
     ⚠️ 네 발주처가 전부 채워져서 '빈 항목' 경로를 밟을 실제 데이터가 없어졌다.
     그 렌더 경로는 단위 테스트가 값을 주입해 지킨다(`PackOpsPages.test.tsx`).
     여기서는 **팩 수가 포털과 맞는지**를 본다 — 두 화면이 갈라지지 않게. */
  test('도메인 팩 스튜디오가 포털과 같은 팩 수를 말한다', async ({ page }) => {
    await page.goto('./')
    /* 첫 화면에서 고를 수 있는 발주처는 위쪽 스위처에 있다(D-014) */
    const openInPortal = await page
      .getByRole('navigation', { name: '발주처 선택' })
      .getByRole('button')
      .evaluateAll((els) => els.filter((e) => !(e as HTMLButtonElement).disabled).length)

    await page.getByRole('button', { name: /관리자 시스템/ }).click()
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '도메인 팩 스튜디오' }).click()
    await expect(page.getByText(/이름만으로는 팩이 되지 않습니다/)).toBeVisible()

    // 같은 문구가 팩 배지에도 있어 지표 카드(dt)로 좁힌다
    const dt = page.locator('dt', { hasText: '포털에서 선택 가능' })
    await expect(dt).toHaveCount(1)
    await expect(dt.locator('xpath=following-sibling::dd[1]')).toHaveText(`${openInPortal}개`)
  })

  /* 도구는 끊겨도 서비스가 죽지 않아 더 늦게 발견된다 */
  test('도구·배포가 끊긴 도구의 영향과 미반영 버전을 먼저 보여 준다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '도구 · 배포' }).click()
    await expect(page.getByText(/끊긴 도구 때문에 못 도는 에이전트 2종/)).toBeVisible()
    await expect(page.getByText(/서비스는 계속 돌고 있어 오류가 나지 않습니다/)).toBeVisible()

    await page.getByRole('tab', { name: '배포' }).click()
    await expect(page.getByText(/운영에 안 나간 버전 3건/)).toBeVisible()
    await page.getByRole('button', { name: '운영 반영' }).first().click()
    await expect(page.getByRole('alert')).toContainText(/운영 버전은 그대로입니다/)
  })


  /* 인프라 수치는 숫자 자체가 전부다 — 지어낸 값을 실측처럼 그리면 거짓 계기판이 된다 */
  test('P4 다섯 화면이 모두 예시 값임을 먼저 말한다', async ({ page }) => {
    await enterAdmin(page)
    // 데이터 관리·개발 환경·모델 평가는 그룹이 되어 첫 하위 화면으로 간다.
    // 메뉴 이름과 화면 제목은 같아야 한다 — 갈라지면 여기서 걸린다.
    const pairs: [string, string][] = [
      ['데이터 관리', '데이터셋'],
      ['개발 환경', '작업 공간'],
      ['모델 레지스트리', '모델 레지스트리'],
      ['학습 · 튜닝', '학습 · 튜닝'],
      ['모델 평가', '평가 결과'],
    ]
    for (const [menu, heading] of pairs) {
      const nav = await adminNav(page)
      await nav.getByRole('button', { name: menu, exact: true }).first().click()
      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
      await expect(page.getByText(/서버 미연결 — 예시 값/).first()).toBeVisible()
    }
  })

  /* 운영 중인데 무슨 데이터로 학습했는지 모르면 삭제 요청에 답할 수 없다 */
  test('계보가 끊긴 모델과 부풀려진 평가 점수를 드러낸다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '모델 레지스트리' }).click()
    await expect(page.getByText(/계보가 끊긴 모델 1건/)).toBeVisible()
    await expect(page.getByText(/평가 기록 없이 운영 중인 모델/)).toBeVisible()

    nav = await adminNav(page)
    await nav.getByRole('button', { name: '모델 평가' }).click()
    await expect(page.getByText(/믿을 수 없는 평가 결과 1건 — 순위에서 뺐습니다/)).toBeVisible()
    // 부풀려진 점수는 순위 표에 없다
    await expect(page.getByRole('table')).not.toContainText('95.8%')
  })

  test('노는 GPU와 학습 데이터 기록 없는 작업을 드러낸다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '개발 환경' }).click()
    await expect(page.getByText(/놀면서 GPU를 잡고 있는 작업 공간/)).toBeVisible()
    await expect(page.getByText(/자동 회수 기준은 정해지지 않았습니다/)).toBeVisible()

    nav = await adminNav(page)
    await nav.getByRole('button', { name: '학습 · 튜닝' }).click()
    await expect(page.getByText(/학습 데이터 기록이 없는 작업 1건/)).toBeVisible()
    await expect(page.getByText(/같은 작업을 다른 각도로 보는 것이라 데이터를 복제하지 않았습니다/)).toBeVisible()
  })


  /* 능력 배지만 나열하면 많을수록 좋아 보인다 — 위험한 건 확인 없이 나가는 것 */
  test('태스크플로우 빌더가 사람 확인 없는 실행형을 먼저 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '에이전트' }).click()
    await expect(page.getByRole('heading', { name: '에이전트', level: 1 })).toBeVisible()

    nav = await adminNav(page)
    await nav.getByRole('button', { name: '태스크플로우 빌더' }).click()
    await expect(page.getByText(/사람 확인 없이 실행되는 에이전트 1종/)).toBeVisible()
    await expect(page.getByText(/결과가 그대로 나갑니다/)).toBeVisible()

    await page.getByRole('button', { name: '단계 보기' }).first().click()
    await expect(page.getByText(/PdM 센서 조회\(끊김\)/)).toBeVisible()
  })

  /* 목록에는 '켜짐'으로 보인다 — 눌러 보기 전까지 모른다 */
  test('시나리오 빌더가 켜져 있지만 못 도는 것을 먼저 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '에이전트' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '시나리오 빌더' }).click()
    await expect(page.getByText(/켜져 있지만 지금 끝까지 못 도는 시나리오 1건/)).toBeVisible()
    await expect(page.getByText(/사용자에게는 카드가 그대로 보입니다/)).toBeVisible()
    await expect(page.getByText('사규 개정 영향 검토')).toBeVisible()
  })


  /* 묶음이 열려 있어도 개별 앱은 꺼져 있을 수 있다 */
  test('앱 인스턴스가 내려간 이유와 안 쓰는 앱을 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '애플리케이션' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '앱 인스턴스' }).click()
    await expect(page.getByText(/안전 문서 색인이 끝나지 않아 답이 부실해 내렸습니다/)).toBeVisible()
    await expect(page.getByText(/만들어 두고 잊힌 앱도 계속 자원을 잡고/)).toBeVisible()

    await pickLabel(page, '보고서 생성')
    await expect(page.getByText('내규 Q&A 봇')).toHaveCount(0)
  })

  /* 결과만 보면 고칠 곳을 못 찾는다 */
  test('RAG 파이프라인이 어느 단계에서 떨어졌는지 보여 준다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '지식 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: 'RAG 파이프라인' }).click()
    await expect(page.getByText(/스캔 이미지라 글자를 뽑지 못함 — 1건/)).toBeVisible()
    await expect(page.getByText(/가장 많이 떨어지는 단계/).first()).toBeVisible()
    // 안 끝난 실행을 끝난 것처럼 그리지 않는다
    await expect(page.getByText('진행 중')).toBeVisible()
  })


  /* 목록만 보면 그냥 나란한 컬렉션으로 보인다 */
  test('벡터 DB가 차원이 섞인 것을 먼저 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '데이터 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '벡터 DB' }).click()
    await expect(page.getByText(/차원이 다른 컬렉션이 섞여 있습니다/)).toBeVisible()
    await expect(page.getByText(/어느 지식영역에도 안 붙은 컬렉션이 1개/)).toBeVisible()
  })

  /* 스케줄은 도는데 마지막 실행이 실패했을 수 있다 */
  test('자동 적재가 실패와 0건을 갈라서 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '데이터 관리' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '자동 적재' }).click()
    await expect(page.getByText(/마지막 수집이 실패한 소스 1건/)).toBeVisible()
    await expect(page.getByText(/성공했지만 한 건도 못 가져온 소스가 1건/)).toBeVisible()
  })

  /* 점수만 나란히 세우면 위키 독해 잘하는 모델을 사내 QA용으로 고르게 된다 */
  test('평가 지표가 무엇을 재는지 점수보다 먼저 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '모델 평가' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '평가 지표' }).click()
    await expect(page.getByText('이 지표들이 무엇을 재는가')).toBeVisible()
    await expect(page.getByText(/업무와 다른 벤치마크로만 잰 모델 1종/)).toBeVisible()
    await expect(page.getByText(/서로 다른 지표의 점수를 나란히 두고 비교하지 마십시오/)).toBeVisible()
  })


  /* '이행했다'와 '이행을 증명할 수 있다'는 다르다 */
  test('감사 추적 탭이 증명할 수 없는 책무를 드러낸다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: 'AI 기본법 대응' }).click()
    await page.getByRole('tab', { name: '감사 추적' }).click()
    await expect(page.getByText(/지금 서버 기록으로 증명할 수 있는 책무 · 1 \/ 5/)).toBeVisible()
    await expect(page.getByText(/아무 데도 기록이 남지 않는 항목 3건/)).toBeVisible()
    await expect(page.getByText(/지금 감사를 받으면 이 항목들은 근거로 내놓을 것이 없습니다/)).toBeVisible()
  })

  /* 인프라 주소를 지어내지 않는다 */
  test('MCP 서버 탭이 주소를 표시하지 않는 이유를 적는다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '도구 · 배포' }).click()
    await page.getByRole('tab', { name: 'MCP 서버' }).click()
    await expect(page.getByText(/서버 주소와 접속 토큰은 이 화면에 표시하지 않습니다/)).toBeVisible()
    await expect(page.getByText(/사외로 나가는 서버가 1개/)).toBeVisible()
  })

  test('공유 볼륨이 곧 찰 볼륨과 방치된 볼륨을 말한다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '개발 환경' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '공유 볼륨' }).click()
    await expect(page.getByText(/85%를 넘긴 볼륨 1개/)).toBeVisible()
    await expect(page.getByText(/차면 학습 작업이 중간에 죽습니다/)).toBeVisible()
    await expect(page.getByText(/60일 넘게 아무도 안 쓴 볼륨이 1개/)).toBeVisible()
  })


  /* 갈림이 있으면 결과만 보고는 어느 길로 갔는지 알 수 없다 */
  test('워크플로우가 안 탄 분기와 검토 없는 실행을 드러낸다', async ({ page }) => {
    await enterAdmin(page)
    let nav = await adminNav(page)
    await nav.getByRole('button', { name: '에이전트' }).click()
    nav = await adminNav(page)
    await nav.getByRole('button', { name: '워크플로우' }).click()
    await expect(page.getByText(/사람 검토 없이 실행까지 가는 워크플로우 1건/)).toBeVisible()
    await expect(page.getByText(/한 번도 안 탄 길 1개/)).toBeVisible()
    await expect(page.getByText(/PdM 센서 조회 도구가 끊겨 진단을 못 했습니다/)).toBeVisible()
  })

  /* 설정이 없으면 같은 결과를 다시 만들 수 없다 */
  test('학습 유형 필터와 유형별 설정이 동작한다', async ({ page }) => {
    await enterAdmin(page)
    const nav = await adminNav(page)
    await nav.getByRole('button', { name: '학습 · 튜닝' }).click()
    await expect(page.getByText(/LoRA rank 16/).first()).toBeVisible()

    await pickLabel(page, '리랭킹 학습')
    await expect(page.getByText(/Top-K 50 · 음성 표본 하드 네거티브 8/)).toBeVisible()
    await expect(page.getByText('JOB-992')).toHaveCount(0)
  })

})

/* 도구는 발주처 데이터, 배포는 플랫폼 것 — 한 화면에서 축이 다르다 */
test('도구·배포에서 발주처를 바꾸면 도구가 바뀌고 배포는 그대로다', async ({ page }) => {
  await enterAdmin(page)
  const nav = await adminNav(page)
  await nav.getByRole('button', { name: '도구 · 배포' }).click()
  await expect(page.getByText('MES 조회')).toBeVisible()

  await page.getByLabel('발주처').selectOption({ label: '새빛대학교병원 (의료)' })
  await expect(page.getByText('청구 자료 조회')).toBeVisible()
  await expect(page.getByText('MES 조회')).toHaveCount(0)
  await expect(page.getByText(/끊긴 도구 없음/)).toBeVisible()

  /* 배포 탭에는 발주처 선택이 없다 — 플랫폼이 한 번 올리면 모두가 그 버전을 쓴다 */
  await page.getByRole('tab', { name: '배포' }).click()
  await expect(page.getByLabel('발주처')).toHaveCount(0)
  await expect(page.getByText(/검증에만 올라가 있고 운영에 안 나간 버전/)).toBeVisible()
})

/* 지식 영역도 발주처 데이터 — 관리자는 어느 발주처를 보는지 말해야 한다 */
test('지식 관리에서 발주처를 바꾸면 영역이 바뀐다', async ({ page }) => {
  await enterAdmin(page)
  const nav = await adminNav(page)
  await nav.getByRole('button', { name: '지식 관리' }).click()
  await expect(page.getByText('작업표준·공정 문서')).toBeVisible()

  await page.getByLabel('발주처').selectOption({ label: '한성시청 (행정)' })
  await expect(page.getByText('재난·안전 매뉴얼')).toBeVisible()
  await expect(page.getByText('작업표준·공정 문서')).toHaveCount(0)
})
