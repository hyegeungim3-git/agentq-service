import { useState } from 'react'
import {
  STRATEGY_LABEL,
  disabled,
  fallbackFor,
  inOrder,
  shareTotal,
  staleCache,
} from '@entities/augment/model'
import { fetchCacheEntries, fetchRoutes, fetchStrategies, reloadCacheEntry } from '@shared/api/augment'
import { useRemote } from '@features/remote/useRemote'

/**
 * 지식 증강 전략.
 *
 * "RAG 하나로 다 한다"가 아니라는 것을 관리할 수 있게 만든 화면이다.
 *
 * 두 가지를 먼저 말한다.
 *  ① **꺼진 라우팅 규칙** — 목록에 있으면 도는 줄 안다. 꺼져 있으면 그 질의가
 *     아래 어느 규칙으로 흘러가는지까지 말한다. 집계 질의가 문서 검색으로 가면 틀린다
 *  ② **원문이 바뀐 캐시** — 캐시는 검색 없이 바로 답하므로 낡으면 옛 내용을
 *     자신 있게 말한다. 규정·표준 문서에서 특히 위험하다
 *
 * 강점만 나열하지 않는다. 세 방법이 다 좋아 보이면 고를 수 없다.
 */

export function AugmentPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const strategies = useRemote(fetchStrategies, [])
  const routes = useRemote(fetchRoutes, [])
  const cache = useRemote(fetchCacheEntries, [])

  const reload = (id: string) => {
    void reloadCacheEntry(id).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">지식 증강 전략</h1>
      <p className="mt-1 text-sm text-slate-600">
        질의 성격에 맞는 방법을 고르고, 그 경로가 지금 어떻게 도는지를 봅니다.
      </p>

      {failure && (
        <p role="alert" className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {routes.kind === 'ready' && (
        <>
          {disabled(routes.data).map((r) => {
            const next = fallbackFor(routes.data, r)
            return (
              <p
                key={r.id}
                className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900"
              >
                <b>{r.order}순위 규칙이 꺼져 있습니다</b> — {r.when}는 지금{' '}
                {next === null ? '어디로도 가지 않습니다' : `${next.order}순위(${STRATEGY_LABEL[next.strategy]})로 갑니다`}.
                {next !== null && next.strategy !== 'tag' && r.strategy === 'tag' && (
                  <> 집계 질의를 문서 검색으로 답하면 <b>수치가 틀립니다.</b></>
                )}
              </p>
            )
          })}
        </>
      )}

      {cache.kind === 'ready' && staleCache(cache.data).length > 0 && (
        <div className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-bold text-amber-900">
            원문이 바뀌었는데 다시 안 올린 캐시 {staleCache(cache.data).length}건
          </p>
          <ul className="mt-1 space-y-1.5">
            {staleCache(cache.data).map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2 text-[11px] text-amber-900">
                <span>
                  {c.name} — 올릴 때 {c.loadedRev}, 지금 {c.currentRev}
                </span>
                {/* 고칠 수 있는 자리를 문제 옆에 둔다 — 표 안쪽 버튼은 좁은 화면에서 닿기 어렵다 */}
                <button
                  type="button"
                  onClick={() => reload(c.id)}
                  className="min-h-11 rounded-lg border border-amber-300 bg-white px-2.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100"
                >
                  다시 올리기
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[11px] text-amber-800">
            캐시는 검색 없이 바로 답합니다. 다시 올리기 전까지 <b>옛 내용으로 답합니다.</b>
          </p>
        </div>
      )}

      {strategies.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">증강 전략을 불러오는 중입니다</span>
        </div>
      )}

      {strategies.kind === 'ready' && (
        <>
          <h2 className="mt-5 text-sm font-black text-slate-900">방법 세 가지</h2>
          {shareTotal(strategies.data) !== 100 && (
            <p className="mt-1 text-xs text-amber-800">
              비중 합이 {shareTotal(strategies.data)}%입니다 — 어느 경로로 답했는지 모르는 질의가 있습니다.
            </p>
          )}
          <ul className="mt-2 grid gap-3 lg:grid-cols-3">
            {strategies.data.map((s) => (
              <li key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-black text-slate-900">{STRATEGY_LABEL[s.id]}</span>
                  <span className="text-[11px] text-slate-400">{s.fullName}</span>
                  <span className="ml-auto text-sm font-black tabular-nums text-slate-900">{s.share}%</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">{s.what}</p>
                <dl className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-[10px] text-slate-400">평균 응답</dt>
                    <dd className="text-[11px] font-bold tabular-nums text-slate-700">{s.avgLatencyMs}ms</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-slate-400">근거를 찾은 비율</dt>
                    <dd className="text-[11px] font-bold tabular-nums text-slate-700">{s.hitRate}%</dd>
                  </div>
                </dl>
                <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] text-emerald-900">
                  잘하는 것 — {s.strength}
                </p>
                {/* 강점만 적으면 셋 다 좋아 보여 고를 수 없다 */}
                <p className="mt-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-700">
                  못 하는 것 — {s.caveat.replace(/\*\*/g, '')}
                </p>
                <p className="mt-2 text-[10px] text-slate-500">쓰는 자료: {s.targets.join(' · ')}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {routes.kind === 'ready' && (
        <>
          <h2 className="mt-5 text-sm font-black text-slate-900">라우팅 규칙</h2>
          <p className="mt-1 max-w-3xl text-xs text-slate-600">
            <b>위에서부터 적용됩니다.</b> 순서가 결과를 바꾸므로 순서 자체가 설정입니다.
          </p>
          <ul className="mt-2 space-y-2">
            {inOrder(routes.data).map((r) => (
              <li
                key={r.id}
                className={`rounded-xl border p-3 ${
                  r.enabled ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-black text-slate-700">
                    {r.order}순위
                  </span>
                  <span className="text-sm font-bold text-slate-900">{r.when}</span>
                  <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-brand-fg">
                    {STRATEGY_LABEL[r.strategy]}
                  </span>
                  <span
                    className={`ml-auto rounded px-1.5 py-0.5 text-[11px] font-bold ${
                      r.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.enabled ? '적용 중' : '꺼짐'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  걸리는 말: {r.keywords} · 누적 {r.hits.toLocaleString()}건
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      {cache.kind === 'ready' && (
        <>
          <h2 className="mt-5 text-sm font-black text-slate-900">캐시에 올려 둔 문서</h2>
          <div
            className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white"
            role="region"
            aria-label="표 — 가로로 스크롤됩니다"
            tabIndex={0}
          >
            <table className="w-full min-w-[46rem] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">문서</th>
                  <th scope="col" className="px-3 py-2">크기</th>
                  <th scope="col" className="px-3 py-2">올린 때</th>
                  <th scope="col" className="px-3 py-2">올릴 때 원문</th>
                  <th scope="col" className="px-3 py-2">지금 원문</th>
                  <th scope="col" className="px-3 py-2">쓰임</th>
                </tr>
              </thead>
              <tbody>
                {cache.data.map((c) => {
                  const stale = c.loadedRev !== c.currentRev
                  return (
                    <tr key={c.id} className="border-t border-slate-100">
                      <th scope="row" className="px-3 py-2 text-left font-bold text-slate-900">
                        {c.name}
                      </th>
                      <td className="px-3 py-2 tabular-nums text-slate-600">{c.tokens}</td>
                      <td className="px-3 py-2 tabular-nums text-slate-600">{c.loadedAt}</td>
                      <td className="px-3 py-2 text-slate-600">{c.loadedRev}</td>
                      <td className={`px-3 py-2 ${stale ? 'font-bold text-amber-800' : 'text-slate-600'}`}>
                        {c.currentRev}
                        {stale && ' (다름)'}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-slate-500">{c.hits.toLocaleString()}건</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}
