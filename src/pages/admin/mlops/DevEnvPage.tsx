import { useState } from 'react'
import { IDLE_LIMIT_DAYS, idleHolding } from '@entities/mlops/model'
import { fetchWorkspaces, releaseWorkspace } from '@shared/api/mlops'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'

/**
 * 개발 환경.
 *
 * **놀고 있는데 GPU를 잡고 있는 작업 공간**을 먼저 드러낸다. 목록만 보면 다 쓰고
 * 있는 것처럼 보이는데, 실제로는 실험이 끝났는데 안 내린 것이 섞여 있다.
 * GPU 현황에서 남는 카드가 없어 보이는 이유가 여기 있을 수 있다.
 *
 * 회수 정책은 아직 없다. 며칠 놀면 자동으로 내릴지 정해지지 않았으므로
 * 화면이 판단하지 않고 **사실만 보여 준다.**
 */

export function DevEnvPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchWorkspaces, [])

  const release = (id: string) => {
    void releaseWorkspace(id).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">작업 공간</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        사람별 작업 공간과 잡고 있는 GPU입니다. 함께 쓰는 저장소는 <b>공유 볼륨</b>에서 봅니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">작업 공간을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const idle = idleHolding(state.data)
          const gpus = state.data.reduce((n, w) => n + w.gpuCount, 0)
          const wasted = idle.reduce((n, w) => n + w.gpuCount, 0)
          const rest = state.data.filter((w) => !idle.includes(w))
          return (
            <>
              {idle.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-black text-amber-900">
                    {IDLE_LIMIT_DAYS}일 넘게 놀면서 GPU를 잡고 있는 작업 공간 {idle.length}건 (GPU{' '}
                    {wasted}장)
                  </p>
                  <ul className="mt-2 space-y-1">
                    {idle.map((w) => (
                      <li key={w.id} className="text-xs text-amber-900">
                        <b>{w.owner}</b> · {w.purpose} — {w.idleDays}일째 (마지막 계산 {w.lastActiveAt})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-amber-800">
                    자동 회수 기준은 정해지지 않았습니다. 지금은 사실만 보여 주고 화면이 판단하지
                    않습니다.
                  </p>
                </div>
              )}

              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">작업 공간</dt>
                  <dd className="text-xl font-black text-slate-900">{state.data.length}개</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">잡고 있는 GPU</dt>
                  <dd className="text-xl font-black text-slate-900">{gpus}장</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    wasted > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">노는 GPU</dt>
                  <dd className="text-xl font-black text-slate-900">{wasted}장</dd>
                </div>
              </dl>

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[42rem] text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">사용자</th>
                      <th scope="col" className="px-3 py-2">용도</th>
                      <th scope="col" className="px-3 py-2">GPU</th>
                      <th scope="col" className="px-3 py-2">마지막 계산</th>
                      <th scope="col" className="px-3 py-2">유휴</th>
                      <th scope="col" className="px-3 py-2">조치</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...idle, ...rest].map((w) => (
                      <tr
                        key={w.id}
                        className={`border-t border-slate-100 ${idle.includes(w) ? 'bg-amber-50' : ''}`}
                      >
                        <td className="px-3 py-2 font-bold text-slate-800">{w.owner}</td>
                        <td className="px-3 py-2 text-slate-600">{w.purpose}</td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">{w.gpuCount}장</td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">{w.lastActiveAt}</td>
                        {/* GPU를 안 잡은 유휴는 급하지 않다 — 같은 무게로 두지 않는다 */}
                        <td className="px-3 py-2 tabular-nums">
                          {w.idleDays === 0 ? (
                            <span className="text-slate-400">사용 중</span>
                          ) : (
                            <span
                              className={
                                w.idleDays >= IDLE_LIMIT_DAYS && w.gpuCount > 0
                                  ? 'font-bold text-amber-800'
                                  : 'text-slate-600'
                              }
                            >
                              {w.idleDays}일
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => release(w.id)}
                            disabled={w.gpuCount === 0}
                            className="min-h-11 rounded-lg border border-slate-300 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            회수
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        })()}
    </main>
  )
}
