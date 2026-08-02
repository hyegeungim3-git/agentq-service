import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SystemStatusPage } from './system/SystemStatusPage'
import { ServiceStatusPage } from './service/ServiceStatusPage'
import { GpuStatusPage } from './gpu/GpuStatusPage'
import { TrainerStatusPage } from './trainer/TrainerStatusPage'
import { PlannedPage } from './planned/PlannedPage'
import { findMenu } from '@entities/admin/nav'

/** 라디오가 sr-only라 라벨을 누른다 — 실제 사용자도 라벨을 누른다 */
const pick = async (label: string) => {
  const el = screen.getAllByText(label).find((n) => n.closest('label'))
  await userEvent.click(el?.closest('label') as HTMLElement)
}

describe('시스템 현황', () => {
  /* 인프라 수치는 로직이 없다 — 지어낸 값을 실측처럼 그리면 거짓 계기판이 된다 */
  it('값보다 먼저 예시 값임을 말한다', async () => {
    render(<SystemStatusPage />)
    expect(screen.getAllByText(/서버 미연결 — 예시 값/).length).toBeGreaterThan(0)
    expect(await screen.findByText('5.3%')).toBeInTheDocument()
  })

  it('노드 표를 보여 준다', async () => {
    render(<SystemStatusPage />)
    expect(await screen.findByText('genos01')).toBeInTheDocument()
    expect(screen.getByText('genos03')).toBeInTheDocument()
  })

  /* 구간을 고르면 서버에 다시 묻는다 — 어느 구간이나 같으면 고를 이유가 없다 */
  it('구간을 넓히면 짧은 구간에 없던 파드가 나온다', async () => {
    render(<SystemStatusPage />)
    expect(await screen.findByText(/24h 구간 7건/)).toBeInTheDocument()
    expect(screen.getByText('notify-relay-6d4f2')).toBeInTheDocument()

    await pick('1h')
    expect(await screen.findByText(/1h 구간 3건/)).toBeInTheDocument()
    expect(screen.queryByText('notify-relay-6d4f2')).not.toBeInTheDocument()

    await pick('7d')
    expect(await screen.findByText(/7d 구간 10건/)).toBeInTheDocument()
    expect(screen.getByText('backup-milvus-weekly')).toBeInTheDocument()
  })

  /* 상태(Running)만 보면 조용히 죽고 살아나는 파드를 놓친다 */
  it('실패·재시작 건수를 먼저 말한다', async () => {
    render(<SystemStatusPage />)
    expect(await screen.findByText(/실패하거나 재시작한 파드 2건/)).toBeInTheDocument()

    await pick('1h')
    expect(await screen.findByText(/실패·재시작 없음/)).toBeInTheDocument()
  })
})

describe('서비스 현황', () => {
  /* 상태를 아는 것과 조치할 수 있는 것은 다르다 */
  it('정상이 아닌 서비스는 사유와 조치를 함께 준다', async () => {
    render(<ServiceStatusPage />)
    expect(await screen.findByText('알림 서비스')).toBeInTheDocument()
    expect(screen.getByText(/학습 실패 알림 3건이 전송되지 않았습니다/)).toBeInTheDocument()
    expect(screen.getByText(/조치 · 시스템 현황에서 notify-relay/)).toBeInTheDocument()
  })

  it('조치가 필요한 개수를 센다', async () => {
    render(<ServiceStatusPage />)
    const box = (await screen.findByText('조치 필요')).closest('div') as HTMLElement
    expect(within(box).getByText('1')).toBeInTheDocument()
  })

  /* 6개 중 1개를 훑어 찾게 하지 않는다 */
  it('정상이 아닌 것을 목록 맨 위에 둔다', async () => {
    render(<ServiceStatusPage />)
    const items = await screen.findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('알림 서비스')
  })
})

describe('GPU 현황', () => {
  it('과부하 판정 기준을 화면에 적는다', async () => {
    render(<GpuStatusPage />)
    expect(await screen.findByText(/사용률 90% 이상 또는 75°C 이상이면/)).toBeInTheDocument()
  })

  it('요약과 카드 배지가 같은 기준으로 센다', async () => {
    render(<GpuStatusPage />)
    expect(await screen.findByText('12장')).toBeInTheDocument()
    // 노드 배지와 카드 배지가 같은 판정을 가리켜야 한다
    // (요약 카드의 '과부하'는 <dt>라 selector로 가른다)
    expect(screen.getByText('과부하 1장')).toBeInTheDocument()
    expect(screen.getAllByText('과부하', { selector: 'span' })).toHaveLength(1)
  })
})

describe('트레이너 현황', () => {
  it('구간을 바꾸면 집계가 달라진다', async () => {
    render(<TrainerStatusPage />)
    expect(await screen.findByText('24건')).toBeInTheDocument()

    await pick('일간')
    expect(await screen.findByText('3건')).toBeInTheDocument()

    await pick('월간')
    expect(await screen.findByText('96건')).toBeInTheDocument()
  })

  /* 건수만 세면 손쓸 수 없다 */
  it('실패한 작업의 사유를 위로 올린다', async () => {
    render(<TrainerStatusPage />)
    expect(await screen.findByText('실패한 작업 2건')).toBeInTheDocument()
    expect(screen.getByText(/genos-ai-01 GPU 2 과열로 중단/)).toBeInTheDocument()
  })

  /* 억지로 100%를 채우면 여유가 없는 것처럼 보인다 */
  it('남는 몫을 여유로 보여 준다', async () => {
    render(<TrainerStatusPage />)
    const idle = await screen.findByText('여유')
    expect(idle.parentElement).toHaveTextContent('5%')
  })
})

describe('준비 중 화면', () => {
  /* 껍데기 화면을 복제하지 않는다. 대신 무엇이 언제 오는지 말한다 */
  it('무엇을 할 화면인지와 언제 만드는지 말한다', () => {
    const menu = findMenu('users')
    expect(menu).not.toBeNull()
    render(<PlannedPage menu={menu as NonNullable<typeof menu>} />)
    expect(screen.getByText('계정·승인·권한 부여')).toBeInTheDocument()
    expect(screen.getByText(/운영·관리 단계에서 만듭니다/)).toBeInTheDocument()
  })
})
