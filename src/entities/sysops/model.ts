/**
 * HR 연계 · API · 외부 연동.
 *
 * ⚠️ **API 키는 이 모델에 없다.** 발급 시 한 번만 보여 주고 그 뒤로는 서버도
 * 원문을 갖지 않는 것이 맞다. 관리 화면에 키를 늘어놓으면 화면을 여는 사람 모두가
 * 모든 키를 갖게 된다 — 목록에 있으면 언젠가 캡처되고 공유된다.
 *
 * HR 동기화는 **계정을 만들고 없애는 일**이다. 퇴직 처리가 밀리면 접속이 열린 채로
 * 남는다. 그래서 '몇 건 처리했다'가 아니라 **못 처리한 것과 밀린 시간**을 드러낸다.
 */

export type HrChangeKind = 'join' | 'leave' | 'move' | 'concurrent' | 'absence'

export const HR_CHANGE_LABEL: Record<HrChangeKind, string> = {
  join: '신규입사',
  leave: '퇴직',
  move: '부서이동',
  concurrent: '겸직',
  absence: '부재',
}

export type HrChange = {
  id: string
  name: string
  kind: HrChangeKind
  dept: string
  syncedOn: string
  /** 이 변경으로 계정에 무슨 일이 있었는가 */
  effect: string
  /** 처리에 실패했으면 이유. 성공이면 null */
  failedReason: string | null
}

export type HrSyncState = {
  connected: boolean
  lastSyncAt: string
  nextSyncAt: string
  totalUsers: number
  changes: HrChange[]
}

/** 처리 못 한 변경 — 퇴직이 밀리면 접속이 열려 있다 */
export const failedChanges = (s: HrSyncState): HrChange[] =>
  s.changes.filter((c) => c.failedReason !== null)

/** 밀린 것 중 위험한 것(퇴직·부재)만 */
export const riskyPending = (s: HrSyncState): HrChange[] =>
  failedChanges(s).filter((c) => c.kind === 'leave' || c.kind === 'absence')

export type ApiState = 'active' | 'beta' | 'stopped'

export const API_STATE_LABEL: Record<ApiState, string> = {
  active: '운영',
  beta: '베타',
  stopped: '중지',
}

export type ApiEntry = {
  id: string
  name: string
  path: string
  version: string
  auth: string
  state: ApiState
  callsToday: number
  approvedOn: string
  /** 베타·중지면 왜인지 */
  note: string | null
}

export type PromptEntry = {
  id: string
  target: string
  version: string
  updatedOn: string
  /** 무엇을 정하는 프롬프트인가 */
  purpose: string
  /** 바꿨을 때 무엇이 달라지는가 */
  affects: string
}

/** 외부 시스템 연동 */
export type Integration = {
  id: string
  name: string
  kind: string
  connected: boolean
  lastOkAt: string
  /** 끊겼으면 무엇이 멈추는지 */
  impactIfDown: string
  /** 끊긴 이유. 정상이면 null */
  downReason: string | null
}

export const brokenIntegrations = (list: Integration[]): Integration[] =>
  list.filter((i) => !i.connected)
