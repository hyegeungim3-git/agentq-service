import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HandoverPage } from './HandoverPage'
import { WorkOrderPage } from './WorkOrderPage'
import {
  nextStatus,
  openOrders,
  overdue,
  unacknowledged,
  unresolvedPending,
  withoutDue,
} from '@entities/field/model'
import { RECEIVED, WORK_ORDERS } from '@fixtures/field'
import { TODAY } from '@fixtures/users'

describe('교대 인수인계', () => {
  /**
   * 이상·경보는 조치가 이미 돈다. 미결은 다음 조가 안 보면 아무도 하지 않는다.
   * 그래서 확인 안 된 것 중에서도 미결을 따로 센다.
   */
  it('확인 없이 넘어온 미결을 먼저 이름으로 말한다', async () => {
    render(<HandoverPage />)
    expect(await screen.findByText(/확인 없이 넘어온 미결 2건/)).toBeInTheDocument()
    /* 경고 상자와 아래 목록 양쪽에 나온다 — 급한 것은 두 자리에서 같은 말을 한다 */
    expect(screen.getAllByText(/자재 입고 지연으로 B조 이월/)).toHaveLength(2)
    expect(screen.getByText(/미결은 다음 조가 안 보면 아무도 하지 않습니다/)).toBeInTheDocument()
  })

  it('이미 확인된 항목은 다시 확인하라고 하지 않는다', async () => {
    render(<HandoverPage />)
    expect(await screen.findAllByText('확인됨')).toHaveLength(2)
  })

  /* 확인이 화면에만 남으면 다음 조가 열었을 때 그대로다 */
  it('확인 저장은 성공한 척하지 않는다', async () => {
    render(<HandoverPage />)
    const boxes = await screen.findAllByRole('checkbox')
    await userEvent.click(boxes[0] as HTMLElement)
    await userEvent.click(screen.getByRole('button', { name: /확인 1건 저장/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/다음 조가 볼 수 있게 서버에 남아야/)
  })

  it('고른 것이 없으면 저장 버튼이 눌리지 않는다', async () => {
    render(<HandoverPage />)
    expect(await screen.findByRole('button', { name: /확인 0건 저장/ })).toBeDisabled()
  })
})

describe('작업지시 추적', () => {
  /* 늦은 것과 언제 할지 모르는 것은 다른 문제다 */
  it('기한 지남과 기한 없음을 따로 말한다', async () => {
    render(<WorkOrderPage />)
    /* 숫자는 <b> 안에 있어 문장과 나뉜다 — 문장과 대상 문서를 따로 확인한다 */
    expect(await screen.findByText(/기한이 지났는데 안 끝난 지시/)).toBeInTheDocument()
    expect(screen.getByText(/HBP-품질-2026-088\(2026-07-29\)/)).toBeInTheDocument()
    expect(screen.getByText(/기한이 없는 지시/)).toBeInTheDocument()
    expect(screen.getByText(/언제까지 해야 하는지가 없으면 아무도 하지 않습니다/)).toBeInTheDocument()
  })

  /* 현재 상태만 있으면 추적이 아니라 현황판이다 */
  it('언제 누가 바꿨는지를 함께 보여 준다', async () => {
    render(<WorkOrderPage />)
    expect(await screen.findByText(/발행 · 2026-07-30 09:12 · AI 자동 발행/)).toBeInTheDocument()
  })

  it('되돌리는 버튼을 두지 않는다', async () => {
    render(<WorkOrderPage />)
    await screen.findByRole('button', { name: '작업 착수' })
    expect(screen.queryByRole('button', { name: /되돌리기|취소/ })).not.toBeInTheDocument()
    expect(screen.getByText(/정정이 아니라 추가로 남깁니다/)).toBeInTheDocument()
  })

  it('끝난 지시에는 다음 단계 버튼이 없다', async () => {
    render(<WorkOrderPage />)
    await screen.findByText('침탄로 2호기 존2 열전대 교체')
    /* 발행·작업 중·작업 완료 세 건에만 다음 단계가 있다 */
    expect(screen.getAllByRole('button', { name: /작업 착수|작업 완료 처리|검증 확인/ })).toHaveLength(3)
  })

  it('상태 변경은 성공한 척하지 않는다', async () => {
    render(<WorkOrderPage />)
    await userEvent.click(await screen.findByRole('button', { name: '작업 착수' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/현장 기록이라 서버에 남아야/)
  })
})

describe('현장 판정', () => {
  it('확인 안 된 것 중 미결만 급한 것으로 센다', () => {
    expect(unacknowledged(RECEIVED).map((i) => i.id)).toEqual(['h-3', 'h-4', 'h-5'])
    expect(unresolvedPending(RECEIVED).map((i) => i.id)).toEqual(['h-3', 'h-4'])
  })

  it('기한은 기준 시점으로 재고, 기한 없음과 섞지 않는다', () => {
    expect(overdue(WORK_ORDERS, TODAY).map((o) => o.docNo)).toEqual(['HBP-품질-2026-088'])
    expect(withoutDue(WORK_ORDERS).map((o) => o.docNo)).toEqual(['HBP-안전-2026-031'])
    expect(openOrders(WORK_ORDERS)).toHaveLength(3)
  })

  it('상태는 앞으로만 간다', () => {
    expect(nextStatus('issued')).toBe('working')
    expect(nextStatus('done')).toBe('verified')
    expect(nextStatus('verified')).toBeNull()
  })
})
