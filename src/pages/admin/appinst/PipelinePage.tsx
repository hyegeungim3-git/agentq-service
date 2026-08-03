import { STAGE_LABEL, dropped, survived, worstStage } from '@entities/appinst/model'
import { fetchPipelineRuns } from '@shared/api/appinst'
import { useRemote } from '@features/remote/useRemote'

/**
 * RAG 파이프라인.
 *
 * 지식 관리 화면과 나누는 기준: 저기는 **결과**(못 찾는 문서가 몇 건),
 * 여기는 **어느 단계에서 떨어졌나**다. 결과만 보면 고칠 곳을 못 찾는다.
 *
 * 단계별로 들어온 수·나간 수·떨어진 이유를 본다. 가장 많이 떨어지는 단계를
 * 먼저 말한다 — 고칠 곳은 대개 거기다.
 *
 * **아직 안 끝난 실행을 끝난 것처럼 그리지 않는다.** 마지막 단계 숫자만 보면
 * 다 된 것처럼 보인다.
 */

export function PipelinePage() {
  const state = useRemote(fetchPipelineRuns, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">RAG 파이프라인</h1>
      <p className="mt-1 text-sm text-slate-600">
        문서가 검색되기까지 거치는 단계입니다. 결과(못 찾는 문서가 몇 건)는{' '}
        <b>지식 · RAG &gt; 지식영역</b>에서 보고, 여기서는 <b>어느 단계에서 떨어졌는지</b>를 봅니다.
      </p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">파이프라인 기록을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' && (
        <ul aria-label="파이프라인 실행" className="mt-4 space-y-4">
          {state.data.map((run) => {
            const worst = worstStage(run.stages)
            const first = run.stages[0]?.incoming ?? 0
            const last = survived(run.stages)
            const running = run.finishedAt === null
            return (
              <li
                key={run.id}
                className={`rounded-xl border p-4 ${
                  running ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-slate-900">{run.areaName}</p>
                  {/* 마지막 단계 숫자만 보면 다 된 것처럼 보인다 */}
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                      running ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {running ? '진행 중' : '완료'}
                  </span>
                  <span className="ml-auto text-[11px] text-slate-500">
                    {run.startedAt}
                    {run.finishedAt ? ` → ${run.finishedAt}` : ' — 아직 안 끝났습니다'}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-700">
                  들어온 문서 <b>{first}건</b> → 검색 가능 <b>{last}건</b>
                  {first !== last && (
                    <span className="ml-1 font-bold text-rose-700">· {first - last}건 떨어짐</span>
                  )}
                </p>

                {/* 고칠 곳은 대개 여기다 */}
                {worst && dropped(worst) > 0 && (
                  <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
                    가장 많이 떨어지는 단계 · <b>{STAGE_LABEL[worst.stage]}</b>에서 {dropped(worst)}건
                  </p>
                )}

                <ol className="mt-3 space-y-2">
                  {run.stages.map((s) => {
                    const lost = dropped(s)
                    return (
                      <li key={s.stage} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-slate-900">
                            {STAGE_LABEL[s.stage]}
                          </span>
                          <span className="text-xs tabular-nums text-slate-600">
                            {s.incoming} → {s.out}
                          </span>
                          {lost > 0 && (
                            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                              {lost}건 떨어짐
                            </span>
                          )}
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-slate-700"
                            style={{
                              width: `${s.incoming === 0 ? 0 : (s.out / s.incoming) * 100}%`,
                            }}
                          />
                        </div>
                        {/* '몇 건 떨어졌다'만으로는 손쓸 수 없다 */}
                        {s.drops.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {s.drops.map((d) => (
                              <li key={d.reason} className="text-[11px] text-slate-600">
                                · {d.reason} — {d.count}건
                              </li>
                            ))}
                          </ul>
                        )}
                        {lost > 0 && s.drops.length === 0 && (
                          <p className="mt-1 text-[11px] text-amber-800">
                            떨어진 사유가 기록되지 않았습니다 — 무엇을 고쳐야 하는지 알 수 없습니다.
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
