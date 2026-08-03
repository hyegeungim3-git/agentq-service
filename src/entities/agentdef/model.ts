/**
 * 에이전트 정의 · 시나리오 정의.
 *
 * 운영 화면(`agentops`)이 '지금 어떻게 돌고 있나'라면 여기는 **'무엇을 하도록
 * 정해 놓았나'**다. 목록은 여전히 카탈로그(`entities/agent/model.ts`) 하나를 쓴다.
 *
 * ⚠️ 이 화면에서 가장 중요한 것은 **사람 확인(HITL) 없이 나가는 에이전트**를
 * 드러내는 것이다. 능력 배지를 나열만 하면 'RAG·A2A·실행형'이 많을수록 좋아
 * 보이는데, 실제로 위험한 것은 **확인 없이 결과가 그대로 나가는 것**이다.
 *
 * 시나리오는 여러 에이전트를 잇는다. 중간에 하나가 못 돌면 시나리오 전체가
 * 멈추므로, **끊긴 도구를 쓰는 에이전트가 끼어 있는지**를 함께 본다.
 */
import type { AgentId } from '@entities/agent/model'

export type Capability = 'rag' | 'hitl' | 'a2a' | 'actionable'

export const CAPABILITY_LABEL: Record<Capability, string> = {
  rag: '문서 근거(RAG)',
  hitl: '사람 확인(HITL)',
  a2a: '에이전트 연계',
  actionable: '실행형',
}

export const CAPABILITIES: Capability[] = ['rag', 'hitl', 'a2a', 'actionable']

/** 결과를 어떻게 내놓는가 */
export type ResponseMode = 'grounded' | 'direct'

export const RESPONSE_MODE_LABEL: Record<ResponseMode, string> = {
  grounded: '근거 제시',
  direct: '직접 응답',
}

export type FlowStep = {
  order: number
  name: string
  /** 이 단계가 부르는 도구 id. 없으면 빈 배열 */
  toolIds: string[]
  /** 사람이 확인하는 지점인가 */
  humanCheck: boolean
}

export type AgentDefinition = {
  agentId: AgentId
  code: string
  version: string
  purpose: string
  capabilities: Capability[]
  responseMode: ResponseMode
  steps: FlowStep[]
  owner: string
}

export const has = (d: AgentDefinition, c: Capability): boolean => d.capabilities.includes(c)

/**
 * 사람 확인 없이 결과가 그대로 나가는 에이전트.
 *
 * 실행형이면서 확인이 없으면 더 위험하다 — 답을 내놓는 데서 끝나지 않고
 * 무언가를 실제로 한다.
 */
export const noHumanCheck = (list: AgentDefinition[]): AgentDefinition[] =>
  list.filter((d) => !has(d, 'hitl') && !d.steps.some((s) => s.humanCheck))

export const actingWithoutCheck = (list: AgentDefinition[]): AgentDefinition[] =>
  noHumanCheck(list).filter((d) => has(d, 'actionable'))

/** 정의된 단계 중 사람이 확인하는 지점 */
export const checkPoints = (d: AgentDefinition): FlowStep[] => d.steps.filter((s) => s.humanCheck)

export type ScenarioStep = {
  order: number
  agentId: AgentId
  what: string
}

export type ScenarioDefinition = {
  id: string
  title: string
  trigger: string
  steps: ScenarioStep[]
  /** 결과로 나오는 것 */
  output: string
  owner: string
  enabled: boolean
}

/** 시나리오가 부르는 에이전트 중 카탈로그에 없는 것 — 있으면 그 시나리오는 못 돈다 */
export function unknownAgents(s: ScenarioDefinition, known: AgentId[]): AgentId[] {
  return s.steps.map((x) => x.agentId).filter((id) => !known.includes(id))
}

/** 끊긴 도구를 쓰는 에이전트가 시나리오에 끼어 있는가 */
export function blockedBy(
  s: ScenarioDefinition,
  defs: AgentDefinition[],
  brokenToolIds: string[],
): { agentId: AgentId; toolId: string }[] {
  const out: { agentId: AgentId; toolId: string }[] = []
  for (const step of s.steps) {
    const def = defs.find((d) => d.agentId === step.agentId)
    if (!def) continue
    for (const fs of def.steps) {
      for (const t of fs.toolIds) {
        if (brokenToolIds.includes(t)) out.push({ agentId: step.agentId, toolId: t })
      }
    }
  }
  return out
}
