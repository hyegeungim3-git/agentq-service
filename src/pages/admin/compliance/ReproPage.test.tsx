import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReproPage } from './ReproPage'
import { canReproduce, driftCounts, drifted, missingSourceRev } from '@entities/repro/model'
import { SNAPSHOTS } from '@fixtures/repro'

describe('답변 재현성', () => {
  /**
   * 이 화면이 어디까지 답할 수 있는지를 먼저 밝혀야 한다.
   *
   * 원문을 안 남기면서 '재현했다'고 말하면, 심사에서 같은 답이 나온다는 뜻으로 읽힌다.
   */
  it("'같은 답이 나오는가'는 못 말한다고 맨 위에서 밝힌다", () => {
    render(<ReproPage />)
    expect(screen.getByText(/질의·답변 원문은 보관하지 않습니다/)).toBeInTheDocument()
    expect(screen.getByText(/그때 구성 그대로 돌릴 수 있는가'까지/)).toBeInTheDocument()
    expect(screen.getByText(/§3-7/)).toBeInTheDocument()
  })

  /* 재현 불가 자체는 결함이 아니다 — 무엇이 바뀌었는지 말할 수 있으면 된다 */
  it('무엇이 바뀌어서 못 도는지를 구성별로 센다', async () => {
    render(<ReproPage />)
    expect(await screen.findByText(/구성이 바뀌어 그대로 못 돌리는 스냅샷 3건/)).toBeInTheDocument()
    expect(screen.getByText(/재현 불가 자체는 결함이 아니고/)).toBeInTheDocument()
    /* 지식베이스가 2건으로 가장 잦다 */
    expect(screen.getByText(/지식베이스 바뀜/)).toBeInTheDocument()
  })

  /* 문서 이름만으로는 재현이 안 된다 — 같은 이름이라도 내용이 바뀐다 */
  it('근거 문서의 개정 버전이 안 남은 스냅샷을 드러낸다', async () => {
    render(<ReproPage />)
    expect(await screen.findByText(/개정 버전이 안 남았습니다/)).toBeInTheDocument()
  })

  it('구성 상세를 펴면 그때 값과 지금 값을 나란히 보여 준다', async () => {
    render(<ReproPage />)
    const card = (await screen.findByText('분기 불량률 집계')).closest('li')
    expect(card).not.toBeNull()
    await userEvent.click(
      screen.getAllByRole('button', { name: '구성 상세 보기' })[1] as HTMLElement,
    )
    expect(await screen.findByText(/그때 p-2.0 → 지금 p-2.1/)).toBeInTheDocument()
    expect(screen.getByText(/그때 GPT-OSS 120B v2.2 → 지금 GPT-OSS 120B v2.3/)).toBeInTheDocument()
  })

  /**
   * 서버 없이 '결과 일치'를 띄우면 심사에서 재현해 봤다고 말하게 된다.
   * 이전 데모는 1.8초 뒤 성공 토스트를 띄웠다.
   */
  it('재현 실행은 성공한 척하지 않고 무엇이 필요한지 말한다', async () => {
    render(<ReproPage />)
    const buttons = await screen.findAllByRole('button', { name: '이 구성으로 재현' })
    await userEvent.click(buttons[0] as HTMLElement)
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/모델 가중치와 색인/)
    expect(alert).toHaveTextContent(/실행하지 못했습니다/)
    /* 실패했는데 결과가 나온 것처럼 보이면 안 된다 */
    expect(screen.queryByText(/결과 일치/)).not.toBeInTheDocument()
  })
})

describe('재현 판정', () => {
  /* 저장된 값이면 구성이 바뀐 뒤에도 '가능'이 그대로 남는다 */
  it('차이가 없을 때만 그때 구성 그대로다', () => {
    const same = SNAPSHOTS.find((s) => s.id === 'sn-1')
    const changed = SNAPSHOTS.find((s) => s.id === 'sn-2')
    expect(canReproduce(same as NonNullable<typeof same>)).toBe(true)
    expect(canReproduce(changed as NonNullable<typeof changed>)).toBe(false)
    expect(drifted(SNAPSHOTS).map((s) => s.id)).toEqual(['sn-2', 'sn-3', 'sn-4'])
  })

  it('가장 자주 바뀐 구성을 앞에 놓는다', () => {
    const counts = driftCounts(SNAPSHOTS)
    expect(counts[0]).toEqual({ part: 'knowledge', count: 2 })
    /* 안 바뀐 구성은 목록에 넣지 않는다 — 0건을 나열하면 무엇이 문제인지 흐려진다 */
    expect(counts.map((c) => c.part)).not.toContain('params')
  })

  it('개정 버전이 빈 근거 문서를 잡는다', () => {
    expect(missingSourceRev(SNAPSHOTS).map((s) => s.id)).toEqual(['sn-4'])
  })
})
