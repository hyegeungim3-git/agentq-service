import {
  formatTimestamp,
  incompleteActions,
  speakerName,
  uncoveredAgenda,
  type MeetingInputs,
  type MeetingResult,
} from '@entities/meeting/model'
import { useMeeting, type MeetingOptions } from '@features/meeting/useMeeting'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'

/* 부모 안에서 정의하지 않는다 — 매 렌더 새 타입이 되어 리마운트되고,
   입력창이라면 첫 글자만 입력된다(AGENTS.md §6) */
function Field({
  id,
  label,
  hint,
  value,
  rows,
  onChange,
}: {
  id: string
  label: string
  hint?: string
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

export function MeetingPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: MeetingOptions }) {
  const m = useMeeting(apiOptions ?? {})

  return (
    <AgentShell<MeetingResult>
      title="회의록 작성 에이전트"
      agentId="meeting"
      desc="녹음을 발언자별로 정리하고, 결정 사항과 조치 항목을 뽑아 줍니다."
      onBack={onBack}
      phase={m.phase}
      docs={m.docs}
      documentId={m.documentId}
      onSelectDocument={m.setDocumentId}
      docSectionLabel="회의 녹음"
      emptyDocsLabel="정리할 회의 녹음이 없습니다."
      upload={m.upload}
      optionsLabel="작성 설정"
      runLabel="회의록 작성"
      runningLabel="정리 중…"
      runningMessage="발언을 분리하고 결정 사항을 뽑고 있습니다…"
      onRun={() => void m.run()}
      onReset={m.reset}
      options={
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-1 text-xs font-bold text-slate-600">회의 자료 첨부 (선택)</legend>
            {/* 자료를 붙이면 결정에 문서 근거가 달린다. 안 붙이면 발언에만 의존한다 */}
            <p className="mb-2 text-xs text-slate-500">
              붙이면 결정 사항에 근거 조항을 답니다. 없으면 발언에만 의존했다고 표시합니다.
            </p>
            <ul className="space-y-2">
              {m.references.map((r) => (
                <li key={r.id}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand-soft">
                    <input
                      type="checkbox"
                      checked={m.referenceIds.includes(r.id)}
                      onChange={() => m.toggleReference(r.id)}
                      className="size-4 shrink-0"
                    />
                    <span className="min-w-0 truncate text-sm font-bold text-slate-800">{r.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs font-bold text-slate-600">회의 기본 정보</legend>
            <p className="text-xs text-slate-500">비우면 녹음에서 추정하고, 추정했다고 표시합니다.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ['title', '제목', '비우면 추정'],
                  ['heldOn', '일자', 'YYYY-MM-DD'],
                  ['place', '장소', '비우면 추정'],
                ] as [keyof MeetingInputs, string, string][]
              ).map(([key, label, hint]) => (
                <Field
                  key={key}
                  id={`mt-${key}`}
                  label={label}
                  hint={hint}
                  value={m.inputs[key]}
                  onChange={(v) => m.setInput(key, v)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs font-bold text-slate-600">참석자 · 안건</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                id="mt-attendees"
                label="참석자 (한 줄에 한 명)"
                rows={4}
                value={m.inputs.attendees}
                onChange={(v) => m.setInput('attendees', v)}
              />
              <Field
                id="mt-agenda"
                label="안건 (한 줄에 하나)"
                rows={4}
                value={m.inputs.agenda}
                onChange={(v) => m.setInput('agenda', v)}
              />
            </div>
            <p className="text-xs text-slate-500">
              참석자는 발언 기록과 대조하고, 안건은 논의 여부를 표시합니다.
            </p>
          </fieldset>

          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={m.includeUtterances}
              onChange={(e) => m.setIncludeUtterances(e.target.checked)}
              className="size-4"
            />
            <span className="text-sm font-bold text-slate-800">발언 기록 포함</span>
            <span className="text-xs text-slate-500">끄면 결정·조치만 남습니다</span>
          </label>
        </div>
      }
      result={(res) => {
        const pending = incompleteActions(res.actionItems)
        const uncovered = uncoveredAgenda(res.agendaCoverage)
        return (
          <>
            <ResultSection
              id="meeting-result"
              title={`${res.title} — ${res.heldOn}`}
              stats={[
                ['장소', res.place],
                ['결정 사항', `${res.decisions.length}건`],
                ['조치 항목', `${res.actionItems.length}건`],
                ['미확정', `${pending.length}건`],
              ]}
            >
              {/* 사람이 넣은 값인지 추정값인지 밝힌다 */}
              {res.headerSource === 'estimated' && (
                <p className="-mt-1 mb-4 text-xs text-slate-500">
                  회의 기본 정보를 입력하지 않아 녹음 파일에서 추정했습니다.
                </p>
              )}

              {res.attendance && (
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-600">참석자 대조</p>
                  <p className="mt-1 text-sm text-slate-700">
                    발언 확인 {res.attendance.spoke.length}명
                    {res.attendance.spoke.length > 0 && ` (${res.attendance.spoke.join(', ')})`}
                  </p>
                  {res.attendance.silent.length > 0 && (
                    <p className="mt-1 text-sm text-slate-700">
                      발언 기록 없음 · {res.attendance.silent.join(', ')}
                    </p>
                  )}
                  {/* 명단에 없는 발언자는 오인식이거나 미기재 참석자다 — 둘 다 확인해야 한다 */}
                  {res.attendance.unlisted.length > 0 && (
                    <p className="mt-1 text-sm font-bold text-amber-800">
                      명단에 없는 발언자 · {res.attendance.unlisted.join(', ')} — 음성 인식 오류이거나
                      명단 누락입니다.
                    </p>
                  )}
                </div>
              )}
              {!res.attendance && (
                <p className="mb-4 text-xs text-slate-500">
                  참석자 명단을 입력하지 않아 발언자 이름은 음성 인식 추정입니다.
                </p>
              )}

              <h3 className="text-sm font-bold text-slate-800">결정 사항</h3>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                {res.decisions.map((d) => (
                  <li key={d.id}>
                    {d.text}
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {d.basis ? `근거 · ${d.basis}` : '근거 문서 없음 — 발언에만 의존'}
                    </span>
                  </li>
                ))}
              </ol>

              {res.agendaCoverage.length > 0 && (
                <>
                  <h3 className="mt-5 text-sm font-bold text-slate-800">안건별 논의</h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {res.agendaCoverage.map((a) => (
                      <li key={a.no} className="flex flex-wrap items-baseline gap-2">
                        <span className="text-slate-500">{a.no}.</span>
                        <span className="text-slate-700">{a.topic}</span>
                        <span
                          className={`text-xs font-bold ${
                            a.decisionIds.length > 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {a.decisionIds.length > 0 ? `결정 ${a.decisionIds.length}건` : '논의 기록 없음'}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {/* 회의가 끝났는데 남은 것 — 이걸 드러내는 게 회의록의 실무 가치다 */}
                  {uncovered.length > 0 && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
                      논의되지 않은 안건이 {uncovered.length}건 있습니다 (
                      {uncovered.map((a) => a.topic).join(', ')}).
                    </p>
                  )}
                </>
              )}

              <h3 className="mt-5 text-sm font-bold text-slate-800">조치 항목</h3>
              <div className="mt-2 overflow-x-auto" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
                <table className="w-full min-w-[28rem] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                      <th scope="col" className="py-2 pr-3 font-bold">
                        할 일
                      </th>
                      <th scope="col" className="py-2 pr-3 font-bold">
                        담당
                      </th>
                      <th scope="col" className="py-2 font-bold">
                        기한
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.actionItems.map((a) => (
                      <tr key={a.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 pr-3 text-slate-700">{a.task}</td>
                        {/* 회의에서 안 정해진 것을 채우지 않는다 — 비었으면 비었다고 쓴다 */}
                        <td className={`py-2 pr-3 ${a.ownerId ? 'text-slate-700' : 'font-bold text-amber-700'}`}>
                          {speakerName(res.speakers, a.ownerId)}
                        </td>
                        <td className={`py-2 ${a.due ? 'text-slate-700' : 'font-bold text-amber-700'}`}>
                          {a.due ?? '미정'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pending.length > 0 && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
                  담당자 또는 기한이 정해지지 않은 항목이 {pending.length}건 있습니다. 회의 후 확정이 필요합니다.
                </p>
              )}
            </ResultSection>

            {res.utterances.length > 0 && (
              <ResultSection
                id="utterances"
                title="발언 기록"
                notice="AI가 정리한 회의록입니다. 참석자 확인 후 확정하십시오."
              >
                <ul className="space-y-3">
                  {res.utterances.map((u, i) => (
                    <li key={i} className="border-l-2 border-slate-200 pl-3">
                      <p className="text-[11px] text-slate-500">
                        {formatTimestamp(u.atSeconds)} · {speakerName(res.speakers, u.speakerId)}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{u.text}</p>
                    </li>
                  ))}
                </ul>
              </ResultSection>
            )}

            {res.utterances.length === 0 && (
              <p className="text-xs text-slate-400">
                AI가 정리한 회의록입니다. 참석자 확인 후 확정하십시오.
              </p>
            )}
          </>
        )
      }}
    />
  )
}
