import { useState } from 'react'
import { AGENTS } from '@entities/agent/model'
import { byFailure, failureRatio, unused } from '@entities/agentops/model'
import { hasGap, missing } from '@entities/knowledgebase/model'
import { fetchAgentOps, setAgentExposure } from '@shared/api/agentops'
import { fetchAreas } from '@shared/api/knowledgebase'
import { fetchDomains } from '@shared/api/domains'
import { DomainSelect } from '@widgets/admin-shell/DomainSelect'
import { useRemote } from '@features/remote/useRemote'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'
import { AdminButton } from '@widgets/admin-shell/AdminControls'

/**
 * 에이전트 운영.
 *
 * **목록은 사용자 포털과 같은 카탈로그**(`entities/agent/model.ts`)를 쓴다.
 * 관리자가 목록을 따로 가지면 '관리자에는 있는데 포털에는 없는 에이전트'가 생긴다.
 *
 * 실행 건수만 보여 주면 잘 도는 것처럼 보인다. 두 가지를 더 본다.
 *  ① 실패율 — 높은 순으로 올린다
 *  ② **그 에이전트가 기대는 지식영역에 못 찾는 문서가 있는지** — 답이 부실한 원인은
 *    대개 에이전트가 아니라 그 아래 데이터에 있다. 고칠 곳을 잘못 짚지 않게 잇는다.
 *
 * 한 번도 안 쓴 에이전트도 드러낸다. 0건은 '문제 없음'이 아니라
 * 아무도 안 쓰는 화면을 계속 운영하고 있다는 뜻이다.
 */

const pct = (r: number): string => `${(r * 100).toFixed(1)}%`

