import { useState } from 'react'
import { fetchAccessLogs, fetchLogGaps, type LogFilter } from '@shared/api/users'
import { useRemote } from '@features/remote/useRemote'

/**
 * 접근 로그.
 *
 * **무엇이 로그에 안 남는지 함께 말한다.** 목록만 보여 주면 '여기 있는 게 전부'로
 * 읽힌다. 감사 목적으로 이 화면을 믿어도 되는지는 빠진 것을 알아야 판단할 수 있다.
 *
 * 거부된 접근을 위로 올린다. 시각순으로만 두면 막힌 시도가 정상 접근 사이에 묻힌다.
 */

export function AccessLogPage() {
  const [filter, setFilter] = useState<LogFilter>({ onlyDenied: false, keyword: '' })
  const logs = useRemote(() => fetchAccessLogs(filter), [filter.onlyDenied, filter.keyword])
  const gaps = useRemote(fetchLogGaps, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">접근 로그</h1>
      <p className="mt-1 text-sm text-slate-600">누가 언제 무엇에 접근했는지입니다.</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label htmlFor="log-kw" className="block text-[11px] font-bold text-slate-500">
            사용자 · 대상 · IP
          </label>
          <input
            id="log-kw"
            type="search"
            value={filter.keyword}
            onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
            placeholder="검색어"
            className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm"
          />
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={filter.onlyDenied}
            onChange={(e) => setFilter({ ...filter, onlyDenied: e.target.checked })}
          />
          거부된 접근만
        </label>
      </div>

      {logs.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">접근 기록을 불러오는 중입니다</span>
        </div>
      )}

      {logs.kind === 'ready' && logs.data.length === 0 && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          조건에 맞는 기록이 없습니다.
        </p>
      )}

      {logs.kind === 'ready' &&
        logs.data.length > 0 &&
        (() => {
          const denied = logs.data.filter((l) => l.result === 'denied')
          const ok = logs.data.filter((l) => l.result === 'ok')
          return (
            <>
              <p className="mt-4 text-xs text-slate-600">
                {logs.data.length}건
                {denied.length > 0 && (
                  <span className="ml-1 font-bold text-rose-700">· 거부 {denied.length}건</span>
                )}
              </p>
              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white" tabIndex={0}>
                <table className="w-full min-w-[48rem] text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">시각</th>
                      <th scope="col" className="px-3 py-2">사용자</th>
                      <th scope="col" className="px-3 py-2">행위</th>
                      <th scope="col" className="px-3 py-2">대상</th>
                      <th scope="col" className="px-3 py-2">IP</th>
                      <th scope="col" className="px-3 py-2">결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 거부를 위로 — 막힌 시도가 정상 접근 사이에 묻히면 안 된다 */}
                    {[...denied, ...ok].map((l) => (
                      <tr key={l.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 tabular-nums text-slate-600">{l.at}</td>
                        <td className="px-3 py-2 font-bold text-slate-800">{l.actor}</td>
                        <td className="px-3 py-2 text-slate-600">{l.action}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {l.target}
                          {/* 거부만 표시하고 이유를 빼면 왜 막혔는지 알 수 없다 */}
                          {l.deniedReason && (
                            <span className="mt-0.5 block text-[11px] text-rose-700">
                              {l.deniedReason}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{l.ip}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                              l.result === 'denied'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {l.result === 'denied' ? '거부' : '허용'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        })()}

      {/* 목록만 보여 주면 '여기 있는 게 전부'로 읽힌다 */}
      {gaps.kind === 'ready' && (
        <section
          aria-labelledby="log-gaps"
          className="mt-5 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <h2 id="log-gaps" className="text-sm font-black text-amber-900">
            이 목록에 남지 않는 것
          </h2>
          <ul className="mt-2 space-y-1">
            {gaps.data.map((g) => (
              <li key={g} className="text-xs text-amber-900">
                · {g}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
