import {
  FOCUS_AREAS,
  SUMMARY_STYLES,
  TARGET_LENGTHS,
  compressionRate,
  focusLabel,
  styleDesc,
  styleLabel,
} from '@entities/summary/model'
import { useSummarize, type SummarizeOptions } from '@features/summarize/useSummarize'
import { formatSize } from '@entities/document/model'
import { formatCount } from '@shared/lib/format'

export function SummaryPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: SummarizeOptions }) {
  const s = useSummarize(apiOptions ?? {})

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
          <h1 className="text-xl font-black text-slate-900">문서 요약 에이전트</h1>
          <p className="mt-1 text-sm text-slate-600">
            문서를 고르고 방식을 정하면 핵심을 구조화해 요약합니다.
          </p>
        </header>

        {s.phase.kind === 'loadingDocs' && (
          <div role="status" aria-live="polite" className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white">
            <span className="sr-only">문서 목록을 불러오는 중입니다</span>
          </div>
        )}

        {s.phase.kind === 'docsError' && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-bold text-rose-800">문서 목록을 불러오지 못했습니다</p>
            <p className="mt-1 text-sm text-rose-700">{s.phase.message}</p>
          </div>
        )}

        {s.phase.kind !== 'loadingDocs' && s.phase.kind !== 'docsError' && (
          <div className="space-y-5">
            {/* ── 1. 문서 선택 ── */}
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-black text-slate-900">1 · 요약할 문서</h2>
              {s.docs.length === 0 ? (
                <p className="text-sm text-slate-600">요약할 문서가 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {s.docs.map((d) => (
                    <li key={d.id}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-50">
                        <input
                          type="radio"
                          name="document"
                          value={d.id}
                          checked={s.documentId === d.id}
                          onChange={() => s.setDocumentId(d.id)}
                          className="size-4"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-800">{d.name}</span>
                          <span className="block text-xs text-slate-500">
                            {formatSize(d.sizeBytes)} · 원문 {formatCount(d.text.length)}자
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ── 2. 요약 방식 ── */}
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-black text-slate-900">2 · 요약 방식</h2>
              <fieldset>
                <legend className="sr-only">요약 방식 선택</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUMMARY_STYLES.map((st) => (
                    <label
                      key={st}
                      className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="style"
                        value={st}
                        checked={s.style === st}
                        onChange={() => s.setStyle(st)}
                        className="mt-0.5 size-4"
                      />
                      <span>
                        <span className="block text-sm font-bold text-slate-800">{styleLabel(st)}</span>
                        <span className="block text-xs text-slate-500">{styleDesc(st)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-4">
                <label htmlFor="target-length" className="block text-xs font-bold text-slate-600">
                  목표 분량
                </label>
                <select
                  id="target-length"
                  value={s.targetLength}
                  onChange={(e) => s.setTargetLength(Number(e.target.value) as (typeof TARGET_LENGTHS)[number])}
                  className="mt-1 min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
                >
                  {TARGET_LENGTHS.map((n) => (
                    <option key={n} value={n}>
                      {formatCount(n)}자
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="mt-4">
                <legend className="text-xs font-bold text-slate-600">강조할 관점 (선택)</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FOCUS_AREAS.map((f) => (
                    <label
                      key={f}
                      className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={s.focusAreas.includes(f)}
                        onChange={() => s.toggleFocus(f)}
                        className="sr-only"
                      />
                      {focusLabel(f)}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            {/* ── 3. 실행 ── */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void s.run()}
                disabled={s.phase.kind === 'running' || !s.documentId}
                className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {s.phase.kind === 'running' ? '요약 중…' : '요약 생성'}
              </button>
              {s.phase.kind === 'done' && (
                <button
                  type="button"
                  onClick={s.reset}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  다시 설정
                </button>
              )}
            </div>

            {s.phase.kind === 'running' && (
              <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-slate-700">문서를 요약하고 있습니다…</p>
                <div className="mt-3 space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              </div>
            )}

            {s.phase.kind === 'failed' && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
                <p className="text-sm font-bold text-rose-800">요약에 실패했습니다</p>
                <p className="mt-1 text-sm text-rose-700">{s.phase.message}</p>
                <button
                  type="button"
                  onClick={() => void s.run()}
                  className="mt-3 min-h-11 rounded-lg border border-rose-300 px-3 text-sm font-bold text-rose-800 hover:bg-rose-100"
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* ── 4. 결과 ── */}
            {s.phase.kind === 'done' && (
              <section aria-labelledby="result-heading" className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 id="result-heading" className="text-sm font-black text-slate-900">
                  요약 결과 — {styleLabel(s.phase.result.style)}
                </h2>

                <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ['원문', `${formatCount(s.phase.result.stats.sourceChars)}자`],
                    ['요약', `${formatCount(s.phase.result.stats.summaryChars)}자`],
                    ['압축률', `${Math.round(compressionRate(s.phase.result.stats) * 100)}%`],
                    ['소요', `${s.phase.result.stats.elapsedSeconds}초`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
                      <dt className="text-[11px] text-slate-500">{k}</dt>
                      <dd className="text-sm font-black text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 space-y-3">
                  {s.phase.result.sections.map((sec) => (
                    <div key={sec.heading}>
                      <h3 className="text-sm font-bold text-slate-800">{sec.heading}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">{sec.body}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <h3 className="text-xs font-bold text-slate-600">핵심 키워드</h3>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {s.phase.result.keywords.map((k) => (
                      <li
                        key={k.word}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                      >
                        {k.word}
                        <span className="ml-1 font-normal text-slate-500">
                          {Math.round(k.weight * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 text-xs text-slate-400">
                  AI가 생성한 요약입니다. 중요한 사항은 원문으로 확인하세요.
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
