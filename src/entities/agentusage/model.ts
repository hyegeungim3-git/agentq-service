/**
 * 에이전트 사용 현황 — 이 발주처에서 무엇을 얼마나 쓰는가.
 *
 * 원본 허브에 있던 실행 횟수·순위·즐겨찾기와 오른쪽 '내 에이전트 활동' 패널의 재료다(D-014).
 *
 * ⚠️ **이 수는 서버가 센 것이 아니다.** 지금은 팩이 들고 있고, 서버가 붙으면
 * 이용 통계에서 온다. 그때 화면은 안 바뀐다 — 출처만 바뀐다.
 *
 * 순위를 데이터로 저장하지 않는다. 횟수에서 계산한다 — 저장해 두면 횟수가 바뀐 뒤에도
 * 옛 순위가 남고, 두 수가 서로 다른 말을 하게 된다(중대재해 화면의 초록색과 같은 함정).
 */
import type { AgentId } from '@entities/agent/model'

export type AgentUsage = {
  agentId: AgentId
  /** 이번 달 실행 횟수 */
  runs: number
  /** 사용자가 즐겨찾기에 둔 것 */
  favorite: boolean
}

export type RecentRun = {
  id: string
  agentId: AgentId
  /** 무엇을 했는가 — 한 줄 */
  title: string
  /** 결과물이나 건수 */
  detail: string
  at: string
}

/**
 * 지금 하면 좋을 일.
 *
 * ⚠️ **AI가 판단한 것이 아니다.** 팩이 적어 둔 업무 맥락이다. 서버가 붙으면
 * 실제 업무 상태에서 나온다. 화면이 'AI 추천'이라고 부르지 않는 이유다 —
 * 추천의 근거를 댈 수 없으면 그렇게 부르면 안 된다.
 */
export type WorkHint = {
  id: string
  title: string
  body: string
  /** 이어서 열 에이전트 */
  agentId: AgentId
  /** 버튼에 적을 말 */
  action: string
}

export type AgentActivity = {
  usage: AgentUsage[]
  recent: RecentRun[]
  hints: WorkHint[]
}

/** 많이 쓴 순. 같으면 원래 순서를 지킨다 */
export const byRuns = (list: AgentUsage[]): AgentUsage[] =>
  [...list].sort((a, b) => b.runs - a.runs)

/** 이 에이전트가 몇 번째로 많이 쓰였나. 목록에 없으면 null */
export function rankOf(list: AgentUsage[], id: AgentId): number | null {
  const i = byRuns(list).findIndex((u) => u.agentId === id)
  return i < 0 ? null : i + 1
}

export const runsOf = (list: AgentUsage[], id: AgentId): number =>
  list.find((u) => u.agentId === id)?.runs ?? 0

export const isFavorite = (list: AgentUsage[], id: AgentId): boolean =>
  list.find((u) => u.agentId === id)?.favorite ?? false

/** 이번 달 전체 실행 수 */
export const totalRuns = (list: AgentUsage[]): number => list.reduce((n, u) => n + u.runs, 0)

/**
 * 최근 쓴 순서대로 몇 개 — 허브 위 '최근 사용' 칩.
 *
 * 기본값을 두지 않는다. 명세 생성기가 **기본 인자를 만나면 스키마를 못 만든다**
 * (2026-08-09에 깨졌다). 부르는 쪽이 몇 개인지 적는 편이 읽기에도 낫다.
 */
export const recentlyUsed = (recent: RecentRun[], limit: number): AgentId[] => {
  const seen: AgentId[] = []
  for (const r of recent) {
    if (!seen.includes(r.agentId)) seen.push(r.agentId)
    if (seen.length === limit) break
  }
  return seen
}
