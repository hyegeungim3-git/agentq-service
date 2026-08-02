/**
 * 플랫폼 사용자 — 계정·승인·할당량·접근 기록·차단.
 *
 * ⚠️ **권한 규칙은 프론트가 정하지 않는다**(SCOPE-PLAN §4, API-PROPOSAL §3).
 * 누가 무엇을 할 수 있는지는 서버가 판정해 `permissions`로 내려 주고,
 * 화면은 그 값을 그리기만 한다. 화면에 규칙을 하드코딩하면 서버 규칙과
 * 어긋나는 순간 **화면에서는 되는데 서버가 막는** 상태가 된다.
 *
 * 상태·역할은 코드로 받는다. 표시 문자열과 색은 화면이 정한다.
 */

export type UserRole = 'member' | 'manager' | 'admin'
export type UserState = 'active' | 'suspended' | 'pending'

export const ROLE_LABEL: Record<UserRole, string> = {
  member: '일반',
  manager: '부서 관리자',
  admin: '시스템 관리자',
}

export const STATE_LABEL: Record<UserState, string> = {
  active: '사용 중',
  suspended: '정지',
  pending: '승인 대기',
}

export const USER_ROLES: UserRole[] = ['member', 'manager', 'admin']
export const USER_STATES: UserState[] = ['active', 'suspended', 'pending']

/** 기간당 한도. 서버가 집계 시각을 함께 준다 — 언제 기준인지 모르면 숫자를 못 믿는다 */
export type Quota = {
  /** 월 요청 한도. 무제한이면 null */
  limit: number | null
  used: number
  /** 집계 기준 시각 */
  countedAt: string
}

export type PlatformUser = {
  id: string
  name: string
  dept: string
  email: string
  role: UserRole
  state: UserState
  /** 한 번도 접속하지 않았으면 null — 0으로 두면 오늘 접속한 것처럼 읽힌다 */
  lastSeenAt: string | null
  quota: Quota
}

/** 한도를 넘었는가. limit이 null이면 넘을 수 없다 */
export const isOverQuota = (u: PlatformUser): boolean =>
  u.quota.limit !== null && u.quota.used > u.quota.limit

/** 한도 대비 사용률. 무제한이면 null — 0으로 두면 안 쓴 것처럼 보인다 */
export function quotaRatio(u: PlatformUser): number | null {
  if (u.quota.limit === null || u.quota.limit === 0) return null
  return u.quota.used / u.quota.limit
}

export type ApprovalKind = 'signup' | 'role' | 'quota'

export const APPROVAL_LABEL: Record<ApprovalKind, string> = {
  signup: '가입 신청',
  role: '권한 변경',
  quota: '한도 상향',
}

export type ApprovalRequest = {
  id: string
  kind: ApprovalKind
  applicant: string
  dept: string
  requestedAt: string
  /** 무엇을 요청했는가 — 사람이 읽고 판단할 근거 */
  detail: string
  /** 신청자가 적은 사유. 안 적었으면 null — 빈 문자열로 두면 적은 줄 안다 */
  reason: string | null
}

/** 며칠 기다렸는가 */
export function waitingDays(req: ApprovalRequest, today: string): number {
  const a = Date.parse(`${req.requestedAt}T00:00:00Z`)
  const b = Date.parse(`${today}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.max(0, Math.round((b - a) / 86_400_000))
}

export type AccessResult = 'ok' | 'denied'

export type AccessLogEntry = {
  id: string
  at: string
  actor: string
  action: string
  target: string
  ip: string
  result: AccessResult
  /** 거부됐으면 왜인지. 허용이면 null */
  deniedReason: string | null
}

export type BlockRule = {
  id: string
  kind: 'ip' | 'account'
  value: string
  reason: string
  /** 만료일. 무기한이면 null */
  until: string | null
  createdBy: string
  createdAt: string
}

/**
 * 아직 유효한 규칙인가.
 *
 * 만료된 규칙을 '차단 중'으로 그리면 막고 있다고 믿게 된다 —
 * 실제로는 이미 뚫려 있다.
 */
export const isActiveRule = (r: BlockRule, today: string): boolean =>
  r.until === null || r.until >= today
