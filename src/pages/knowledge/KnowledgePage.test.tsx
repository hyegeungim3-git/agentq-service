import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnowledgePage } from './KnowledgePage'

const setup = () => render(<KnowledgePage apiOptions={{ delayMs: 0 }} />)

/** 검색어를 넣고 실행한다 */
const searchFor = async (q: string) => {
  const box = await screen.findByRole('searchbox')
  await userEvent.clear(box)
  await userEvent.type(box, q)
  await userEvent.click(screen.getByRole('button', { name: /검색 시작/ }))
}

describe('KnowledgePage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('검색어 없이 실행하면 무엇이 빠졌는지 말한다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: /검색 시작/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('검색어를 입력해 주세요')
  })

  /* 유사도 점수만 보여 주면 담당자가 신뢰할 근거가 없다 */
  it('도면 결과는 속성 일치/불일치를 함께 보여준다', async () => {
    setup()
    await searchFor('브래킷 굽힘 금형')
    const hit = await screen.findByRole('region', { name: /HBM-2211/ })
    expect(hit).toHaveTextContent('홀 피치')
    expect(hit).toHaveTextContent('확인 필요 · 홀 피치')
    expect(hit).toHaveTextContent('신규 브래킷 M-318')
  })

  /* 검색어가 결과를 바꾸지 않으면 그건 검색이 아니다 */
  it('검색어가 다르면 결과가 다르다', async () => {
    setup()
    await searchFor('절삭유 농도')
    expect(await screen.findByRole('region', { name: /절삭유 농도 관리 기준/ })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /HBM-2211/ })).not.toBeInTheDocument()
  })

  it('찾는 것이 없으면 지어내지 않고 없다고 말한다', async () => {
    setup()
    // 이 지식베이스가 다루지 않는 주제 — '기준' 같은 흔한 말을 넣으면 실제로 걸린다
    await searchFor('연차 휴가')
    expect(await screen.findByText(/이 검색 범위에는 해당하는 문서가 없습니다/)).toBeInTheDocument()
  })

  /* 전문 검색은 그대로 있는 말만, 시맨틱은 뜻이 가까운 것까지.
     요약 문구가 아니라 실제로 걸린 문서로 판정한다 — 방식 이름과 소요 시간은
     결과가 같아도 달라지므로 그걸로 비교하면 무엇도 확인하지 못한다. */
  it('검색 방식에 따라 걸리는 문서가 달라진다', async () => {
    setup()
    await searchFor('성형')
    // 시맨틱은 본문에 '성형'이 없는 HBM-2211도 개념으로 찾아낸다
    expect(await screen.findByRole('region', { name: /HBM-2211/ })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: /전문 검색/ }))
    await userEvent.click(screen.getByRole('button', { name: /검색 시작/ }))
    expect(await screen.findByRole('region', { name: '검색 결과 2건' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /HBM-2211/ })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: /스티프너 성형 금형/ })).toBeInTheDocument()
  })

  /* 필터에 걸려 빠진 것을 감추면 '없다'로 읽힌다 — 있는데 안 보여 준 것뿐인데 */
  it('보안 등급으로 빠진 문서가 있으면 건수를 알린다', async () => {
    setup()
    await searchFor('브래킷 굽힘 금형')
    await screen.findByRole('region', { name: /HBM-2211/ })

    await userEvent.click(screen.getByRole('radio', { name: '일반' }))
    await userEvent.click(screen.getByRole('button', { name: /검색 시작/ }))
    const summary = await screen.findByRole('region', { name: /검색 결과/ })
    expect(summary).toHaveTextContent(/보안 등급 필터로 \d+건이 빠졌습니다/)
    expect(screen.queryByRole('region', { name: /HBM-2211/ })).not.toBeInTheDocument()
  })

  it('검색 범위에서 뺀 지식베이스가 있으면 건수를 알린다', async () => {
    setup()
    const scope = await screen.findByRole('group', { name: /검색 범위/ })
    await userEvent.click(within(scope).getByRole('checkbox', { name: /설계 도면 온톨로지/ }))
    await searchFor('브래킷 굽힘 금형')
    const summary = await screen.findByRole('region', { name: /검색 결과/ })
    expect(summary).toHaveTextContent(/검색 범위에서 뺀 지식베이스에 \d+건이 있습니다/)
  })

  it('결과 수를 넘으면 몇 건이 잘렸는지 밝힌다', async () => {
    setup()
    await searchFor('금형')
    const summary = await screen.findByRole('region', { name: '검색 결과 3건' })
    expect(summary).toHaveTextContent(/상위 3건만 보여 줍니다/)

    await userEvent.click(screen.getByRole('radio', { name: '상위 10건' }))
    await userEvent.click(screen.getByRole('button', { name: /검색 시작/ }))
    expect(await screen.findByRole('region', { name: /검색 결과 [4-9]건/ })).toBeInTheDocument()
  })
})
