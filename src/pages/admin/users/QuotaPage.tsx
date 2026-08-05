import { isOverQuota, quotaRatio } from '@entities/user/model'
import { fetchUsers } from '@shared/api/users'
import { useRemote } from '@features/remote/useRemote'

/**
 * 할당량.
 *
 * **한도를 넘긴 사용자를 위로 올린다.** 이름순으로 두면 넘긴 한 명을 찾아 훑어야 한다.
 *
 * 무제한 계정의 사용률을 0%로 그리지 않는다 — 안 쓴 것처럼 보인다. '무제한'이라고 쓴다.
 * 집계 기준 시각을 함께 보여 준다. 언제 기준인지 모르면 숫자를 믿을 수 없다.
 */

const ALL = { keyword: '', role: 'all', state: 'all' } as const

export function QuotaPage() {
  const state = useRemote(() => fetchUsers(ALL), ['quota'])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">할당량</h1>
      <p className="mt-1 text-sm text-slate-600">사용자별 월 요청 한도와 사용량입니다.</p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">할당량을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const over = state.data.filter(isOverQuota)
          const rest = state.data.filter((u) => !isOverQuota(u))
          const countedAt = state.data[0]?.quota.countedAt ?? null
          return (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-xs text-slate-600">
                  {state.data.length}명
                  {over.length > 0 && (
                    <span className="ml-1 font-bold text-rose-700">· 한도 초과 {over.length}명</span>
                  )}
                </p>
                {/* 언제 기준인지 모르면 숫자를 믿을 수 없다 */}
                {countedAt && <p className="text-xs text-slate-400">집계 기준 {countedAt}</p>}
              </div>

              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white" tabIndex={0}>
                <table className="w-full min-w-[42rem] text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">이름</th>
                      <th scope="col" className="px-3 py-2">부서</th>
                      <th scope="col" className="px-3 py-2">한도</th>
                      <th scope="col" className="px-3 py-2">사용</th>
                      <th scope="col" className="px-3 py-2">사용률</th>
                      <th scope="col" className="px-3 py-2">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...over, ...rest].map((u) => {
                      const ratio = quotaRatio(u)
                      const excess = u.quota.limit === null ? 0 : u.quota.used - u.quota.limit
                      return (
                        <tr key={u.id} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-bold text-slate-800">{u.name}</td>
                          <td className="px-3 py-2 text-slate-600">{u.dept}</td>
                          <td className="px-3 py-2 tabular-nums text-slate-600">
                            {u.quota.limit === null ? '무제한' : u.quota.limit.toLocaleString('ko-KR')}
                          </td>
                          <td className="px-3 py-2 tabular-nums text-slate-600">
                            {u.quota.used.toLocaleString('ko-KR')}
                          </td>
                          {/* 무제한을 0%로 그리면 안 쓴 것처럼 보인다 */}
                          <td className="px-3 py-2 tabular-nums">
                            {ratio === null ? (
                              <span className="text-slate-400">해당 없음</span>
                            ) : (
                              <span className={ratio > 1 ? 'font-bold text-rose-700' : 'text-slate-700'}>
                                {Math.round(ratio * 100)}%
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {excess > 0 ? (
                              <span className="font-bold text-rose-700">
                                {excess.toLocaleString('ko-KR')}건 초과
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {over.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  한도를 넘겨도 지금은 요청이 막히지 않습니다. 초과 시 차단할지 경고만 할지는
                  정해지지 않았습니다 — 정책이 정해지면 이 화면에서 처리 방식을 함께 보여 줍니다.
                </p>
              )}
            </>
          )
        })()}
    </main>
  )
}
