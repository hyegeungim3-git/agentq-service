/**
 * 에이전트 운영 · 애플리케이션 구성.
 *
 * ⚠️ **에이전트 목록을 여기서 새로 만들지 않는다.** 카탈로그는
 * `entities/agent/model.ts`의 `AGENTS` 하나이고, 사용자 포털의 허브가 그것을 그린다.
 * 관리자가 목록을 따로 가지면 '관리자에는 있는데 포털에는 없는 에이전트'가 생긴다.
 * 여기서는 그 카탈로그에 **운영 정보만 얹는다.**
 *
 * 실행 건수만 보여 주면 잘 도는 것처럼 보인다. 실패율과, 그 에이전트가 기대는
 * 지식영역에 **못 찾는 문서가 있는지**를 함께 본다 — 답이 부실한 원인은
 * 대개 에이전트가 아니라 그 아래 데이터에 있다.
 */
import type { AgentId } from '@entities/agent/model'

export type AgentOps = {
  agentId: AgentId
  /** 쓰는 모델 id (`entities/llmops`의 모델) */
  modelId: string
  modelName: string
  /** 근거로 뒤지는 지식영역 id. 문서를 안 쓰면 빈 배열 */
  areaIds: string[]
  runs7d: number
  failed7d: number
  owner: string
  /** 사용자 포털에 열려 있는가 */
  exposed: boolean
}

export const failureRatio = (o: AgentOps): number | null =>
  o.runs7d === 0 ? null : o.failed7d / o.runs7d

/** 실패율이 높은 순 */
export function byFailure(list: AgentOps[]): AgentOps[] {
  return [...list].sort((a, b) => (failureRatio(b) ?? -1) - (failureRatio(a) ?? -1))
}

/** 한 번도 안 쓴 에이전트 — 0건을 '문제 없음'으로 읽으면 안 된다 */
export const unused = (list: AgentOps[]): AgentOps[] => list.filter((o) => o.runs7d === 0)

/** 앱에 열어 준 것 */
export type AppSurface = {
  id: string
  name: string
  audience: string
  /** 지금 열려 있는가 */
  live: boolean
  /** 못 여는 이유. 열려 있으면 null */
  blockedReason: string | null
  /** 이 앱이 여는 화면 */
  includes: string[]
}

export type DomainExposure = {
  domainId: string
  orgName: string
  /** 업무 데이터가 준비됐는가 */
  dataReady: boolean
  /** 열려 있는 에이전트 수 */
  openAgents: number
  note: string
}
