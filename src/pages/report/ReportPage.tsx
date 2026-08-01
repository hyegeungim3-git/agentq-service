import {
  REPORT_TYPES,
  autoFillRate,
  reportTypeDesc,
  reportTypeLabel,
  type ReportResult,
} from '@entities/report/model'
import { useReport, type ReportOptions } from '@features/report/useReport'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'

export function ReportPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: ReportOptions }) {
  const r = useReport(apiOptions ?? {})

  return (
    <AgentShell<ReportResult>
      title="표준 보고서 작성 에이전트"
      desc="실적 데이터를 표준 양식에 채우고, 사람이 확인해야 하는 칸을 표시합니다."
      onBack={onBack}
      phase={r.phase}
      docs={r.docs}
      documentId={r.documentId}
      onSelectDocument={r.setDocumentId}
      docSectionLabel="근거 문서"
      emptyDocsLabel="참조할 문서가 없습니다."
      optionsLabel="보고 유형"
      runLabel="보고서 생성"
      runningLabel="작성 중…"
      runningMessage="실적 데이터를 모아 보고서를 작성하고 있습니다…"
      onRun={() => void r.run()}
      onReset={r.reset}
      options={
        <fieldset>
          <legend className="sr-only">보고 유형 선택</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {REPORT_TYPES.map((t) => (
              <label
                key={t}
                className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-50"
              >
                <input
                  type="radio"
                  name="report-type"
                  value={t}
                  checked={r.type === t}
                  onChange={() => r.setType(t)}
                  className="mt-0.5 size-4"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-800">{reportTypeLabel(t)}</span>
                  <span className="block text-xs text-slate-500">{reportTypeDesc(t)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      }
      result={(res) => (
        <ResultSection
          id="report-result"
          title={`${reportTypeLabel(res.type)} — ${res.docNo}`}
          stats={[
            ['보고 기간', res.period],
            ['작성 절', `${res.sections.length}개`],
            ['자동 채움', `${Math.round(autoFillRate(res) * 100)}%`],
            ['소요', `${res.elapsedSeconds}초`],
          ]}
          notice="AI가 작성한 초안입니다. 결재 전 담당자 확인이 필요합니다."
        >
          <div className="space-y-4">
            {res.sections.map((s) => (
              <div key={s.heading}>
                <h3 className="text-sm font-bold text-slate-800">{s.heading}</h3>
                {s.body ? (
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{s.body}</p>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">자동으로 채우지 못했습니다.</p>
                )}
                {/* 어느 데이터에서 왔는지 밝힌다 — 출처 없는 수치는 검증할 수 없다 */}
                <p className="mt-1 text-[11px] text-slate-500">
                  {s.source ? `출처 · ${s.source}` : '출처 없음 — 담당자 작성 필요'}
                </p>
              </div>
            ))}
          </div>

          {res.pendingFields.length > 0 && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-900">담당자 작성이 필요한 칸</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                {res.pendingFields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </ResultSection>
      )}
    />
  )
}
