import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModelPage } from './ModelPage'
import { ReliabilityPage } from './ReliabilityPage'
import { QualityPage } from './QualityPage'
import { averageGain } from '@entities/llmops/model'
import { PIPELINES } from '@fixtures/llmops'

describe('LLM 설정', () => {
  it('모델을 고르기 전에는 상세를 지어내지 않는다', async () => {
    render(<ModelPage />)
    expect(await screen.findByText(/왼쪽에서 모델을 고르면/)).toBeInTheDocument()
  })

  it('고른 모델의 상세가 실제로 바뀐다', async () => {
    render(<ModelPage />)
    await userEvent.click(await screen.findByRole('button', { name: /GPT-OSS-120B/ }))
    expect(screen.getByText(/사내 문서를 근거로 답하는 주 모델/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Llama-3-Kor-Instruct/ }))
    expect(screen.getByText(/한국어 경량 모델/)).toBeInTheDocument()
    expect(screen.queryByText(/사내 문서를 근거로 답하는 주 모델/)).not.toBeInTheDocument()
  })

  /* 이유가 없으면 다시 켜도 되는지 아무도 모른다 */
  it('중지된 모델은 왜 껐는지 말한다', async () => {
    render(<ModelPage />)
    await userEvent.click(await screen.findByRole('button', { name: /Solar-10.7B/ }))
    expect(screen.getByText(/수치 인용 오류가 반복돼 중지했습니다/)).toBeInTheDocument()
    expect(screen.getByText(/지금 이 모델로 나가는 답변은 없습니다/)).toBeInTheDocument()
  })

  it('어떤 업무에 쓰이는지 보여 준다', async () => {
    render(<ModelPage />)
    await userEvent.click(await screen.findByRole('button', { name: /GPT-OSS-120B/ }))
    expect(screen.getByText('문서 사전 검토')).toBeInTheDocument()
  })

  /* 바꾼 줄 알고 닫는데 실제 답변이 그대로면 가장 위험하다 */
  it('설정 저장은 성공한 척하지 않는다', async () => {
    render(<ModelPage />)
    await userEvent.click(await screen.findByRole('button', { name: /EXAONE/ }))
    // range 입력은 타이핑이 아니라 값 변경으로 움직인다
    fireEvent.change(screen.getByLabelText(/온도/), { target: { value: '0.2' } })
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/답변은 그대로입니다/)
  })
})

describe('신뢰성 관리', () => {
  /* 안 잰 것을 0으로 세면 효과가 없어 보이고 평균이 무너진다 */
  it('측정 전 파이프라인을 평균에서 빼고 그렇다고 말한다', async () => {
    render(<ReliabilityPage />)
    expect(await screen.findByText(/아직 안 잰 것/)).toBeInTheDocument()
    expect(screen.getByText(/위 평균에 포함하지 않았습니다/)).toBeInTheDocument()
    expect(screen.getByText('측정 전')).toBeInTheDocument()
    expect(screen.getByText(/4개 측정값의 평균/)).toBeInTheDocument()
  })

  it('측정값에는 표본 수와 시점을 붙인다', async () => {
    render(<ReliabilityPage />)
    expect(await screen.findByText(/\(420건 · 2026-07-20\)/)).toBeInTheDocument()
  })

  it('탭을 바꾸면 내용이 실제로 바뀐다', async () => {
    render(<ReliabilityPage />)
    expect(await screen.findByText('Top-K')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: '출력 가드레일' }))
    expect(await screen.findByText('개인정보 마스킹')).toBeInTheDocument()
    expect(screen.queryByText('Top-K')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: '신뢰도 임계값' }))
    expect(await screen.findByText(/자동 응답 임계값 · 80%/)).toBeInTheDocument()
  })

  /* 끄기 전에 무엇이 통과하게 되는지 알아야 한다 */
  it('가드레일마다 껐을 때의 결과를 적는다', async () => {
    render(<ReliabilityPage />)
    await userEvent.click(await screen.findByRole('tab', { name: '출력 가드레일' }))
    expect(screen.getByText(/문서에 있던 개인정보가 답변에 그대로 실려 나갑니다/)).toBeInTheDocument()
    // 이미 꺼진 규칙은 '지금' 무슨 일이 벌어지는지로 쓴다
    expect(screen.getByText(/꺼져 있어 지금 · 긴 답변이 그대로 나갑니다/)).toBeInTheDocument()
  })

  it('가드레일 전환은 성공한 척하지 않는다', async () => {
    render(<ReliabilityPage />)
    await userEvent.click(await screen.findByRole('tab', { name: '출력 가드레일' }))
    await userEvent.click(screen.getAllByRole('button', { name: '끄기' })[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/실제 필터는 바뀌지 않았습니다/)
  })

  it('임계값이 무슨 뜻인지 함께 말한다', async () => {
    render(<ReliabilityPage />)
    await userEvent.click(await screen.findByRole('tab', { name: '신뢰도 임계값' }))
    expect(screen.getByText(/원문 확인 권장 표시를 붙이고/)).toBeInTheDocument()
    expect(screen.getByText(/'임계값을 넘겼다'는 것이 곧 '맞다'는 뜻은 아닙니다/)).toBeInTheDocument()
  })
})

