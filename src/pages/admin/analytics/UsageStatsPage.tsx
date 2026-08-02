import { useState } from 'react'
import {
  MODE_LABEL,
  STAT_WINDOWS,
  STAT_WINDOW_LABEL,
  type StatWindow,
} from '@entities/analytics/model'
import { fetchUsageStats } from '@shared/api/analytics'
import { useRemote } from '@features/remote/useRemote'

/**
 * 이용 통계.
 *
 * **평균 응답시간은 성공한 요청만 센 값이다.** 실패한 요청을 빼고 잰 평균을
 * 그냥 '평균 응답시간'이라 적으면 빠른 것처럼 보인다. 몇 건이 빠졌는지 함께 적는다.
 *
 * 구간을 고르면 서버에 다시 묻는다 — 어느 구간이나 같으면 고를 이유가 없다.
 */

export function UsageStatsPage() {
  const [window, setWindow] = useState<StatWindow>('7d')
  const state = useRemote(() => fetchUsageStats(window), [window])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-black text-slate-900">이용 통계</h1>
        <div className="ml-auto flex flex-wrap gap-1">
          {STAT_WINDOWS.map((w) => (
            <label
              key={w}
              className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
            >
              <input
                type="radio"
                name="stat-window"
                value={w}
                checked={window === w}
                onChange={() => setWindow(w)}
                className="sr-only"
              />
              {STAT_WINDOW_LABEL[w]}
            </label>
          ))}
        </div>
      </div>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">이용 통계를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const s = state.data
          const maxQueries = Math.max(...s.daily.map((d) => d.queries), 1)
          const maxMode = Math.max(...s.byMode.map((m) => m.queries), 1)
          return (
            <>
              <p className="mt-1 text-sm text-slate-600">
                {STAT_WINDOW_LABEL[s.window]} 집계입니다.
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">총 질의</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {s.totalQueries.toLocaleString('ko-KR')}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">활성 사용자</dt>
                  <dd className="text-xl font-black text-slate-900">{s.activeUsers}명</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">평균 응답</dt>
                  <dd className="text-xl font-black text-slate-900">{s.avgSeconds.toFixed(1)}초</dd>
                  {/* 실패를 빼고 잰 평균을 그냥 '평균'이라 적으면 빠른 것처럼 보인다 */}
                  <dd className="text-[10px] text-slate-400">성공한 요청만</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    s.failedQueries > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">실패</dt>
                  <dd className="text-xl font-black text-slate-900">{s.failedQueries}건</dd>
                  <dd className="text-[10px] text-slate-400">평균에서 제외</dd>
                </div>
              </dl>

              <p className="mt-3 max-w-3xl text-xs text-slate-500">
                평균 응답시간은 성공한 요청만 센 값입니다. 실패한 {s.failedQueries}건(전체의{' '}
                {((s.failedQueries / s.totalQueries) * 100).toFixed(1)}%)은 빠져 있으므로, 이 숫자를
                서비스 전체의 체감 속도로 읽으면 안 됩니다.
              </p>

              <section aria-labelledby="daily" className="mt-5">
                <h2 id="daily" className="text-sm font-black text-slate-900">
                  질의량 추이
                </h2>
                <ul className="mt-2 space-y-1">
                  {s.daily.map((d) => (
                    <li key={d.date} className="flex items-center gap-2">
                      <span className="w-14 text-xs text-slate-600">{d.date}</span>
                      <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-full bg-slate-700"
                          style={{ width: `${((d.queries / maxQueries) * 100).toFixed(1)}%` }}
                        />
                      </span>
                      <span className="w-32 text-right text-xs tabular-nums text-slate-600">
                        {d.queries.toLocaleString('ko-KR')}건 · {d.users}명
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="bymode" className="mt-5">
                <h2 id="bymode" className="text-sm font-black text-slate-900">
                  업무 유형별
                </h2>
                <ul className="mt-2 space-y-1">
                  {s.byMode.map((m) => (
                    <li key={m.mode} className="flex items-center gap-2">
                      <span className="w-20 text-xs text-slate-600">{MODE_LABEL[m.mode]}</span>
                      <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-full bg-slate-500"
                          style={{ width: `${((m.queries / maxMode) * 100).toFixed(1)}%` }}
                        />
                      </span>
                      <span className="w-28 text-right text-xs tabular-nums text-slate-600">
                        {m.queries.toLocaleString('ko-KR')}건 (
                        {Math.round((m.queries / s.totalQueries) * 100)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )
        })()}
    </main>
  )
}
