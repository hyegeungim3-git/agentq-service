import { useState } from 'react'
import { responseRate, surveyAverage } from '@entities/analytics/model'
import { fetchSurvey, sendSurvey } from '@shared/api/analytics'
import { useRemote } from '@features/remote/useRemote'
import { AdminButton } from '@widgets/admin-shell/AdminControls'

/**
 * 이용만족도.
 *
 * **평균 옆에 표본을 적는다.** 응답률이 68%면 그 평균은 답한 사람만의 평균이고,
 * 답하지 않은 32%는 아무 말도 하지 않았다. '평균 4.2점'만 크게 띄우면
 * 전체가 4.2점이라고 읽는다.
 *
 * 낮은 점수(1~2점) 의견을 위로 올린다. 좋은 평 사이에 섞이면 그냥 넘어간다 —
 * 고칠 거리는 낮은 점수 쪽에 있다.
 */

export function SatisfactionPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchSurvey, [])

  const send = () => {
    void sendSurvey().then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-black text-slate-900">이용만족도</h1>
        <AdminButton layout="ml-auto" onClick={send}>
          만족도 조사 발송
        </AdminButton>
      </div>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">만족도 조사를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const s = state.data
          const avg = surveyAverage(s)
          const rate = responseRate(s)
          const silent = s.sent - s.responded
          const low = s.comments.filter((c) => c.rating <= 2)
          const rest = s.comments.filter((c) => c.rating > 2)
          const total = s.distribution.reduce((n, c) => n + c, 0)
          return (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">평균</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {avg === null ? '없음' : `${avg}점`}
                  </dd>
                  {/* 누가 답한 평균인지 밝힌다 */}
                  <dd className="text-[10px] text-slate-400">답한 {s.responded}명의 평균</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">응답률</dt>
                  <dd className="text-xl font-black text-slate-900">{Math.round(rate * 100)}%</dd>
                  <dd className="text-[10px] text-slate-400">
                    {s.responded} / {s.sent}명
                  </dd>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <dt className="text-[11px] font-bold text-amber-900">답하지 않음</dt>
                  <dd className="text-xl font-black text-amber-900">{silent}명</dd>
                  <dd className="text-[10px] text-amber-800">이 평균에 없음</dd>
                </div>
              </dl>

              {/* 표본 편향을 말하지 않으면 전체 평균으로 읽힌다 */}
              <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                이 점수는 <b>답한 {s.responded}명의 평균</b>입니다. {silent}명은 답하지 않았고 그 사람들의
                생각은 여기 없습니다. 만족한 사람과 불만인 사람 중 어느 쪽이 더 답했는지 알 수 없으므로
                전사 만족도로 읽으면 안 됩니다.
              </p>

              <section aria-labelledby="dist" className="mt-5">
                <h2 id="dist" className="text-sm font-black text-slate-900">
                  평점 분포
                </h2>
                <ul className="mt-2 space-y-1">
                  {[5, 4, 3, 2, 1].map((score) => {
                    const n = s.distribution[score - 1] ?? 0
                    const ratio = total === 0 ? 0 : n / total
                    return (
                      <li key={score} className="flex items-center gap-2">
                        <span className="w-8 text-xs font-bold text-slate-600">{score}점</span>
                        <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <span
                            className={`block h-full ${score <= 2 ? 'bg-rose-500' : 'bg-slate-700'}`}
                            style={{ width: `${(ratio * 100).toFixed(1)}%` }}
                          />
                        </span>
                        <span className="w-24 text-right text-xs tabular-nums text-slate-600">
                          {n}건 ({Math.round(ratio * 100)}%)
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </section>

              <section aria-labelledby="trend" className="mt-5">
                <h2 id="trend" className="text-sm font-black text-slate-900">
                  최근 추이
                </h2>
                <ul className="mt-2 flex flex-wrap gap-3">
                  {s.trend.map((t) => (
                    <li key={t.date} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
                      <span className="block text-sm font-black tabular-nums text-slate-900">
                        {t.value.toFixed(1)}
                      </span>
                      <span className="block text-[10px] text-slate-500">{t.date}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="comments" className="mt-5">
                <h2 id="comments" className="text-sm font-black text-slate-900">
                  남긴 의견 {s.comments.length}건
                  {low.length > 0 && (
                    <span className="ml-1 text-xs font-bold text-rose-700">· 낮은 점수 {low.length}건</span>
                  )}
                </h2>
                {/* 고칠 거리는 낮은 점수 쪽에 있다 */}
                <ul className="mt-2 space-y-2">
                  {[...low, ...rest].map((c) => (
                    <li
                      key={c.id}
                      className={`rounded-xl border p-3 ${
                        c.rating <= 2 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                            c.rating <= 2 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.rating}점
                        </span>
                        <span className="text-xs font-bold text-slate-800">{c.userName}</span>
                        <span className="text-xs text-slate-500">{c.dept}</span>
                        <span className="ml-auto text-[11px] text-slate-400">{c.at}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-700">{c.text}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )
        })()}
    </main>
  )
}
