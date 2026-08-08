import { untrusted } from '@entities/mlops/model'
import { fetchEvalResults, fetchDatasets } from '@shared/api/mlops'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'

/**
 * 모델 평가.
 *
 * **점수를 나란히 세우면 큰 숫자가 이긴다.** 그런데 학습에도 쓴 데이터로 잰 점수는
 * 실제보다 높다. 그 결과를 다른 결과와 같은 줄에 두면 잘못된 모델을 고르게 된다.
 *
 * 그래서 믿을 수 없는 결과를 **먼저, 따로** 보여 주고 순위에서 뺀다.
 * 빼는 대신 왜 뺐는지 적는다 — 그냥 감추면 왜 점수가 안 보이는지 알 수 없다.
 */

const pct = (r: number): string => `${(r * 100).toFixed(1)}%`

export function EvaluationPage() {
/* 이름은 **경계에서 받은 목록**으로 붙인다. fixture를 직접 읽으면 서버가 붙어도
   이 화면만 옛 목록을 쓴다 — 있는 항목을 id로 보여 주거나, 없어진 항목을 이름으로
   보여 주게 된다(AGENTS.md §9) */
  const datasets = useRemote(fetchDatasets, [])
  const datasetName = (id: string): string =>
    (datasets.kind === 'ready' ? datasets.data.find((d) => d.id === id)?.name : undefined) ?? id
  const state = useRemote(fetchEvalResults, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">평가 결과</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        사내 평가셋 점수입니다. 공개 벤치마크(MTEB·KorQuAD 등)는 <b>평가 지표</b>에서 봅니다 —
        재는 것이 달라 같은 표에 두지 않았습니다.
      </p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">평가 결과를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const bad = untrusted(state.data)
          const good = state.data.filter((e) => e.trustworthy)
          const ranked = [...good].sort((a, b) => b.score - a.score)
          return (
            <>
              {bad.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    믿을 수 없는 평가 결과 {bad.length}건 — 순위에서 뺐습니다
                  </p>
                  <ul className="mt-2 space-y-1">
                    {bad.map((e) => (
                      <li key={e.id} className="text-xs text-rose-800">
                        <b>
                          {e.modelName} {e.modelVersion}
                        </b>{' '}
                        · {datasetName(e.datasetId)} · {pct(e.score)} — {e.caveat}
                      </li>
                    ))}
                  </ul>
                  {/* 그냥 감추면 왜 점수가 안 보이는지 알 수 없다 */}
                  <p className="mt-2 text-xs font-bold text-rose-900">
                    점수를 나란히 세우면 큰 숫자가 이깁니다. 부풀려진 점수를 같은 줄에 두면 잘못된
                    모델을 고르게 되므로 따로 뺐습니다.
                  </p>
                </div>
              )}

              <section aria-labelledby="ranked" className="mt-5">
                <h2 id="ranked" className="text-sm font-black text-slate-900">
                  믿을 수 있는 결과 {ranked.length}건
                </h2>
                <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
                  <table className="w-full min-w-[44rem] text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] text-slate-500">
                      <tr>
                        <th scope="col" className="px-3 py-2">순위</th>
                        <th scope="col" className="px-3 py-2">모델</th>
                        <th scope="col" className="px-3 py-2">평가셋</th>
                        <th scope="col" className="px-3 py-2">지표</th>
                        <th scope="col" className="px-3 py-2">점수</th>
                        <th scope="col" className="px-3 py-2">평가일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map((e, i) => (
                        <tr key={e.id} className="border-t border-slate-100">
                          <th scope="row" className="px-3 py-2 tabular-nums font-bold text-slate-500 text-left">{i + 1}</th>
                          <td className="px-3 py-2">
                            <span className="font-bold text-slate-800">{e.modelName}</span>
                            <span className="ml-1 font-mono text-[11px] text-slate-500">
                              {e.modelVersion}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600">{datasetName(e.datasetId)}</td>
                          <td className="px-3 py-2 text-slate-600">{e.metric}</td>
                          <td className="px-3 py-2 tabular-nums font-black text-slate-900">
                            {pct(e.score)}
                          </td>
                          <td className="px-3 py-2 tabular-nums text-slate-600">{e.evaluatedOn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <p className="mt-4 max-w-3xl text-xs text-slate-500">
                같은 평가셋으로 잰 것끼리만 비교할 수 있습니다. 평가셋이 다르면 점수가 달라도
                어느 쪽이 나은지 알 수 없습니다 — 여기 순위는 참고이고, 배포 전에는 같은 조건으로
                다시 재십시오.
              </p>
            </>
          )
        })()}
    </main>
  )
}
