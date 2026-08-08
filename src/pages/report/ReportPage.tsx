import {
  REPORT_LENGTHS,
  REPORT_TONES,
  REPORT_TYPES,
  fillRate,
  reportLengthDesc,
  reportLengthLabel,
  reportToneDesc,
  reportToneLabel,
  reportTypeDesc,
  reportTypeLabel,
  type ReportInputs,
  type ReportResult,
} from '@entities/report/model'
import { useReport, type ReportOptions } from '@features/report/useReport'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'
import { DocActions } from '@widgets/doc-actions/DocActions'
import type { OutgoingDoc } from '@entities/docflow/model'

/* 부모 안에서 정의하지 않는다 — 매 렌더 새 타입이 되어 리마운트되고,
   입력창이라면 첫 글자만 입력된다(AGENTS.md §6, 이전 데모에서 난 사고) */
function TextField({
  id,
  label,
  hint,
  value,
  rows,
  onChange,
}: {
  id: string
  label: string
  hint: string
  value: string
  rows?: number
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-600">
        {label}
      </label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hint}
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus-visible:outline-2 focus-visible:outline-slate-900"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hint}
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-2 focus-visible:outline-slate-900"
        />
      )}
    </div>
  )
}

function RadioCards<T extends string>({
  name,
  items,
  value,
  onChange,
  label,
  desc,
  cols,
}: {
  name: string
  items: T[]
  value: T
  onChange: (v: T) => void
  label: (v: T) => string
  desc: (v: T) => string
  cols: string
}) {
  return (
    <div className={`grid gap-2 ${cols}`}>
      {items.map((v) => (
        <label
          key={v}
          className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand-soft"
        >
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="mt-0.5 size-4 shrink-0"
          />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-800">{label(v)}</span>
            <span className="block text-xs text-slate-500">{desc(v)}</span>
          </span>
        </label>
      ))}
    </div>
  )
}

/**
 * 보고서 결과를 **내보낼 문서 모양**으로 옮긴다.
 *
 * 자가점검·내려받기·결재가 이 모양 하나만 보게 해서 세 화면이 갈라지지 않게 한다.
 * 보안등급은 아직 정하는 자리가 없다 — 없는 것을 `null`로 넘겨 점검이 그 사실을 말하게 한다.
 */
function asDoc(res: ReportResult): OutgoingDoc {
  return {
    docNo: res.docNo,
    title: `${reportTypeLabel(res.type)} — ${res.department}`,
    department: res.department,
    period: res.period,
    sections: res.sections,
    pendingFields: res.pendingFields,
    securityGrade: null,
  }
}

export function ReportPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: ReportOptions }) {
  const r = useReport(apiOptions ?? {})

  return (
    <AgentShell<ReportResult>
      title="표준 보고서 작성 에이전트"
      agentId="report"
      desc="실적 데이터를 표준 양식에 채우고, 사람이 확인해야 하는 칸을 표시합니다."
      onBack={onBack}
      phase={r.phase}
      docs={r.docs}
      documentId={r.documentId}
      onSelectDocument={r.setDocumentId}
      docSectionLabel="근거 문서"
      emptyDocsLabel="참조할 문서가 없습니다."
      upload={r.upload}
      optionsLabel="보고서 설정"
      runLabel="보고서 생성"
      runningLabel="작성 중…"
      runningMessage="실적 데이터를 모아 보고서를 작성하고 있습니다…"
      onRun={() => void r.run()}
      onReset={r.reset}
      options={
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-xs font-bold text-slate-600">보고 유형</legend>
            <RadioCards
              name="report-type"
              items={REPORT_TYPES}
              value={r.type}
              onChange={r.setType}
              label={reportTypeLabel}
              desc={reportTypeDesc}
              cols="sm:grid-cols-2"
            />
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-bold text-slate-600">문체</legend>
            <RadioCards
              name="report-tone"
              items={REPORT_TONES}
              value={r.tone}
              onChange={r.setTone}
              label={reportToneLabel}
              desc={reportToneDesc}
              cols="sm:grid-cols-3"
            />
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-bold text-slate-600">분량</legend>
            <RadioCards
              name="report-length"
              items={REPORT_LENGTHS}
              value={r.length}
              onChange={r.setLength}
              label={reportLengthLabel}
              desc={reportLengthDesc}
              cols="sm:grid-cols-3"
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs font-bold text-slate-600">직접 입력</legend>
            {/* 비워 두면 지어내지 않고 '확인 필요'로 남는다 */}
            <p className="text-xs text-slate-500">
              비워 두면 자동으로 채우지 않고 담당자 작성 필요로 표시합니다.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                id="rp-dept"
                label="보고 부서"
                hint="비우면 기본 부서"
                value={r.inputs.department}
                onChange={(v) => r.setInput('department', v)}
              />
              <TextField
                id="rp-period"
                label="보고 기간"
                hint="비우면 기본 기간"
                value={r.inputs.period}
                onChange={(v) => r.setInput('period', v)}
              />
            </div>
            {(
              [
                ['achievements', '주요 실적', '이번 기간에 무엇을 했는지'],
                ['nextPlan', '다음 계획', '다음 기간에 무엇을 할지'],
                ['remarks', '특이 사항 (선택)', '없으면 비워 두세요'],
              ] as [keyof ReportInputs, string, string][]
            ).map(([key, label, hint]) => (
              <TextField
                key={key}
                id={`rp-${key}`}
                label={label}
                hint={hint}
                rows={2}
                value={r.inputs[key]}
                onChange={(v) => r.setInput(key, v)}
              />
            ))}
          </fieldset>
        </div>
      }
      result={(res) => (
        <ResultSection
          id="report-result"
          title={`${reportTypeLabel(res.type)} — ${res.docNo}`}
          stats={[
            ['보고 부서', res.department],
            ['보고 기간', res.period],
            ['작성 절', `${res.sections.length}개`],
            ['채운 칸', `${Math.round(fillRate(res) * 100)}%`],
          ]}
          notice="AI가 작성한 초안입니다. 결재 전 담당자 확인이 필요합니다."
        >
          <p className="-mt-1 mb-4 text-xs text-slate-500">
            {reportToneLabel(res.tone)} · {reportLengthLabel(res.length)} · 소요 {res.elapsedSeconds}초
          </p>

          <div className="space-y-4">
            {res.sections.map((s) => (
              <div key={s.heading}>
                <h3 className="text-sm font-bold text-slate-800">{s.heading}</h3>
                {/* 공식체·근거 데이터는 줄바꿈이 의미를 갖는다 */}
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {s.body}
                </p>
                {/* 어느 데이터에서 왔는지 밝힌다 — 출처 없는 수치는 검증할 수 없다 */}
                <p className="mt-1 text-[11px] text-slate-500">출처 · {s.source}</p>
              </div>
            ))}
          </div>

          <DocActions doc={asDoc(res)} />

          {res.pendingFields.length > 0 && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 id="report-pending" className="text-sm font-bold text-amber-900">
                담당자 작성이 필요한 칸
              </h3>
              <ul
                aria-labelledby="report-pending"
                className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900"
              >
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
