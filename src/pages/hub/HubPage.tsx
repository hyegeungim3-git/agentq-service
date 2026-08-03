import { ChevronRight, UserCheck, Workflow } from 'lucide-react'
import { AGENTS, type AgentDefinition, type AgentId } from '@entities/agent/model'
import {
  CAPABILITY_LABEL,
  checkPoints,
  type AgentDefinition as AgentFlow,
} from '@entities/agentdef/model'
import type { Domain } from '@entities/domain/model'
import { sectorLabel } from '@entities/domain/model'
import { fetchAgentDefs } from '@shared/api/agentdef'
import { useRemote } from '@features/remote/useRemote'
import { AGENT_ICONS, FALLBACK_AGENT_ICON } from '@shared/ui/agentIcons'

/**
 * 에이전트 허브.
 *
 * 카드에 **정의(`agentdef`)를 함께 보여 준다.** 이름과 한 줄 설명만 있으면
 * 눌러 보기 전에는 무엇을 하는지 모른다 — 어떤 단계를 밟는지, 무엇을 근거로 하는지,
 * **사람이 확인하는 지점이 있는지**까지 카드에서 보인다.
 *
 * 관리자의 '태스크플로우 빌더'와 **같은 정의**를 읽는다. 복제하지 않는다 —
 * 거기서 단계를 고치면 여기 카드도 함께 바뀐다.
 *
 * 정의는 나중에 오므로 카드가 정의를 기다리지 않는다. 이름·설명은 먼저 나오고
 * 단계·배지가 뒤따른다 — 목록 전체를 회색 상자로 막아 두지 않는다.
 */
export function HubPage({
  domain,
  onOpen,
  onOpenScenario,
  onBack,
  /* 목록을 주입할 수 있게 둔다 — 13종이 모두 ready가 된 뒤에도
     '준비 중' 렌더 경로를 테스트로 지킬 수 있어야 한다. */
  agents = AGENTS,
}: {
  domain: Domain
  onOpen: (id: AgentId) => void
  /** 복합 업무 시나리오 — 없으면 카드를 그리지 않는다 */
  onOpenScenario?: (() => void) | undefined
  /** 셸 밖에서 단독으로 쓸 때만 필요하다. 셸 안에서는 사이드바가 그 역할을 한다 */
  onBack?: (() => void) | undefined
  agents?: AgentDefinition[]
}) {
  const total = agents.length
  const ready = agents.filter((a) => a.status === 'ready').length
  const defs = useRemote(fetchAgentDefs, [])
  const flowOf = (id: AgentId): AgentFlow | null =>
    defs.kind === 'ready' ? (defs.data.find((d) => d.agentId === id) ?? null) : null

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 min-h-11 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              ← 분야 선택
            </button>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {/* 색은 셸이 꽂아 준 `--color-brand`를 따른다 — 화면이 직접 칠하지 않는다 */}
            <span className="bg-brand text-brand-fg rounded px-2 py-0.5 text-[11px] font-bold">
              {sectorLabel(domain.sector)}
            </span>
            <h1 className="text-xl font-black text-slate-900">{domain.orgName}</h1>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            업무에 맞는 에이전트를 선택하세요.{' '}
            <span className="text-slate-400">
              (이식 {ready}/{total}종)
            </span>
          </p>
        </header>

        {/* 한 에이전트로 끝나지 않는 업무는 릴레이로 묶는다 */}
        {onOpenScenario && (
          <button
            type="button"
            onClick={onOpenScenario}
            className="border-brand-soft bg-brand-soft hover:border-brand mb-4 flex min-h-24 w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors"
          >
            <span className="bg-brand flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Workflow className="text-brand-fg size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="bg-brand text-brand-fg rounded px-1.5 py-0.5 text-[10px] font-bold">
                  복합 업무
                </span>
                <span className="font-bold text-slate-900">수입검사 성적서 접수 처리</span>
              </span>
              <span className="mt-1 block text-sm text-slate-600">
                성적서 1건이 인식 → 주소 표준화 → 이력 조회 → 보고서 초안까지 이어집니다.
              </span>
            </span>
            <ChevronRight className="text-brand mt-2 size-5 shrink-0" aria-hidden="true" />
          </button>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {agents.map((a) => {
            const usable = a.status === 'ready'
            const Icon = AGENT_ICONS[a.id] ?? FALLBACK_AGENT_ICON
            const flow = flowOf(a.id)
            const checks = flow ? checkPoints(flow) : []
            return (
              /* 카드 전체가 눌리지만 **버튼 안에 설명을 넣지 않는다.**
                 넣었더니 버튼 이름이 '표준 보고서 작성 … 실적 데이터 조회 › …'처럼
                 길어져 '데이터 조회' 에이전트와 이름이 겹쳤다(E2E가 잡았다).
                 보조기기에도 같은 문제다 — 이름은 짧아야 하고 설명은 따로 읽혀야 한다.
                 그래서 버튼은 제목만 갖고, 겹침(after)으로 카드 전체를 덮는다. */
              <li
                key={a.id}
                className={`group relative flex min-h-24 flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all ${
                  usable ? 'hover:border-brand-soft hover:shadow-md' : 'bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="bg-brand-soft flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="text-brand size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpen(a.id)}
                        disabled={!usable}
                        aria-describedby={`${a.id}-desc`}
                        className="text-left font-bold text-slate-900 after:absolute after:inset-0 after:content-[''] disabled:cursor-not-allowed"
                      >
                        {a.name}
                        {!usable && <span className="sr-only"> — 준비 중</span>}
                      </button>
                      {!usable && (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          준비 중
                        </span>
                      )}
                    </div>
                    <p id={`${a.id}-desc`} className="mt-1 text-sm text-slate-600">
                      {a.desc}
                    </p>
                  </div>
                </div>

                {flow && (
                  <>
                    {/* 능력 배지 — 무엇을 근거로 답하는지 */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {flow.capabilities.map((c) => (
                        <span
                          key={c}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600"
                        >
                          {CAPABILITY_LABEL[c]}
                        </span>
                      ))}
                    </div>

                    {/* 밟는 단계 — 관리자의 태스크플로우 빌더와 같은 정의다 */}
                    <ol className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1">
                      {flow.steps.map((s, i) => (
                        <li key={s.order} className="flex items-center gap-1">
                          {i > 0 && (
                            <ChevronRight className="size-3 text-slate-300" aria-hidden="true" />
                          )}
                          <span className="text-[11px] text-slate-500">{s.name}</span>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2">
                      {/* 확인 지점이 없으면 결과가 그대로 나간다 — 좋아 보이는 배지보다 이게 중요하다 */}
                      {checks.length > 0 ? (
                        <>
                          <UserCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
                          <span className="text-[11px] font-bold text-emerald-800">
                            사람 확인 {checks.length}곳
                          </span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="size-3.5 text-amber-700" aria-hidden="true" />
                          <span className="text-[11px] font-bold text-amber-800">
                            사람 확인 지점 없음
                          </span>
                        </>
                      )}
                      {usable && (
                        <span className="text-brand ml-auto flex items-center gap-0.5 text-[11px] font-bold">
                          시작하기
                          <ChevronRight
                            className="size-3.5 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                    </div>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
