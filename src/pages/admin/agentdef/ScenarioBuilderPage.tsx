import { useState } from 'react'
import { AGENTS } from '@entities/agent/model'
import { blockedBy, notAdopted, unknownAgents } from '@entities/agentdef/model'
import {
  fetchAdoptedAgents,
  fetchAgentDefs,
  fetchScenarioDefs,
  saveScenario,
} from '@shared/api/agentdef'
import { fetchDomains } from '@shared/api/domains'
import { useRemote } from '@features/remote/useRemote'
import { DomainSelect } from '@widgets/admin-shell/DomainSelect'
import { TOOLS } from '@fixtures/packops'
import { withSubject } from '@shared/lib/korean'

/**
 * 시나리오 빌더 — 여러 에이전트를 잇는 복합 업무.
 *
 * ⚠️ 시나리오는 **중간에 하나만 못 돌아도 전체가 멈춘다.** 그런데 목록에는
 * '사용 중'으로 보인다 — 눌러 보기 전까지 모른다.
 *
 * 그래서 세 가지를 미리 본다.
 *  ① 시나리오가 부르는 에이전트가 카탈로그에 실제로 있는가
 *  ② **이 발주처가 그 에이전트를 도입했는가** — 있어도 안 샀으면 거기서 멈춘다
 *  ③ 그 에이전트가 **끊긴 도구**를 쓰는가 (도구·배포 화면과 같은 판정)
 *
 * ②가 포털과 이어진다. 도입 안 한 에이전트를 부르는 시나리오라서 포털 허브에
 * 릴레이 카드가 없는 것이다 — 두 화면이 같은 사실을 말해야 한다.
 *
 * 꺼 둔 시나리오는 목록에서 빼지 않는다. 빼면 만든 적 없는 것으로 읽힌다.
 */

export function ScenarioBuilderPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const domains = useRemote(fetchDomains, [])
  const ready = domains.kind === 'ready' ? domains.data.filter((d) => d.status === 'ready') : []
  const [picked, setPicked] = useState<string | null>(null)
  const domainId = picked ?? ready[0]?.id ?? null
  const scenarios = useRemote(() => fetchScenarioDefs(domainId), [domainId])
  const defs = useRemote(() => fetchAgentDefs(domainId), [domainId])
  const adopted = useRemote(() => fetchAdoptedAgents(domainId), [domainId])

  const save = (id: string) => {
    void saveScenario(id).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  const agentName = (id: string): string => AGENTS.find((a) => a.id === id)?.name ?? id
  const toolName = (id: string): string => TOOLS.find((t) => t.id === id)?.name ?? id
  const brokenTools = TOOLS.filter((t) => !t.connected).map((t) => t.id)
  const knownAgents = AGENTS.map((a) => a.id)

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">시나리오 빌더</h1>
      <p className="mt-1 text-sm text-slate-600">
        여러 에이전트를 <b>순서대로</b> 이어 처리하는 복합 업무입니다. 사용자 포털의 에이전트 탭
        위쪽 카드가 이것입니다. 조건에 따라 길이 갈리는 것은 <b>워크플로우</b>에서 봅니다.
      </p>

      <DomainSelect
        domains={ready}
        value={domainId}
        onChange={setPicked}
        note="시나리오는 발주처마다 다릅니다. 도입하지 않은 에이전트를 부르는 시나리오는 포털에 카드가 뜨지 않습니다."
      />

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {scenarios.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">시나리오를 불러오는 중입니다</span>
        </div>
      )}

      {scenarios.kind === 'ready' &&
        defs.kind === 'ready' &&
        (() => {
          const adoptedIds = adopted.kind === 'ready' ? adopted.data.agents : knownAgents
          const withState = scenarios.data.map((s) => ({
            s,
            missing: unknownAgents(s, knownAgents),
            /* 카탈로그에는 있는데 이 발주처가 안 산 것 */
            unbought: notAdopted(s, adoptedIds),
            blocked: blockedBy(s, defs.data, brokenTools),
          }))
          const broken = withState.filter(
            (x) => x.s.enabled && (x.blocked.length > 0 || x.missing.length > 0 || x.unbought.length > 0),
          )
          const rest = withState.filter((x) => !broken.includes(x))
          return (
            <>
              {/* 목록에는 '사용 중'으로 보인다 — 눌러 보기 전까지 모른다 */}
              {broken.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    켜져 있지만 지금 끝까지 못 도는 시나리오 {broken.length}건
                  </p>
                  <ul className="mt-2 space-y-1">
                    {broken.map((x) => (
                      <li key={x.s.id} className="text-xs text-rose-800">
                        <b>{x.s.title}</b> —{' '}
                        {x.missing.length > 0
                          ? '없는 에이전트를 부릅니다(' + x.missing.join(', ') + ')'
                          : x.unbought.length > 0
                            ? '이 발주처가 도입하지 않은 에이전트를 부릅니다(' +
                              x.unbought.map(agentName).join(', ') +
                              ')'
                            : x.blocked
                              /* 괄호로 얼버무리지 않는다 — 받침으로 고른다 */
                                .map((bkd) => withSubject(agentName(bkd.agentId)) + ' ' + toolName(bkd.toolId) + '를 씁니다')
                                .join(', ') + ' — 그 도구가 끊겨 있습니다'}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-bold text-rose-900">
                    사용자에게는 카드가 그대로 보입니다. 눌러야 멈춘다는 것을 알게 됩니다.
                  </p>
                </div>
              )}

              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">시나리오</dt>
                  <dd className="text-xl font-black text-slate-900">{scenarios.data.length}건</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">켜짐</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {scenarios.data.filter((s) => s.enabled).length}건
                  </dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    broken.length > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">못 도는 것</dt>
                  <dd className="text-xl font-black text-slate-900">{broken.length}건</dd>
                </div>
              </dl>

              <ul aria-label="시나리오" className="mt-4 space-y-3">
                {[...broken, ...rest].map(({ s, blocked, missing, unbought }) => (
                  <li
                    key={s.id}
                    className={`rounded-xl border p-4 ${
                      blocked.length > 0 || missing.length > 0 || unbought.length > 0
                        ? 'border-rose-200 bg-rose-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-slate-900">{s.title}</p>
                      {/* 꺼 둔 것을 빼면 만든 적 없는 것으로 읽힌다 */}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          s.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.enabled ? '켜짐' : '꺼짐'}
                      </span>
                      <span className="ml-auto text-[11px] text-slate-500">{s.owner}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {s.trigger} → {s.output}
                    </p>

                    <ol className="mt-2 space-y-1 border-l-2 border-slate-200 pl-3">
                      {s.steps.map((st) => {
                        const bad = blocked.some((bkd) => bkd.agentId === st.agentId)
                        const unsold = unbought.includes(st.agentId)
                        return (
                          <li key={st.order} className="text-xs">
                            <span
                              className={`font-bold ${bad || unsold ? 'text-rose-800' : 'text-slate-800'}`}
                            >
                              {st.order}. {agentName(st.agentId)}
                              {unsold ? ' (도입 전)' : bad ? ' (도구 끊김)' : ''}
                            </span>
                            <span className="ml-1 text-slate-600">— {st.what}</span>
                          </li>
                        )
                      })}
                    </ol>

                    <button
                      type="button"
                      onClick={() => save(s.id)}
                      className="mt-3 min-h-11 rounded-lg bg-brand px-3 text-[11px] font-bold text-brand-fg hover:opacity-90"
                    >
                      시나리오 저장
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )
        })()}
    </main>
  )
}
