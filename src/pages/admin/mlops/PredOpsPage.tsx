import { useState } from 'react'
import {
  MARGIN_WARN,
  PSI_WATCH,
  awaitingPromotion,
  challengerWins,
  drifting,
  margin,
  needsAttention,
  withoutSchedule,
  type PredModel,
} from '@entities/predops/model'
import { fetchDriftItems, fetchPredModels, fetchRetrainRuns, promoteChallenger } from '@shared/api/predops'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'
import { AdminButton } from '@widgets/admin-shell/AdminControls'

/**
 * 예측 모델 운영.
 *
 * 배포한 뒤의 이야기다 — 낡고 있는가, 무엇이 달라져서 낡는가, 새로 만든 것이 더 나은가.
 *
 * **지표를 그대로 나란히 두지 않는다.** MAE는 낮을수록 좋고 F1은 높을수록 좋아서,
 * 두 수를 한 표에 세우면 반드시 잘못 읽는다. 임계까지 남은 **여유**로 바꿔 방향을
 * 없앤다 — 어느 모델이든 '남은 만큼'이고, 0에 가까울수록 급하다.
 * 원래 값도 함께 보여 주되, 판단은 여유로 한다.
 */

function MarginBar({ m }: { m: PredModel }) {
  const left = margin(m)
  const pct = Math.max(0, Math.min(1, left)) * 100
  const tone = left < 0 ? 'bg-rose-500' : left < MARGIN_WARN ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 text-[11px] font-bold tabular-nums text-slate-700">
          여유 {Math.round(left * 100)}%
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        {m.metricName} — 배포 때 {m.baseline} · 지금 {m.current} · 손봐야 하는 선 {m.threshold}
        {m.direction === 'lower' ? ' (낮을수록 좋음)' : ' (높을수록 좋음)'}
      </p>
    </div>
  )
}

export function PredOpsPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const models = useRemote(fetchPredModels, [])
  const drift = useRemote(fetchDriftItems, [])
  const runs = useRemote(fetchRetrainRuns, [])

  const promote = (id: string) => {
    void promoteChallenger(id).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">예측 모델 운영</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        배포한 모델이 지금도 맞는지, 무엇이 달라져서 낡는지를 봅니다.
      </p>

      {failure && (
        <p role="alert" className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {models.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">모델을 불러오는 중입니다</span>
        </div>
      )}

      {models.kind === 'ready' && (
        <>
          {(() => {
            const soon = needsAttention(models.data)
            const unscheduled = withoutSchedule(models.data)
            return (
              <>
                {soon.length > 0 && (
                  <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    손봐야 하는 선에 가까워진 모델 <b>{soon.length}건</b> —{' '}
                    {soon.map((m) => m.name).join(' · ')}. 지표 방향이 서로 달라 값만 보면 잘못
                    읽습니다. 아래는 <b>남은 여유</b>로 통일해 보여 줍니다.
                  </p>
                )}
                {unscheduled.length > 0 && (
                  <p className="mt-2 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                    다음 재학습이 안 잡힌 모델 <b>{unscheduled.length}건</b> —{' '}
                    {unscheduled.map((m) => m.name).join(' · ')}. 손봐야 한다는 것은 아는데
                    <b> 언제 손볼지가 없습니다.</b>
                  </p>
                )}
              </>
            )
          })()}

          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            {models.data.map((m) => (
              <li key={m.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{m.name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                    {m.version}
                  </span>
                  <span
                    className={`ml-auto rounded px-1.5 py-0.5 text-[11px] font-bold ${
                      margin(m) < 0
                        ? 'bg-rose-100 text-rose-800'
                        : margin(m) < MARGIN_WARN
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {margin(m) < 0 ? '선을 넘음' : margin(m) < MARGIN_WARN ? '여유 얼마 없음' : '여유 있음'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {m.task} · {m.deployedOn} 배포 · {m.samples} · {m.owner}
                </p>
                <MarginBar m={m} />
                <p className="mt-2 text-[11px] text-slate-600">
                  다음 재학습:{' '}
                  {m.nextRetrainOn === null ? (
                    <b className="text-rose-800">안 잡힘</b>
                  ) : (
                    <b>{m.nextRetrainOn}</b>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      {drift.kind === 'ready' && (
        <>
          <h2 className="mt-5 text-sm font-black text-slate-900">들어오는 데이터가 달라졌나</h2>
          <p className="mt-1 max-w-3xl text-xs text-slate-600">
            모델이 낡는 이유는 대개 모델이 아니라 <b>데이터가 달라져서</b>입니다.
            분포 이동이 {PSI_WATCH}를 넘으면 들여다봅니다 — 지금 <b>{drifting(drift.data).length}건</b>입니다.
          </p>
          <ul className="mt-2 space-y-2">
            {drift.data.map((d) => {
              const watch = d.psi > PSI_WATCH
              return (
                <li
                  key={d.feature}
                  className={`rounded-xl border p-3 ${watch ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{d.feature}</span>
                    <span
                      className={`ml-auto text-[11px] font-bold tabular-nums ${watch ? 'text-amber-900' : 'text-slate-600'}`}
                    >
                      이동 {d.psi.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">{d.note}</p>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {runs.kind === 'ready' && models.kind === 'ready' && (
        <>
          <h2 className="mt-5 text-sm font-black text-slate-900">재학습과 교체</h2>
          {awaitingPromotion(runs.data).length > 0 && (
            <p className="mt-1 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              새로 만든 쪽이 더 나은데 아직 안 바꾼 것 <b>{awaitingPromotion(runs.data).length}건</b> —
              좋아진 모델이 서랍에 있는 동안 사용자는 옛 모델의 답을 받습니다.
            </p>
          )}
          <ul className="mt-2 space-y-2">
            {runs.data.map((r) => {
              const model = models.data.find((m) => m.id === r.modelId)
              const better = challengerWins(r)
              return (
                <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{model?.name ?? r.modelId}</span>
                    <span className="text-[11px] text-slate-500">· {r.trigger}</span>
                    <span
                      className={`ml-auto rounded px-1.5 py-0.5 text-[11px] font-bold ${
                        r.promotedOn === null ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.promotedOn === null ? '아직 안 바꿈' : `${r.promotedOn} 교체됨`}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {r.startedAt} 시작 · 지금 도는 모델 {r.champion} · 새로 만든 모델 {r.challenger} —{' '}
                    <b className={better ? 'text-emerald-800' : 'text-slate-600'}>
                      {better ? '새 쪽이 낫습니다' : '새 쪽이 낫지 않습니다'}
                    </b>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{r.note}</p>
                  {r.promotedOn === null && better && (
                    <AdminButton size="sm" layout="mt-2" onClick={() => promote(r.id)}>
                      이 모델로 교체
                    </AdminButton>
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
