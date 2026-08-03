import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GuardrailPage } from './GuardrailPage'
import { AiActPage } from './AiActPage'
import { highRisk, passedThrough, reviewingInService, unmetDuties } from '@entities/compliance/model'
import { AI_SYSTEMS, HITS } from '@fixtures/compliance'

describe('가드레일', () => {
  /* 경고만 한 건은 실제로는 나갔다 — 합계에 섞으면 다 막은 것처럼 읽힌다 */
  it('경고만 한 건을 차단과 따로 세고 나갔다고 말한다', async () => {
    render(<GuardrailPage />)
    expect(await screen.findByText('경고만 — 나갔음')).toBeInTheDocument()
    expect(screen.getByText(/실제로 사용자에게 나갔습니다/)).toBeInTheDocument()
    expect(screen.getByText(/차단 건수로 읽으면 안 됩니다/)).toBeInTheDocument()
  })

  it('경고만 한 건을 표 맨 위에 둔다', async () => {
    render(<GuardrailPage />)
    const rows = await screen.findAllByRole('row')
    expect(rows[1]).toHaveTextContent('경고만')
  })

  /* 규칙 목록을 두 화면에 두면 어느 쪽이 진짜인지 알 수 없다 */
  it('규칙 설정은 신뢰성 관리에서 한다고 밝힌다', async () => {
    render(<GuardrailPage />)
    expect(await screen.findByText(/같은 목록을 두 화면에 두지 않았습니다/)).toBeInTheDocument()
  })

  /* 개인정보를 가리려고 만든 규칙의 이력에 그 개인정보가 있으면 앞뒤가 안 맞는다 */
  it('걸린 내용의 원문을 남기지 않는다고 말한다', async () => {
    render(<GuardrailPage />)
    expect(await screen.findByText(/걸린 내용의 원문은 남기지 않습니다/)).toBeInTheDocument()
  })

  it('경고만 한 건을 골라낸다', () => {
    expect(passedThrough(HITS).map((h) => h.id)).toEqual(['g-2', 'g-4'])
  })
})

describe('AI 기본법 대응', () => {
  /* 화면이 판정하는 것처럼 보이면 의무를 화면에 넘기게 된다 */
  it('법적 판단을 내리지 않는다고 먼저 말한다', () => {
    render(<AiActPage />)
    expect(screen.getByText(/이 화면은 법적 판단을 내리지 않습니다/)).toBeInTheDocument()
    expect(screen.getByText(/'비해당'으로\s*보인다는 것이 의무가 없다는 뜻은 아닙니다/)).toBeInTheDocument()
  })

  it('근거 조문을 함께 보여 준다', () => {
    render(<AiActPage />)
    expect(screen.getByText('제34조')).toBeInTheDocument()
    expect(screen.getByText(/고영향 AI 영향평가/)).toBeInTheDocument()
  })

  it('고영향인데 책무를 못 채운 시스템을 맨 위에 올린다', async () => {
    render(<AiActPage />)
    expect(await screen.findByText(/고영향인데 책무를 다 못 채운 시스템 2건/)).toBeInTheDocument()
    // 두 시스템 모두 이용자 보호가 남아 있다
    expect(screen.getAllByText(/남은 책무: 이용자 보호/)).toHaveLength(2)
  })

  /* 대개 쓰면서 판단한다 — 감추면 안전한 것처럼 보인다 */
  it('판정이 안 끝났는데 운영 중인 시스템을 드러낸다', async () => {
    render(<AiActPage />)
    expect(
      await screen.findByText(/해당 여부를 확인 중인데 이미 운영 중인 시스템 1건/),
    ).toBeInTheDocument()
    // 경고 상자와 아래 목록 양쪽에 나온다
    expect(screen.getAllByText(/작업자 안전 위험도 추정 모델/).length).toBeGreaterThan(1)
  })

  it('판정 필터가 목록을 실제로 좁힌다', async () => {
    render(<AiActPage />)
    expect(await screen.findByText('6개 시스템')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: '비해당' }))
    expect(await screen.findByText('2개 시스템')).toBeInTheDocument()
  })

  /* 적용률만 보여 주면 남은 것이 무엇인지 알 수 없다 */
  it('생성물 표시에서 미적용 대상을 이름으로 말한다', async () => {
    render(<AiActPage />)
    await userEvent.click(screen.getByRole('tab', { name: '생성물 표시' }))
    expect(await screen.findByText(/제31조 표시 의무를 지금 채우지 못하고 있습니다/)).toBeInTheDocument()
    // 안내 문장과 목록 항목 양쪽에 나온다 — 이름을 말해야 무엇이 남았는지 안다
    expect(screen.getAllByText(/데이터 분석 차트/)).toHaveLength(2)
  })

  it('영향평가는 안 끝난 것에 무엇이 남았는지 적는다', async () => {
    render(<AiActPage />)
    await userEvent.click(screen.getByRole('tab', { name: '영향평가 현황' }))
    expect(await screen.findByText(/협력사 이해관계자 의견수렴이 남았습니다/)).toBeInTheDocument()
    expect(screen.getByText(/고영향 해당 여부 확인이 끝나야 착수합니다/)).toBeInTheDocument()
  })
})

describe('이행 판정', () => {
  it('고영향이면서 책무가 빈 것만 센다', () => {
    expect(highRisk(AI_SYSTEMS).map((s) => s.id)).toEqual(['s-1', 's-2'])
  })

  it('책무를 다 채운 비해당 시스템은 안 잡는다', () => {
    const done = AI_SYSTEMS.find((s) => s.id === 's-5')
    expect(unmetDuties(done as NonNullable<typeof done>)).toEqual([])
  })

  /* 검토 중이어도 안 돌고 있으면 급하지 않다 */
  it('검토 중이면서 운영 중인 것만 잡는다', () => {
    expect(reviewingInService(AI_SYSTEMS).map((s) => s.id)).toEqual(['s-3'])
  })
})
