import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntegratedLogPage } from './IntegratedLogPage'
import { UsageMonitorPage } from './UsageMonitorPage'
import { ContentPage } from '@pages/admin/content/ContentPage'
import { daysToLimit } from '@entities/oplog/model'
import { ACCESS_AS_OPLOG, USAGE_BUCKETS } from '@fixtures/oplog'
import { ACCESS_LOGS } from '@fixtures/users'
import { NOTICES } from '@fixtures/notices'
import { FAQ_ITEMS } from '@fixtures/chat'

describe('통합 로그 관리', () => {
  /* 문서가 밖으로 나간 기록은 감사에서 가장 먼저 보는 것이다 */
  it('추출·출력 로그를 첫 탭으로 연다', async () => {
    render(<IntegratedLogPage />)
    expect(await screen.findByText(/수입검사성적서 SPCC-2211/)).toBeInTheDocument()
    expect(screen.getByText(/감사에서 가장 먼저 보는 항목이라 앞에 둡니다/)).toBeInTheDocument()
  })

  /* 두 화면이 같은 데이터를 다룬다는 것을 말하지 않으면 어느 쪽이 진짜인지 헷갈린다 */
  it('접속 로그가 접근 로그와 같은 데이터임을 밝힌다', async () => {
    render(<IntegratedLogPage />)
    await userEvent.click(screen.getByRole('tab', { name: '접속 로그' }))
    expect(await screen.findByText(/사용자 관리 > 접근 로그와 같은 데이터입니다/)).toBeInTheDocument()
    // 실제로 같은 원본에서 왔는지 확인한다 — 복제하면 여기서 갈라진다
    expect(ACCESS_AS_OPLOG).toHaveLength(ACCESS_LOGS.length)
    expect(ACCESS_AS_OPLOG[0]?.ip).toBe(ACCESS_LOGS[0]?.ip)
  })

  it('탭을 바꾸면 내용이 실제로 바뀐다', async () => {
    render(<IntegratedLogPage />)
    expect(await screen.findByText('3건')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: '작업 로그' }))
    expect(await screen.findByText(/차단 규칙 추가/)).toBeInTheDocument()
    expect(screen.queryByText(/수입검사성적서 SPCC-2211/)).not.toBeInTheDocument()
  })

  /* 빈칸으로 두면 못 적은 것으로 읽힌다 */
  it('질의 이력은 본문 미보관이라고 적는다', async () => {
    render(<IntegratedLogPage />)
    await userEvent.click(screen.getByRole('tab', { name: '질의 이력' }))
    expect(await screen.findByText(/질의 본문은 남기지 않습니다/)).toBeInTheDocument()
    expect(screen.getAllByText('본문 미보관').length).toBeGreaterThan(0)
  })

  it('CSV 내보내기는 성공한 척하지 않는다', async () => {
    render(<IntegratedLogPage />)
    await userEvent.click(screen.getByRole('button', { name: 'CSV 내보내기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/조회 조건 밖의 기록이 빠진 채로/)
  })
})

describe('한도 도달 계산', () => {
  /* '80% 소비'만 보여 주면 남은 날짜를 머리로 계산해야 한다 */
  it('지금 속도로 며칠 뒤 한도에 닿는지 구한다', () => {
    const b = { id: 'x', label: 'x', used: 1_420_000, limit: 2_000_000 }
    // 2일에 142만 → 하루 71만, 남은 58만 → 0일 뒤
    expect(daysToLimit(b, 2, 31)).toBe(0)
  })

  it('이미 넘었으면 0을 준다', () => {
    const over = USAGE_BUCKETS.find((b) => b.id === 'b-translate')
    expect(daysToLimit(over as NonNullable<typeof over>, 2, 31)).toBe(0)
  })

  /* 한도가 없으면 넘을 수 없다 */
  it('한도가 없으면 계산하지 않는다', () => {
    const free = USAGE_BUCKETS.find((b) => b.id === 'b-secure')
    expect(daysToLimit(free as NonNullable<typeof free>, 2, 31)).toBeNull()
  })

  it('이달 안에 안 넘으면 알리지 않는다', () => {
    const slow = { id: 'y', label: 'y', used: 1_000, limit: 1_000_000 }
    expect(daysToLimit(slow, 2, 31)).toBeNull()
  })
})

describe('사용량 모니터링', () => {
  it('한도를 넘긴 항목을 초과분과 함께 말한다', async () => {
    render(<UsageMonitorPage />)
    expect(await screen.findByText(/한도를 40,000토큰 넘겼습니다/)).toBeInTheDocument()
  })

  /* 금액이 없는 이유를 안 적으면 무료로 읽힌다 */
  it('금액을 넣지 않은 이유를 말한다', async () => {
    render(<UsageMonitorPage />)
    expect(await screen.findByText(/과금 단가가 정해지지 않아/)).toBeInTheDocument()
    expect(screen.getByText(/예산 근거로 쓰이게 됩니다/)).toBeInTheDocument()
  })

  it('무제한 항목을 0으로 그리지 않는다', async () => {
    render(<UsageMonitorPage />)
    // 숫자와 '무제한'이 한 문단 안에서 갈라져 있어 문단 전체로 찾는다
    expect(await screen.findByText(/64,000 \/ 무제한/)).toBeInTheDocument()
    expect(screen.getByText('한도가 없어 넘을 수 없습니다.')).toBeInTheDocument()
  })
})

describe('콘텐츠 관리', () => {
  /* 관리자가 따로 목록을 갖고 있으면 '여기서 고쳤는데 포털에 안 나오는' 상태가 생긴다 */
  it('사용자 포털과 같은 공지를 보여 준다', async () => {
    render(<ContentPage />)
    expect(await screen.findByText(`${NOTICES.length}건`, { exact: false })).toBeInTheDocument()
    const first = NOTICES[0]
    expect(screen.getByText(first?.title as string)).toBeInTheDocument()
    expect(screen.getByText(/사용자 포털에 그대로 보입니다/)).toBeInTheDocument()
  })

  it('챗봇의 자주 묻는 질문과 같은 목록을 보여 준다', async () => {
    render(<ContentPage />)
    await userEvent.click(screen.getByRole('tab', { name: 'Q&A' }))
    const q = FAQ_ITEMS[0]?.question as string
    expect(await screen.findByText(q)).toBeInTheDocument()
    expect(screen.getByText(/지식베이스에 근거가 없으면/)).toBeInTheDocument()
  })

  /* 같은 것을 두 화면에 두면 어느 쪽이 진짜인지 알 수 없다 */
  it('설문은 서비스 분석에서 다룬다고 안내한다', async () => {
    render(<ContentPage />)
    await userEvent.click(screen.getByRole('tab', { name: '설문조사' }))
    expect(await screen.findByText(/설문 발송과 결과 집계는/)).toBeInTheDocument()
    expect(screen.getByText('서비스 분석 > 이용만족도')).toBeInTheDocument()
  })

  it('공지 등록은 성공한 척하지 않는다', async () => {
    render(<ContentPage />)
    await userEvent.type(await screen.findByLabelText('새 공지 제목'), '4월 정기 점검')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/사용자 포털에는 아무 것도 올라가지 않았습니다/)
  })
})
