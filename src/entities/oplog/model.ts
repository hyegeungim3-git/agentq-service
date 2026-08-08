/**
 * 통합 로그와 사용량.
 *
 * ⚠️ **접속 로그는 사용자 관리 > 접근 로그와 같은 데이터다.** 화면이 둘인 이유는
 * 보는 관점이 다르기 때문이다 — 저쪽은 계정 관점에서 거부된 접근을 먼저 보고,
 * 여기는 운영 관점에서 종류별로 훑는다. **데이터를 복제하지 않는다.**
 * 복제하면 어느 쪽이 진짜인지 알 수 없게 된다.
 *
 * 추출·출력 로그를 따로 둔 이유: 문서가 밖으로 나간 기록은 감사에서 가장 먼저
 * 보는 것이다. 다른 행위와 섞어 두면 찾을 수 없다.
 */

export type OpLogKind = 'access' | 'operation' | 'query' | 'export'

export const OPLOG_KIND_LABEL: Record<OpLogKind, string> = {
  access: '접속 로그',
  operation: '작업 로그',
  query: '질의 이력',
  export: '추출·출력 로그',
}

export const OPLOG_KINDS: OpLogKind[] = ['export', 'access', 'operation', 'query']

export type OpLogEntry = {
  id: string
  at: string
  actor: string
  dept: string
  ip: string
  action: string
  /** 무엇에 대해서인지. 없으면 null */
  detail: string | null
  /** 문서가 밖으로 나간 기록인가 */
  sensitive: boolean
}

/** 소비량 — 한도 대비 얼마나 썼는지 */
export type UsageBucket = {
  id: string
  label: string
  /** 이번 달 소비 토큰 */
  used: number
  /** 월 한도. 없으면 null */
  limit: number | null
}

export const bucketRatio = (b: UsageBucket): number | null =>
  b.limit === null || b.limit === 0 ? null : b.used / b.limit

/**
 * 이 속도면 한도를 언제 넘는가.
 *
 * '이번 달 80% 소비'만 보여 주면 남은 날짜를 머리로 계산해야 한다.
 * 넘을 것 같으면 며칠 뒤인지 말해 준다. 안 넘으면 null.
 */
export function daysToLimit(b: UsageBucket, elapsedDays: number, monthDays: number): number | null {
  if (b.limit === null || elapsedDays <= 0) return null
  const perDay = b.used / elapsedDays
  if (perDay <= 0) return null
  const remaining = b.limit - b.used
  if (remaining <= 0) return 0
  const days = Math.floor(remaining / perDay)
  return days < monthDays - elapsedDays ? days : null
}

/**
 * 청구 월 진행도 — **서버가 주는 값**이다.
 *
 * '이 속도면 며칠 뒤 한도를 넘는다'가 여기에 걸린다. 청구 주기는 요금제마다 달라
 * 브라우저가 달력으로 유추할 수 없다.
 */
export type BillingMonth = {
  /** 이번 주기에서 지난 일수 */
  elapsedDays: number
  /** 이번 주기의 총 일수 */
  totalDays: number
}
