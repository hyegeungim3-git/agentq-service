import { REGULATION_CATEGORIES, categoryLabel, isStale } from '@entities/regulation/model'
import { useRegulation, type RegulationOptions } from '@features/regulation/useRegulation'
import { AgentPageHeader } from '@widgets/agent-shell/AgentShell'
import { Play } from 'lucide-react'

/**
 * 내규 조회는 문서 선택이 아니라 질문 입력형이라 AgentShell을 쓰지 않는다.
 * 골격을 억지로 맞추면 '문서를 고르라'는 절이 남아 화면이 이상해진다.
 */
export function RegulationPage({
  onBack,
  apiOptions,
}: {
  onBack?: () => void
  apiOptions?: RegulationOptions
}) {
  const r = useRegulation(apiOptions ?? {})

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <AgentPageHeader
          agentId="internalreg"
          title="내규·규정 조회 에이전트"
          desc={
            <>
              사내 규정을 조항 근거와 함께 조회합니다. 근거를 찾지 못하면 답을 지어내지 않습니다.
            </>
          }
          onBack={onBack}
        />

        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <label htmlFor="question" className="block text-sm font-black text-slate-900">
              무엇이 궁금하신가요?
            </label>
            <textarea
              id="question"
              value={r.question}
              onChange={(e) => r.setQuestion(e.target.value)}
              rows={3}
              placeholder="예) 출장 여비 기준액을 초과하면 어떻게 하나요?"
              className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />

            <fieldset className="mt-4">
              <legend className="text-xs font-bold text-slate-600">조회할 규정 분류</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {REGULATION_CATEGORIES.map((c) => (
                  <label
                    key={c}
                    className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
                  >
                    <input
                      type="checkbox"
                      checked={r.categories.includes(c)}
                      onChange={() => r.toggleCategory(c)}
                      className="sr-only"
                    />
                    {categoryLabel(c)}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <button
            type="button"
            onClick={() => void r.run()}
            disabled={!r.canRun || r.phase.kind === 'running'}
            className="bg-brand text-brand-fg flex min-h-11 items-center gap-2 rounded-lg px-5 text-sm font-bold shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="size-4" aria-hidden="true" />
            {r.phase.kind === 'running' ? '조회 중…' : '규정 조회'}
          </button>

          {r.phase.kind === 'running' && (
            <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-700">규정을 검색하고 있습니다…</p>
              <div className="mt-3 space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
                ))}
              </div>
            </div>
          )}

          {r.phase.kind === 'failed' && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
              <p className="text-sm font-bold text-rose-800">조회에 실패했습니다</p>
              <p className="mt-1 text-sm text-rose-700">{r.phase.message}</p>
            </div>
          )}

          {r.phase.kind === 'done' && (
            <section
              aria-labelledby="reg-answer"
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <h2 id="reg-answer" className="text-sm font-black text-slate-900">
                조회 결과
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-800">{r.phase.result.answer}</p>

              {r.phase.result.citations.length === 0 ? (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
                  근거 조항을 찾지 못했습니다. 담당 부서 확인이 필요합니다.
                </p>
              ) : (
                <>
                  <h3 className="mt-5 text-xs font-bold text-slate-600">근거 조항</h3>
                  <ul className="mt-2 space-y-3">
                    {r.phase.result.citations.map((c) => (
                      <li key={c.clause} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
                          <span>{c.clause}</span>
                          <span className="text-slate-400">개정 {c.revisedOn}</span>
                          {/* 오래된 근거는 사람이 확인해야 한다 */}
                          {isStale(c) && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                              개정 후 3년 경과 — 최신 여부 확인 필요
                            </span>
                          )}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{c.text}</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {r.phase.result.related.length > 0 && (
                <>
                  <h3 className="mt-5 text-xs font-bold text-slate-600">함께 보면 좋은 조항</h3>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {r.phase.result.related.map((x) => (
                      <li key={x} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {x}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <p className="mt-5 text-xs text-slate-400">
                AI가 검색한 결과입니다. 최종 판단은 원문과 담당 부서 확인이 필요합니다.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
