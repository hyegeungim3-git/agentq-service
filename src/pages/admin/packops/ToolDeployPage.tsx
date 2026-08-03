import { useState } from 'react'
import {
  STAGE_LABEL,
  TOOL_KIND_LABEL,
  blockedAgents,
  pendingPromotion,
} from '@entities/packops/model'
import { fetchDeployments, fetchTools, promote } from '@shared/api/packops'
import { useRemote } from '@features/remote/useRemote'

/**
 * 도구 · 배포.
 *
 * **도구는 끊겨도 서비스가 죽지 않는다.** 그 도구를 쓰는 에이전트만 조용히 못 돈다.
 * 그래서 '연결됨/끊김'만 쓰지 않고 **끊기면 어떤 에이전트가 멈추는지**를 이름으로
 * 적는다 — 연계 SW 모니터링과 같은 방식이다.
 *
 * 배포는 **검증에만 올라가 있고 운영에 안 나간 버전**을 먼저 보여 준다.
 * 목록만 나열하면 무엇이 아직 사용자에게 안 갔는지 훑어서 찾아야 한다.
 */

type Tab = 'tools' | 'deploy'

export function ToolDeployPage() {
  const [tab, setTab] = useState<Tab>('tools')
  const [failure, setFailure] = useState<string | null>(null)
  const tools = useRemote(fetchTools, [])
  const deployments = useRemote(fetchDeployments, [])

  const doPromote = (target: string, version: string) => {
    void promote(target, version).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">도구 · 배포</h1>
      <p className="mt-1 text-sm text-slate-600">에이전트가 부르는 도구와, 지금 떠 있는 버전입니다.</p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      <div role="tablist" aria-label="도구·배포" className="mt-4 flex flex-wrap gap-2">
        {(
          [
            { id: 'tools' as const, label: '도구' },
            { id: 'deploy' as const, label: '배포' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-full border px-4 text-sm font-bold ${
              tab === t.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tools' && tools.kind === 'ready' && (
        <section className="mt-4">
          {(() => {
            const broken = tools.data.filter((t) => !t.connected)
            const ok = tools.data.filter((t) => t.connected)
            const blocked = blockedAgents(tools.data)
            return (
              <>
                {/* 도구는 끊겨도 서비스가 죽지 않아 더 늦게 발견된다 */}
                {blocked.length > 0 && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-black text-rose-900">
                      끊긴 도구 때문에 못 도는 에이전트 {blocked.length}종
                    </p>
                    <p className="mt-1 text-xs text-rose-800">{blocked.join(', ')}</p>
                    <p className="mt-2 text-xs font-bold text-rose-900">
                      서비스는 계속 돌고 있어 오류가 나지 않습니다. 이 에이전트를 쓰면 결과가 비거나
                      옛 값으로 나옵니다.
                    </p>
                  </div>
                )}

                <ul className="mt-4 grid gap-3 lg:grid-cols-2">
                  {[...broken, ...ok].map((t) => (
                    <li
                      key={t.id}
                      className={`rounded-xl border p-4 ${
                        t.connected ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-slate-900">{t.name}</p>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {TOOL_KIND_LABEL[t.kind]}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                            t.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.connected ? '연결됨' : '끊김'}
                        </span>
                        <span className="ml-auto text-[11px] tabular-nums text-slate-500">
                          7일 {t.calls7d.toLocaleString('ko-KR')}회
                        </span>
                      </div>
                      {t.downReason && (
                        <p className="mt-2 text-xs font-bold text-rose-800">{t.downReason}</p>
                      )}
                      {/* 이름만 보고는 무엇이 이 도구에 기대는지 알 수 없다 */}
                      <p className="mt-2 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-700">
                        {t.connected ? '끊기면 멈추는 에이전트 · ' : '지금 못 도는 에이전트 · '}
                        {t.usedBy.join(', ')}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )
          })()}
        </section>
      )}

      {tab === 'deploy' && deployments.kind === 'ready' && (
        <section className="mt-4">
          {(() => {
            const pending = pendingPromotion(deployments.data)
            return (
              <>
                {/* 목록만 나열하면 무엇이 아직 안 갔는지 훑어서 찾아야 한다 */}
                {pending.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-black text-amber-900">
                      검증에만 올라가 있고 운영에 안 나간 버전 {pending.length}건
                    </p>
                    <ul className="mt-2 space-y-2">
                      {pending.map((x) => (
                        <li key={x.target} className="flex flex-wrap items-center gap-2 text-xs text-amber-900">
                          <b>{x.target}</b>
                          <span className="tabular-nums">
                            운영 {x.production ?? '없음'} → 검증 {x.staging}
                          </span>
                          <button
                            type="button"
                            onClick={() => doPromote(x.target, x.staging)}
                            className="min-h-11 rounded-lg border border-amber-300 px-3 text-[11px] font-bold text-amber-900 hover:bg-amber-100"
                          >
                            운영 반영
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-amber-800">
                      사용자가 보고 있는 것은 운영 버전입니다. 검증에서 확인한 것이 그대로 나가고
                      있다고 생각하면 안 됩니다.
                    </p>
                  </div>
                )}

                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full min-w-[40rem] text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] text-slate-500">
                      <tr>
                        <th scope="col" className="px-3 py-2">대상</th>
                        <th scope="col" className="px-3 py-2">단계</th>
                        <th scope="col" className="px-3 py-2">버전</th>
                        <th scope="col" className="px-3 py-2">배포 시각</th>
                        <th scope="col" className="px-3 py-2">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deployments.data.map((d) => (
                        <tr key={d.id} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-bold text-slate-800">{d.target}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                                d.stage === 'production'
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {STAGE_LABEL[d.stage]}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{d.version}</td>
                          <td className="px-3 py-2 tabular-nums text-slate-600">{d.deployedAt}</td>
                          <td className="px-3 py-2 text-slate-600">
                            {d.note ?? <span className="text-slate-400">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          })()}
        </section>
      )}
    </main>
  )
}
