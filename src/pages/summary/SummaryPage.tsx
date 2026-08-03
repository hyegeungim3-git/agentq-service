import {
  FOCUS_AREAS,
  SUMMARY_STYLES,
  TARGET_LENGTHS,
  compressionRate,
  focusLabel,
  styleDesc,
  styleLabel,
  type SummaryResult,
} from '@entities/summary/model'
import { useSummarize, type SummarizeOptions } from '@features/summarize/useSummarize'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'
import { formatCount } from '@shared/lib/format'

export function SummaryPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: SummarizeOptions }) {
  const s = useSummarize(apiOptions ?? {})

  return (
    <AgentShell<SummaryResult>
      title="문서 요약 에이전트"
      desc="문서를 고르고 방식을 정하면 핵심을 구조화해 요약합니다."
      onBack={onBack}
      phase={s.phase}
      docs={s.docs}
      documentId={s.documentId}
      onSelectDocument={s.setDocumentId}
      docSectionLabel="요약할 문서"
      emptyDocsLabel="요약할 문서가 없습니다."
      upload={s.upload}
      optionsLabel="요약 방식"
      runLabel="요약 생성"
      runningLabel="요약 중…"
      runningMessage="문서를 요약하고 있습니다…"
      onRun={() => void s.run()}
      onReset={s.reset}
      options={
        <>
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
                  className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
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
        </>
      }
      result={(r) => (
        <ResultSection
          id="summary-result"
          title={`요약 결과 — ${styleLabel(r.style)}`}
          stats={[
            ['원문', `${formatCount(r.stats.sourceChars)}자`],
            ['요약', `${formatCount(r.stats.summaryChars)}자`],
            ['압축률', `${Math.round(compressionRate(r.stats) * 100)}%`],
            ['소요', `${r.stats.elapsedSeconds}초`],
          ]}
          notice="AI가 생성한 요약입니다. 중요한 사항은 원문으로 확인하세요."
        >
          <div className="space-y-3">
            {r.sections.map((sec) => (
              <div key={sec.heading}>
                <h3 className="text-sm font-bold text-slate-800">{sec.heading}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{sec.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h3 className="text-xs font-bold text-slate-600">핵심 키워드</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {r.keywords.map((k) => (
                <li key={k.word} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                  {k.word}
                  <span className="ml-1 font-normal text-slate-500">{Math.round(k.weight * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </ResultSection>
      )}
    />
  )
}
