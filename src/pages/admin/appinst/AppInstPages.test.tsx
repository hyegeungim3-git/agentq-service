import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppInstancePage } from './AppInstancePage'
import { PipelinePage } from './PipelinePage'
import { down, dropped, survived, unused, worstStage } from '@entities/appinst/model'
import { APP_INSTANCES, PIPELINE_RUNS } from '@fixtures/appinst'
import { AREAS } from '@fixtures/knowledgebase'

const pick = async (label: string) => {
  const el = screen.getAllByText(label).find((n) => n.closest('label'))
  await userEvent.click(el?.closest('label') as HTMLElement)
}

describe('앱 인스턴스', () => {
  /* 묶음이 열려 있어도 개별 앱은 꺼져 있을 수 있다 */
  it('앱 묶음 화면과 나누는 기준을 밝힌다', async () => {
    render(<AppInstancePage />)
    expect(await screen.findByText(/사람들이 만든 개별 앱입니다/)).toBeInTheDocument()
    expect(screen.getByText('AI 서비스 > 애플리케이션')).toBeInTheDocument()
  })

  /* 이유가 없으면 다시 올려도 되는지 모른다 */
  it('내려간 앱은 왜 내렸는지 말한다', async () => {
    render(<AppInstancePage />)
    expect(await screen.findByText(/안전 문서 색인이 끝나지 않아 답이 부실해 내렸습니다/)).toBeInTheDocument()
    expect(screen.getByText(/PdM 센서 조회 도구가 끊겨 결과가 비어 나옵니다/)).toBeInTheDocument()
  })

  /* 0건은 '문제 없음'이 아니다 */
  it('열렸는데 아무도 안 쓰는 앱을 따로 센다', async () => {
    render(<AppInstancePage />)
    expect(await screen.findByText('열렸는데 7일간 0건')).toBeInTheDocument()
    expect(screen.getByText(/만들어 두고 잊힌 앱도 계속 자원을 잡고/)).toBeInTheDocument()
  })

  it('내려간 앱을 맨 위에 둔다', async () => {
    render(<AppInstancePage />)
    const list = await screen.findByRole('list', { name: '앱 인스턴스' })
    const items = [...list.children]
    expect(items[0]?.textContent).toContain('안전작업 안내 봇')
  })

  /* 같은 표를 세 벌 만들지 않는다 */
  it('유형 필터가 목록을 실제로 좁힌다', async () => {
    render(<AppInstancePage />)
    // '앱' 카드의 dd로 좁힌다 (열림/내려감 카드에도 같은 숫자가 있다)
    const count = async () => {
      const dt = await screen.findByText('앱', { selector: 'dt' })
      return dt.nextElementSibling?.textContent
    }
    expect(await count()).toBe('11개')
    await pick('보고서 생성')
    await screen.findByText('협력사 납품 실적 리포트')
    expect(await count()).toBe('3개')
    expect(screen.queryByText('내규 Q&A 봇')).not.toBeInTheDocument()
  })

  it('상태 변경은 성공한 척하지 않는다', async () => {
    render(<AppInstancePage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '올리기' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/사용자에게는 그대로 보입니다/)
  })
})

describe('RAG 파이프라인', () => {
  /* 결과만 보면 고칠 곳을 못 찾는다 */
  it('지식영역 화면과 나누는 기준을 밝힌다', async () => {
    render(<PipelinePage />)
    expect(await screen.findByText(/어느 단계에서 떨어졌는지/)).toBeInTheDocument()
  })

  it('가장 많이 떨어지는 단계를 먼저 말한다', async () => {
    render(<PipelinePage />)
    expect((await screen.findAllByText(/가장 많이 떨어지는 단계/)).length).toBeGreaterThan(0)
    // 단계 이름이 <b>로 갈라져 있어 문단 전체 텍스트로 찾는다
    const notes = screen.getAllByText(/가장 많이 떨어지는 단계/)
    expect(notes.some((n) => (n.textContent ?? '').includes('색인에서 3건'))).toBe(true)
  })

  /* '몇 건 떨어졌다'만으로는 손쓸 수 없다 */
  it('떨어진 이유를 건수와 함께 적는다', async () => {
    render(<PipelinePage />)
    expect(await screen.findByText(/스캔 이미지라 글자를 뽑지 못함 — 1건/)).toBeInTheDocument()
    expect(screen.getByText(/암호로 잠긴 파일 — 1건/)).toBeInTheDocument()
  })

  /* 마지막 단계 숫자만 보면 다 된 것처럼 보인다 */
  it('안 끝난 실행을 끝난 것처럼 그리지 않는다', async () => {
    render(<PipelinePage />)
    expect(await screen.findByText('진행 중')).toBeInTheDocument()
    expect(screen.getByText(/아직 안 끝났습니다/)).toBeInTheDocument()
  })

  it('사유가 없는 손실도 그렇다고 말한다', async () => {
    render(<PipelinePage />)
    expect(await screen.findByText(/떨어진 사유가 기록되지 않았습니다/)).toBeInTheDocument()
  })
})

describe('계산과 정합', () => {
  it('단계별 손실을 구한다', () => {
    const safety = PIPELINE_RUNS.find((r) => r.id === 'run-safety')
    const stages = (safety as NonNullable<typeof safety>).stages
    expect(dropped(stages[1] as NonNullable<(typeof stages)[0]>)).toBe(2)
    expect(worstStage(stages)?.stage).toBe('index')
    expect(survived(stages)).toBe(58)
  })

  /* 두 화면의 숫자가 어긋나면 어느 쪽이 사실인지 알 수 없다 */
  it('파이프라인 결과가 지식영역 화면과 맞는다', () => {
    for (const run of PIPELINE_RUNS) {
      const area = AREAS.find((a) => a.id === run.areaId)
      expect(area, run.areaId).toBeDefined()
      if (run.finishedAt === null) continue
      expect(run.stages[0]?.incoming, run.areaId).toBe(area?.registered)
      expect(survived(run.stages), run.areaId).toBe(area?.searchable)
    }
  })

  it('내려간 앱과 안 쓰는 앱을 가른다', () => {
    expect(down(APP_INSTANCES).map((a) => a.id)).toEqual(['a-1655', 'a-1580'])
    expect(unused(APP_INSTANCES).map((a) => a.id)).toEqual(['a-1610'])
  })
})
