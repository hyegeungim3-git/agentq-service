import {
  canSubmit,
  complianceScore,
  countBySeverity,
  severityLabel,
  type ReviewResult,
  type Severity,
} from '@entities/review/model'
import { useReview, type ReviewOptions } from '@features/review/useReview'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'

/* 심각도는 색만으로 구분하지 않는다(가이드 §8) — 라벨을 항상 함께 쓴다. */
const SEVERITY_STYLE: Record<Severity, string> = {
  high: 'border-rose-200 bg-rose-50 text-rose-900',
  medium: 'border-amber-200 bg-amber-50 text-amber-900',
  low: 'border-sky-200 bg-sky-50 text-sky-900',
}

export function ReviewPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: ReviewOptions }) {
  const r = useReview(apiOptions ?? {})

  return (
    <AgentShell<ReviewResult>
      title="문서 사전 검토 에이전트"
      agentId="review"
      desc="기안문을 사규와 대조해 위반 소지와 조치 사항을 찾아 줍니다."
      onBack={onBack}
      phase={r.phase}
      docs={r.docs}
      documentId={r.documentId}
      onSelectDocument={r.setDocumentId}
      docSectionLabel="검토할 문서"
      emptyDocsLabel="검토할 문서가 없습니다."
      upload={r.upload}
      optionsLabel="대조할 규정"
      runLabel="사전 검토 시작"
      runningLabel="검토 중…"
      runningMessage="사규와 대조하고 있습니다…"
      canRun={r.regulationSets.length > 0}
      onRun={() => void r.run()}
      onReset={r.reset}
      options={
        <fieldset>
          <legend className="sr-only">대조할 규정 선택</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {r.sets.map((set) => (
              <label
                key={set.code}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand-soft"
              >
                <input
                  type="checkbox"
                  checked={r.regulationSets.includes(set.code)}
                  onChange={() => r.toggleSet(set.code)}
                  className="size-4"
                />
                <span className="text-sm font-bold text-slate-800">{set.label}</span>
              </label>
            ))}
          </div>
          {r.regulationSets.length === 0 && (
            <p className="mt-2 text-xs font-bold text-amber-700">규정을 1개 이상 선택하세요.</p>
          )}
        </fieldset>
      }
      result={(res) => {
        const c = countBySeverity(res.violations)
        return (
          <ResultSection
            id="review-result"
            title={`검토 결과 — 위반 소지 ${res.violations.length}건`}
            stats={[
              ['준수 점수', `${complianceScore(res.violations)}점`],
              ['높음', `${c.high}건`],
              ['중간·낮음', `${c.medium + c.low}건`],
              ['대조 조항', `${res.checkedClauses}개`],
            ]}
            notice="AI가 대조한 결과입니다. 최종 판단은 담당 부서 확인이 필요합니다."
          >
            {/* 점수만 보여 주면 '그래서 올려도 되나'에 답이 없다 */}
            <p
              className={`-mt-1 mb-4 rounded-lg border px-3 py-2 text-sm font-bold ${
                canSubmit(res.violations)
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              {canSubmit(res.violations)
                ? '심각도 높음 위반이 없어 결재 상신이 가능합니다.'
                : '심각도 높음 위반이 남아 있어 결재 상신을 권하지 않습니다.'}
            </p>

            {res.violations.length === 0 ? (
              <p className="text-sm text-slate-600">선택한 규정에서 위반 소지를 찾지 못했습니다.</p>
            ) : (
              <ul className="space-y-3">
                {res.violations.map((v) => (
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
          </ResultSection>
        )
      }}
    />
  )
}
