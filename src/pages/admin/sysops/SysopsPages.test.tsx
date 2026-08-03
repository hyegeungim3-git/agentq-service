import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HrSyncPage } from './HrSyncPage'
import { ApiPromptPage } from './ApiPromptPage'
import { IntegrationPage } from './IntegrationPage'
import { AdminHomePage } from './AdminHomePage'
import { ADMIN_HOME_CARDS } from './homeCards'
import { findMenu } from '@entities/admin/nav'
import { failedChanges, riskyPending } from '@entities/sysops/model'
import { APIS, HR_SYNC, INTEGRATIONS } from '@fixtures/sysops'

describe('HR 연계', () => {
  /* '842명 동기화 완료'만 보여 주면 잘 돌고 있는 것처럼 보인다 */
  it('처리 못 한 퇴직을 맨 위에 경고로 올린다', async () => {
    render(<HrSyncPage />)
    expect(await screen.findByText(/계정이 열린 채로 남은 변경 1건/)).toBeInTheDocument()
    // 경고 상자와 표 양쪽에 같은 사유가 나온다 — 표만 보고 지나치지 않게
    expect(screen.getAllByText(/사번이 두 계정에 걸려 있어/)).toHaveLength(2)
    expect(screen.getByText(/자동 처리를 기다리면 그동안\s*접속이 가능합니다/)).toBeInTheDocument()
  })

  it('실패한 변경을 표 맨 위에 둔다', async () => {
    render(<HrSyncPage />)
    const rows = await screen.findAllByRole('row')
    expect(rows[1]).toHaveTextContent('장태훈')
    expect(rows[1]).toHaveTextContent('처리 실패')
  })

  it('수동 동기화는 성공한 척하지 않는다', async () => {
    render(<HrSyncPage />)
    await userEvent.click(screen.getByRole('button', { name: '수동 동기화' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/밀린 처리도 그대로입니다/)
  })

  it('위험한 미처리만 따로 센다', () => {
    expect(failedChanges(HR_SYNC)).toHaveLength(1)
    expect(riskyPending(HR_SYNC).map((c) => c.name)).toEqual(['장태훈'])
  })
})

describe('API · 프롬프트', () => {
  /* 목록에 있으면 언젠가 캡처되고 공유된다 */
  it('키를 화면에 표시하지 않고 그 이유를 적는다', async () => {
    render(<ApiPromptPage />)
    expect(await screen.findByText(/API 키는 이 화면에 표시하지 않습니다/)).toBeInTheDocument()
    expect(screen.getByText(/화면을 여는 사람 모두가 모든 키를 갖게 되고/)).toBeInTheDocument()
  })

  /* fixture에도 키를 두지 않는다 — 두면 화면에 뿌리고 싶어진다 */
  it('fixture에 키 원문이 없다', () => {
    const raw = JSON.stringify(APIS)
    expect(raw).not.toMatch(/secret|apiKey|token[_-]?value/i)
  })

  it('베타·중지 API는 왜 그런지 말한다', async () => {
    render(<ApiPromptPage />)
    expect(await screen.findByText(/외부 시스템에 붙이지 마십시오/)).toBeInTheDocument()
    expect(screen.getByText(/집계 기준이 바뀌어 중지했습니다/)).toBeInTheDocument()
  })

  it('키 재발급은 성공한 척하지 않는다', async () => {
    render(<ApiPromptPage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '재발급' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/쓰던 키는 그대로 살아 있습니다/)
  })

  /* 버전 번호만 보면 고쳐도 되는 것처럼 보인다 */
  it('프롬프트는 바꿨을 때 무엇이 달라지는지 적는다', async () => {
    render(<ApiPromptPage />)
    await userEvent.click(screen.getByRole('tab', { name: '프롬프트 관리' }))
    expect(await screen.findByText(/근거 없는 질문에 답을 지어내기 시작할 수 있습니다/)).toBeInTheDocument()
  })
})

describe('연계 SW 모니터링', () => {
  /* 이름만 보고는 그 연동이 무엇을 떠받치는지 알 수 없다 */
  it('끊긴 연동을 위로 올리고 무엇이 멈추는지 말한다', async () => {
    render(<IntegrationPage />)
    const items = await screen.findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('PdM 진동 수집기')
    expect(items[0]).toHaveTextContent(/진동 알람이 오지 않습니다/)
    // 요약 카드와 각 항목 배지에 나온다
    expect(screen.getAllByText('끊김')).toHaveLength(3)
  })

  it('정상 연동도 끊겼을 때의 영향을 적는다', async () => {
    render(<IntegrationPage />)
    expect(await screen.findByText(/아무도 로그인할 수 없습니다/)).toBeInTheDocument()
  })

  it('끊긴 개수를 센다', () => {
    expect(INTEGRATIONS.filter((i) => !i.connected)).toHaveLength(2)
  })
})

describe('관리 홈', () => {
  /* 화면을 두 벌 만들지 않는다 */
  it('카드를 누르면 그 화면으로 간다', async () => {
    const onOpen = vi.fn()
    render(<AdminHomePage onOpen={onOpen} />)
    await userEvent.click(screen.getByRole('button', { name: /사용자 목록/ }))
    expect(onOpen).toHaveBeenCalledWith('users.list')
  })

  it('같은 화면을 두 벌 만들지 않았다고 말한다', () => {
    render(<AdminHomePage onOpen={() => {}} />)
    expect(screen.getByText(/같은 화면을 두 벌 만들지\s*않았습니다/)).toBeInTheDocument()
  })

  /* 감추면 없는 기능으로, 그냥 두면 죽은 카드로 읽힌다.
     몇 개가 준비 중인지는 진행에 따라 바뀌므로 목록에서 유도한다 */
  it('아직 안 만든 화면 카드는 준비 중으로 표시한다', () => {
    const planned = ADMIN_HOME_CARDS.filter((c) => findMenu(c.menuId)?.status === 'planned')
    expect(planned.length, '관리 홈에 준비 중 카드가 하나도 없다').toBeGreaterThan(0)
    render(<AdminHomePage onOpen={() => {}} />)
    expect(screen.getAllByText('준비 중')).toHaveLength(planned.length)
  })
})
