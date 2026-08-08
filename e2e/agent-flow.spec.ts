import { test, expect } from '@playwright/test'
import { openAgent } from './shell'

/**
 * 처리 단계 — 13종 어디서나 있어야 한다.
 *
 * 위젯 자체는 단위 검사가 본다. 여기서 보는 것은 **화면이 그 위젯을 실제로 달았는가**다.
 * 공용 셸을 쓰는 화면과 안 쓰는 화면이 갈려 있어서(질문 입력형 5개는 셸을 안 쓴다),
 * 한 곳만 고치고 끝났다고 믿기 쉽다 — 실제로 이번에 그럴 뻔했다.
 *
 * 업무 챗봇은 뺀다. 그 카드는 에이전트 화면이 아니라 일반 대화 화면을 연다 —
 * 대화는 매 turn마다 거치는 단계가 달라서 화면 하나에 고정으로 붙일 수 없다.
 */
const AGENTS = [
  '문서 요약',
  '문서 번역',
  '문서 사전 검토',
  '표준 보고서 작성',
  '회의록 작성',
  '지식 검색',
  '내규·규정 조회',
  '문서 인식(OCR)',
  '데이터 조회',
  '기준정보 표준화',
  '데이터 분석',
  '안전관리계획 수립',
]

for (const name of AGENTS) {
  test(`${name} — 무엇을 거쳐 답하는지 편다`, async ({ page }) => {
    await openAgent(page, name)

    const toggle = page.getByRole('button', { name: /처리 단계/ })
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    /* 진행률을 안 만든 이유를 화면이 직접 말한다 — 이 문장이 사라지면
       다음 사람이 '왜 진행 표시가 없지' 하고 지어낸다 */
    await expect(page.getByText(/어느 단계까지 갔는지는 표시하지 않습니다/)).toBeVisible()
  })
}
