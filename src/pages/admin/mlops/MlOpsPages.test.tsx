import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatasetPage } from './DatasetPage'
import { DevEnvPage } from './DevEnvPage'
import { RegistryPage } from './RegistryPage'
import { TrainingPage } from './TrainingPage'
import { EvaluationPage } from './EvaluationPage'
import {
  idleHolding,
  leaky,
  unevaluated,
  unlicensed,
  untraceable,
  untrusted,
} from '@entities/mlops/model'
import { DATASETS, EVAL_RESULTS, MODEL_VERSIONS, WORKSPACES } from '@fixtures/mlops'

/* 인프라 수치는 숫자 자체가 전부다 — 지어낸 값을 실측처럼 그리면 거짓 계기판이 된다 */
describe('P4 공통', () => {
  it('다섯 화면 모두 예시 값임을 먼저 말한다', () => {
    for (const Page of [DatasetPage, DevEnvPage, RegistryPage, TrainingPage, EvaluationPage]) {
      const { unmount } = render(<Page />)
      expect(screen.getAllByText(/서버 미연결 — 예시 값/).length).toBeGreaterThan(0)
      unmount()
    }
  })
})

describe('데이터 관리', () => {
  /* 학습에도 쓴 데이터로 평가하면 점수가 부풀려진다 */
  it('학습·평가 겸용 데이터셋을 경고한다', async () => {
    render(<DatasetPage />)
    expect(await screen.findByText(/학습과 평가에 같이 쓰는 데이터셋 1건/)).toBeInTheDocument()
    expect(screen.getByText(/배포 판단에 쓰면 안 됩니다/)).toBeInTheDocument()
  })

  it('출처를 모르는 데이터의 뒷일을 말한다', async () => {
    render(<DatasetPage />)
    expect(await screen.findByText(/그 데이터로 학습한 모델까지 다시 만들어야 합니다/)).toBeInTheDocument()
  })

  /* '포함'만 쓰면 처리했는지 안 했는지 알 수 없다 */
  it('개인정보를 어떻게 처리했는지 적는다', async () => {
    render(<DatasetPage />)
    expect(await screen.findByText(/학습 전 가명 처리했고 원본은 별도 보관합니다/)).toBeInTheDocument()
  })
})

describe('개발 환경', () => {
  it('놀면서 GPU를 잡고 있는 작업 공간을 먼저 말한다', async () => {
    render(<DevEnvPage />)
    expect(await screen.findByText(/7일 넘게 놀면서 GPU를 잡고 있는 작업 공간 1건 \(GPU 2장\)/)).toBeInTheDocument()
    // 경고 상자와 표 양쪽에 나온다
    expect(screen.getAllByText(/한지민/).length).toBe(2)
  })

  /* 화면이 판단하지 않는다 — 정책이 없다 */
  it('자동 회수 기준이 없다고 밝힌다', async () => {
    render(<DevEnvPage />)
    expect(await screen.findByText(/자동 회수 기준은 정해지지 않았습니다/)).toBeInTheDocument()
  })

  it('회수는 성공한 척하지 않는다', async () => {
    render(<DevEnvPage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '회수' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/GPU는 그대로 잡혀 있습니다/)
  })
})

describe('모델 레지스트리', () => {
  /* 운영 중인데 무슨 데이터로 학습했는지 모르면 삭제 요청에 답할 수 없다 */
  it('계보가 끊긴 모델을 맨 위에 올린다', async () => {
    render(<RegistryPage />)
    expect(await screen.findByText(/계보가 끊긴 모델 1건/)).toBeInTheDocument()
    expect(screen.getByText(/다시 학습해야\s*하는지 판단할 수 없습니다/)).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('EXAONE-3.0-7.8B')
  })

  it('평가 없이 운영 중인 모델을 드러낸다', async () => {
    render(<RegistryPage />)
    expect(await screen.findByText(/평가 기록 없이 운영 중인 모델/)).toBeInTheDocument()
  })

  /* 빈칸으로 두면 못 적은 것인지 없는 것인지 알 수 없다 */
  it('없는 계보를 빈칸이 아니라 기록 없음으로 쓴다', async () => {
    render(<RegistryPage />)
    expect((await screen.findAllByText('기록 없음')).length).toBeGreaterThan(0)
  })
})

describe('학습 · 튜닝', () => {
  /* 같은 작업을 다른 각도로 본다 — 데이터를 복제하지 않는다 */
  it('트레이너 현황과의 관계를 밝힌다', async () => {
    render(<TrainingPage />)
    expect(await screen.findByText(/같은 작업을 다른 각도로 보는 것이라 데이터를 복제하지 않았습니다/)).toBeInTheDocument()
  })

  it('데이터 기록 없이 돈 작업을 경고한다', async () => {
    render(<TrainingPage />)
    expect(await screen.findByText(/학습 데이터 기록이 없는 작업 1건/)).toBeInTheDocument()
    expect(screen.getByText(/이런 작업에서 나온 모델은 계보가 끊깁니다/)).toBeInTheDocument()
  })

  it('실패한 작업을 맨 위에 둔다', async () => {
    render(<TrainingPage />)
    const items = await screen.findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('JOB-988')
  })
})

describe('모델 평가', () => {
  /* 점수를 나란히 세우면 큰 숫자가 이긴다 */
  it('믿을 수 없는 결과를 순위에서 빼고 이유를 적는다', async () => {
    render(<EvaluationPage />)
    expect(await screen.findByText(/믿을 수 없는 평가 결과 1건 — 순위에서 뺐습니다/)).toBeInTheDocument()
    expect(screen.getByText(/부풀려진 점수를 같은 줄에 두면 잘못된\s*모델을 고르게 되므로/)).toBeInTheDocument()
    expect(screen.getByText('믿을 수 있는 결과 4건')).toBeInTheDocument()
  })

  it('부풀려진 점수가 순위 표에 없다', async () => {
    render(<EvaluationPage />)
    const table = await screen.findByRole('table')
    expect(table).not.toHaveTextContent('95.8%')
    expect(table).toHaveTextContent('88.4%')
  })

  it('평가셋이 다르면 비교할 수 없다고 말한다', async () => {
    render(<EvaluationPage />)
    expect(await screen.findByText(/같은 평가셋으로 잰 것끼리만 비교할 수 있습니다/)).toBeInTheDocument()
  })
})

describe('판정', () => {
  it('학습·평가 겸용과 출처 미확인을 골라낸다', () => {
    expect(leaky(DATASETS).map((d) => d.id)).toEqual(['ds-reg'])
    expect(unlicensed(DATASETS).map((d) => d.id)).toEqual(['ds-web'])
  })

  /* GPU를 안 잡은 유휴는 급하지 않다 */
  it('GPU를 잡은 유휴만 잡는다', () => {
    expect(idleHolding(WORKSPACES).map((w) => w.id)).toEqual(['w-3'])
    expect(WORKSPACES.find((w) => w.id === 'w-4')?.idleDays).toBeGreaterThan(7)
  })

  it('학습 작업이나 데이터가 없으면 계보가 끊긴 것이다', () => {
    expect(untraceable(MODEL_VERSIONS).map((m) => m.id)).toEqual(['mv-3'])
  })

  it('운영 중인데 평가가 없는 모델을 잡는다', () => {
    expect(unevaluated(MODEL_VERSIONS, EVAL_RESULTS).map((m) => m.id)).toEqual(['mv-3'])
  })

  it('학습셋과 겹친 평가를 골라낸다', () => {
    expect(untrusted(EVAL_RESULTS).map((e) => e.id)).toEqual(['ev-2'])
  })
})