describe('평균 계산', () => {
  it('측정된 것만 센다', () => {
    const r = averageGain(PIPELINES)
    expect(r.counted).toBe(5)
    // 안 잰 것을 0으로 세면 평균이 낮아진다
    const naive = PIPELINES.reduce((n, p) => n + (p.measurement.gain ?? 0), 0) / PIPELINES.length
    expect(r.value).not.toBeCloseTo(naive, 4)
  })

  it('하나도 안 쟀으면 평균을 만들지 않는다', () => {
    const none = PIPELINES.filter((p) => p.measurement.gain === null)
    expect(averageGain(none).value).toBeNull()
  })
})

describe('AI 품질 관리', () => {
  beforeEach(() => window.localStorage.clear())

  /* 정확 판정 사이에 섞이면 그냥 넘어간다 */
  it('할루시네이션 판정을 맨 위에 둔다', async () => {
    render(<QualityPage />)
    const items = await screen.findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('할루시네이션')
    expect(items[0]).toHaveTextContent(/모른다고 답했어야 합니다/)
  })

  /* 평균 신뢰도만 보여 주면 '높으니 괜찮다'로 읽힌다 */
  it('손봐야 하는 비율을 먼저 말한다', async () => {
    render(<QualityPage />)
    expect(await screen.findByText(/60%/)).toBeInTheDocument()
    expect(screen.getByText(/가 손봐야\s*하는 답변입니다/)).toBeInTheDocument()
  })

  it('판정 필터가 목록을 실제로 좁힌다', async () => {
    render(<QualityPage />)
    // 요약 카드에도 같은 숫자가 있어 목록 건수(p)로 좁힌다
    expect(await screen.findByText('5건', { selector: 'p' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: '수정 필요' }))
    expect(await screen.findByText('2건', { selector: 'p' })).toBeInTheDocument()
    expect(screen.queryByText(/모른다고 답했어야 합니다/)).not.toBeInTheDocument()
  })

  it('검토 의견을 안 남긴 건은 그렇다고 말한다', async () => {
    render(<QualityPage />)
    expect(await screen.findByText('남기지 않음')).toBeInTheDocument()
  })

  /* 안 적으면 전사 집계로 읽힌다 */
  it('사용자 피드백이 이 브라우저 것뿐임을 밝힌다', async () => {
    render(<QualityPage />)
    expect(await screen.findByText('이 브라우저에 남은 것만')).toBeInTheDocument()
    expect(screen.getByText(/이 브라우저에 남은 피드백이 없습니다/)).toBeInTheDocument()
    expect(screen.getByText(/어떤 질문이었는지도 이어 붙일 수\s*없습니다/)).toBeInTheDocument()
  })

  it('포털에서 누른 피드백을 집계한다', async () => {
    window.localStorage.setItem(
      'agentq.feedback.v1',
      JSON.stringify({
        'm-1': { verdict: 'down', reason: '근거가 부족하다' },
        'm-2': { verdict: 'down', reason: '근거가 부족하다' },
        'm-3': { verdict: 'up', reason: null },
      }),
    )
    render(<QualityPage />)
    const box = await screen.findByRole('region', { name: '사용자 피드백' })
    // 사유 목록에도 '2건'이 있어 dt 옆의 dd로 좁힌다
    expect(within(box).getByText('아쉬움').nextElementSibling).toHaveTextContent('2건')
    expect(within(box).getByText('도움됨').nextElementSibling).toHaveTextContent('1건')
    expect(within(box).getByText(/근거가 부족하다 ·/)).toBeInTheDocument()
  })
})
