import {
  criticalHazards,
  riskLevel,
  riskLevelLabel,
  riskScore,
  type RiskLevel,
  type SafetyPlan,
} from '@entities/safety/model'
import { useSafety, type SafetyOptions } from '@features/safety/useSafety'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'
import { DocActions } from '@widgets/doc-actions/DocActions'
import type { OutgoingDoc } from '@entities/docflow/model'

/* 등급은 색만으로 구분하지 않는다 — 라벨과 점수를 항상 함께 쓴다 */
const LEVEL_STYLE: Record<RiskLevel, string> = {
  critical: 'border-rose-200 bg-rose-50 text-rose-900',
  high: 'border-amber-200 bg-amber-50 text-amber-900',
  medium: 'border-sky-200 bg-sky-50 text-sky-900',
  low: 'border-slate-200 bg-slate-50 text-slate-700',
}

/**
 * 위험성평가를 내보낼 문서 모양으로.
 *
 * 위험요인 하나가 절 하나다. 출처는 **근거 법령·규정** — 대책의 근거가 없으면
 * 그 대책은 누가 정한 것인지 알 수 없다.
 */
function asDoc(res: SafetyPlan): OutgoingDoc {
  return {
    docNo: res.docNo,
    title: `위험성평가 — ${res.taskName}`,
    department: '안전보건팀',
    period: res.taskName,
    sections: res.hazards.map((h) => ({
      heading: `${h.step} — ${h.cause}`,
      body: `대책 · ${h.control}\n잔여 위험 · ${h.residual}`,
      source: res.references[0] ?? '',
    })),
    pendingFields: [],
    securityGrade: null,
  }
}

export function SafetyPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: SafetyOptions }) {
  const s = useSafety(apiOptions ?? {})

  return (
    <AgentShell<SafetyPlan>
      title="안전관리계획 수립 에이전트"
      agentId="safety"
      desc="작업 단계별 위험요인을 빈도×강도로 평가하고, 대책과 잔여 위험을 함께 제시합니다."
      onBack={onBack}
      phase={s.phase}
      docs={s.docs}
      documentId={s.documentId}
      onSelectDocument={s.setDocumentId}
      docSectionLabel="대상 작업 표준"
      emptyDocsLabel="참조할 작업 표준이 없습니다."
      upload={s.upload}
      optionsLabel="작업 조건"
      runLabel="위험성평가 실시"
      runningLabel="평가 중…"
      runningMessage="작업 단계별 위험요인을 평가하고 있습니다…"
      onRun={() => void s.run()}
      onReset={s.reset}
      options={
        <div>
          <label htmlFor="crew" className="block text-xs font-bold text-slate-600">
            작업 인원
          </label>
          <select
            id="crew"
            value={s.crewSize}
            onChange={(e) => s.setCrewSize(Number(e.target.value))}
            className="mt-1 min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value={1}>1명 (단독 작업)</option>
            <option value={2}>2명 (2인 1조)</option>
            <option value={3}>3명 이상</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            2인 미만이면 상호 확인 대책이 성립하지 않아 평가 결과가 달라집니다.
          </p>
        </div>
      }
      result={(res) => {
        const critical = criticalHazards(res.hazards)
        return (
          <>
            <ResultSection
              id="safety-result"
              title={`${res.taskName} — 위험요인 ${res.hazards.length}건`}
              stats={[
                ['평가 단계', `${res.hazards.length}개`],
                ['매우 높음', `${critical.length}건`],
                ['최고 점수', `${Math.max(...res.hazards.map(riskScore))}점`],
                ['소요', `${res.elapsedSeconds}초`],
              ]}
            >
              {critical.length > 0 && (
                <p className="-mt-1 mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-900">
                  즉시 조치가 필요한 위험이 {critical.length}건 있습니다. 작업 착수 전 대책 이행을 확인하십시오.
                </p>
              )}

              <ul className="space-y-3">
                {res.hazards.map((h) => {
                  const level = riskLevel(h)
                  return (
                    <li key={h.id} className={`rounded-lg border p-4 ${LEVEL_STYLE[level]}`}>
                      <p className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="rounded bg-white/70 px-1.5 py-0.5">
                          {riskLevelLabel(level)} · {riskScore(h)}점
                        </span>
                        <span>빈도 {h.frequency} × 강도 {h.severity}</span>
                        <span className="ml-auto">{h.step}</span>
                      </p>
                      <p className="mt-1.5 text-sm font-bold">{h.cause}</p>
                      <p className="mt-1 text-sm leading-relaxed">
                        <span className="font-bold">대책 · </span>
                        {h.control}
                      </p>
                      {/* 잔여 위험을 비우면 '대책을 세웠으니 안전하다'로 읽힌다 */}
                      <p className="mt-1.5 text-sm leading-relaxed">
                        <span className="font-bold">잔여 위험 · </span>
                        {h.residual}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </ResultSection>

            <ResultSection
              id="safety-ref"
              title="근거 법령·규정"
              notice="AI가 작성한 평가안입니다. 안전관리책임자 확인 후 확정하십시오."
            >
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {res.references.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>

              <DocActions doc={asDoc(res)} />
            </ResultSection>
          </>
        )
      }}
    />
  )
}
