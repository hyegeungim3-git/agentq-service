import { AGENTS, type AgentDefinition, type AgentId } from '@entities/agent/model'
import type { Domain } from '@entities/domain/model'
import { sectorLabel } from '@entities/domain/model'

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
            className="mb-4 min-h-24 w-full rounded-xl border border-slate-300 bg-white p-4 text-left transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-brand-fg">
                복합 업무
              </span>
              <span className="font-bold text-slate-900">수입검사 성적서 접수 처리</span>
            </span>
            <span className="mt-1 block text-sm text-slate-600">
              성적서 1건이 인식 → 주소 표준화 → 이력 조회 → 보고서 초안까지 이어집니다.
            </span>
          </button>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {agents.map((a) => {
            const ready = a.status === 'ready'
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onOpen(a.id)}
                  disabled={!ready}
                  aria-describedby={ready ? undefined : `${a.id}-status`}
                  className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors enabled:hover:border-slate-300 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{a.name}</span>
                    {!ready && (
                      <span
                        id={`${a.id}-status`}
                        className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600"
                      >
                        준비 중
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">{a.desc}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
