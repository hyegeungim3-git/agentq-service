import { useState } from 'react'
import { HR_CHANGE_LABEL, failedChanges, riskyPending } from '@entities/sysops/model'
import { fetchHrSync, runHrSync } from '@shared/api/sysops'
import { useRemote } from '@features/remote/useRemote'

/**
 * HR 연계·그룹 관리.
 *
 * 이 화면은 **계정을 만들고 없애는 일**을 다룬다. '842명 동기화 완료'만 보여 주면
 * 잘 돌고 있는 것처럼 보이는데, 정작 중요한 것은 **처리하지 못한 것**이다.
 * 퇴직 처리가 밀리면 그 계정은 지금 접속이 열려 있다.
 *
 * 그래서 실패한 변경을 맨 위에 두고, 그중 위험한 것(퇴직·부재)을 먼저 센다.
 */

export function HrSyncPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchHrSync, [])

  const sync = () => {
    void runHrSync().then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-black text-slate-900">HR 연계·그룹 관리</h1>
        <button
          type="button"
          onClick={sync}
          className="ml-auto min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          수동 동기화
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-600">인사 정보가 바뀌면 계정이 따라 바뀝니다.</p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">동기화 상태를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const s = state.data
          const failed = failedChanges(s)
          const risky = riskyPending(s)
          const done = s.changes.filter((c) => c.failedReason === null)
          return (
            <>
              {/* '몇 건 처리했다'보다 '못 한 것'이 먼저다 */}
              {risky.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    계정이 열린 채로 남은 변경 {risky.length}건
                  </p>
                  <ul className="mt-2 space-y-1">
                    {risky.map((c) => (
                      <li key={c.id} className="text-xs text-rose-800">
                        <b>
                          {c.name} · {HR_CHANGE_LABEL[c.kind]}
                        </b>{' '}
                        ({c.syncedOn}) — {c.failedReason}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-bold text-rose-900">
                    사용자 관리에서 해당 계정을 직접 정지시키십시오. 자동 처리를 기다리면 그동안
                    접속이 가능합니다.
                  </p>
                </div>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">연동</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {s.connected ? '정상' : '끊김'}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">전체 사용자</dt>
                  <dd className="text-xl font-black text-slate-900">{s.totalUsers}명</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">처리됨</dt>
                  <dd className="text-xl font-black text-slate-900">{done.length}건</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    failed.length > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">처리 못 함</dt>
                  <dd className={`text-xl font-black ${failed.length > 0 ? 'text-rose-800' : 'text-slate-900'}`}>
                    {failed.length}건
                  </dd>
                </div>
              </dl>

              <p className="mt-2 text-xs text-slate-500">
                마지막 동기화 {s.lastSyncAt} · 다음 예정 {s.nextSyncAt}
              </p>

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
                <table className="w-full min-w-[44rem] text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">이름</th>
                      <th scope="col" className="px-3 py-2">변경</th>
                      <th scope="col" className="px-3 py-2">소속</th>
                      <th scope="col" className="px-3 py-2">일자</th>
                      <th scope="col" className="px-3 py-2">계정에 일어난 일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...failed, ...done].map((c) => (
                      <tr key={c.id} className={`border-t border-slate-100 ${c.failedReason ? 'bg-rose-50' : ''}`}>
                        <td className="px-3 py-2 font-bold text-slate-800">{c.name}</td>
                        <td className="px-3 py-2 text-slate-600">{HR_CHANGE_LABEL[c.kind]}</td>
                        <td className="px-3 py-2 text-slate-600">{c.dept}</td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">{c.syncedOn}</td>
                        <td className="px-3 py-2">
                          {c.failedReason ? (
                            <span className="font-bold text-rose-800">처리 실패 — {c.failedReason}</span>
                          ) : (
                            <span className="text-slate-600">{c.effect}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 max-w-3xl text-xs text-slate-500">
                매일 01:00에 자동 동기화됩니다. 신규 입사는 계정을 만들어 승인 대기로 보내고,
                퇴직은 계정을 비활성화하며, 부서이동은 그룹을 바꿉니다. 자동 처리가 실패하면
                사람이 손대기 전까지 그대로 남습니다.
              </p>
            </>
          )
        })()}
    </main>
  )
}
