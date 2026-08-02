import {
  formatTimestamp,
  incompleteActions,
  speakerName,
  type MeetingResult,
} from '@entities/meeting/model'
import { useMeeting, type MeetingOptions } from '@features/meeting/useMeeting'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'

export function MeetingPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: MeetingOptions }) {
  const m = useMeeting(apiOptions ?? {})

  return (
    <AgentShell<MeetingResult>
      title="회의록 작성 에이전트"
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
      }
      result={(res) => {
        const pending = incompleteActions(res.actionItems)
        return (
          <>
            <ResultSection
              id="meeting-result"
              title={`${res.title} — ${res.heldOn}`}
              stats={[
                ['참석', `${res.speakers.length}명`],
                ['결정 사항', `${res.decisions.length}건`],
                ['조치 항목', `${res.actionItems.length}건`],
                ['미확정', `${pending.length}건`],
              ]}
            >
              <h3 className="text-sm font-bold text-slate-800">결정 사항</h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
                {res.decisions.map((d) => (
                  <li key={d.id}>{d.text}</li>
                ))}
              </ol>

              <h3 className="mt-5 text-sm font-bold text-slate-800">조치 항목</h3>
              <div className="mt-2 overflow-x-auto">
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
