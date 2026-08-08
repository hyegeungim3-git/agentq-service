import { useState } from 'react'
import { ChevronRight, Search, Star, UserCheck, Workflow } from 'lucide-react'
import { AGENTS, type AgentDefinition, type AgentId } from '@entities/agent/model'
import {
  CAPABILITY_LABEL,
  checkPoints,
  type AgentDefinition as AgentFlow,
} from '@entities/agentdef/model'
import type { Domain } from '@entities/domain/model'
import { sectorLabel } from '@entities/domain/model'
import { fetchAdoptedAgents, fetchAgentDefs } from '@shared/api/agentdef'
import { fetchAgentActivity } from '@shared/api/agentusage'
import { isFavorite, rankOf, recentlyUsed, runsOf } from '@entities/agentusage/model'
import { AgentActivityPanel } from '@widgets/agent-activity/AgentActivityPanel'
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
  const [query, setQuery] = useState('')
  const total = agents.length
  const ready = agents.filter((a) => a.status === 'ready').length
  const defs = useRemote(() => fetchAgentDefs(domain.id), [domain.id])
  /* 이 발주처가 도입한 에이전트. 못 받았으면 아무것도 막지 않는다 —
     목록을 잘못 잠그는 것보다 그대로 두는 편이 덜 위험하다 */
  const adopted = useRemote(fetchAdoptedAgents, [domain.id])
  /* 실행 횟수·순위·최근 작업 — 서버가 붙으면 이용 통계에서 온다(D-014) */
  const activity = useRemote(fetchAgentActivity, [domain.id])
  const usage = activity.kind === 'ready' ? activity.data.usage : []
  const adoptedIds = adopted.kind === 'ready' ? adopted.data.agents : null
  const scenario = adopted.kind === 'ready' ? adopted.data.scenario : null
  const adoptedCount = adoptedIds?.length ?? null
  /* 이름·설명 어느 쪽이 걸려도 찾힌다 — 사용자는 '번역'을 이름으로만 기억하지 않는다 */
  const q = query.trim().toLowerCase()
  const shown =
    q === ''
      ? agents
      : agents.filter(
          (a) => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q),
        )

  const flowOf = (id: AgentId): AgentFlow | null =>
    defs.kind === 'ready' ? (defs.data.find((d) => d.agentId === id) ?? null) : null

  return (
    /* 본문과 활동 패널을 나란히 — 원본 배치(D-014). 좁은 화면에서는 패널이 접힌다,
       카드 목록이 먼저다 */
    <div className="flex min-h-dvh bg-slate-50">
      <main className="min-w-0 flex-1 px-4 py-8">
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
          <p className="mt-1 text-sm text-slate-600">업무에 맞는 에이전트를 선택하세요.</p>

          {/* 원본처럼 **한눈에 세 수**를 둔다(D-014) — 몇 개가 있고, 몇 개가 도는지.
              지어낸 수가 아니라 카탈로그와 팩에서 센 값이다 */}
          <dl className="mt-4 flex flex-wrap gap-6">
            <div>
              <dd className="text-2xl font-black text-slate-900">{total}</dd>
              <dt className="text-[11px] text-slate-500">에이전트</dt>
            </div>
            <div>
              <dd className="text-2xl font-black text-emerald-700">{ready}</dd>
              <dt className="text-[11px] text-slate-500">가동 중</dt>
            </div>
            <div>
              <dd className="text-2xl font-black text-slate-900">{adoptedCount ?? '—'}</dd>
              <dt className="text-[11px] text-slate-500">이 발주처 도입</dt>
            </div>
          </dl>

          {/* 13종을 눈으로 훑는 대신 이름으로 좁힌다 — 고르는 것이 결과를 바꾼다 */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label htmlFor="agent-q" className="sr-only">
              에이전트 검색
            </label>
            <div className="relative min-w-56 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="agent-q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="에이전트 검색…"
                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:border-slate-400"
              />
            </div>
            <span className="text-[11px] text-slate-500">
              {shown.length}종 표시
            </span>
          </div>

          {/* 최근 쓴 것부터 — 13장을 다시 훑지 않게 한다(원본 배치) */}
          {activity.kind === 'ready' && recentlyUsed(activity.data.recent, 3).length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">최근 사용</span>
              {recentlyUsed(activity.data.recent, 3).map((id) => {
                const a = agents.find((x) => x.id === id)
                if (!a) return null
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onOpen(id)}
                    /* 카드에도 같은 이름이 있다 — 겹치면 음성으로 골라 누를 수 없다.
                       보이는 글자를 담고 뒤에 자리를 덧붙인다(WCAG 2.5.3) */
                    aria-label={`${a.name} 최근 사용에서 열기`}
                    className="min-h-11 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {a.name} <span className="text-slate-400">{runsOf(usage, id)}회</span>
                  </button>
                )
              })}
            </div>
          )}
        </header>

        {/* 한 에이전트로 끝나지 않는 업무는 릴레이로 묶는다 */}
        {onOpenScenario && scenario && (
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
                <span className="font-bold text-slate-900">{scenario.title}</span>
              </span>
              <span className="mt-1 block text-sm text-slate-600">{scenario.summary}</span>
            </span>
            <ChevronRight className="text-brand mt-2 size-5 shrink-0" aria-hidden="true" />
          </button>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {shown.map((a) => {
            /* 두 가지 이유로 못 쓴다 — 아직 안 만든 화면과, 이 발주처가 아직 안 도입한 것.
               뭉뚱그리면 '없는 기능'과 '아직 안 산 기능'을 구분할 수 없다 */
            const built = a.status === 'ready'
            const notAdopted = built && adoptedIds !== null && !adoptedIds.includes(a.id)
            const usable = built && !notAdopted
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
                        /* 설명에 **사람 확인 지점**까지 넣는다. 눈으로 보는 사람은 카드
                           아래 배지로 즉시 골라내지만, Tab으로 도는 사람은 13개를 다
                           지나도록 그 말을 한 번도 못 들었다 — 이 제품이 강조하는 판단
                           근거가 소리에서 통째로 빠져 있었다 */
                        aria-describedby={`${a.id}-desc ${a.id}-check`}
                        className="text-left font-bold text-slate-900 after:absolute after:inset-0 after:content-[''] disabled:cursor-not-allowed"
                      >
                        {a.name}
                        {!usable && (
                          <span className="sr-only">
                            {' '}
                            — {notAdopted ? '이 발주처 도입 전' : '준비 중'}
                          </span>
                        )}
                      </button>
                      {!usable && (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {notAdopted ? '도입 전' : '준비 중'}
                        </span>
                      )}
                      {/* 얼마나 쓰는지 — 원본 카드의 실행 횟수·순위·즐겨찾기(D-014).
                          많이 쓰는 것이 위에 있지 않으므로 카드에서 알 수 있어야 한다.
                          숫자만 두지 않고 '이번 달'을 붙인다 — 언제부터 센 수인지 없으면
                          21회가 하루치인지 1년치인지 알 수 없다 */}
                      {usable && runsOf(usage, a.id) > 0 && (
                        <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px] text-slate-400">
                          {isFavorite(usage, a.id) && (
                            <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                          )}
                          <span className="font-bold text-slate-500">
                            이번 달 {runsOf(usage, a.id)}회
                          </span>
                          {(rankOf(usage, a.id) ?? 99) <= 3 && (
                            <span className="bg-brand-soft text-brand rounded px-1 py-0.5 font-black">
                              #{String(rankOf(usage, a.id)).padStart(2, '0')}
                            </span>
                          )}
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

                    <div
                      id={`${a.id}-check`}
                      className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2"
                    >
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

      {activity.kind === 'ready' && (
        <div className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] xl:block">
          <AgentActivityPanel activity={activity.data} onOpen={onOpen} />
        </div>
      )}
    </div>
  )
}
