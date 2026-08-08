import { useId, useState } from 'react'
import { ChevronDown, ChevronRight, UserCheck, Wrench } from 'lucide-react'
import type { AgentId } from '@entities/agent/model'
import type { FlowStep } from '@entities/agentdef/model'
import { fetchAgentDefs } from '@shared/api/agentdef'
import { fetchTools } from '@shared/api/packops'
import { activeDomain } from '@shared/api/tenant'
import { useRemote } from '@features/remote/useRemote'

/**
 * 처리 단계 — 이 결과가 나오기까지 무엇을 거쳤는가.
 *
 * 원본 데모의 '에이전트 내부 로직 보기'다. 대조표에서 마지막까지 남아 있던
 * 미이관 1건이며, 없으면 사용자는 결과만 보고 **무엇을 근거로 나온 것인지**
 * 알 방법이 없다. 관리자 화면에는 이 정보가 있었는데 정작 결과를 받는 사람에게만
 * 없었다 — 순서가 거꾸로였다.
 *
 * ⚠️ **진행률을 흉내 내지 않는다.** 실행 중에 어느 단계까지 갔는지 지금은 알 수
 * 없다. 모르면서 3/5 같은 수를 보여 주면 그것은 거짓말이고, 서버가 붙어 실제
 * 진행이 오는 날 화면은 안 바뀌는데 뜻만 바뀐다. 그래서 여기는 **거치는 단계의
 * 목록**이고, 진행 표시가 아니다.
 *
 * 사람이 확인하는 지점(`humanCheck`)은 눈에 띄게 둔다. 어디가 자동이고 어디에
 * 사람이 개입하는지가 이 화면에서 제일 중요한 정보다.
 */

export function AgentFlowTrail({ agentId }: { agentId: AgentId }) {
  const domainId = activeDomain()
  const defs = useRemote(() => fetchAgentDefs(domainId), [domainId])
  const tools = useRemote(() => fetchTools(domainId), [domainId])
  const [open, setOpen] = useState(false)
  const panelId = useId()

  if (defs.kind !== 'ready') return null
  const def = defs.data.find((d) => d.agentId === agentId)
  if (!def || def.steps.length === 0) return null

  const toolOf = (id: string) =>
    tools.kind === 'ready' ? (tools.data.find((t) => t.id === id) ?? null) : null

  const steps = [...def.steps].sort((a, b) => a.order - b.order)
  const checks = steps.filter((s) => s.humanCheck).length

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-11 w-full items-center gap-2 px-5 py-3 text-left hover:bg-slate-50"
        >
          {open ? (
            <ChevronDown className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          )}
          <span className="min-w-0 flex-1 text-sm font-black text-slate-900">처리 단계</span>
          <span className="shrink-0 text-xs text-slate-500">
            {steps.length}단계
            {checks > 0 && ` · 사람 확인 ${checks}곳`}
          </span>
        </button>
      </h2>

      {/* 접혔다고 **안 그리면 안 된다.** 버튼의 `aria-controls`가 없는 id를 가리키게 되고,
          낭독기는 '무엇을 여는 버튼인지' 말할 대상을 잃는다(접근성 훑기가 잡았다).
          자리는 늘 두고 `hidden`으로 감춘다 */}
      <div hidden={!open} id={panelId} className="border-t border-slate-200 px-5 py-4">
        <p className="mb-3 text-xs text-slate-600">
          이 에이전트가 결과를 만들 때 거치는 단계입니다. 지금은 어느 단계까지 갔는지는 표시하지
          않습니다 — 실제 진행 상태는 서버가 붙어야 알 수 있습니다.
        </p>
        <ol className="space-y-2">
          {steps.map((s) => (
            <li key={s.order}>
              <FlowStepRow step={s} tool={toolOf} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function FlowStepRow({
  step,
  tool,
}: {
  step: FlowStep
  tool: (id: string) => { name: string; connected: boolean } | null
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2">
      <span className="bg-brand-soft text-brand mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black">
        {step.order}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-800">{step.name}</span>
        {step.toolIds.length > 0 && (
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            {step.toolIds.map((id) => {
              const t = tool(id)
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-600"
                >
                  <Wrench className="size-3 shrink-0 text-slate-400" aria-hidden="true" />
                  {/* 이름을 못 찾으면 id를 그대로 둔다. 조용히 감추면 그 단계가
                      도구를 안 쓰는 것처럼 보인다 */}
                  {t?.name ?? id}
                  {t && !t.connected && (
                    <span className="font-bold text-amber-700">· 미연결</span>
                  )}
                </span>
              )
            })}
          </span>
        )}
      </span>
      {step.humanCheck && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
          <UserCheck className="size-3" aria-hidden="true" />
          사람 확인
        </span>
      )}
    </div>
  )
}
