import { formatSize } from '@entities/document/model'
import {
  LANGUAGES,
  TONES,
  categoryLabel,
  driftedChecks,
  languageLabel,
  needsReview,
  toneLabel,
} from '@entities/translation/model'
import { useTranslate, type TranslateOptions } from '@features/translate/useTranslate'

export function TranslatePage({
  onBack,
  apiOptions,
}: {
  onBack?: () => void
  apiOptions?: TranslateOptions
}) {
  const t = useTranslate(apiOptions ?? {})

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
          <h1 className="text-xl font-black text-slate-900">수출 문서 번역 에이전트</h1>
          <p className="mt-1 text-sm text-slate-600">
            용어집을 적용해 번역하고, 역번역으로 의미가 틀어진 문장을 찾아 줍니다.
          </p>
        </header>

        {t.phase.kind === 'loadingDocs' && (
          <div role="status" aria-live="polite" className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white">
            <span className="sr-only">문서 목록을 불러오는 중입니다</span>
          </div>
        )}

        {t.phase.kind === 'docsError' && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-bold text-rose-800">문서 목록을 불러오지 못했습니다</p>
            <p className="mt-1 text-sm text-rose-700">{t.phase.message}</p>
          </div>
        )}

        {t.phase.kind !== 'loadingDocs' && t.phase.kind !== 'docsError' && (
          <div className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-black text-slate-900">1 · 번역할 문서</h2>
              {t.docs.length === 0 ? (
                <p className="text-sm text-slate-600">번역할 문서가 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {t.docs.map((d) => (
                    <li key={d.id}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-50">
                        <input
                          type="radio"
                          name="document"
                          value={d.id}
                          checked={t.documentId === d.id}
                          onChange={() => t.setDocumentId(d.id)}
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
              <h2 className="mb-3 text-sm font-black text-slate-900">2 · 번역 설정</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="to-lang" className="block text-xs font-bold text-slate-600">
                    번역 언어
                  </label>
                  <select
                    id="to-lang"
                    value={t.to}
                    onChange={(e) => t.setTo(e.target.value as (typeof LANGUAGES)[number])}
                    className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  >
                    {LANGUAGES.filter((l) => l !== 'ko').map((l) => (
                      <option key={l} value={l}>
                        {languageLabel(l)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tone" className="block text-xs font-bold text-slate-600">
                    문체
                  </label>
                  <select
                    id="tone"
                    value={t.tone}
                    onChange={(e) => t.setTone(e.target.value as (typeof TONES)[number])}
                    className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  >
                    {TONES.map((n) => (
                      <option key={n} value={n}>
                        {toneLabel(n)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={t.useGlossary}
                  onChange={(e) => t.setUseGlossary(e.target.checked)}
                  className="size-4"
                />
                <span className="text-sm font-bold text-slate-800">사내 용어집 적용</span>
                <span className="text-xs text-slate-500">규격 용어를 고정합니다</span>
              </label>
            </section>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void t.run()}
                disabled={t.phase.kind === 'running' || !t.documentId}
                className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.phase.kind === 'running' ? '번역 중…' : '번역 실행'}
              </button>
              {t.phase.kind === 'done' && (
                <button
                  type="button"
                  onClick={t.reset}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  다시 설정
                </button>
              )}
            </div>

            {t.phase.kind === 'running' && (
              <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-slate-700">문서를 번역하고 있습니다…</p>
                <div className="mt-3 space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              </div>
            )}

            {t.phase.kind === 'failed' && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
                <p className="text-sm font-bold text-rose-800">번역에 실패했습니다</p>
                <p className="mt-1 text-sm text-rose-700">{t.phase.message}</p>
                <button
                  type="button"
                  onClick={() => void t.run()}
                  className="mt-3 min-h-11 rounded-lg border border-rose-300 px-3 text-sm font-bold text-rose-800 hover:bg-rose-100"
                >
                  다시 시도
                </button>
              </div>
            )}

            {t.phase.kind === 'done' && (
              <>
                <section
                  aria-labelledby="segments-heading"
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <h2 id="segments-heading" className="text-sm font-black text-slate-900">
                    번역 결과 — {languageLabel(t.phase.result.from)} → {languageLabel(t.phase.result.to)}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    소요 {t.phase.result.elapsedSeconds}초 · 문장 {t.phase.result.segments.length}개 ·
                    검토 권장 {t.phase.result.segments.filter(needsReview).length}개
                  </p>

                  <ol className="mt-4 space-y-4">
                    {t.phase.result.segments.map((seg) => (
                      <li key={seg.id} className="border-l-2 border-slate-200 pl-3">
                        <p className="text-xs text-slate-500">{seg.source}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-800">{seg.target}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className={needsReview(seg) ? 'font-bold text-amber-700' : 'text-slate-400'}>
                            신뢰도 {Math.round(seg.confidence * 100)}%
                          </span>
                          {needsReview(seg) && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-bold text-amber-800">
                              담당자 검토 권장
                            </span>
                          )}
                          {seg.appliedTerms.map((term) => (
                            <span key={term} className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                              {term}
                            </span>
                          ))}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>

                <section
                  aria-labelledby="back-heading"
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <h2 id="back-heading" className="text-sm font-black text-slate-900">
                    역번역 검증
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    번역문을 원문 언어로 되돌려 의미가 유지되는지 확인합니다.
                  </p>

                  {driftedChecks(t.phase.result.backChecks).length === 0 ? (
                    <p className="mt-3 text-sm text-slate-600">의미가 틀어진 문장이 없습니다.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {driftedChecks(t.phase.result.backChecks).map((c) => (
                        <li key={c.segmentId} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                          <p className="text-[11px] font-bold text-amber-800">
                            {c.segmentId}번 문장 · 일치도 {Math.round(c.similarity * 100)}%
                          </p>
                          <p className="mt-1 text-sm text-amber-900">{c.backText}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {t.phase.result.glossaryUsed.length > 0 && (
                  <section
                    aria-labelledby="glossary-heading"
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <h2 id="glossary-heading" className="text-sm font-black text-slate-900">
                      적용된 용어집
                    </h2>
                    <ul className="mt-3 divide-y divide-slate-100">
                      {t.phase.result.glossaryUsed.map((g) => (
                        <li key={g.source} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                          <span className="font-bold text-slate-800">{g.source}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-slate-700">{g.target}</span>
                          <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                            {categoryLabel(g.category)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <p className="text-xs text-slate-400">
                  AI가 생성한 번역입니다. 대외 제출 전 담당자 확인이 필요합니다.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
