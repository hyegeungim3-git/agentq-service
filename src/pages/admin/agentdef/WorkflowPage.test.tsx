import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkflowPage } from './WorkflowPage'
import { TrainingPage } from '@pages/admin/mlops/TrainingPage'
import { ToolDeployPage } from '@pages/admin/packops/ToolDeployPage'
import {
  actsWithoutReview,
  branchNodes,
  successRatio,
  untakenBranches,
} from '@entities/workflow/model'
import { WORKFLOWS } from '@fixtures/workflow'
import { TRAIN_RUNS } from '@fixtures/mlops'
import { pendingPromotion } from '@entities/packops/model'
import { DEPLOYMENTS } from '@fixtures/packops'

const pick = async (label: string) => {
  const el = screen.getAllByText(label).find((n) => n.closest('label'))
  await userEvent.click(el?.closest('label') as HTMLElement)
}

describe('워크플로우', () => {
  /* 시나리오는 선형, 워크플로우는 갈림 — 나누는 기준을 밝힌다 */
  it('시나리오 빌더와 나누는 기준을 밝힌다', async () => {
    render(<WorkflowPage />)
    expect(await screen.findByText(/조건에 따라 길이 갈리는 흐름입니다/)).toBeInTheDocument()
    expect(screen.getByText(/어느 길로 갔는지 알 수\s*없어서 따로 둡니다/)).toBeInTheDocument()
  })

  /* 답을 내놓는 데서 끝나지 않고 무언가를 실제로 한다 */
  it('사람 검토 없이 실행까지 가는 워크플로우를 먼저 말한다', async () => {
    render(<WorkflowPage />)
    expect(await screen.findByText(/사람 검토 없이 실행까지 가는 워크플로우 1건/)).toBeInTheDocument()
    // 경고 상자와 목록 양쪽에 나온다
    expect(screen.getAllByText(/신규 입사자 계정 준비/).length).toBe(2)
  })

  /* 성공률만 보면 어디서 실패했는지 모른다 */
  it('실패가 몰린 노드를 이름으로 적는다', async () => {
    render(<WorkflowPage />)
    expect(await screen.findByText(/에서 2회 멈췄습니다/)).toBeInTheDocument()
    expect(screen.getByText(/PdM 센서 조회 도구가 끊겨 진단을 못 했습니다/)).toBeInTheDocument()
  })

  /* 죽은 길이거나 조건이 틀렸다 */
  it('한 번도 안 탄 분기를 드러낸다', async () => {
    render(<WorkflowPage />)
    expect(await screen.findByText(/한 번도 안 탄 길 1개 \(낮음\)/)).toBeInTheDocument()
  })

  /* 실행이 없으면 성공률 100%가 아니라 잰 적이 없는 것이다 */
  it('실행이 없는 워크플로우를 성공률로 그리지 않는다', async () => {
    render(<WorkflowPage />)
    expect(await screen.findByText('· 실행 없음')).toBeInTheDocument()
  })

  it('상태 변경은 성공한 척하지 않는다', async () => {
    render(<WorkflowPage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '끄기' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/지금 도는 흐름은 그대로입니다/)
  })
})

describe('학습 유형', () => {
  /* 표 모양이 같아 네 벌 만들지 않는다 */
  it('유형 필터가 목록을 실제로 좁힌다', async () => {
    render(<TrainingPage />)
    const count = async () => {
      const dt = await screen.findByText('작업', { selector: 'dt' })
      return dt.nextElementSibling?.textContent
    }
    expect(await count()).toBe('7건')
    await pick('임베딩 학습')
    expect(await count()).toBe('1건')
    expect(screen.getByText('EMB-005')).toBeInTheDocument()
    expect(screen.queryByText('JOB-992')).not.toBeInTheDocument()
  })

  /* 설정이 없으면 같은 결과를 다시 만들 수 없다 */
  it('유형마다 다른 설정을 보여 준다', async () => {
    render(<TrainingPage />)
    // 같은 설정으로 돈 작업이 둘이다(JOB-992·JOB-974)
    expect((await screen.findAllByText(/LoRA rank 16 · 학습률 2e-4 · epoch 3/)).length).toBe(2)
    await pick('리랭킹 학습')
    expect(await screen.findByText(/Top-K 50 · 음성 표본 하드 네거티브 8/)).toBeInTheDocument()
  })

  it('설정이 없는 작업을 재현 불가로 표시한다', async () => {
    render(<TrainingPage />)
    expect(await screen.findByText(/기록 없음 — 재현할 수 없습니다/)).toBeInTheDocument()
  })

  it('네 유형이 모두 fixture에 있다', () => {
    for (const k of ['llm', 'vlm', 'embedding', 'rerank'] as const) {
      expect(
        TRAIN_RUNS.some((r) => r.kind === k),
        k,
      ).toBe(true)
    }
  })
})

describe('태스크플로우 배포', () => {
  /* 정의가 바뀌면 답이 달라진다 — 앱 버전보다 더 조심해야 한다 */
  it('에이전트 정의도 배포 대상으로 보여 준다', async () => {
    render(<ToolDeployPage />)
    await userEvent.click(screen.getByRole('tab', { name: '배포' }))
    // 미반영 경고와 표 양쪽에 나온다
    expect((await screen.findAllByText(/에이전트 정의/)).length).toBeGreaterThan(1)
    expect(screen.getByText(/태스크플로우 빌더에서 고친 정의는/)).toBeInTheDocument()
  })

  it('정의의 검증본이 운영에 안 나간 것을 잡는다', () => {
    const targets = pendingPromotion(DEPLOYMENTS).map((x) => x.target)
    expect(targets).toContain('에이전트 정의')
  })
})

describe('판정', () => {
  it('실행 노드가 있는데 검토가 없는 것만 잡는다', () => {
    expect(actsWithoutReview(WORKFLOWS).map((w) => w.id)).toEqual(['wf-2'])
  })

  it('안 탄 분기를 골라낸다', () => {
    const wf1 = WORKFLOWS.find((w) => w.id === 'wf-1')
    expect(untakenBranches(wf1 as NonNullable<typeof wf1>).map((u) => u.branch)).toEqual(['낮음'])
    expect(branchNodes(wf1 as NonNullable<typeof wf1>)).toHaveLength(1)
  })

  /* 실행이 없으면 잰 적이 없는 것이다 */
  it('실행이 없으면 성공률을 만들지 않는다', () => {
    const wf3 = WORKFLOWS.find((w) => w.id === 'wf-3')
    expect(successRatio(wf3 as NonNullable<typeof wf3>)).toBeNull()
    const wf1 = WORKFLOWS.find((w) => w.id === 'wf-1')
    expect(successRatio(wf1 as NonNullable<typeof wf1>)).toBeCloseTo(0.75, 5)
  })
})
