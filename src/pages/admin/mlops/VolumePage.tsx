import { useState } from 'react'
import { FULL_THRESHOLD, STALE_DAYS, nearlyFull, stale, usedRatio } from '@entities/evidence/model'
import { fetchVolumes, releaseVolume } from '@shared/api/evidence'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'

/**
 * 공유 볼륨.
 *
 * **차면 학습이 멈춘다.** 그런데 용량은 조용히 찬다 — 오류가 나는 것은 다 찬
 * 다음이고, 그때는 이미 학습 작업이 죽어 있다. 그래서 곧 찰 볼륨을 먼저 말한다.
 *
 * 오래 안 쓴 볼륨도 드러낸다. 실험이 끝나도 아무도 안 지우고, 그 공간이 없어서
 * 새 학습이 못 도는 일이 생긴다.
 */

const pct = (r: number): string => `${Math.round(r * 100)}%`
const fmt = (n: number): string => n.toLocaleString('ko-KR')

export function VolumePage() {
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchVolumes, [])

  const release = (id: string) => {
    void releaseVolume(id).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">공유 볼륨</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        작업 공간이 함께 쓰는 저장소입니다. 사람별 GPU는 <b>작업 공간</b>에서 봅니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">볼륨을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const full = nearlyFull(state.data)
          const old = stale(state.data)
          const used = state.data.reduce((n, v) => n + v.usedGb, 0)
          const cap = state.data.reduce((n, v) => n + v.capacityGb, 0)
          return (
            <>
              {/* 오류가 나는 것은 다 찬 다음이다 */}
              {full.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    {Math.round(FULL_THRESHOLD * 100)}%를 넘긴 볼륨 {full.length}개
                  </p>
                  <ul className="mt-2 space-y-1">
                    {full.map((v) => (
                      <li key={v.id} className="text-xs text-rose-800">
                        <b>{v.name}</b> — {fmt(v.usedGb)} / {fmt(v.capacityGb)}GB ({pct(usedRatio(v))})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-bold text-rose-900">
                    차면 학습 작업이 중간에 죽습니다. 용량은 조용히 차고, 오류가 나는 것은 다 찬
                    다음입니다.
                  </p>
                </div>
              )}

              {old.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  {STALE_DAYS}일 넘게 아무도 안 쓴 볼륨이 {old.length}개 있습니다(
                  {old.map((v) => `${v.name} ${fmt(v.usedGb)}GB`).join(', ')}). 실험이 끝나도 지우는
                  사람이 없어, 그 공간이 없어서 새 학습이 못 도는 일이 생깁니다.
                </p>
              )}

              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">볼륨</dt>
                  <dd className="text-xl font-black text-slate-900">{state.data.length}개</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">사용</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {fmt(used)} / {fmt(cap)}GB
                  </dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    old.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">오래 안 쓴 것</dt>
                  <dd className="text-xl font-black text-slate-900">{old.length}개</dd>
                </div>
              </dl>

              <ul aria-label="공유 볼륨" className="mt-4 space-y-3">
                {[...full, ...state.data.filter((v) => !full.includes(v))].map((v) => {
                  const ratio = usedRatio(v)
                  return (
                    <li
                      key={v.id}
                      className={`rounded-xl border p-4 ${
                        ratio >= FULL_THRESHOLD ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="font-mono text-sm font-black text-slate-900">{v.name}</p>
                        <p className="text-xs tabular-nums text-slate-600">
                          {fmt(v.usedGb)} / {fmt(v.capacityGb)}GB
                        </p>
                        <p
                          className={`ml-auto text-sm font-black tabular-nums ${
                            ratio >= FULL_THRESHOLD ? 'text-rose-800' : 'text-slate-900'
                          }`}
                        >
                          {pct(ratio)}
                        </p>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${ratio >= FULL_THRESHOLD ? 'bg-rose-600' : 'bg-slate-700'}`}
                          style={{ width: `${(ratio * 100).toFixed(1)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        쓰는 사람 · {v.users.join(', ')} · 마지막 기록 {v.lastWriteAt}
                        {/* 안 쓴 지 며칠인지 안 적으면 지워도 되는지 모른다 */}
                        {v.idleDays > 0 && (
                          <span
                            className={
                              v.idleDays >= STALE_DAYS
                                ? ' font-bold text-amber-800'
                                : ' text-slate-500'
                            }
                          >
                            {' '}
                            · {v.idleDays}일째 안 씀
                          </span>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => release(v.id)}
                        className="mt-2 min-h-11 rounded-lg border border-slate-300 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                      >
                        비우기
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )
        })()}
    </main>
  )
}
