import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UsageHistoryPage } from './UsageHistoryPage'
import { SatisfactionPage } from './SatisfactionPage'
import { UsageStatsPage } from './UsageStatsPage'
import { ReportPage } from './ReportPage'
import { averageRating, responseRate, surveyAverage } from '@entities/analytics/model'
import { SURVEY, USAGE_ENTRIES } from '@fixtures/analytics'
import { LOG_GAPS } from '@fixtures/users'

const pick = async (label: string) => {
  const el = screen.getAllByText(label).find((n) => n.closest('label'))
  await userEvent.click(el?.closest('label') as HTMLElement)
}

describe('이용 이력', () => {
  /* 두 화면이 다른 말을 하면 어느 쪽이 사실인지 알 수 없다 */
  it('질의 본문을 남기지 않는다고 접근 로그와 같게 말한다', async () => {
    render(<UsageHistoryPage />)
    expect(await screen.findByText('질의 본문은 이 목록에 없습니다')).toBeInTheDocument()
    expect(screen.getByText(/접근 로그와 같은 기준입니다/)).toBeInTheDocument()
    // 접근 로그 쪽 문구가 실제로 같은 사실을 말하고 있어야 한다
    expect(LOG_GAPS.some((g) => g.includes('질문 본문은 남기지 않습니다'))).toBe(true)
  })

  it('본문이 없어 무엇을 못 하는지도 말한다', async () => {
    render(<UsageHistoryPage />)
    expect(await screen.findByText(/무엇을 물었길래 오류로 신고됐는지/)).toBeInTheDocument()
  })

  /* 안 남긴 것을 0점으로 세면 나쁜 평가를 받은 것으로 읽힌다 */
  it('만족도를 안 남긴 건을 평균에서 뺀다', async () => {
    render(<UsageHistoryPage />)
    expect(await screen.findByText(/8건 중 5건이 답함/)).toBeInTheDocument()
    expect(screen.getAllByText('답하지 않음')).toHaveLength(3)
  })

  it('오류 신고 건을 맨 위에 둔다', async () => {
    render(<UsageHistoryPage />)
    const rows = await screen.findAllByRole('row')
    expect(rows[1]).toHaveTextContent('신고됨')
    expect(rows[1]).toHaveTextContent('한지민')
  })

  it('업무 유형 필터가 목록을 실제로 좁힌다', async () => {
    render(<UsageHistoryPage />)
    expect(await screen.findByText('8건')).toBeInTheDocument()
    await pick('보안채팅')
    expect(await screen.findByText('1건')).toBeInTheDocument()
    expect(screen.queryByText('신고됨')).not.toBeInTheDocument()
  })
})

describe('만족도 계산', () => {
  it('분포에서 평균을 구한다', () => {
    expect(surveyAverage(SURVEY)).toBe(4.2)
  })

  it('응답률은 보낸 사람 기준이다', () => {
    expect(Math.round(responseRate(SURVEY) * 100)).toBe(68)
  })

  it('답한 건만 세어 평균을 낸다', () => {
    const r = averageRating(USAGE_ENTRIES)
    expect(r.counted).toBe(5)
    const naive = USAGE_ENTRIES.reduce((n, e) => n + (e.rating ?? 0), 0) / USAGE_ENTRIES.length
    expect(r.value).not.toBeCloseTo(naive, 3)
  })
})

describe('이용만족도', () => {
  /* '평균 4.2점'만 크게 띄우면 전체가 4.2점이라고 읽는다 */
  it('평균 옆에 표본을 적고 답하지 않은 사람 수를 말한다', async () => {
    render(<SatisfactionPage />)
    expect(await screen.findByText('4.2점')).toBeInTheDocument()
    // 카드 아래 캡션과 아래 설명 문단 두 곳에서 같은 사실을 말한다 — 숫자만 보고 지나치지 않게
    expect(screen.getAllByText('답한 342명의 평균')).toHaveLength(2)
    expect(screen.getByText('161명')).toBeInTheDocument()
    expect(screen.getByText(/전사 만족도로 읽으면 안 됩니다/)).toBeInTheDocument()
  })

  /* 고칠 거리는 낮은 점수 쪽에 있다 */
  it('낮은 점수 의견을 맨 위에 둔다', async () => {
    render(<SatisfactionPage />)
    const section = await screen.findByRole('region', { name: /남긴 의견/ })
    const items = within(section).getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('1점')
    expect(items[0]).toHaveTextContent(/모르면 모른다고 해야 합니다/)
  })

  it('조사 발송은 성공한 척하지 않는다', async () => {
    render(<SatisfactionPage />)
    await userEvent.click(screen.getByRole('button', { name: '만족도 조사 발송' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/아무에게도 발송되지 않았습니다/)
  })
})

describe('이용 통계', () => {
  it('구간을 바꾸면 집계가 달라진다', async () => {
    render(<UsageStatsPage />)
    expect(await screen.findByText('1,842')).toBeInTheDocument()
    await pick('분기')
    expect(await screen.findByText('21,470')).toBeInTheDocument()
  })

  /* 실패를 빼고 잰 평균을 그냥 '평균'이라 적으면 빠른 것처럼 보인다 */
  it('평균 응답시간이 성공한 요청만 센 값임을 밝힌다', async () => {
    render(<UsageStatsPage />)
    expect(await screen.findByText('성공한 요청만')).toBeInTheDocument()
    expect(screen.getByText(/체감 속도로 읽으면 안 됩니다/)).toBeInTheDocument()
    expect(screen.getByText('평균에서 제외')).toBeInTheDocument()
  })
})

describe('서비스 통계 리포트', () => {
  /* 목록에서 빼면 애초에 없는 지표로 읽힌다 */
  it('못 만드는 항목을 감추지 않고 이유를 적는다', async () => {
    render(<ReportPage />)
    expect(await screen.findByText(/지금 넣을 수 없는 항목 2개/)).toBeInTheDocument()
    expect(screen.getByText(/과금 단가가 정해지지 않아/)).toBeInTheDocument()
    expect(screen.getByText(/조직도 연동\(HR 연계\)이 아직 없어/)).toBeInTheDocument()
  })

  it('못 만드는 항목은 고를 수 없다', async () => {
    render(<ReportPage />)
    expect(await screen.findAllByRole('checkbox')).toHaveLength(4)
  })

  it('아무것도 안 고르면 만들 수 없다', async () => {
    render(<ReportPage />)
    expect(await screen.findByRole('button', { name: '리포트 만들기' })).toBeDisabled()
    expect(screen.getByText('항목을 하나 이상 고르세요.')).toBeInTheDocument()
  })

  it('리포트 생성은 성공한 척하지 않는다', async () => {
    render(<ReportPage />)
    await userEvent.click((await screen.findAllByRole('checkbox'))[0] as HTMLElement)
    await userEvent.click(screen.getByRole('button', { name: '리포트 만들기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/지금은 내려받을 것이 없습니다/)
  })
})
