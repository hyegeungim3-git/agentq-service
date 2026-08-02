import {
  SEARCH_MODES,
  SECURITY_LEVELS,
  TOP_K_STEPS,
  hasHiddenByFilter,
  matchRatio,
  mismatches,
  searchModeDesc,
  searchModeLabel,
  securityLabel,
  type KnowledgeResult,
  type SearchHit,
} from '@entities/knowledge/model'
import { REFERENCE_SPEC } from '@fixtures/knowledge'
import { useKnowledge, type KnowledgeOptions } from '@features/knowledge/useKnowledge'

const EXAMPLES = ['브래킷 굽힘 금형', '진동 관리 기준', '절삭유 농도', '버 과다']

export function KnowledgePage({
  onBack,
  apiOptions,
}: {
  onBack?: () => void
  apiOptions?: KnowledgeOptions
}) {
  const k = useKnowledge(apiOptions ?? {})
  const baseName = (id: string) => k.bases.find((b) => b.id === id)?.name ?? id
  const busy = k.phase.kind === 'searching'

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
          <h1 className="text-xl font-black text-slate-900">지식 검색 에이전트</h1>
          <p className="mt-1 text-sm text-slate-600">
            축적 도면·표준·사례를 검색합니다. 필터에 걸려 빠진 문서가 있으면 함께 알립니다.
          </p>
        </header>

        {k.phase.kind === 'loadingBases' && (
          <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="sr-only">검색 범위를 불러오는 중입니다</span>
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        )}

        {k.phase.kind === 'basesError' && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-bold text-rose-800">검색 범위를 불러오지 못했습니다</p>
            <p className="mt-1 text-sm text-rose-700">{k.phase.message}</p>
          </div>
        )}

        {k.phase.kind !== 'loadingBases' && k.phase.kind !== 'basesError' && (
          <div className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <label htmlFor="kq" className="block text-sm font-black text-slate-900">
                1 · 무엇을 찾으시나요?
              </label>
              <input
                id="kq"
                type="search"
                value={k.query}
                onChange={(e) => k.setQuery(e.target.value)}
                placeholder="예) 브래킷 굽힘 금형"
                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-2 focus-visible:outline-slate-900"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => k.setQuery(e)}
                    className="min-h-11 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-black text-slate-900">2 · 검색 조건</h2>

              <fieldset>
                <legend className="mb-2 text-xs font-bold text-slate-600">검색 방식</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SEARCH_MODES.map((m) => (
                    <label
                      key={m}
                      className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="k-mode"
                        value={m}
                        checked={k.mode === m}
                        onChange={() => k.setMode(m)}
                        className="mt-0.5 size-4 shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-800">{searchModeLabel(m)}</span>
                        <span className="block text-xs text-slate-500">{searchModeDesc(m)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-bold text-slate-600">보안 등급</legend>
                <div className="flex flex-wrap gap-2">
                  {(['all', ...SECURITY_LEVELS] as const).map((s) => (
                    <label
                      key={s}
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
                    >
                      <input
                        type="radio"
                        name="k-security"
                        value={s}
                        checked={k.security === s}
                        onChange={() => k.setSecurity(s)}
                        className="sr-only"
                      />
                      {s === 'all' ? '전체' : securityLabel(s)}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-bold text-slate-600">
                  검색 범위 ({k.baseIds.length}/{k.bases.length})
                </legend>
                <ul className="space-y-2">
                  {k.bases.map((b) => (
                    <li key={b.id}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={k.baseIds.includes(b.id)}
                          onChange={() => k.toggleBase(b.id)}
                          className="size-4 shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-800">{b.name}</span>
                          <span className="block text-xs text-slate-500">
                            {b.docCount.toLocaleString('ko-KR')}개 문서 · 최종 업데이트 {b.updatedAt}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-bold text-slate-600">결과 수</legend>
                <div className="flex flex-wrap gap-2">
                  {TOP_K_STEPS.map((n) => (
                    <label
                      key={n}
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
                    >
                      <input
                        type="radio"
                        name="k-topk"
                        value={n}
                        checked={k.topK === n}
                        onChange={() => k.setTopK(n)}
                        className="sr-only"
                      />
                      상위 {n}건
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void k.search()}
                disabled={busy}
                className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? '검색 중…' : `${searchModeLabel(k.mode)} 시작`}
              </button>
              {k.phase.kind === 'done' && (
                <button
                  type="button"
                  onClick={k.reset}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  다시 설정
                </button>
              )}
            </div>

            {busy && (
              <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-slate-700">지식베이스를 훑고 있습니다…</p>
                <div className="mt-3 space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              </div>
            )}

            {k.phase.kind === 'failed' && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
                <p className="text-sm font-bold text-rose-800">검색하지 못했습니다</p>
                <p className="mt-1 text-sm text-rose-700">{k.phase.message}</p>
              </div>
            )}

            {k.phase.kind === 'done' && <SearchResultView result={k.phase.result} baseName={baseName} />}
          </div>
        )}
      </div>
    </main>
  )
}

function SearchResultView({
  result,
  baseName,
}: {
  result: KnowledgeResult
  baseName: (id: string) => string
}) {
  const hidden = hasHiddenByFilter(result)

  return (
    <>
      <section aria-labelledby="k-summary" className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 id="k-summary" className="text-sm font-black text-slate-900">
          검색 결과 {result.hits.length}건
        </h2>

        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['검색어', result.query],
            ['검색 범위', `${result.indexedCount.toLocaleString('ko-KR')}개 문서`],
            ['방식', searchModeLabel(result.mode)],
            ['소요', `${result.elapsedSeconds}초`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-[11px] text-slate-500">{label}</dt>
              <dd className="truncate text-sm font-black text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>

        {/* 필터에 걸려 빠진 것을 감추면 '없다'로 읽힌다 — 있는데 안 보여 준 것뿐인데 */}
        {hidden && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-bold text-amber-900">조건에 맞았지만 빠진 문서가 있습니다.</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-amber-900">
              {result.excludedBySecurity > 0 && (
                <li>보안 등급 필터로 {result.excludedBySecurity}건이 빠졌습니다.</li>
              )}
              {result.excludedByScope > 0 && (
                <li>검색 범위에서 뺀 지식베이스에 {result.excludedByScope}건이 있습니다.</li>
              )}
            </ul>
          </div>
        )}

        {result.truncated > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            조건에 맞는 문서가 {result.hits.length + result.truncated}건이지만 상위 {result.hits.length}건만
            보여 줍니다. 결과 수를 늘리면 더 볼 수 있습니다.
          </p>
        )}

        {result.hits.length === 0 && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {hidden
              ? '보이는 결과가 없습니다. 다만 위에 적은 대로 필터에 걸려 빠진 문서가 있으니 조건을 넓혀 보십시오.'
              : '이 검색 범위에는 해당하는 문서가 없습니다. 다른 말로 찾거나 시맨틱 검색을 써 보십시오.'}
          </p>
        )}
      </section>

      {result.hits.map((hit) => (
        <HitCard key={hit.id} hit={hit} baseName={baseName} />
      ))}

      {result.hits.length > 0 && (
        <p className="text-xs text-slate-400">AI가 찾은 결과입니다. 적용 전 담당자 검토가 필요합니다.</p>
      )}
    </>
  )
}

function HitCard({ hit, baseName }: { hit: SearchHit; baseName: (id: string) => string }) {
  return (
    <section
      aria-labelledby={`hit-${hit.id}`}
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={`hit-${hit.id}`} className="text-sm font-black text-slate-900">
          {hit.title}
        </h3>
        {/* 색이 아니라 글자로 구분한다 */}
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
          {securityLabel(hit.security)}
        </span>
        <span className="ml-auto text-xs font-bold text-slate-700">{Math.round(hit.score * 100)}%</span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">{baseName(hit.baseId)}</p>
      <p className="mt-2 text-sm text-slate-700">{hit.snippet}</p>

      <p className="mt-2 text-xs text-slate-500">
        걸린 말 ·{' '}
        {hit.matchedTerms.map((t) => (
          <span key={t} className="mr-1 rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-700">
            {t}
          </span>
        ))}
      </p>

      {hit.drawing && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-600">
            {REFERENCE_SPEC} 사양 대비 · 속성{' '}
            {hit.drawing.attributes.filter((a) => a.matched).length}/{hit.drawing.attributes.length} 일치 (
            {Math.round(matchRatio(hit.drawing) * 100)}%)
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-sm">
              <caption className="sr-only">{hit.drawing.code} 속성 대조</caption>
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th scope="col" className="py-2 pr-3 font-bold">속성</th>
                  <th scope="col" className="py-2 pr-3 font-bold">신규 사양</th>
                  <th scope="col" className="py-2 pr-3 font-bold">후보 도면</th>
                  <th scope="col" className="py-2 font-bold">일치</th>
                </tr>
              </thead>
              <tbody>
                {hit.drawing.attributes.map((a) => (
                  <tr key={a.label} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 text-slate-600">{a.label}</td>
                    <td className="py-2 pr-3 text-slate-700">{a.queryValue}</td>
                    <td className="py-2 pr-3 text-slate-700">{a.candidateValue}</td>
                    <td className={`py-2 font-bold ${a.matched ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {a.matched ? '일치' : '다름'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mismatches(hit.drawing).length > 0 && (
            <p className="mt-2 text-sm font-bold text-rose-800">
              확인 필요 ·{' '}
              {mismatches(hit.drawing)
                .map((m) => m.label)
                .join(', ')}
            </p>
          )}
          {hit.drawing.reusable.length > 0 && (
            <p className="mt-1 text-sm text-slate-700">재사용 가능 · {hit.drawing.reusable.join(' / ')}</p>
          )}
        </div>
      )}
    </section>
  )
}
