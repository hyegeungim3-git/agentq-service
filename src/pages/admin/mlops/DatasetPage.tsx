import { DATASET_KIND_LABEL, leaky, unlicensed } from '@entities/mlops/model'
import { fetchDatasets } from '@shared/api/mlops'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'

/**
 * 데이터 관리.
 *
 * **학습과 평가에 같이 쓰는 데이터**를 먼저 드러낸다. 그걸로 평가하면 점수가
 * 부풀려지고, 높은 점수를 보고 배포하게 된다. 오류가 나지 않으므로 화면이
 * 말하지 않으면 아무도 모른다.
 *
 * 출처를 모르는 데이터도 드러낸다. 지금은 돌아가지만 나중에 못 쓰게 될 수 있고,
 * 그때는 그 데이터로 학습한 모델까지 다시 만들어야 한다.
 *
 * 개인정보가 든 데이터는 **어떻게 처리했는지**를 함께 적는다. '포함'만 쓰면
 * 처리했는지 안 했는지 알 수 없다.
 */

export function DatasetPage() {
  const state = useRemote(fetchDatasets, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">데이터셋</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        학습·평가에 쓰는 데이터셋입니다. 검색용 벡터는 <b>벡터 DB</b>, 바깥에서 가져오는 것은{' '}
        <b>자동 적재</b>에서 봅니다.
      </p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">데이터셋을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const mixed = leaky(state.data)
          const noLicense = unlicensed(state.data)
          const pii = state.data.filter((d) => d.hasPii)
          return (
            <>
              {mixed.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    학습과 평가에 같이 쓰는 데이터셋 {mixed.length}건
                  </p>
                  <ul className="mt-2 space-y-1">
                    {mixed.map((d) => (
                      <li key={d.id} className="text-xs text-rose-800">
                        {d.name}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-bold text-rose-900">
                    이 데이터로 잰 점수는 실제보다 높습니다. 배포 판단에 쓰면 안 됩니다 — 모델 평가
                    화면에서 해당 결과를 믿을 수 없음으로 표시해 두었습니다.
                  </p>
                </div>
              )}

              {noLicense.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  출처·라이선스를 확인하지 못한 데이터셋 {noLicense.length}건(
                  {noLicense.map((d) => d.name).join(', ')})이 있습니다. 지금은 쓸 수 있지만 나중에 못
                  쓰게 되면 <b>그 데이터로 학습한 모델까지 다시 만들어야 합니다.</b>
                </p>
              )}

              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">데이터셋</dt>
                  <dd className="text-xl font-black text-slate-900">{state.data.length}건</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">개인정보 포함</dt>
                  <dd className="text-xl font-black text-slate-900">{pii.length}건</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">총 행 수</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {state.data.reduce((n, d) => n + d.rows, 0).toLocaleString('ko-KR')}
                  </dd>
                </div>
              </dl>

              <ul className="mt-4 space-y-3">
                {state.data.map((d) => (
                  <li
                    key={d.id}
                    className={`rounded-xl border p-4 ${
                      d.kind === 'both' || d.license === null
                        ? 'border-amber-200 bg-white'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-slate-900">{d.name}</p>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          d.kind === 'both' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {DATASET_KIND_LABEL[d.kind]}
                      </span>
                      <span className="ml-auto text-[11px] tabular-nums text-slate-500">
                        {d.rows.toLocaleString('ko-KR')}행 · {d.registeredOn}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      출처 ·{' '}
                      {d.license ?? <span className="font-bold text-amber-800">확인되지 않음</span>}
                    </p>
                    {/* '포함'만 쓰면 처리했는지 안 했는지 알 수 없다 */}
                    {d.hasPii && (
                      <p className="mt-1 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-700">
                        개인정보 · {d.piiNote ?? '처리 여부가 기록되지 않았습니다.'}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )
        })()}
    </main>
  )
}
