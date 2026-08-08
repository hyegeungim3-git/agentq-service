import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PackStudioPage } from './PackStudioPage'
import { ToolDeployPage } from './ToolDeployPage'
import {
  blockedAgents,
  meetsMinimum,
  packMissing,
  pendingPromotion,
  type DomainPack,
} from '@entities/packops/model'
import { DEPLOYMENTS } from '@fixtures/packops'
import { fetchTools } from '@shared/api/packops'
import { DOMAIN_FIXTURES } from '@fixtures/domains'
import { PACKED_DOMAIN_IDS } from '@fixtures/packs'
import { fetchPacks } from '@shared/api/packops'
import { agentName } from '@entities/agent/model'
import { fetchDomainExposure } from '@shared/api/agentops'

/* 기대값을 손으로 적지 않는다. 발주처를 추가할 때마다 숫자를 고쳐야 하면
   결국 테스트를 숫자에 맞추게 되고, 그러면 아무것도 안 지킨다 */
const NO_PACK = DOMAIN_FIXTURES.filter((d) => !PACKED_DOMAIN_IDS.includes(d.id))

describe('도메인 팩 스튜디오', () => {
  /* 비율만 보여 주면 무엇을 더 해야 하는지 알 수 없다 */
  it('빈 항목을 이름으로 말하고 필수는 따로 표시한다', async () => {
    render(<PackStudioPage />)
    await screen.findByRole('list', { name: '발주처 팩' })
    // 팩이 없는 발주처만 필수 항목 배지를 단다
    expect(screen.queryAllByText(/업무 문서 없음\(필수\)/)).toHaveLength(NO_PACK.length)
    expect(screen.queryAllByText(/이게 없으면 다른 발주처의 자료가 그대로 보입니다/)).toHaveLength(
      NO_PACK.length,
    )
  })

  /* 무엇을 먼저 해야 하는지 알려면 순서가 중요하다 */
  it('거의 다 된 팩을 위로 올린다', async () => {
    render(<PackStudioPage />)
    // 항목 배지도 li라서 팩 목록으로 좁힌다
    const list = await screen.findByRole('list', { name: '발주처 팩' })
    const packs = within(list)
      .getAllByRole('listitem')
      .filter((el) => el.parentElement === list)
    // 팩이 있는 것이 먼저, 없는 것이 뒤
    const packed = DOMAIN_FIXTURES.filter((d) => PACKED_DOMAIN_IDS.includes(d.id))
    expect(packs[0]).toHaveTextContent(packed[0]?.orgName ?? '')
    if (NO_PACK.length > 0) {
      expect(packs[packs.length - 1]).toHaveTextContent(NO_PACK[NO_PACK.length - 1]?.orgName ?? '')
    }
  })

  it('포털에서 선택 가능한 팩 수를 센다', async () => {
    render(<PackStudioPage />)
    const dt = await screen.findByText('포털에서 선택 가능', { selector: 'dt' })
    expect(dt.nextElementSibling).toHaveTextContent(`${PACKED_DOMAIN_IDS.length}개`)
  })

  /* 애플리케이션 화면과 같은 사실을 반대쪽에서 본다 */
  it('팩 상태와 발주처 노출이 어긋나지 않는다', async () => {
    /* 예전에는 두 fixture를 비교했는데, 네 번째 발주처를 열자 한쪽만 바뀌어
       포털은 열렸는데 관리자는 '데이터 없음'이라고 말했다. 지금은 둘 다
       같은 레지스트리에서 나오므로 **경계 응답끼리** 대조한다 */
    const packs = await fetchPacks()
    const exposure = await fetchDomainExposure()
    expect(packs.ok && exposure.ok).toBe(true)
    if (!packs.ok || !exposure.ok) return
    for (const p of packs.data) {
      const e = exposure.data.find((x) => x.domainId === p.domainId)
      expect(e, p.domainId).toBeDefined()
      expect(e?.dataReady, p.domainId).toBe(p.usable)
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
    /* 순서는 정의 순서를 따른다 — 손으로 적던 때와 달라졌다 */
    expect(screen.getByText('데이터 분석, 안전관리계획 수립')).toBeInTheDocument()
    expect(screen.getByText(/서비스는 계속 돌고 있어 오류가 나지 않습니다/)).toBeInTheDocument()
  })

  /**
   * **도구도 발주처마다 다르다.** 하나만 두었을 때는 어느 발주처를 보든
   * MES가 떴다. 값이 실제로 갈리는지 본다.
   */
  it('발주처를 바꾸면 도구 목록이 그 발주처 것으로 바뀐다', async () => {
    render(<ToolDeployPage />)
    expect(await screen.findByText('MES 조회')).toBeInTheDocument()

    const select = await screen.findByLabelText('발주처')
    await userEvent.selectOptions(select, screen.getByRole('option', { name: /한성시청/ }))
    expect(await screen.findByText('민원 처리 대장 조회')).toBeInTheDocument()
    expect(screen.queryByText('MES 조회')).not.toBeInTheDocument()
    /* 이 발주처의 끊긴 도구는 강우 관측이고, 그래서 데이터 분석이 멈춘다 */
    expect(screen.getByText(/끊긴 도구 때문에 못 도는 에이전트 1종/)).toBeInTheDocument()
    expect(screen.getByText('데이터 분석', { selector: 'p' })).toBeInTheDocument()
  })

  /* 0을 안 보여 주면 '끊긴 게 없다'와 '안 봤다'를 구분할 수 없다 */
  it('끊긴 도구가 없는 발주처에서는 없다고 말한다', async () => {
    render(<ToolDeployPage />)
    const select = await screen.findByLabelText('발주처')
    await userEvent.selectOptions(select, screen.getByRole('option', { name: /새빛대학교병원/ }))
    expect(await screen.findByText(/끊긴 도구 없음/)).toBeInTheDocument()
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
  /* 판정 함수는 데이터가 아니라 규칙이다 — 팩이 늘어도 안 깨지게 값을 만들어 넣는다 */
  const pack = (filled: DomainPack['filled']): DomainPack => ({
    domainId: 'x',
    orgName: '예시',
    sector: 'public',
    filled,
    usable: filled.length > 0,
  })

  it('필수 항목이 없으면 최소 조건을 못 채운다', () => {
    const empty = pack([])
    expect(meetsMinimum(empty)).toBe(false)
    expect(packMissing(empty)).toContain('documents')
  })

  it('다 채운 팩은 빈 항목이 없다', () => {
    const full = pack(['documents', 'agentContent', 'scenarios', 'mapIntel', 'signals', 'branding'])
    expect(packMissing(full)).toEqual([])
  })

  /**
   * 사용처는 **정의에서 유도한다** — 손으로 적었더니 어긋났다.
   * 안전관리계획이 지식 검색을 부르는데 그 도구의 사용처에는 없었고,
   * 화면이 '끊기면 멈추는 에이전트'를 실제보다 적게 말하고 있었다.
   */
  it('끊긴 도구를 쓰는 에이전트를 경계가 유도해 준다', async () => {
    const res = await fetchTools('manufacturing')
    if (!res.ok) throw new Error(res.error)
    /* 경계는 **id**를 돌려준다 — 이름을 만들면 서버가 붙을 때 그 문자열까지
       서버가 줘야 하고 카탈로그와 갈라진다(AGENTS.md §9) */
    expect(blockedAgents(res.data).sort()).toEqual(['dataanalysis', 'safety'])
    /* 사람이 읽는 이름은 화면이 붙인다 */
    expect(blockedAgents(res.data).map(agentName).sort()).toEqual([
      '데이터 분석',
      '안전관리계획 수립',
    ])
  })

  /* 검증과 운영이 같으면 반영할 것이 없다 */
  it('검증과 운영 버전이 같으면 반영 대상이 아니다', () => {
    const targets = pendingPromotion(DEPLOYMENTS).map((x) => x.target)
    expect(targets).toEqual(['사용자 포털', '에이전트 실행기', '에이전트 정의'])
    expect(targets).not.toContain('관리자 시스템')
  })
})
