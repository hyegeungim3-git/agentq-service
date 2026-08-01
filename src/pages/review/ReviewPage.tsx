import { formatSize } from '@entities/document/model'
import {
  REGULATION_SETS,
  canSubmit,
  complianceScore,
  countBySeverity,
  regulationLabel,
  severityLabel,
  type Severity,
} from '@entities/review/model'
import { useReview, type ReviewOptions } from '@features/review/useReview'

/* 심각도 표현은 색만으로 구분하지 않는다(가이드 §8: 색상만으로 상태를 전달하지 않는다).
   라벨을 항상 함께 쓴다. */
const SEVERITY_STYLE: Record<Severity, string> = {
  high: 'border-rose-200 bg-rose-50 text-rose-900',
  medium: 'border-amber-200 bg-amber-50 text-amber-900',
  low: 'border-sky-200 bg-sky-50 text-sky-900',
}

export function ReviewPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: ReviewOptions }) {
  const r = useReview(apiOptions ?? {})

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 min-h-11 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              ← 돌아가기
            </button>
          )}
          <h1 className="text-xl font-black text-slate-900">문서 사전 검토 에이전트</h1>
          <p className="mt-1 text-sm text-slate-600">
            기안문을 사규와 대조해 위반 소지와 조치 사항을 찾아 줍니다.
          </p>
        </header>

        {r.phase.kind === 'loadingDocs' && (
          <div role="status" aria-live="polite" className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white">
            <span className="sr-only">문서 목록을 불러오는 중입니다</span>
          </div>
        )}

        {r.phase.kind === 'docsError' && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-bold text-rose-800">문서 목록을 불러오지 못했습니다</p>
            <p className="mt-1 text-sm text-rose-700">{r.phase.message}</p>
          </div>
        )}

        {r.phase.kind !== 'loadingDocs' && r.phase.kind !== 'docsError' && (
          <div className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-black text-slate-900">1 · 검토할 문서</h2>
              {r.docs.length === 0 ? (
                <p className="text-sm text-slate-600">검토할 문서가 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {r.docs.map((d) => (
                    <li key={d.id}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-50">
                        <input
                          type="radio"
                          name="document"
                          value={d.id}
                          checked={r.documentId === d.id}
                          onChange={() => r.setDocumentId(d.id)}
                          className="size-4"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-800">{d.name}</span>
                          <span className="block text-xs text-slate-500">{formatSize(d.sizeBytes)}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <fieldset>
                <legend className="text-sm font-black text-slate-900">2 · 대조할 규정</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {REGULATION_SETS.map((set) => (
                    <label
                      key={set}
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={r.regulationSets.includes(set)}
                        onChange={() => r.toggleSet(set)}
                        className="size-4"
                      />
                      <span className="text-sm font-bold text-slate-800">{regulationLabel(set)}</span>
                    </label>
                  ))}
                </div>
                {r.regulationSets.length === 0 && (
                  <p className="mt-2 text-xs font-bold text-amber-700">규정을 1개 이상 선택하세요.</p>
                )}
              </fieldset>
            </section>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void r.run()}
                disabled={r.phase.kind === 'running' || !r.documentId || r.regulationSets.length === 0}
                className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {r.phase.kind === 'running' ? '검토 중…' : '사전 검토 시작'}
              </button>
              {r.phase.kind === 'done' && (
                <button
                  type="button"
                  onClick={r.reset}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  다시 설정
                </button>
              )}
            </div>

            {r.phase.kind === 'running' && (
              <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-slate-700">사규와 대조하고 있습니다…</p>
                <div className="mt-3 space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              </div>
            )}

            {r.phase.kind === 'failed' && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
                <p className="text-sm font-bold text-rose-800">검토에 실패했습니다</p>
                <p className="mt-1 text-sm text-rose-700">{r.phase.message}</p>
              </div>
            )}

            {r.phase.kind === 'done' && (
              <section aria-labelledby="review-result" className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 id="review-result" className="text-sm font-black text-slate-900">
                  검토 결과 — 위반 소지 {r.phase.result.violations.length}건
                </h2>

                <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(() => {
                    const c = countBySeverity(r.phase.result.violations)
                    return [
                      ['준수 점수', `${complianceScore(r.phase.result.violations)}점`],
                      ['높음', `${c.high}건`],
                      ['중간·낮음', `${c.medium + c.low}건`],
                      ['대조 조항', `${r.phase.result.checkedClauses}개`],
                    ]
                  })().map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
                      <dt className="text-[11px] text-slate-500">{k}</dt>
                      <dd className="text-sm font-black text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>

                {/* 상신 가능 여부를 명시한다 — 점수만 보여 주면 '그래서 올려도 되나'에 답이 없다 */}
                <p
                  className={`mt-4 rounded-lg border px-3 py-2 text-sm font-bold ${
                    canSubmit(r.phase.result.violations)
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-rose-200 bg-rose-50 text-rose-900'
                  }`}
                >
                  {canSubmit(r.phase.result.violations)
                    ? '심각도 높음 위반이 없어 결재 상신이 가능합니다.'
                    : '심각도 높음 위반이 남아 있어 결재 상신을 권하지 않습니다.'}
                </p>

                {r.phase.result.violations.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">선택한 규정에서 위반 소지를 찾지 못했습니다.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {r.phase.result.violations.map((v) => (
                      <li key={v.id} className={`rounded-lg border p-4 ${SEVERITY_STYLE[v.severity]}`}>
                        <p className="flex flex-wrap items-center gap-2 text-xs font-bold">
                          <span className="rounded bg-white/70 px-1.5 py-0.5">심각도 {severityLabel(v.severity)}</span>
                          <span>{v.clause}</span>
                        </p>
                        <p className="mt-1.5 text-sm font-bold">{v.type}</p>
                        <p className="mt-1 text-sm leading-relaxed">{v.detail}</p>
                        <p className="mt-2 text-sm">
                          <span className="font-bold">조치 · </span>
                          {v.action}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-5 text-xs text-slate-400">
                  AI가 대조한 결과입니다. 최종 판단은 담당 부서 확인이 필요합니다.
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
