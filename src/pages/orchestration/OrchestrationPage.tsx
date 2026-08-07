import {
  isComplete,
  stepStatusLabel,
  totalReviewPoints,
  type OrchestrationStep,
  type StepOutcome,
  type StepStatus,
} from '@entities/orchestration/model'
import { useOrchestration, type OrchestrationOptions } from '@features/orchestration/useOrchestration'
import { AgentPageHeader } from '@widgets/agent-shell/AgentShell'
import { Workflow } from 'lucide-react'

const STATUS_STYLE: Record<StepStatus, string> = {
  pending: 'bg-slate-100 text-slate-500',
  running: 'bg-brand text-brand-fg',
  done: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-rose-100 text-rose-800',
}

export function OrchestrationPage({
  onBack,
  apiOptions,
}: {
  onBack?: () => void
  apiOptions?: OrchestrationOptions
}) {
  const o = useOrchestration(apiOptions ?? {})
  const scenario = o.scenario
  const busy = o.phase.kind === 'running'
  const reviews = totalReviewPoints(o.outcomes)

  const statusOf = (i: number): StepStatus => {
    const out = o.outcomes[i]
    if (out) return out.status
    if (o.phase.kind === 'running' && o.phase.index === i) return 'running'
    return 'pending'
  }

  /* 릴레이가 없는 발주처는 카드를 안 그리므로 여기 올 일이 없다.
     그래도 억지로 들어왔을 때 빈 화면을 주지 않는다 — 왜 없는지 말한다 */
  if (!scenario) {
    return (
      <main className="min-h-dvh bg-slate-50 px-4 py-8">
        <div className="mx-auto w-full max-w-3xl">
          <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            이 발주처에는 복합 업무 릴레이가 아직 없습니다. 어느 서류가 어느 순서로 도는지
            정해져야 만들 수 있습니다.
          </p>
        </div>
      </main>
    )
  }

  const finished = isComplete(o.outcomes, scenario.steps)

  /**
   * 지금 어느 단계가 도는가 — **한 곳에서만** 말한다.
   *
   * 원래는 단계마다 자기 라이브 리전을 갖고 있었다. 그 리전은 그 단계가 시작할 때
   * 생겨나 끝나면 사라지므로, 낭독기가 첫 변화를 놓치거나 앞 알림이 끝나기 전에
   * 다음 것이 덮어써 네 번 중 몇 번만 들린다(대본 흐름 4의 3번이 그 자리다).
   * 자리를 하나로 모아 상주시키고 내용만 갈아 끼운다.
   */
  const running = scenario.steps.find((_, i) => statusOf(i) === 'running')

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <AgentPageHeader
          icon={Workflow}
          title={scenario.title}
          desc={
            <>
              요청 하나가 여러 에이전트를 거쳐 산출물까지 갑니다. 중간에 사람이 봐야 할 것을 모아 마지막에
            함께 보여 줍니다.
            </>
          }
          onBack={onBack}
        />

        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold text-slate-600">시작 조건</p>
            <p className="mt-1 text-sm text-slate-800">{scenario.trigger}</p>
            <p className="mt-3 text-xs font-bold text-slate-600">산출물</p>
            <p className="mt-1 text-sm text-slate-800">{scenario.deliverable}</p>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void o.run()}
              disabled={busy}
              className="min-h-11 rounded-lg bg-brand px-5 text-sm font-bold text-brand-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? '진행 중…' : '릴레이 실행'}
            </button>
            {o.outcomes.length > 0 && !busy && (
              <button
                type="button"
                onClick={o.reset}
                className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                다시 설정
              </button>
            )}
          </div>

          {/**
           * 끝났다는 것을 **소리로도** 말한다.
           *
           * 단계별 진행 알림은 그 단계가 끝나면 사라진다. 그래서 마지막 단계가 끝나는
           * 순간 화면의 라이브 리전이 전부 없어지고 요약 상자만 조용히 나타났다 —
           * 이 제품에서 가장 중요한 문장('확인해야 하는 지점 N건')이 낭독기에는
           * 통째로 빠져 있었다.
           *
           * 자리는 늘 두고 내용만 채운다. 아래 요약 상자는 같은 문장을 눈으로 보여
           * 주므로 낭독에서 뺀다 — 안 그러면 훑을 때 두 번 들린다.
           */}
          <p role="status" aria-live="polite" className="sr-only">
            {finished
              ? reviews > 0
                ? `릴레이가 끝났습니다. 사람이 확인해야 하는 지점이 ${reviews}건 남았습니다.`
                : '릴레이가 끝났습니다. 모든 단계가 확인 지점 없이 완료됐습니다.'
              : running
                ? `${running.title} 진행 중입니다`
                : ''}
          </p>

          {/* 끝까지 갔다고 다 된 게 아니다 — 합계를 결과보다 먼저 말한다 */}
          {finished && (
            <div
              aria-hidden="true"
              className={`rounded-xl border p-5 ${
                reviews > 0 ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'
              }`}
            >
              {reviews > 0 ? (
                <>
                  <p className="text-sm font-bold text-amber-900">
                    릴레이는 끝까지 진행됐지만 사람이 확인해야 하는 지점이 {reviews}건 남았습니다.
                  </p>
                  <p className="mt-1 text-sm text-amber-900">
                    산출물을 결재에 올리기 전에 아래 단계별 확인 지점을 처리하십시오.
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-emerald-900">
                  모든 단계가 확인 지점 없이 완료됐습니다.
                </p>
              )}
            </div>
          )}

          <ol className="space-y-3">
            {scenario.steps.map((step, i) => (
              <li key={step.id}>
                <StepCard step={step} index={i} status={statusOf(i)} outcome={o.outcomes[i] ?? null} />
              </li>
            ))}
          </ol>

          <p className="text-xs text-slate-400">
            각 단계는 해당 에이전트의 데이터 경계를 실제로 호출합니다. 서버가 붙으면 각 단계에 적힌 함수
            자리가 엔드포인트로 바뀝니다.
          </p>
        </div>
      </div>
    </main>
  )
}

