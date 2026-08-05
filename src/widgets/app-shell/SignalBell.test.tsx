import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignalBell } from './SignalBell'
import { SIGNALS } from '@fixtures/signals'

describe('SignalBell', () => {
  it('처리 필요 건수를 배지로 알린다', () => {
    render(<SignalBell signals={SIGNALS} onOpen={vi.fn()} />)
    expect(screen.getByRole('button', { name: /처리 필요 2건/ })).toBeInTheDocument()
  })

  it('열면 신호마다 출처를 함께 보여준다', async () => {
    render(<SignalBell signals={SIGNALS} onOpen={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /^알림/ }))
    const box = screen.getByRole('region', { name: /업무 알림 \d+건/ })
    expect(box).toHaveTextContent('PRS-C03 진동 관리 기준 초과')
    // 근거 없는 알림은 확인할 방법이 없다
    expect(box).toHaveTextContent('출처 · PdM 센서 알람')
  })

  it('이어질 화면이 없는 신호는 그렇다고 말한다', async () => {
    render(<SignalBell signals={SIGNALS} onOpen={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /^알림/ }))
    expect(screen.getByText('이어질 화면이 없는 안내입니다.')).toBeInTheDocument()
  })

  it('처리 화면으로 이으면 목록이 닫힌다', async () => {
    const onOpen = vi.fn()
    render(<SignalBell signals={SIGNALS} onOpen={onOpen} />)
    await userEvent.click(screen.getByRole('button', { name: /^알림/ }))
    await userEvent.click(screen.getByRole('button', { name: /설비 이력 조회 →/ }))
    expect(onOpen).toHaveBeenCalledWith({ kind: 'agent', agentId: 'dbquery', label: '설비 이력 조회' })
    expect(screen.queryByRole('region', { name: /업무 알림 \d+건/ })).not.toBeInTheDocument()
  })

  it('Esc로 닫힌다', async () => {
    render(<SignalBell signals={SIGNALS} onOpen={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /^알림/ }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('region', { name: /업무 알림 \d+건/ })).not.toBeInTheDocument()
  })

  it('알림이 없으면 없다고 말한다', async () => {
    render(<SignalBell signals={[]} onOpen={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /^알림/ }))
    expect(screen.getByText('지금 처리할 알림이 없습니다.')).toBeInTheDocument()
  })
})