export function AgentOpsPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const domains = useRemote(fetchDomains, [])
  const ready = domains.kind === 'ready' ? domains.data.filter((d) => d.status === 'ready') : []
  const [picked, setPicked] = useState<string | null>(null)
  const domainId = picked ?? ready[0]?.id ?? null
  const ops = useRemote(() => fetchAgentOps(domainId), [domainId])
  const areas = useRemote(() => fetchAreas(domainId), [domainId])

  const toggle = (id: string, next: boolean) => {
    void setAgentExposure(id, next).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">에이전트</h1>
      <p className="mt-1 text-sm text-slate-600">
        사용자 포털에 열려 있는 에이전트 {AGENTS.length}종입니다 — 포털이 그리는 목록과 같은
        카탈로그입니다.
      </p>

      <DomainSelect
        domains={ready}
        value={domainId}
        onChange={setPicked}
        note="운영 실적도 기대는 지식 영역도 발주처마다 다릅니다."
      />

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {ops.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">에이전트 운영 정보를 불러오는 중입니다</span>
        </div>
      )}

      {ops.kind === 'ready' &&
        (() => {
          const idle = unused(ops.data)
          const runs = ops.data.reduce((n, o) => n + o.runs7d, 0)
          const fails = ops.data.reduce((n, o) => n + o.failed7d, 0)
          const areaById = areas.kind === 'ready' ? areas.data : []
          /* 이 에이전트가 기대는 영역에 못 찾는 문서가 있는가 */
          const gapAreas = (ids: string[]) =>
            areaById.filter((a) => ids.includes(a.id) && hasGap(a))
          const affected = ops.data.filter((o) => gapAreas(o.areaIds).length > 0)

          return (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">에이전트</dt>
                  <dd className="text-xl font-black text-slate-900">{AGENTS.length}종</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">7일 실행</dt>
                  <dd className="text-xl font-black text-slate-900">{runs.toLocaleString('ko-KR')}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">실패</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {fails}건 ({pct(fails / runs)})
                  </dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    idle.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">7일간 미사용</dt>
                  <dd className="text-xl font-black text-slate-900">{idle.length}종</dd>
                </div>
              </dl>

              {/* 고칠 곳을 잘못 짚지 않게 잇는다 */}
              {affected.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-black text-amber-900">
                    근거 문서에 빈틈이 있는 에이전트 {affected.length}종
                  </p>
                  <ul className="mt-2 space-y-1">
                    {affected.map((o) => {
                      const def = AGENTS.find((a) => a.id === o.agentId)
                      const gaps = gapAreas(o.areaIds)
                      return (
                        <li key={o.agentId} className="text-xs text-amber-900">
                          <b>{def?.name ?? o.agentId}</b> — {gaps.map((g) => g.name).join(', ')}에
                          검색에 안 잡히는 문서{' '}
                          {gaps.reduce((n, g) => n + missing(g), 0)}건이 있습니다.
                        </li>
                      )
                    })}
                  </ul>
                  <p className="mt-2 text-xs font-bold text-amber-900">
                    답이 부실하면 에이전트보다 먼저 지식 관리를 보십시오. 고칠 곳이 거기일 때가
                    많습니다.
                  </p>
                </div>
              )}

              <AdminTable label="에이전트 운영 현황" minW="min-w-[52rem]" wrap="mt-4">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">에이전트</th>
                      <th scope="col" className="px-3 py-2">모델</th>
                      <th scope="col" className="px-3 py-2">근거 문서</th>
                      <th scope="col" className="px-3 py-2">7일 실행</th>
                      <th scope="col" className="px-3 py-2">실패율</th>
                      <th scope="col" className="px-3 py-2">담당</th>
                      <th scope="col" className="px-3 py-2">노출</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ops.data.length === 0 && (
                      <EmptyRow cols={6}>운영 중인 에이전트가 없습니다.</EmptyRow>
                    )}
                    {/* 실패율이 높은 순 — 이름순으로 두면 문제를 찾아 훑어야 한다 */}
                    {byFailure(ops.data).map((o) => {
                      const def = AGENTS.find((a) => a.id === o.agentId)
                      const ratio = failureRatio(o)
                      const gaps = gapAreas(o.areaIds)
                      return (
                        <tr key={o.agentId} className="border-t border-slate-100">
                          <th scope="row" className="px-3 py-2 font-bold text-slate-800 text-left">
                            {def?.name ?? o.agentId}
                          </th>
                          <td className="px-3 py-2 text-slate-600">{o.modelName}</td>
                          <td className="px-3 py-2 text-slate-600">
                            {o.areaIds.length === 0 ? (
                              <span className="text-slate-400">문서를 안 씀</span>
                            ) : (
                              <>
                                {o.areaIds.length}개 영역
                                {gaps.length > 0 && (
                                  <span className="ml-1 font-bold text-amber-800">· 빈틈 있음</span>
                                )}
                              </>
                            )}
                          </td>
                          <td className="px-3 py-2 tabular-nums text-slate-600">{o.runs7d}</td>
                          {/* 0건을 0%로 두면 '문제 없음'으로 읽힌다 */}
                          <td className="px-3 py-2 tabular-nums">
                            {ratio === null ? (
                              <span className="text-slate-400">실행 없음</span>
                            ) : (
                              <span className={ratio > 0.1 ? 'font-bold text-rose-700' : 'text-slate-700'}>
                                {pct(ratio)}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-slate-600">{o.owner}</td>
                          <td className="px-3 py-2">
                            <AdminButton size="sm" onClick={() => toggle(o.agentId, !o.exposed)}>
                              {o.exposed ? '내리기' : '올리기'}
                            </AdminButton>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </AdminTable>

              <p className="mt-4 max-w-3xl text-xs text-slate-500">
                에이전트가 무엇을 하도록 정해 놓았는지(단계·능력·사람 확인 지점)는{' '}
                <b>태스크플로우 빌더</b>에서 봅니다. 여기서는 운영 상태만 봅니다 — 같은
                카탈로그를 두 각도로 나눠 본 것입니다.
              </p>
            </>
          )
        })()}
    </main>
  )
}