function StepCard({
  step,
  index,
  status,
  outcome,
}: {
  step: OrchestrationStep
  index: number
  status: StepStatus
  outcome: StepOutcome | null
}) {
  return (
    <section
      aria-labelledby={`${step.id}-title`}
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400">STEP {index + 1}</span>
        <h2 id={`${step.id}-title`} className="text-sm font-black text-slate-900">
          {step.title}
        </h2>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[status]}`}>
          {stepStatusLabel(status)}
        </span>
        {outcome?.elapsedSeconds !== null && outcome !== null && (
          <span className="ml-auto text-[11px] text-slate-400">{outcome.elapsedSeconds}초</span>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-500">받는 것 · {step.input}</p>
      {/* 서버가 붙으면 이 자리가 엔드포인트가 된다 */}
      <p className="mt-0.5 font-mono text-[11px] text-slate-400">{step.apiCall}</p>

      {/* 진행 중이라는 말은 **위의 상주 리전 한 곳**이 한다 — 단계마다 리전을 두면
          그 단계가 끝날 때 리전이 사라져 첫 변화를 놓치고, 앞 알림이 끝나기 전에
          다음 것이 덮어써 네 번 중 몇 번만 들린다 */}
      {status === 'running' && (
        <div aria-hidden="true" className="mt-3 space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      )}

      {outcome?.output && <p className="mt-3 text-sm font-bold text-slate-800">{outcome.output}</p>}

      {outcome?.error && (
        <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-900">
          {outcome.error}
        </p>
      )}

      {outcome && outcome.reviewPoints.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-bold text-amber-900">
            사람 확인 필요 {outcome.reviewPoints.length}건
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-amber-900">
            {outcome.reviewPoints.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {outcome && outcome.status === 'done' && outcome.reviewPoints.length === 0 && (
        <p className="mt-2 text-xs text-slate-500">이 단계에서 확인할 것은 없습니다.</p>
      )}
    </section>
  )
}
