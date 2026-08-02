import { useState } from 'react'
import {
  TRAIN_STATE_LABEL,
  TRAIN_WINDOWS,
  TRAIN_WINDOW_LABEL,
  allocatedRatio,
  type TrainWindow,
} from '@entities/infra/model'
import { fetchTrainerReport } from '@shared/api/infra'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'

/**
 * 트레이너 현황 — 학습 작업 집계.
 *
 * 실패 건수만 세면 손쓸 수 없다. 실패한 작업에는 **사유**를 붙이고 목록 위로 올린다.
 * 이전 데모는 '실패한 작업 2건'까지만 있었다.
 *
 * 자원 배분은 합이 1이 되지 않는다. 남는 몫이 곧 여유이고, 억지로 100%를 만들면
 * 여유가 없는 것처럼 보인다. 화면이 남는 몫을 '대기'로 계산해 보여 준다.
 */

const pct = (r: number): string => `${Math.round(r * 100)}%`

export function TrainerStatusPage() {
  const [window, setWindow] = useState<TrainWindow>('week')
  const state = useRemote(() => fetchTrainerReport(window), [window])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">트레이너 현황</h1>
        <ExampleBadge />
        <div className="ml-auto flex flex-wrap gap-1">
          {TRAIN_WINDOWS.map((w) => (
            <label
              key={w}
              className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
            >
              <input
                type="radio"
                name="train-window"
                value={w}
                checked={window === w}
                onChange={() => setWindow(w)}
                className="sr-only"
              />
              {TRAIN_WINDOW_LABEL[w]}
            </label>
          ))}
        </div>
      </div>

      {state.kind === 'loading' && (
        <div role="status" className="mt-5 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">학습 작업을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'error' && (
        <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {state.message}
        </p>
      )}

      {state.kind === 'ready' &&
        (() => {
          const r = state.data
          const idle = Math.max(0, 1 - allocatedRatio(r.allocations))
          const failedJobs = r.jobs.filter((j) => j.state === 'failed')
          return (
            <>
              <p className="mt-1 text-sm text-slate-600">
                {TRAIN_WINDOW_LABEL[r.window]} 집계입니다.
              </p>

              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">완료</dt>
                  <dd className="text-xl font-black text-slate-900">{r.done}건</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    r.failed > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">실패</dt>
                  <dd className={`text-xl font-black ${r.failed > 0 ? 'text-rose-800' : 'text-slate-900'}`}>
                    {r.failed}건
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">대기</dt>
                  <dd className="text-xl font-black text-slate-900">{r.queued}건</dd>
                </div>
              </dl>

              <section aria-labelledby="alloc" className="mt-6">
                <h2 id="alloc" className="text-sm font-black text-slate-900">
                  자원 배분
                </h2>
                <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  {r.allocations.map((a, i) => (
                    <div
                      key={a.label}
                      style={{ width: `${(a.ratio * 100).toFixed(1)}%` }}
                      className={i === 0 ? 'bg-slate-800' : i === 1 ? 'bg-slate-500' : 'bg-slate-300'}
                    />
                  ))}
                </div>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {r.allocations.map((a) => (
                    <li key={a.label} className="text-slate-600">
                      {a.label} <span className="font-bold tabular-nums text-slate-900">{pct(a.ratio)}</span>
                    </li>
                  ))}
                  {/* 억지로 100%를 채우면 여유가 없는 것처럼 보인다 */}
                  <li className="text-slate-400">
                    여유 <span className="font-bold tabular-nums">{pct(idle)}</span>
                  </li>
                </ul>
              </section>

              {/* 건수만 세면 손쓸 수 없다 — 실패 사유를 위로 올린다 */}
              {failedJobs.length > 0 && (
                <section aria-labelledby="failed" className="mt-6">
                  <h2 id="failed" className="text-sm font-black text-rose-800">
                    실패한 작업 {failedJobs.length}건
                  </h2>
                  <ul className="mt-2 space-y-2">
                    {failedJobs.map((j) => (
                      <li key={j.id} className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                        <p className="text-xs font-black text-rose-900">
                          {j.id} · {j.model}
                        </p>
                        <p className="mt-0.5 text-xs text-rose-800">{j.note ?? '사유가 기록되지 않았습니다.'}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="jobs" className="mt-6">
                <h2 id="jobs" className="text-sm font-black text-slate-900">
                  학습 작업 {r.jobs.length}건
                </h2>
                <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full min-w-[38rem] text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] text-slate-500">
                      <tr>
                        <th scope="col" className="px-3 py-2">작업</th>
                        <th scope="col" className="px-3 py-2">모델</th>
                        <th scope="col" className="px-3 py-2">유형</th>
                        <th scope="col" className="px-3 py-2">시작</th>
                        <th scope="col" className="px-3 py-2">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.jobs.map((j) => (
                        <tr key={j.id} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-mono text-[11px] font-bold text-slate-800">{j.id}</td>
                          <td className="px-3 py-2 text-slate-700">{j.model}</td>
                          <td className="px-3 py-2 text-slate-600">{j.kind}</td>
                          <td className="px-3 py-2 tabular-nums text-slate-600">{j.startedAt}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                                j.state === 'failed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : j.state === 'running'
                                    ? 'bg-sky-50 text-sky-900'
                                    : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {TRAIN_STATE_LABEL[j.state]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )
        })()}
    </main>
  )
}
