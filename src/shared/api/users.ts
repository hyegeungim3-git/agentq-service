import type {
  AccessLogEntry,
  ApprovalRequest,
  BlockRule,
  PlatformUser,
  UserRole,
  UserState,
} from '@entities/user/model'
import { ACCESS_LOGS, APPROVALS, BLOCK_RULES, LOG_GAPS, USERS } from '@fixtures/users'
import type { ApiResult } from './domains'

/**
 * 사용자 관리의 데이터 경계.
 *
 * **조회는 되고 변경은 안 된다.** 서버가 없으면 계정 상태를 바꿀 곳이 없다.
 * 성공한 척하면 관리자는 정지시킨 줄 알고 화면을 닫는다 — 실제로는 그 계정이
 * 그대로 살아 있다. 업로드와 같은 처리다(DECISIONS D-009).
 *
 * 걸러 내기는 **서버 질의 조건**으로 둔다. 전체를 내려받아 화면에서 거르면
 * 권한 없는 사용자의 정보까지 브라우저에 도착한다 — 서버가 걸러야 한다.
 */

export type UserFilter = {
  keyword: string
  role: UserRole | 'all'
  state: UserState | 'all'
}

const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function fetchUsers(
  filter: UserFilter,
  opts: { delayMs?: number | undefined } = {},
): Promise<ApiResult<PlatformUser[]>> {
  await wait(opts.delayMs ?? 0)
  // TODO(api-미확정): GET /users?keyword=&role=&state= 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  const kw = filter.keyword.trim().toLowerCase()
  const hit = USERS.filter((u) => {
    if (filter.role !== 'all' && u.role !== filter.role) return false
    if (filter.state !== 'all' && u.state !== filter.state) return false
    if (kw === '') return true
    return (
      u.name.toLowerCase().includes(kw) ||
      u.dept.toLowerCase().includes(kw) ||
      u.email.toLowerCase().includes(kw)
    )
  })
  return { ok: true, data: hit }
}

/**
 * 계정 상태 변경 — 지금은 반드시 실패한다.
 *
 * 화면에서 성공시키면 이 저장소가 없애려는 바로 그것이 된다.
 */
export function updateUserState(userId: string, next: UserState): Promise<ApiResult<never>> {
  void userId
  void next
  // TODO(api-미확정): PATCH /users/{id} 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '계정 상태를 바꾸지 못했습니다. 서버가 연결되지 않아 변경을 저장할 곳이 없습니다. 변경한 척하면 정지된 줄 알고 화면을 닫게 되므로 그대로 알립니다.',
  })
}

export function fetchApprovals(): Promise<ApiResult<ApprovalRequest[]>> {
  // TODO(api-미확정): GET /approvals 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: APPROVALS })
}

export function decideApproval(id: string, accept: boolean): Promise<ApiResult<never>> {
  void id
  void accept
  // TODO(api-미확정): POST /approvals/{id}:decide 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '승인 처리를 저장하지 못했습니다. 서버가 연결되지 않았습니다. 신청자에게는 아무 것도 전달되지 않았습니다.',
  })
}

export type LogFilter = { onlyDenied: boolean; keyword: string }

export function fetchAccessLogs(filter: LogFilter): Promise<ApiResult<AccessLogEntry[]>> {
  // TODO(api-미확정): GET /audit/access?denied=&keyword= 로 교체. 제거 조건 = 백엔드가 보관 정책을 확정.
  const kw = filter.keyword.trim().toLowerCase()
  const hit = ACCESS_LOGS.filter((l) => {
    if (filter.onlyDenied && l.result !== 'denied') return false
    if (kw === '') return true
    return (
      l.actor.toLowerCase().includes(kw) ||
      l.target.toLowerCase().includes(kw) ||
      l.ip.includes(kw)
    )
  })
  return Promise.resolve({ ok: true, data: hit })
}

/** 로그에 남지 않는 것 — 목록만 보여 주면 '여기 있는 게 전부'로 읽힌다 */
export function fetchLogGaps(): Promise<ApiResult<string[]>> {
  // TODO(api-미확정): GET /audit/coverage 로 교체. 제거 조건 = 백엔드가 보관 정책을 확정.
  return Promise.resolve({ ok: true, data: LOG_GAPS })
}

export function fetchBlockRules(): Promise<ApiResult<BlockRule[]>> {
  // TODO(api-미확정): GET /access-rules 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: BLOCK_RULES })
}

export function createBlockRule(rule: Omit<BlockRule, 'id' | 'createdAt'>): Promise<ApiResult<never>> {
  void rule
  // TODO(api-미확정): POST /access-rules 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '차단 규칙을 저장하지 못했습니다. 서버가 연결되지 않아 실제로는 아무 것도 차단되지 않습니다.',
  })
}
