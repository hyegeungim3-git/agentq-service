import { useState } from 'react'
import { TRAIN_KINDS, TRAIN_KIND_LABEL, type TrainKind } from '@entities/mlops/model'
import { fetchTrainRuns } from '@shared/api/mlops'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'
import { DATASETS } from '@fixtures/mlops'

/**
 * 학습 · 튜닝.
 *
 * 대시보드의 **트레이너 현황과 같은 작업**을 다룬다. 화면이 둘인 이유는 보는
 * 것이 다르기 때문이다 — 저기는 구간별 집계(몇 건 돌았나), 여기는 **작업 하나하나**
 * (무슨 데이터로 돌았고 GPU를 얼마나 썼나). 데이터를 복제하지 않는다.
 *
 * **데이터셋 없이 돈 작업**을 드러낸다. 무엇으로 학습했는지 모르는 모델이
 * 거기서 나온다 — 모델 레지스트리의 '계보가 끊긴 모델'이 이렇게 생긴다.
 *
 * 이전 데모는 LLM 파인튜닝·VLM·임베딩·리랭킹을 메뉴 넷으로 나눠 뒀다. 표 모양이
 * 같아 화면 하나에 **유형 필터**를 뒀다 — 대신 유형마다 다른 설정을 함께 보여 준다.
 * **설정이 없으면 같은 결과를 다시 만들 수 없다.**
 */

const STATE_LABEL = { running: '학습 중', done: '완료', failed: '실패' } as const
const STATE_TONE = {
  running: 'bg-sky-50 text-sky-900',
  done: 'bg-slate-100 text-slate-600',
  failed: 'bg-rose-100 text-rose-800',
} as const

const datasetName = (id: string): string => DATASETS.find((d) => d.id === id)?.name ?? id

export function TrainingPage() {
  const [kind, setKind] = useState<TrainKind | 'all'>('all')
  const state = useRemote(fetchTrainRuns, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">학습 · 튜닝</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        학습 작업 하나하나입니다. 구간별 집계는 <b>대시보드 &gt; 트레이너 현황</b>에서 봅니다 —
        같은 작업을 다른 각도로 보는 것이라 데이터를 복제하지 않았습니다.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', ...TRAIN_KINDS] as const).map((k) => (
          <label
            key={k}
            className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
          >
            <input
              type="radio"
              name="train-kind"
              value={k}
              checked={kind === k}
              onChange={() => setKind(k)}
              className="sr-only"
            />
            {k === 'all' ? '전체' : TRAIN_KIND_LABEL[k]}
          </label>
        ))}
      </div>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">학습 작업을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const shown = kind === 'all' ? state.data : state.data.filter((r) => r.kind === kind)
          const noData = shown.filter((r) => r.datasetIds.length === 0)
          const failed = shown.filter((r) => r.state === 'failed')
          const gpuHours = shown.reduce((n, r) => n + r.gpuHours, 0)
          return (
            <>
              {noData.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    학습 데이터 기록이 없는 작업 {noData.length}건
                  </p>
                  <ul className="mt-2 space-y-1">
                    {noData.map((r) => (
                      <li key={r.id} className="text-xs text-rose-800">
                        <b>{r.id}</b> · {r.model} — {r.note ?? '사유가 기록되지 않았습니다.'}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-bold text-rose-900">
                    이런 작업에서 나온 모델은 계보가 끊깁니다. 모델 레지스트리에서 확인하십시오.
                  </p>
                </div>
              )}

              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">작업</dt>
                  <dd className="text-xl font-black text-slate-900">{shown.length}건</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    failed.length > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">실패</dt>
                  <dd className="text-xl font-black text-slate-900">{failed.length}건</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">GPU 시간</dt>
                  <dd className="text-xl font-black text-slate-900">{gpuHours.toFixed(1)}h</dd>
                </div>
              </dl>

              <ul className="mt-4 space-y-2">
                {[...failed, ...shown.filter((r) => r.state !== 'failed')].map((r) => (
                  <li
                    key={r.id}
                    className={`rounded-xl border p-4 ${
                      r.state === 'failed' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${STATE_TONE[r.state]}`}>
                        {STATE_LABEL[r.state]}
                      </span>
                      <p className="font-mono text-sm font-black text-slate-900">{r.id}</p>
                      <span className="text-xs text-slate-600">
                        {r.model} · {r.method}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {TRAIN_KIND_LABEL[r.kind]}
                      </span>
                      <span className="ml-auto text-[11px] tabular-nums text-slate-500">
                        {r.startedAt} · GPU {r.gpuHours.toFixed(1)}h
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      학습 데이터 ·{' '}
                      {r.datasetIds.length === 0 ? (
                        <span className="font-bold text-rose-700">기록 없음</span>
                      ) : (
                        r.datasetIds.map(datasetName).join(', ')
                      )}
                    </p>
                    {/* 설정이 없으면 같은 결과를 다시 만들 수 없다 */}
                    <p className="mt-1 text-xs text-slate-600">
                      설정 ·{' '}
                      {r.config.length === 0 ? (
                        <span className="font-bold text-amber-800">기록 없음 — 재현할 수 없습니다</span>
                      ) : (
                        r.config.map((c) => `${c.label} ${c.value}`).join(' · ')
                      )}
                    </p>
                    {/* 건수만 세면 손쓸 수 없다 */}
                    {r.note && <p className="mt-1 text-xs font-bold text-rose-800">{r.note}</p>}
                  </li>
                ))}
              </ul>
            </>
          )
        })()}
    </main>
  )
}
