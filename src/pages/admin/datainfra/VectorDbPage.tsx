import {
  COLLECTION_STATE_LABEL,
  dimensionGroups,
  notUsable,
  unattached,
} from '@entities/datainfra/model'
import { fetchCollections } from '@shared/api/datainfra'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'
import { AREAS } from '@fixtures/knowledgebase'

/**
 * 벡터 DB.
 *
 * ⚠️ **차원이 다른 컬렉션은 같은 검색에서 비교할 수 없다.** 임베딩 모델이 달라서인데,
 * 목록만 보면 그냥 나란한 컬렉션으로 보인다. 차원이 여럿이면 그 사실을 먼저 말한다.
 *
 * 어느 지식영역에도 안 붙은 컬렉션도 드러낸다 — 만들어 두고 잊힌 것이고,
 * 그동안에도 저장 공간을 잡고 있다.
 */

const fmt = (n: number): string => n.toLocaleString('ko-KR')
const areaName = (id: string | null): string | null =>
  id === null ? null : (AREAS.find((a) => a.id === id)?.name ?? id)

export function VectorDbPage() {
  const state = useRemote(fetchCollections, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">벡터 DB</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        지식영역이 검색에 쓰는 벡터 컬렉션입니다.
      </p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">컬렉션을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const dims = dimensionGroups(state.data)
          const blocked = notUsable(state.data)
          const orphan = unattached(state.data)
          const vectors = state.data.reduce((n, c) => n + c.vectors, 0)
          return (
            <>
              {/* 목록만 보면 그냥 나란한 컬렉션으로 보인다 */}
              {dims.length > 1 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    차원이 다른 컬렉션이 섞여 있습니다 ({dims.join(' / ')}차원)
                  </p>
                  <p className="mt-1 text-xs text-rose-800">
                    임베딩 모델이 다르면 벡터를 같은 자리에 놓을 수 없습니다. 두 컬렉션에 걸친
                    검색은 결과를 비교할 수 없고, 섞어 쓰면 <b>왜 이 문단이 잡혔는지 알 수 없게
                    됩니다.</b> 옛 차원 컬렉션은 새 모델로 다시 만들어야 합니다.
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {state.data
                      .filter((c) => c.dimensions !== Math.max(...dims))
                      .map((c) => (
                        <li key={c.id} className="text-[11px] text-rose-800">
                          {c.name} · {c.dimensions}차원 · {c.embeddingModel}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {orphan.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  어느 지식영역에도 안 붙은 컬렉션이 {orphan.length}개 있습니다(
                  {orphan.map((c) => c.name).join(', ')}). 검색에 쓰이지 않으면서 저장 공간을 잡고
                  있습니다 — 쓸지 지울지 정해야 합니다.
                </p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">컬렉션</dt>
                  <dd className="text-xl font-black text-slate-900">{state.data.length}개</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">총 벡터</dt>
                  <dd className="text-xl font-black text-slate-900">{fmt(vectors)}</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    blocked.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">지금 못 쓰는 것</dt>
                  <dd className="text-xl font-black text-slate-900">{blocked.length}개</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    dims.length > 1 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">차원 종류</dt>
                  <dd className="text-xl font-black text-slate-900">{dims.length}가지</dd>
                </div>
              </dl>

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[50rem] text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">컬렉션</th>
                      <th scope="col" className="px-3 py-2">지식영역</th>
                      <th scope="col" className="px-3 py-2">벡터</th>
                      <th scope="col" className="px-3 py-2">차원</th>
                      <th scope="col" className="px-3 py-2">임베딩 모델</th>
                      <th scope="col" className="px-3 py-2">상태</th>
                      <th scope="col" className="px-3 py-2">조회 지연</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.data.map((c) => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-mono text-[11px] font-bold text-slate-800">
                          {c.name}
                        </td>
                        {/* 빈칸으로 두면 못 적은 것인지 없는 것인지 알 수 없다 */}
                        <td className="px-3 py-2 text-slate-600">
                          {areaName(c.areaId) ?? (
                            <span className="font-bold text-amber-800">안 붙음</span>
                          )}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">{fmt(c.vectors)}</td>
                        <td
                          className={`px-3 py-2 tabular-nums ${
                            c.dimensions !== Math.max(...dims)
                              ? 'font-bold text-rose-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {c.dimensions}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{c.embeddingModel}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                              c.state === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {COLLECTION_STATE_LABEL[c.state]}
                          </span>
                        </td>
                        {/* 0ms를 '빠르다'로 읽으면 안 된다 — 아직 안 만들어졌다 */}
                        <td className="px-3 py-2 tabular-nums text-slate-600">
                          {c.state === 'building' ? (
                            <span className="text-slate-400">아직 없음</span>
                          ) : (
                            `${c.latencyMs}ms`
                          )}
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
