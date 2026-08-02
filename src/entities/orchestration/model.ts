/**
 * 복합 업무 오케스트레이션 모델.
 *
 * 요청 하나가 여러 에이전트를 거쳐 산출물까지 가는 흐름이다.
 *
 * 이 화면의 위험은 **끝까지 갔으니 다 됐다고 읽히는 것**이다.
 * 중간 단계에서 사람이 봐야 할 것이 쌓여도 릴레이는 계속 진행되고,
 * 마지막에 문서번호가 찍히면 완결처럼 보인다.
 * 그래서 단계마다 확인 지점을 모으고, 마지막에 그 합계를 먼저 말한다.
 *
 * 단계는 새 fixture가 아니라 **각 에이전트의 API 경계를 실제로 호출**한다.
 * 따로 흉내 낸 결과를 두면 에이전트를 고쳐도 릴레이는 옛 값을 계속 보여 준다.
 */
import type { AgentId } from '@entities/agent/model'

export type StepStatus = 'pending' | 'running' | 'done' | 'failed'

export type OrchestrationStep = {
  id: string
  agentId: AgentId
  title: string
  /** 앞 단계에서 무엇을 넘겨받는가 */
  input: string
  /**
   * 실제로 호출하는 데이터 경계 함수.
   * 서버가 붙으면 이 자리가 엔드포인트가 된다 — 무엇이 바뀔지 화면이 보여 준다.
   */
  apiCall: string
}

export type StepOutcome = {
  status: StepStatus
  /** 다음 단계로 넘기는 값 */
  output: string | null
  /** 이 단계에서 사람이 확인해야 하는 것 */
  reviewPoints: string[]
  elapsedSeconds: number | null
  error: string | null
}

export type Scenario = {
  id: string
  title: string
  /** 무엇 때문에 시작되는가 */
  trigger: string
  /** 마지막에 나오는 것 */
  deliverable: string
  steps: OrchestrationStep[]
}

const STATUS_LABEL: Record<StepStatus, string> = {
  pending: '대기',
  running: '진행 중',
  done: '완료',
  failed: '실패',
}

export const stepStatusLabel = (s: StepStatus): string => STATUS_LABEL[s]

/** 릴레이 전체에서 사람이 봐야 하는 지점 — 끝까지 갔다고 다 된 게 아니다 */
export function totalReviewPoints(outcomes: StepOutcome[]): number {
  return outcomes.reduce((n, o) => n + o.reviewPoints.length, 0)
}

export function isComplete(outcomes: StepOutcome[], steps: OrchestrationStep[]): boolean {
  return outcomes.length === steps.length && outcomes.every((o) => o.status === 'done')
}
