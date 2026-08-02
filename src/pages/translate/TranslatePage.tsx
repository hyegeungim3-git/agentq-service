import {
  LANGUAGES,
  TONES,
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
      title="수출 문서 번역 에이전트"
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
            <ol className="space-y-4">
              {r.segments.map((seg) => (
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
                    <span className="text-slate-700">{g.target}</span>
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
