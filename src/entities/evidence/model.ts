/**
 * 이행 증거 · MCP 서버 · 공유 볼륨.
 *
 * ⚠️ 감사 추적에서 가장 중요한 구분: **'이행했다'와 '이행을 증명할 수 있다'는
 * 다르다.** 책무를 지켰다고 체크만 해 두면, 감사에서 무엇을 근거로 지켰다고
 * 하는지 물었을 때 내놓을 것이 없다.
 *
 * 그래서 항목마다 **지금 남는 기록이 무엇이고 어디에 남는지**를 적고,
 * 아무 데도 안 남는 것을 먼저 드러낸다.
 */
import type { DutyKey } from '@entities/compliance/model'

/** 기록이 어디에 남는가 */
export type EvidenceStore = 'server' | 'browser' | 'none'

export const STORE_LABEL: Record<EvidenceStore, string> = {
  server: '서버 기록',
  browser: '브라우저에만',
  none: '남지 않음',
}

export type EvidenceItem = {
  duty: DutyKey
  /** 무엇으로 증명하는가 */
  what: string
  store: EvidenceStore
  /** 어느 화면에서 볼 수 있는가. 없으면 null */
  where: string | null
  /** 지금 상태에 대한 설명 */
  note: string
}

/** 아무 데도 안 남는 것 — 감사에서 내놓을 것이 없다 */
export const noRecord = (list: EvidenceItem[]): EvidenceItem[] =>
  list.filter((e) => e.store === 'none')

/** 브라우저에만 남는 것 — 그 사람 브라우저를 지우면 사라진다 */
export const browserOnly = (list: EvidenceItem[]): EvidenceItem[] =>
  list.filter((e) => e.store === 'browser')

/** 증명 가능한 비율 */
export function provableRatio(list: EvidenceItem[]): number {
  if (list.length === 0) return 0
  return list.filter((e) => e.store === 'server').length / list.length
}

export type McpServer = {
  id: string
  name: string
  /** 이 서버가 제공하는 도구 id (`fixtures/packops`의 도구) */
  toolIds: string[]
  connected: boolean
  /** 끊겼으면 이유 */
  downReason: string | null
  /** 마지막 응답 시각 */
  lastSeenAt: string
  /** 사내인가 외부인가 — 밖으로 나가는 것은 따로 봐야 한다 */
  external: boolean
}

/** 밖으로 데이터가 나가는 서버 */
export const externalServers = (list: McpServer[]): McpServer[] => list.filter((s) => s.external)

export type Volume = {
  id: string
  name: string
  /** 기가바이트 */
  usedGb: number
  capacityGb: number
  /** 이 볼륨을 쓰는 작업 공간 소유자 */
  users: string[]
  lastWriteAt: string
  /** 며칠째 아무도 안 썼는가 */
  idleDays: number
}

export const usedRatio = (v: Volume): number => (v.capacityGb === 0 ? 0 : v.usedGb / v.capacityGb)

export const FULL_THRESHOLD = 0.85
export const STALE_DAYS = 60

/** 곧 찰 볼륨 — 차면 학습이 멈춘다 */
export const nearlyFull = (list: Volume[]): Volume[] =>
  list.filter((v) => usedRatio(v) >= FULL_THRESHOLD)

/** 오래 안 쓴 볼륨 — 아무도 안 지운다 */
export const stale = (list: Volume[]): Volume[] =>
  list.filter((v) => v.idleDays >= STALE_DAYS)
