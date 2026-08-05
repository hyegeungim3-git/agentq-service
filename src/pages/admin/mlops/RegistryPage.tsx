import { MODEL_STAGE_LABEL, unevaluated, untraceable } from '@entities/mlops/model'
import { fetchEvalResults, fetchModelVersions } from '@shared/api/mlops'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'
import { DATASETS } from '@fixtures/mlops'

/**
 * 모델 레지스트리.
 *
 * **계보가 끊긴 모델**을 먼저 드러낸다. 운영 중인데 무슨 데이터로 학습했는지
 * 모르면, 개인정보 삭제 요청이 왔을 때 어느 모델을 다시 학습해야 하는지 답할 수
 * 없다. 라이선스가 막히는 경우도 마찬가지다.
 *
 * 평가 기록이 없는데 운영 중인 모델도 함께 본다 — 점수 없이 올라간 것이다.
 */

const datasetName = (id: string): string => DATASETS.find((d) => d.id === id)?.name ?? id

export function RegistryPage() {
  const models = useRemote(fetchModelVersions, [])
  const evals = useRemote(fetchEvalResults, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">모델 레지스트리</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">등록된 모델 버전과 그 계보입니다.</p>

      {models.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">모델 목록을 불러오는 중입니다</span>
        </div>
      )}

      {models.kind === 'ready' &&
        (() => {
          const lost = untraceable(models.data)
          const noEval = evals.kind === 'ready' ? unevaluated(models.data, evals.data) : []
          return (
            <>
              {lost.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">계보가 끊긴 모델 {lost.length}건</p>
                  <ul className="mt-2 space-y-1">
                    {lost.map((m) => (
                      <li key={m.id} className="text-xs text-rose-800">
                        <b>
                          {m.name} {m.version}
                        </b>{' '}
                        · {MODEL_STAGE_LABEL[m.stage]} — 학습 작업과 데이터셋 기록이 없습니다.
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-bold text-rose-900">
                    개인정보 삭제 요청이 오거나 데이터 라이선스가 막히면, 이 모델을 다시 학습해야
                    하는지 판단할 수 없습니다.
                  </p>
                </div>
              )}

              {noEval.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  평가 기록 없이 운영 중인 모델 {noEval.length}건(
                  {noEval.map((m) => `${m.name} ${m.version}`).join(', ')})이 있습니다. 점수 없이
                  올라간 것이므로 무엇을 근거로 골랐는지 남아 있지 않습니다.
                </p>
              )}

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
                <table className="w-full min-w-[48rem] text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">모델</th>
                      <th scope="col" className="px-3 py-2">버전</th>
                      <th scope="col" className="px-3 py-2">단계</th>
                      <th scope="col" className="px-3 py-2">학습 작업</th>
                      <th scope="col" className="px-3 py-2">학습 데이터</th>
                      <th scope="col" className="px-3 py-2">등록</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...lost, ...models.data.filter((m) => !lost.includes(m))].map((m) => (
                      <tr
                        key={m.id}
                        className={`border-t border-slate-100 ${lost.includes(m) ? 'bg-rose-50' : ''}`}
                      >
                        <td className="px-3 py-2 font-bold text-slate-800">{m.name}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{m.version}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                              m.stage === 'production'
                                ? 'bg-brand text-brand-fg'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {MODEL_STAGE_LABEL[m.stage]}
                          </span>
                        </td>
                        {/* 빈칸으로 두면 못 적은 것인지 없는 것인지 알 수 없다 */}
                        <td className="px-3 py-2 font-mono text-[11px]">
                          {m.trainJobId ?? <span className="font-sans font-bold text-rose-700">기록 없음</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {m.datasetIds.length === 0 ? (
                            <span className="font-bold text-rose-700">기록 없음</span>
                          ) : (
                            m.datasetIds.map(datasetName).join(', ')
                          )}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">{m.registeredOn}</td>
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
