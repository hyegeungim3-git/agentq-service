import { useState } from 'react'
import {
  GRADE_LABEL,
  STANDARD_FLOOR,
  USAGE_LABEL,
  lineageOf,
  riskyForAggregate,
  withoutLineage,
} from '@entities/catalog/model'
import { fetchDataAssets, fetchLineages } from '@shared/api/catalog'
import { useRemote } from '@features/remote/useRemote'
import { AdminButton } from '@widgets/admin-shell/AdminControls'

/**
 * 데이터 카탈로그 · 리니지.
 *
 * 답의 출처를 데이터 자산까지 따라간다. 두 가지를 먼저 말한다.
 *  ① **집계에 쓰이는데 표준화가 낮은 자산** — 문서 검색이면 사람이 읽고 판단하지만,
 *     집계는 틀린 수치를 그대로 답한다. 같은 74%라도 쓰임에 따라 위험이 다르다
 *  ② **계보가 안 그려진 자산** — 틀렸을 때 어디를 고쳐야 하는지 모른다
 *
 * 소비처를 함께 적는 이유는 그것이 곧 **영향 범위**이기 때문이다.
 * 이 자산이 틀리면 어느 에이전트가 함께 틀리는지가 한 줄로 보여야 한다.
 */

export function CatalogPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const assets = useRemote(fetchDataAssets, [])
  const lineages = useRemote(fetchLineages, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">카탈로그 · 리니지</h1>
      <p className="mt-1 text-sm text-slate-600">
        어떤 데이터가 있고, 그것이 어디서 와서 어디로 가는지를 봅니다.
      </p>

      {assets.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">데이터 자산을 불러오는 중입니다</span>
        </div>
      )}

      {assets.kind === 'ready' && lineages.kind === 'ready' && (
        <>
          {(() => {
            const risky = riskyForAggregate(assets.data)
            const noLineage = withoutLineage(assets.data, lineages.data)
            return (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { k: '등록 자산', v: `${assets.data.length}개`, tone: 'text-slate-900' },
                    { k: '계보 그려짐', v: `${assets.data.length - noLineage.length}개`, tone: 'text-emerald-700' },
                    { k: '계보 없음', v: `${noLineage.length}개`, tone: noLineage.length ? 'text-amber-800' : 'text-emerald-700' },
                    { k: '집계인데 표준화 낮음', v: `${risky.length}개`, tone: risky.length ? 'text-rose-800' : 'text-emerald-700' },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <dd className={`text-xl font-black ${s.tone}`}>{s.v}</dd>
                      <dt className="mt-0.5 text-[11px] text-slate-500">{s.k}</dt>
                    </div>
                  ))}
                </dl>

                {risky.length > 0 && (
                  <div className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3">
                    <p className="text-xs font-bold text-rose-900">
                      수치 집계에 쓰이는데 표준화가 {STANDARD_FLOOR}% 아래인 자산 {risky.length}개
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {risky.map((a) => (
                        <li key={a.id} className="text-[11px] text-rose-900">
                          {a.name} — 표준화 {a.standardizedRatio}% · 영향 {a.consumers.join(' · ')}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 text-[11px] text-rose-800">
                      코드·단위가 안 맞으면 합계가 틀립니다. 문서 검색이면 사람이 읽고 판단하지만
                      <b> 집계는 틀린 수치를 그대로 답합니다.</b>
                    </p>
                  </div>
                )}

                {noLineage.length > 0 && (
                  <p className="mt-2 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    계보가 아직 안 그려진 자산 <b>{noLineage.length}개</b> —{' '}
                    {noLineage.map((a) => a.name).join(' · ')}. 답이 틀렸을 때 어디를 고쳐야 하는지
                    이 자산만 알 수 없습니다.
                  </p>
                )}
              </>
            )
          })()}

          <ul className="mt-4 space-y-2">
            {assets.data.map((a) => {
              const line = lineageOf(lineages.data, a.id)
              const open = selected === a.id
              return (
                <li key={a.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{a.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {GRADE_LABEL[a.grade]}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {USAGE_LABEL[a.usage]}
                    </span>
                    <span
                      className={`ml-auto text-[11px] font-bold tabular-nums ${
                        a.usage === 'aggregate' && a.standardizedRatio < STANDARD_FLOOR
                          ? 'text-rose-800'
                          : 'text-slate-600'
                      }`}
                    >
                      표준화 {a.standardizedRatio}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {a.source} · {a.owner} · {a.format} · {a.volume} · {a.updateCycle} · 최근 유입 {a.freshness}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    이 자산이 틀리면 함께 틀리는 곳: <b>{a.consumers.join(' · ')}</b>
                  </p>

                  <AdminButton tone="link" size="sm" layout="mt-2" onClick={() => setSelected(open ? null : a.id)} aria-expanded={open}>
                    {open ? '계보 접기' : '계보 보기'}
                  </AdminButton>

                  {open && line === null && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                      이 자산의 계보가 아직 정의되지 않았습니다. 채워 넣지 않고 <b>없다고 말합니다</b> —
                      그럴듯하게 그려 두면 아무도 안 고칩니다.
                    </p>
                  )}

                  {open && line !== null && (
                    <div className="mt-2 grid gap-3 border-t border-slate-100 pt-3 lg:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-bold text-slate-500">원천</p>
                        <ul className="mt-1 space-y-1">
                          {line.upstream.map((n) => (
                            <li key={n.name} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-700">
                              {n.name} <span className="text-slate-400">· {n.kind}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500">처리 단계</p>
                        <ol className="mt-1 space-y-1">
                          {line.stages.map((s, i) => (
                            <li key={s.name} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-700">
                              <b>
                                {i + 1}. {s.name}
                              </b>{' '}
                              — {s.what} <span className="text-slate-400">({s.tool})</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500">소비처</p>
                        <ul className="mt-1 space-y-1">
                          {line.downstream.map((n) => (
                            <li key={n.name} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-700">
                              {n.name} <span className="text-slate-400">· {n.kind}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </main>
  )
}
