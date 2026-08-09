import { useState } from 'react'
import { AGENTS } from '@entities/agent/model'
import {
  CAPABILITIES,
  CAPABILITY_LABEL,
  RESPONSE_MODE_LABEL,
  actingWithoutCheck,
  checkPoints,
  has,
  noHumanCheck,
} from '@entities/agentdef/model'
import { fetchAgentDefs, saveAgentDef } from '@shared/api/agentdef'
import { fetchDomains } from '@shared/api/domains'
import { fetchTools } from '@shared/api/packops'
import { useRemote } from '@features/remote/useRemote'
import { DomainSelect } from '@widgets/admin-shell/DomainSelect'
import { Button } from '@shared/ui/Button'

/**
 * 태스크플로우 빌더 — 에이전트가 무엇을 하도록 정해 놓았나.
 *
 * 운영 화면(에이전트)은 '지금 어떻게 돌고 있나'를 본다. 여기는 정의다.
 * 목록은 여전히 포털과 같은 카탈로그를 쓴다.
 *
 * ⚠️ **능력 배지를 나열만 하면 많을수록 좋아 보인다.** 실제로 위험한 것은
 * 사람 확인 없이 결과가 그대로 나가는 것이고, 그중에서도 **실행형인데 확인이
 * 없는 것**이다 — 답을 내놓는 데서 끝나지 않고 무언가를 실제로 한다.
 * 그래서 그것부터 먼저 말한다.
 *
 * ⚠️ 정의는 **발주처마다 다르다.** 단계 이름이 그 발주처의 업무 용어이고 담당도
 * 그 발주처 부서다. 그래서 어느 발주처의 정의를 보는지 먼저 고른다 —
 * 안 고르면 아무 발주처의 것이나 보여 주게 된다.
 */

