import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TranslatePage } from './TranslatePage'

const setup = () => render(<TranslatePage apiOptions={{ delayMs: 0 }} />)
const translate = async () => {
  await userEvent.click(await screen.findByRole('button', { name: '번역 실행' }))
  return screen.findByRole('region', { name: /번역 결과/ })
}

describe('TranslatePage', () => {
  beforeEach(() => vi.restoreAllMocks())

  /* 목표 언어를 바꿔도 같은 문장이 나오면 그 선택은 장식이다 */
  it('번역 방향을 바꾸면 번역문과 용어가 실제로 달라진다', async () => {
    setup()
    const en = await translate()
    expect(en).toHaveTextContent('This inspection certificate records')
    // 용어집은 별도 절이라 화면 전체에서 확인한다
    expect(screen.getByText('Cold rolled steel sheet (SPCC)')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '다시 설정' }))
    await userEvent.selectOptions(screen.getByLabelText('번역 방향'), 'ko-ja')
    const ja = await translate()
    expect(ja).toHaveTextContent('本検査成績書は')
    expect(ja).not.toHaveTextContent('This inspection certificate records')
    expect(screen.getByText('冷間圧延鋼板')).toBeInTheDocument()
    expect(screen.queryByText('Cold rolled steel sheet (SPCC)')).not.toBeInTheDocument()
  })

  /* 사내 문서는 한국어라 영→한의 원문이 될 수 없다.
     고를 수 없는 조합을 남겨 두면 실행하고 나서야 안 된다는 걸 알게 된다 */
  it('영→한을 고르면 사내 문서를 쓸 수 없다고 미리 말한다', async () => {
    setup()
    await screen.findByLabelText('번역 방향')
    await userEvent.selectOptions(screen.getByLabelText('번역 방향'), 'en-ko')

    expect(screen.getByRole('radio', { name: '사내 문서' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: '직접 입력' })).toBeChecked()
    expect(screen.getByText(/사내 문서는 한국어라/)).toBeInTheDocument()
  })

  it('직접 입력한 영문을 한국어로 번역한다', async () => {
    setup()
    await screen.findByLabelText('번역 방향')
    await userEvent.selectOptions(screen.getByLabelText('번역 방향'), 'en-ko')
    const r = await translate()
    expect(r).toHaveTextContent('본 검사성적서는 냉간압연강판')
  })

  /* 임의 문장은 엔진 없이 번역할 수 없다 — 그럴듯한 결과를 만드는 게 제일 위험하다 */
  it('사전에 없는 문장은 번역하지 않고 그렇다고 말한다', async () => {
    setup()
    await screen.findByLabelText('번역 방향')
    await userEvent.click(screen.getByRole('radio', { name: '직접 입력' }))
    await userEvent.type(screen.getByLabelText('원문 (한 줄에 한 문장)'), '오늘 회식은 몇 시인가요')
    const r = await translate()
    expect(r).toHaveTextContent('1개 문장은 예시 사전에 없어 번역하지 못했습니다')
    expect(r).toHaveTextContent('예시 사전에 없는 문장입니다')
  })

  it('번역+요약을 켜면 요약 절이 붙는다', async () => {
    setup()
    const before = await translate()
    expect(before).not.toHaveTextContent('요약 (영어)')

    await userEvent.click(screen.getByRole('button', { name: '다시 설정' }))
    await userEvent.click(screen.getByRole('checkbox', { name: /번역\+요약/ }))
    const after = await translate()
    expect(after).toHaveTextContent('요약 (영어)')
    expect(after).toHaveTextContent('Incoming inspection of SPCC 2.0T')
  })
})
