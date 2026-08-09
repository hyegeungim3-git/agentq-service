import { useState } from 'react'
import { STAT_WINDOWS, STAT_WINDOW_LABEL, type StatWindow } from '@entities/analytics/model'
import { buildReport, fetchReportSections } from '@shared/api/analytics'
import { useRemote } from '@features/remote/useRemote'
import { Button } from '@shared/ui/Button'

/**
 * 서비스 통계 리포트.
 *
 * **못 만드는 항목을 목록에서 빼지 않는다.** 빼면 애초에 없는 지표로 읽힌다.
 * 고를 수 없게 하고 왜 못 만드는지 적는다 — 무엇이 갖춰지면 되는지가 그 자리에 있다.
 *
 * 파일 생성은 서버가 한다. 지금 눌러도 내려받을 것이 없으므로 그대로 알린다.
 */

export function ReportPage() {
  const [window, setWindow] = useState<StatWindow>('30d')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchReportSections, [])

  const toggle = (id: string) => {
    const next = new Set(picked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setPicked(next)
  }

  const build = () => {
    void buildReport([...picked], window).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">서비스 통계 리포트</h1>
      <p className="mt-1 text-sm text-slate-600">기간과 항목을 골라 리포트를 만듭니다.</p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      <fieldset className="mt-4">
        <legend className="text-[11px] font-bold text-slate-500">기간</legend>
        <div className="mt-1 flex flex-wrap gap-1">
          {STAT_WINDOWS.map((w) => (
            <label
              key={w}
              className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
            >
              <input
                type="radio"
                name="report-window"
                value={w}
                checked={window === w}
                onChange={() => setWindow(w)}
                className="sr-only"
              />
              {STAT_WINDOW_LABEL[w]}
            </label>
          ))}
        </div>
      </fieldset>

      {state.kind === 'ready' &&
        (() => {
          const usable = state.data.filter((s) => s.available)
          const blocked = state.data.filter((s) => !s.available)
          return (
            <>
              <fieldset className="mt-5">
                <legend className="text-[11px] font-bold text-slate-500">
                  넣을 항목 ({picked.size} / {usable.length} 선택)
                </legend>
                <ul className="mt-2 space-y-2">
                  {usable.map((s) => (
                    <li key={s.id}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={picked.has(s.id)}
                          onChange={() => toggle(s.id)}
                        />
                        {s.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>

              {/* 빼면 애초에 없는 지표로 읽힌다 */}
              {blocked.length > 0 && (
                <section
                  aria-labelledby="blocked"
                  className="mt-4 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4"
                >
                  <h2 id="blocked" className="text-sm font-black text-amber-900">
                    지금 넣을 수 없는 항목 {blocked.length}개
                  </h2>
                  <ul className="mt-2 space-y-1">
                    {blocked.map((s) => (
                      <li key={s.id} className="text-xs text-amber-900">
                        <b>{s.label}</b> · {s.unavailableReason}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button tone="primary" onClick={build} disabled={picked.size === 0}>
                  리포트 만들기
                </Button>
                {picked.size === 0 && (
                  <p className="text-xs text-slate-500">항목을 하나 이상 고르세요.</p>
                )}
              </div>

              {/* 무엇이 담기는지 만들기 전에 말한다 */}
              {picked.size > 0 && (
                <p className="mt-3 max-w-2xl text-xs text-slate-600">
                  {STAT_WINDOW_LABEL[window]} 기준으로 {picked.size}개 항목이 담깁니다. 만족도 항목을
                  넣으면 그 점수는 답한 사람만의 평균이라는 설명도 함께 들어갑니다.
                </p>
              )}
            </>
          )
        })()}
    </main>
  )
}
