import { useState } from 'react'
import {
  MODE_LABEL,
  USAGE_MODES,
  averageRating,
  type UsageMode,
} from '@entities/analytics/model'
import { fetchUsageEntries } from '@shared/api/analytics'
import { useRemote } from '@features/remote/useRemote'

/**
 * 이용 이력.
 *
 * ⚠️ **질의 본문은 없다.** 접근 로그 화면이 '챗봇 질문 본문은 남기지 않는다'고
 * 말하고 있으므로 이 화면도 같아야 한다. 이전 데모는 본문을 그대로 보여 줬는데,
 * 그러면 두 화면이 다른 말을 하게 되고 어느 쪽이 사실인지 알 수 없다.
 * 보관 여부는 백엔드가 정한다 — 정해지면 이 자리에 본문이 온다.
 *
 * 만족도를 안 남긴 건을 0점으로 세지 않는다. 평균이 무너진다.
 */

export function UsageHistoryPage() {
  const [mode, setMode] = useState<UsageMode | 'all'>('all')
  const state = useRemote(() => fetchUsageEntries(mode), [mode])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">이용 이력</h1>
      <p className="mt-1 text-sm text-slate-600">언제 누가 어떤 업무로 썼는지입니다.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', ...USAGE_MODES] as const).map((m) => (
          <label
            key={m}
            className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
          >
            <input
              type="radio"
              name="usage-mode"
              value={m}
              checked={mode === m}
              onChange={() => setMode(m)}
              className="sr-only"
            />
            {m === 'all' ? '전체' : MODE_LABEL[m]}
          </label>
        ))}
      </div>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">이용 이력을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' && state.data.length === 0 && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          이 업무 유형으로 쓴 기록이 없습니다.
        </p>
      )}

      {state.kind === 'ready' &&
        state.data.length > 0 &&
        (() => {
          const avg = averageRating(state.data)
          const reported = state.data.filter((e) => e.reported)
          const tokens = state.data.reduce((n, e) => n + e.tokens, 0)
          return (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">질의</dt>
                  <dd className="text-xl font-black text-slate-900">{state.data.length}건</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">사용 토큰</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {tokens.toLocaleString('ko-KR')}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">평균 만족도</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {avg.value === null ? '없음' : `${avg.value}/5`}
                  </dd>
                  {/* 몇 건을 세서 나온 평균인지 밝힌다 */}
                  <dd className="text-[10px] text-slate-400">
                    {state.data.length}건 중 {avg.counted}건이 답함
                  </dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    reported.length > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">오류 신고</dt>
                  <dd
                    className={`text-xl font-black ${reported.length > 0 ? 'text-rose-800' : 'text-slate-900'}`}
                  >
                    {reported.length}건
                  </dd>
                </div>
              </dl>

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[44rem] text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">시각</th>
                      <th scope="col" className="px-3 py-2">사용자</th>
                      <th scope="col" className="px-3 py-2">업무</th>
                      <th scope="col" className="px-3 py-2">토큰</th>
                      <th scope="col" className="px-3 py-2">만족도</th>
                      <th scope="col" className="px-3 py-2">오류 신고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...reported, ...state.data.filter((e) => !e.reported)].map((e) => (
                      <tr key={e.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 tabular-nums text-slate-600">{e.at}</td>
                        <td className="px-3 py-2">
                          <span className="font-bold text-slate-800">{e.userName}</span>
                          <span className="ml-1 text-slate-500">{e.dept}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{MODE_LABEL[e.mode]}</td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">
                          {e.tokens.toLocaleString('ko-KR')}
                        </td>
                        {/* 안 남긴 것을 0점으로 두면 나쁜 평가를 받은 것으로 읽힌다 */}
                        <td className="px-3 py-2 tabular-nums">
                          {e.rating === null ? (
                            <span className="text-slate-400">답하지 않음</span>
                          ) : (
                            <span className={e.rating <= 2 ? 'font-bold text-rose-700' : 'text-slate-700'}>
                              {e.rating}/5
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {e.reported ? (
                            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold text-rose-800">
                              신고됨
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
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

      {/* 두 화면이 다른 말을 하면 어느 쪽이 사실인지 알 수 없다 */}
      <section
        aria-labelledby="no-body"
        className="mt-5 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4"
      >
        <h2 id="no-body" className="text-sm font-black text-amber-900">
          질의 본문은 이 목록에 없습니다
        </h2>
        <p className="mt-1 text-xs text-amber-900">
          접근 로그와 같은 기준입니다 — 누가 언제 어떤 업무로 썼는지만 남기고, 무엇을 물었는지는
          남기지 않습니다. 본문 보관 여부는 정해지지 않았고, 정해지면 이 자리에 보입니다.
        </p>
        <p className="mt-1 text-xs text-amber-800">
          그래서 지금 이 화면으로는 <b>무엇을 물었길래 오류로 신고됐는지</b> 알 수 없습니다.
          신고 건의 내용은 AI 품질 관리의 전문가 검토 기록에서 확인하십시오.
        </p>
      </section>
    </main>
  )
}
