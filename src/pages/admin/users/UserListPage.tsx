import { useState } from 'react'
import {
  ROLE_LABEL,
  STATE_LABEL,
  USER_ROLES,
  USER_STATES,
  type UserRole,
  type UserState,
} from '@entities/user/model'
import { fetchUsers, updateUserState, type UserFilter } from '@shared/api/users'
import { useRemote } from '@features/remote/useRemote'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'
import { AdminButton } from '@widgets/admin-shell/AdminControls'

/**
 * 사용자 목록.
 *
 * 검색·필터는 **서버 질의 조건**이다. 전체를 내려받아 화면에서 거르면 권한 없는
 * 사용자의 정보까지 브라우저에 도착한다 — 서버가 걸러야 한다(API-PROPOSAL §3-3).
 *
 * 상태 변경은 **성공한 척하지 않는다.** 서버가 없으면 저장할 곳이 없다.
 * 화면에서만 바꾸면 관리자는 정지시킨 줄 알고 닫는데 그 계정은 그대로 살아 있다.
 */

const STATE_TONE: Record<UserState, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  suspended: 'bg-rose-100 text-rose-800',
  pending: 'bg-amber-100 text-amber-900',
}

export function UserListPage() {
  const [filter, setFilter] = useState<UserFilter>({ keyword: '', role: 'all', state: 'all' })
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(() => fetchUsers(filter), [filter.keyword, filter.role, filter.state])

  const tryChange = (id: string, next: UserState) => {
    void updateUserState(id, next).then((res) => {
      // 실패만 온다. 성공 분기를 만들어 두면 지금은 죽은 코드다
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">사용자 목록</h1>
      <p className="mt-1 text-sm text-slate-600">
        검색·필터는 서버에 조건으로 보냅니다. 전체를 받아 화면에서 거르지 않습니다.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label htmlFor="user-kw" className="block text-[11px] font-bold text-slate-500">
            이름 · 부서 · 메일
          </label>
          <input
            id="user-kw"
            type="search"
            value={filter.keyword}
            onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
            placeholder="검색어"
            className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="user-role" className="block text-[11px] font-bold text-slate-500">
            역할
          </label>
          <select
            id="user-role"
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value as UserRole | 'all' })}
            className="mt-1 min-h-11 rounded-lg border border-slate-300 px-2 text-sm"
          >
            <option value="all">전체</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="user-state" className="block text-[11px] font-bold text-slate-500">
            상태
          </label>
          <select
            id="user-state"
            value={filter.state}
            onChange={(e) => setFilter({ ...filter, state: e.target.value as UserState | 'all' })}
            className="mt-1 min-h-11 rounded-lg border border-slate-300 px-2 text-sm"
          >
            <option value="all">전체</option>
            {USER_STATES.map((s) => (
              <option key={s} value={s}>
                {STATE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">사용자를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' && state.data.length === 0 && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          조건에 맞는 사용자가 없습니다. 검색어나 필터를 바꿔 보세요.
        </p>
      )}

      {state.kind === 'ready' && state.data.length > 0 && (
        <>
          <p className="mt-4 text-xs text-slate-600">{state.data.length}명</p>
          <AdminTable label="사용자 목록" minW="min-w-[46rem]">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">이름</th>
                  <th scope="col" className="px-3 py-2">부서</th>
                  <th scope="col" className="px-3 py-2">메일</th>
                  <th scope="col" className="px-3 py-2">역할</th>
                  <th scope="col" className="px-3 py-2">상태</th>
                  <th scope="col" className="px-3 py-2">최근 접속</th>
                  <th scope="col" className="px-3 py-2">조치</th>
                </tr>
              </thead>
              <tbody>
            {state.data.length === 0 && (
              <EmptyRow cols={7}>이 조건에 맞는 사용자가 없습니다.</EmptyRow>
            )}
                {state.data.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <th scope="row" className="px-3 py-2 font-bold text-slate-800 text-left">{u.name}</th>
                    <td className="px-3 py-2 text-slate-600">{u.dept}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{u.email}</td>
                    <td className="px-3 py-2 text-slate-600">{ROLE_LABEL[u.role]}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${STATE_TONE[u.state]}`}>
                        {STATE_LABEL[u.state]}
                      </span>
                    </td>
                    {/* 한 번도 접속 안 한 계정을 '-'나 0으로 두면 오늘 접속한 것처럼 읽힌다 */}
                    <td className="px-3 py-2 tabular-nums text-slate-600">
                      {u.lastSeenAt ?? <span className="text-slate-400">접속 이력 없음</span>}
                    </td>
                    <td className="px-3 py-2">
                      <AdminButton size="sm" onClick={() => tryChange(u.id, u.state === 'suspended' ? 'active' : 'suspended')}>
                        {u.state === 'suspended' ? '정지 해제' : '정지'}
                      </AdminButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
        </>
      )}

      {/* 권한 규칙을 화면이 정하지 않는다 */}
      <p className="mt-4 max-w-3xl text-xs text-slate-500">
        누가 어떤 계정을 바꿀 수 있는지는 서버가 판정합니다. 화면은 서버가 준 결과를 그리기만
        합니다 — 화면에 규칙을 넣으면 서버 규칙과 어긋나는 순간 화면에서는 되는데 서버가 막는
        상태가 됩니다.
      </p>
    </main>
  )
}
