import {
  DIRECTIONS,
  TONES,
  directionKey,
  categoryLabel,
  driftedChecks,
  languageLabel,
  needsReview,
  toneLabel,
  type TranslationResult,
} from '@entities/translation/model'
import { useTranslate, type TranslateOptions } from '@features/translate/useTranslate'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'

export function TranslatePage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: TranslateOptions }) {
  const t = useTranslate(apiOptions ?? {})

  return (
    <AgentShell<TranslationResult>
      title="문서 번역 에이전트"
      agentId="translate"
      desc="용어집을 적용해 번역하고, 역번역으로 의미가 틀어진 문장을 찾아 줍니다."
      onBack={onBack}
      phase={t.phase}
      docs={t.docs}
      documentId={t.documentId}
      onSelectDocument={t.setDocumentId}
      docSectionLabel="번역할 문서"
      emptyDocsLabel="번역할 문서가 없습니다."
      upload={t.upload}
      optionsLabel="번역 설정"
      runLabel="번역 실행"
      runningLabel="번역 중…"
      runningMessage="문서를 번역하고 있습니다…"
      onRun={() => void t.run()}
      onReset={t.reset}
      options={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="direction" className="block text-xs font-bold text-slate-600">
                번역 방향
              </label>
              <select
                id="direction"
                value={directionKey(t.direction)}
                onChange={(e) => {
                  const next = DIRECTIONS.find((d) => directionKey(d) === e.target.value)
                  if (next) t.setDirection(next)
                }}
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                {DIRECTIONS.map((d) => (
                  <option key={directionKey(d)} value={directionKey(d)}>
                    {languageLabel(d.from)} → {languageLabel(d.to)}
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

          <fieldset className="mt-4">
            <legend className="mb-2 text-xs font-bold text-slate-600">원문 입력</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['document', '사내 문서'],
                  ['text', '직접 입력'],
                ] as const
              ).map(([v, label]) => (
                <label
                  key={v}
                  className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg has-disabled:cursor-not-allowed has-disabled:opacity-40"
                >
                  <input
                    type="radio"
                    name="tr-source"
                    value={v}
                    checked={t.source === v}
                    disabled={v === 'document' && !t.canUseDocument}
                    onChange={() => t.setSource(v)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
            {/* 고를 수 없는 조합을 남겨 두면 실행하고 나서야 안 된다는 걸 알게 된다 */}
            {!t.canUseDocument && (
              <p className="mt-2 text-xs text-amber-800">
                사내 문서는 한국어라 {languageLabel(t.direction.from)} 원문으로 쓸 수 없습니다. 원문을 직접
                붙여 넣으세요.
              </p>
            )}

            {t.source === 'text' && (
              <div className="mt-3">
                <label htmlFor="tr-text" className="block text-xs font-bold text-slate-600">
                  원문 (한 줄에 한 문장)
                </label>
                <textarea
                  id="tr-text"
                  rows={4}
                  value={t.text}
                  onChange={(e) => t.setText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus-visible:outline-2 focus-visible:outline-slate-900"
                />
                <button
                  type="button"
                  onClick={t.loadSample}
                  className="mt-1 min-h-11 text-xs font-bold text-slate-500 underline hover:text-slate-900"
                >
                  예시 원문 넣기
                </button>
              </div>
            )}
          </fieldset>

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

          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={t.withSummary}
              onChange={(e) => t.setWithSummary(e.target.checked)}
              className="size-4"
            />
            <span className="text-sm font-bold text-slate-800">번역+요약</span>
            <span className="text-xs text-slate-500">번역문을 목표 언어로 요약합니다</span>
          </label>
        </>
      }
      result={(r) => (
        <>
          <ResultSection
            id="translate-result"
            title={`번역 결과 — ${languageLabel(r.from)} → ${languageLabel(r.to)}`}
            stats={[
              ['문장', `${r.segments.length}개`],
              ['검토 권장', `${r.segments.filter(needsReview).length}개`],
              ['용어집 적용', `${r.glossaryUsed.length}건`],
              ['소요', `${r.elapsedSeconds}초`],
            ]}
          >
            {/* 번역 못 한 문장을 감추면 다 된 줄 안다 */}
            {r.untranslated > 0 && (
              <p className="-mt-1 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
                {r.untranslated}개 문장은 예시 사전에 없어 번역하지 못했습니다. 실제 번역은 엔진 연결 후
                동작합니다.
              </p>
            )}

            {r.summary && (
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-600">요약 ({languageLabel(r.to)})</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-800">{r.summary}</p>
              </div>
            )}
            <ol className="space-y-4">
              {r.segments.map((seg) => (
                <li key={seg.id} className="border-l-2 border-slate-200 pl-3">
                  <p className="text-xs text-slate-500">{seg.source}</p>
                  {seg.translated ? (
                    <p className="mt-1 text-sm leading-relaxed text-slate-800">{seg.target}</p>
                  ) : (
                    <p className="mt-1 text-sm font-bold text-amber-800">
                      예시 사전에 없는 문장입니다 — 번역하지 않았습니다.
                    </p>
                  )}
                  {seg.translated && (
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
                  )}
                </li>
              ))}
            </ol>
          </ResultSection>

          <ResultSection id="back-check" title="역번역 검증">
            <p className="-mt-2 mb-3 text-xs text-slate-500">
              번역문을 원문 언어로 되돌려 의미가 유지되는지 확인합니다.
            </p>
            {driftedChecks(r.backChecks).length === 0 ? (
              <p className="text-sm text-slate-600">의미가 틀어진 문장이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {driftedChecks(r.backChecks).map((c) => (
                  <li key={c.segmentId} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-[11px] font-bold text-amber-800">
                      {c.segmentId}번 문장 · 일치도 {Math.round(c.similarity * 100)}%
                    </p>
                    <p className="mt-1 text-sm text-amber-900">{c.backText}</p>
                  </li>
                ))}
              </ul>
            )}
          </ResultSection>

          {r.glossaryUsed.length > 0 && (
            <ResultSection
              id="glossary"
              title="적용된 용어집"
              notice="AI가 생성한 번역입니다. 대외 제출 전 담당자 확인이 필요합니다."
            >
              <ul className="divide-y divide-slate-100">
                {r.glossaryUsed.map((g) => (
                  <li key={g.source} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                    <span className="font-bold text-slate-800">{g.source}</span>
                    <span className="text-slate-400">→</span>
                    {/* 목표 언어에 맞는 대응어를 보여 준다 — 하나만 두면 언어를 바꿔도 같은 말이 나온다 */}
                    <span className="text-slate-700">
                      {r.to === 'ko' ? g.source : g.targets[r.to]}
                    </span>
                    <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                      {categoryLabel(g.category)}
                    </span>
                  </li>
                ))}
              </ul>
            </ResultSection>
          )}

          {r.glossaryUsed.length === 0 && (
            <p className="text-xs text-slate-400">
              AI가 생성한 번역입니다. 대외 제출 전 담당자 확인이 필요합니다.
            </p>
          )}
        </>
      )}
    />
  )
}
