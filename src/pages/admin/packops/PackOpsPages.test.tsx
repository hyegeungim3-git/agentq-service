import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PackStudioPage } from './PackStudioPage'
import { ToolDeployPage } from './ToolDeployPage'
import { blockedAgents, meetsMinimum, packMissing, pendingPromotion } from '@entities/packops/model'
import { DEPLOYMENTS, PACKS, TOOLS } from '@fixtures/packops'
import { DOMAIN_EXPOSURE } from '@fixtures/agentops'

describe('도메인 팩 스튜디오', () => {
  /* 비율만 보여 주면 무엇을 더 해야 하는지 알 수 없다 */
  it('빈 항목을 이름으로 말하고 필수는 따로 표시한다', async () => {
    render(<PackStudioPage />)
    // 문서가 없는 팩이 셋이라 모두 같은 배지를 단다
    expect(await screen.findAllByText(/업무 문서 없음\(필수\)/)).toHaveLength(3)
    // 필수 항목이 빈 팩 셋이 각각 같은 이유를 단다
    expect(screen.getAllByText(/이게 없으면 다른 발주처의 자료가 그대로 보입니다/)).toHaveLength(3)
  })

  /* 무엇을 먼저 해야 하는지 알려면 순서가 중요하다 */
  it('거의 다 된 팩을 위로 올린다', async () => {
    render(<PackStudioPage />)
    // 항목 배지도 li라서 팩 목록으로 좁힌다
    const list = await screen.findByRole('list', { name: '발주처 팩' })
    const packs = within(list)
      .getAllByRole('listitem')
      .filter((el) => el.parentElement === list)
    expect(packs[0]).toHaveTextContent('한빛정밀')
    expect(packs[1]).toHaveTextContent('공공기관')
  })

  it('포털에서 선택 가능한 팩 수를 센다', async () => {
    render(<PackStudioPage />)
    const dt = await screen.findByText('포털에서 선택 가능', { selector: 'dt' })
    expect(dt.nextElementSibling).toHaveTextContent('1개')
  })

  /* 애플리케이션 화면과 같은 사실을 반대쪽에서 본다 */
  it('팩 상태와 발주처 노출이 어긋나지 않는다', () => {
    for (const p of PACKS) {
      const exposure = DOMAIN_EXPOSURE.find((d) => d.domainId === p.domainId)
      expect(exposure, p.domainId).toBeDefined()
      expect(exposure?.dataReady, p.domainId).toBe(p.usable)
    }
  })

  it('팩 만들기는 성공한 척하지 않는다', async () => {
    render(<PackStudioPage />)
    await userEvent.type(await screen.findByLabelText('새 발주처 이름'), '한울에너지공사')
    await userEvent.click(screen.getByRole('button', { name: '팩 만들기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /포털에는 아무 발주처도 추가되지 않았습니다/,
    )
  })

  it('이름만으로는 팩이 되지 않는다고 말한다', async () => {
    render(<PackStudioPage />)
    expect(await screen.findByText(/이름만으로는 팩이 되지 않습니다/)).toBeInTheDocument()
  })
})

describe('도구 · 배포', () => {
  /* 도구는 끊겨도 서비스가 죽지 않아 더 늦게 발견된다 */
  it('끊긴 도구 때문에 못 도는 에이전트를 이름으로 말한다', async () => {
    render(<ToolDeployPage />)
    expect(await screen.findByText(/끊긴 도구 때문에 못 도는 에이전트 2종/)).toBeInTheDocument()
    expect(screen.getByText('안전관리계획 수립, 데이터 분석')).toBeInTheDocument()
    expect(screen.getByText(/서비스는 계속 돌고 있어 오류가 나지 않습니다/)).toBeInTheDocument()
  })

  it('끊긴 도구를 맨 위에 둔다', async () => {
    render(<ToolDeployPage />)
    const items = await screen.findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('PdM 센서 조회')
  })

  it('정상 도구도 끊겼을 때 멈추는 에이전트를 적는다', async () => {
    render(<ToolDeployPage />)
    expect(await screen.findByText(/끊기면 멈추는 에이전트 · 회의록 작성/)).toBeInTheDocument()
  })

  /* 목록만 나열하면 무엇이 아직 안 갔는지 훑어서 찾아야 한다 */
  it('운영에 안 나간 버전을 먼저 보여 준다', async () => {
    render(<ToolDeployPage />)
    await userEvent.click(screen.getByRole('tab', { name: '배포' }))
    expect(await screen.findByText(/운영에 안 나간 버전 3건/)).toBeInTheDocument()
    expect(screen.getByText(/사용자가 보고 있는 것은 운영 버전입니다/)).toBeInTheDocument()
  })

  it('운영 반영은 성공한 척하지 않는다', async () => {
    render(<ToolDeployPage />)
    await userEvent.click(screen.getByRole('tab', { name: '배포' }))
    await userEvent.click((await screen.findAllByRole('button', { name: '운영 반영' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/운영 버전은 그대로입니다/)
  })
})

describe('판정', () => {
  it('필수 항목이 없으면 최소 조건을 못 채운다', () => {
    const pub = PACKS.find((p) => p.domainId === 'public')
    expect(meetsMinimum(pub as NonNullable<typeof pub>)).toBe(false)
    expect(packMissing(pub as NonNullable<typeof pub>)).toContain('documents')
  })

  it('다 채운 팩은 빈 항목이 없다', () => {
    const mfg = PACKS.find((p) => p.domainId === 'manufacturing')
    expect(packMissing(mfg as NonNullable<typeof mfg>)).toEqual([])
  })

  it('끊긴 도구를 쓰는 에이전트를 중복 없이 모은다', () => {
    expect(blockedAgents(TOOLS)).toEqual(['안전관리계획 수립', '데이터 분석'])
  })

  /* 검증과 운영이 같으면 반영할 것이 없다 */
  it('검증과 운영 버전이 같으면 반영 대상이 아니다', () => {
    const targets = pendingPromotion(DEPLOYMENTS).map((x) => x.target)
    expect(targets).toEqual(['사용자 포털', '에이전트 실행기', '에이전트 정의 (13종)'])
    expect(targets).not.toContain('관리자 시스템')
  })
})