export function FlowBuilderPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  /* 목록을 여기서 들고 첫 항목을 기본값으로 쓴다 — effect로 초기값을 넣으면
     첫 렌더에 '발주처 없음' 오류가 한 번 스쳐 지나간다 */
  const domains = useRemote(fetchDomains, [])
  const ready = domains.kind === 'ready' ? domains.data.filter((d) => d.status === 'ready') : []
  const [picked, setPicked] = useState<string | null>(null)
  const domainId = picked ?? ready[0]?.id ?? null
  const state = useRemote(() => fetchAgentDefs(domainId), [domainId])

  const save = (id: string) => {
    void saveAgentDef(id).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  /**
   * 도구 이름과 연결 상태도 **경계에서 받는다.**
   *
   * 전에는 fixture를 직접 import해 읽었다. 이름은 그래도 됐지만 **연결 상태는
   * 살아 있는 값**이라, 서버가 붙으면 이 화면만 옛 상태를 보여 주게 된다.
   * 화면이 '끊김'을 잘못 말하는 것은 '안 보여 주는 것'보다 나쁘다.
   */
  const tools = useRemote(() => fetchTools(domainId), [domainId])
  const toolOf = (id: string) =>
    tools.kind === 'ready' ? tools.data.find((t) => t.id === id) : undefined
  const toolName = (id: string): string => toolOf(id)?.name ?? id
  const toolBroken = (id: string): boolean => toolOf(id)?.connected === false

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">태스크플로우 빌더</h1>
      <p className="mt-1 text-sm text-slate-600">
        에이전트가 밟는 단계와 능력입니다. 지금 어떻게 돌고 있는지는{' '}
        <b>AI 서비스 &gt; 에이전트</b>에서 봅니다 — 같은 카탈로그를 정의와 운영 두 각도로
        나눠 본 것입니다.
      </p>

      <DomainSelect
        domains={ready}
        value={domainId}
        onChange={setPicked}
        note="정의는 발주처마다 다릅니다 — 단계 이름이 그 발주처의 업무 용어이고 담당도 그 발주처 부서입니다."
      />

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">에이전트 정의를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const acting = actingWithoutCheck(state.data)
          const unchecked = noHumanCheck(state.data)
          const name = (id: string) => AGENTS.find((a) => a.id === id)?.name ?? id
          return (
            <>
              {/* 0을 안 보여 주면 '없다'와 '안 쟀다'를 구분할 수 없다.
                  실제로 발주처마다 갈린다 — 병원만 실행형에 확인 지점을 걸어 두었다 */}
              {acting.length === 0 && (
                <p className="mt-4 max-w-3xl rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                  사람 확인 없이 실행되는 에이전트 없음 — 이 발주처는 실행형 에이전트에 확인 지점을
                  두었습니다.
                </p>
              )}

              {/* 답을 내놓는 데서 끝나지 않고 무언가를 실제로 한다 */}
              {acting.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    사람 확인 없이 실행되는 에이전트 {acting.length}종
                  </p>
                  <ul className="mt-2 space-y-1">
                    {acting.map((d) => (
                      <li key={d.agentId} className="text-xs text-rose-800">
                        <b>{name(d.agentId)}</b> · {d.code} — 실행형인데 단계 어디에도 확인 지점이
                        없습니다. 결과가 그대로 나갑니다.
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {unchecked.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  확인 지점이 없는 에이전트가 {unchecked.length}종입니다(
                  {unchecked.map((d) => name(d.agentId)).join(', ')}). 조회만 하는 에이전트는 그래도
                  되지만, <b>결과가 문서나 지시로 이어지는 것은 확인 지점이 있어야 합니다.</b>
                </p>
              )}

              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">정의된 에이전트</dt>
                  <dd className="text-xl font-black text-slate-900">{state.data.length}종</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">확인 지점 있음</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {state.data.length - unchecked.length}종
                  </dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    acting.length > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">확인 없이 실행</dt>
                  <dd className="text-xl font-black text-slate-900">{acting.length}종</dd>
                </div>
              </dl>

              <ul aria-label="에이전트 정의" className="mt-4 space-y-3">
                {[...acting, ...state.data.filter((d) => !acting.includes(d))].map((d) => {
                  const open = openId === d.agentId
                  const checks = checkPoints(d)
                  return (
                    <li
                      key={d.agentId}
                      className={`rounded-xl border p-4 ${
                        acting.includes(d) ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-slate-900">{name(d.agentId)}</p>
                        <span className="font-mono text-[11px] text-slate-500">
                          {d.code} · {d.version}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {RESPONSE_MODE_LABEL[d.responseMode]}
                        </span>
                        <span className="ml-auto text-[11px] text-slate-500">{d.owner}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{d.purpose}</p>

                      {/* 있는 것만 늘어놓으면 많을수록 좋아 보인다 — 없는 것도 같이 보인다 */}
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {CAPABILITIES.map((c) => {
                          const on = has(d, c)
                          const critical = c === 'hitl'
                          return (
                            <li
                              key={c}
                              className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                                on
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : critical
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {CAPABILITY_LABEL[c]}
                              {on ? '' : ' 없음'}
                            </li>
                          )
                        })}
                      </ul>

                      <p className="mt-2 text-xs text-slate-600">
                        단계 {d.steps.length}개 · 사람 확인{' '}
                        {checks.length === 0 ? (
                          <span className="font-bold text-rose-700">없음</span>
                        ) : (
                          <span className="font-bold text-slate-800">{checks.length}곳</span>
                        )}
                      </p>

                      <Button size="sm" layout="mt-2" onClick={() => setOpenId(open ? null : d.agentId)} aria-expanded={open}>
                        {open ? '단계 접기' : '단계 보기'}
                      </Button>

                      {open && (
                        <ol className="mt-3 space-y-2 border-l-2 border-slate-200 pl-3">
                          {d.steps.map((s) => (
                            <li key={s.order} className="text-xs">
                              <span className="font-bold text-slate-800">
                                {s.order}. {s.name}
                              </span>
                              {s.humanCheck && (
                                <span className="ml-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-brand-fg">
                                  사람 확인
                                </span>
                              )}
                              {s.toolIds.length > 0 && (
                                <span className="mt-0.5 block text-[11px] text-slate-500">
                                  도구 ·{' '}
                                  {s.toolIds.map((t) => (
                                    <span
                                      key={t}
                                      className={toolBroken(t) ? 'font-bold text-rose-700' : ''}
                                    >
                                      {toolName(t)}
                                      {toolBroken(t) ? '(끊김)' : ''}{' '}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </li>
                          ))}
                        </ol>
                      )}

                      <Button tone="primary" size="sm" layout="mt-3" onClick={() => save(d.agentId)}>
                        정의 저장
                      </Button>
                    </li>
                  )
                })}
              </ul>
            </>
          )
        })()}
    </main>
  )
}
