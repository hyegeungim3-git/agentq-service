import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserListPage } from './UserListPage'
import { ApprovalPage } from './ApprovalPage'
import { QuotaPage } from './QuotaPage'
import { AccessLogPage } from './AccessLogPage'
import { BlockRulePage } from './BlockRulePage'

describe('사용자 목록', () => {
  it('검색어가 목록을 실제로 좁힌다', async () => {
    render(<UserListPage />)
    expect(await screen.findByText('10명')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(/이름 · 부서 · 메일/), '협력사')
    expect(await screen.findByText('1명')).toBeInTheDocument()
    expect(screen.getByText('이도경')).toBeInTheDocument()
    expect(screen.queryByText('박태윤')).not.toBeInTheDocument()
  })

  it('상태 필터가 목록을 실제로 좁힌다', async () => {
    render(<UserListPage />)
    expect(await screen.findByText('10명')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('상태'), 'pending')
    expect(await screen.findByText('3명')).toBeInTheDocument()
    expect(screen.getByText('강도현')).toBeInTheDocument()
  })

  it('조건에 맞는 사람이 없으면 그렇다고 말한다', async () => {
    render(<UserListPage />)
    await userEvent.type(screen.getByLabelText(/이름 · 부서 · 메일/), '없는이름')
    expect(await screen.findByText(/조건에 맞는 사용자가 없습니다/)).toBeInTheDocument()
  })

  /* 한 번도 접속 안 한 계정을 '-'로 두면 오늘 접속한 것처럼 읽힌다 */
  it('접속 이력이 없는 계정을 그렇다고 표시한다', async () => {
    render(<UserListPage />)
    expect(await screen.findAllByText('접속 이력 없음')).toHaveLength(3)
  })

  /* 화면에서만 바꾸면 정지시킨 줄 알고 닫는데 그 계정은 살아 있다 */
  it('상태 변경은 성공한 척하지 않고 실패를 알린다', async () => {
    render(<UserListPage />)
    const rows = await screen.findAllByRole('button', { name: '정지' })
    await userEvent.click(rows[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/서버가 연결되지 않아 변경을 저장할 곳이 없습니다/)
  })
})

describe('승인 관리', () => {
  /* 접수순으로 두면 8일째 방치된 신청이 목록 어딘가에 묻힌다 */
  it('오래 기다린 신청을 맨 위에 둔다', async () => {
    render(<ApprovalPage />)
    const items = await screen.findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('강도현')
    expect(items[0]).toHaveTextContent('8일 대기 · 오래 기다림')
  })

  it('오래 기다린 건수를 먼저 말한다', async () => {
    render(<ApprovalPage />)
    expect(await screen.findByText(/3일 이상 기다린 신청 2건/)).toBeInTheDocument()
  })

  /* 빈칸으로 두면 적었는데 화면이 못 그린 것인지 구분할 수 없다 */
  it('사유를 안 적은 신청은 그렇다고 말한다', async () => {
    render(<ApprovalPage />)
    expect(await screen.findByText('적지 않음')).toBeInTheDocument()
  })

  it('승인은 성공한 척하지 않는다', async () => {
    render(<ApprovalPage />)
    const buttons = await screen.findAllByRole('button', { name: '승인' })
    await userEvent.click(buttons[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/신청자에게는 아무 것도 전달되지 않았습니다/)
  })
})

describe('할당량', () => {
  it('한도를 넘긴 사용자를 맨 위에 두고 초과분을 말한다', async () => {
    render(<QuotaPage />)
    expect(await screen.findByText(/한도 초과 1명/)).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('이도경')
    expect(rows[1]).toHaveTextContent('231건 초과')
  })

  /* 무제한을 0%로 그리면 안 쓴 것처럼 보인다 */
  it('무제한 계정의 사용률을 0%로 그리지 않는다', async () => {
    render(<QuotaPage />)
    expect(await screen.findByText('무제한')).toBeInTheDocument()
    expect(screen.getByText('해당 없음')).toBeInTheDocument()
  })

  it('집계 기준 시각을 밝힌다', async () => {
    render(<QuotaPage />)
    expect(await screen.findByText(/집계 기준 2026-08-02 09:00/)).toBeInTheDocument()
  })
})

describe('접근 로그', () => {
  it('거부된 접근을 맨 위에 두고 이유를 붙인다', async () => {
    render(<AccessLogPage />)
    expect(await screen.findByText(/거부 3건/)).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('이도경')
    expect(rows[1]).toHaveTextContent(/문서 보안 등급이 대외비이고 계정이 협력사입니다/)
  })

  it('거부만 보기가 목록을 실제로 좁힌다', async () => {
    render(<AccessLogPage />)
    expect(await screen.findByText(/7건/)).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('거부된 접근만'))
    expect(await screen.findByText(/^3건/)).toBeInTheDocument()
  })

  /* 목록만 보여 주면 '여기 있는 게 전부'로 읽힌다 */
  it('로그에 남지 않는 것을 함께 말한다', async () => {
    render(<AccessLogPage />)
    expect(await screen.findByText('이 목록에 남지 않는 것')).toBeInTheDocument()
    expect(screen.getByText(/챗봇 질문 본문은 남기지 않습니다/)).toBeInTheDocument()
    expect(screen.getByText(/보관 기간이 정해지지 않아/)).toBeInTheDocument()
  })
})

describe('접근권한·차단', () => {
  /* 만료된 규칙을 '차단 중'으로 그리면 막고 있다고 믿게 된다 */
  it('만료된 규칙을 차단 중과 가른다', async () => {
    render(<BlockRulePage />)
    expect(await screen.findByText(/차단 중 2건/)).toBeInTheDocument()
    expect(screen.getByText(/만료돼 더 이상 막지 않는 규칙 1건/)).toBeInTheDocument()
    expect(screen.getByText(/203.241.18.77 · 2026-07-31에 풀렸습니다/)).toBeInTheDocument()
  })

  it('규칙 추가는 성공한 척하지 않는다', async () => {
    render(<BlockRulePage />)
    await userEvent.type(await screen.findByLabelText(/차단할 IP/), '203.0.113.0/24')
    await userEvent.click(screen.getByRole('button', { name: '규칙 추가' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/실제로는 아무 것도 차단되지 않습니다/)
  })

  it('빈 값으로는 추가할 수 없다', async () => {
    render(<BlockRulePage />)
    expect(await screen.findByRole('button', { name: '규칙 추가' })).toBeDisabled()
  })
})
