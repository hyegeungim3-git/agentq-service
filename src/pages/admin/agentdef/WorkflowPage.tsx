import { useState } from 'react'
import {
  NODE_KIND_LABEL,
  actsWithoutReview,
  branchNodes,
  reviewNodes,
  successRatio,
  untakenBranches,
  type NodeKind,
} from '@entities/workflow/model'
import { fetchWorkflows, setWorkflowEnabled } from '@shared/api/workflow'
import { useRemote } from '@features/remote/useRemote'

/**
 * 워크플로우.
 *
 * 시나리오 빌더와 다르다 — 시나리오는 **선형 릴레이**(1→2→3→4)이고, 여기는
 * **분기가 있는 그래프**다. 조건에 따라 다른 길로 간다.
 *
 * ⚠️ 분기가 있으면 **어느 길로 갔는지 모른 채 결과만 보게 된다.** 그래서
 * 분기별로 몇 번 탔는지 보여 주고, **한 번도 안 탄 분기**를 드러낸다 —
 * 죽은 길이거나 조건이 틀린 것이다.
 *
 * 성공률만 보면 어디서 실패했는지 모른다. 실패가 몰린 노드를 이름으로 적는다.
 */

const NODE_TONE: Record<NodeKind, string> = {
  trigger: 'bg-slate-100 text-slate-700',
  agent: 'bg-sky-50 text-sky-900',
  branch: 'bg-amber-100 text-amber-900',
  tool: 'bg-slate-100 text-slate-600',
  review: 'bg-brand text-brand-fg',
  action: 'bg-rose-100 text-rose-800',
}

const pct = (r: number): string => `${Math.round(r * 100)}%`

export function WorkflowPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchWorkflows, [])

  const toggle = (id: string, enabled: boolean) => {
    void setWorkflowEnabled(id, enabled).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">워크플로우</h1>
      <p className="mt-1 text-sm text-slate-600">
        조건에 따라 길이 갈리는 흐름입니다. 갈림 없이 순서대로 도는 것은{' '}
        <b>시나리오 빌더</b>에서 봅니다 — 갈림이 있으면 결과만 보고는 어느 길로 갔는지 알 수
        없어서 따로 둡니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">워크플로우를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const risky = actsWithoutReview(state.data.filter((w) => w.enabled))
          return (
            <>
              {/* 답을 내놓는 데서 끝나지 않고 무언가를 실제로 한다 */}
              {risky.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    사람 검토 없이 실행까지 가는 워크플로우 {risky.length}건
                  </p>
                  <ul className="mt-2 space-y-1">
                    {risky.map((w) => (
                      <li key={w.id} className="text-xs text-rose-800">
                        <b>{w.name}</b> — 마지막에 실행 노드가 있는데 중간에 사람이 확인하는
                        지점이 없습니다.
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ul aria-label="워크플로우" className="mt-4 space-y-4">
                {state.data.map((w) => {
                  const untaken = untakenBranches(w)
                  const ratio = successRatio(w)
                  return (
                    <li
                      key={w.id}
                      className={`rounded-xl border p-4 ${
                        w.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-slate-900">{w.name}</p>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                            w.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {w.enabled ? '켜짐' : '꺼짐'}
                        </span>
                        <span className="ml-auto text-[11px] text-slate-500">{w.owner}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{w.purpose}</p>

                      <p className="mt-2 text-xs text-slate-700">
                        24시간 {w.runs24h}회
                        {/* 실행이 없으면 성공률 100%가 아니라 잰 적이 없는 것이다 */}
                        {ratio === null ? (
                          <span className="ml-1 text-slate-400">· 실행 없음</span>
                        ) : (
                          <span className="ml-1">· 성공 {pct(ratio)}</span>
                        )}
                        <span className="ml-1 text-slate-500">· 노드 {w.nodes.length}개</span>
                      </p>

                      {/* 성공률만 보면 어디서 실패했는지 모른다 */}
                      {w.failedAt.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {w.failedAt.map((f) => {
                            const node = w.nodes.find((n) => n.id === f.nodeId)
                            return (
                              <li
                                key={f.nodeId}
                                className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-800"
                              >
                                <b>{node?.label ?? f.nodeId}</b>에서 {f.count}회 멈췄습니다 — {f.reason}
                              </li>
                            )
                          })}
                        </ul>
                      )}

                      <ol className="mt-3 flex flex-wrap items-center gap-1.5">
                        {w.nodes.map((n, i) => (
                          <li key={n.id} className="flex items-center gap-1.5">
                            <span
                              className={`rounded px-2 py-1 text-[11px] font-bold ${NODE_TONE[n.kind]}`}
                            >
                              {n.label}
                              <span className="ml-1 font-normal opacity-70">
                                {NODE_KIND_LABEL[n.kind]}
                              </span>
                            </span>
                            {i < w.nodes.length - 1 && (
                              <span aria-hidden="true" className="text-slate-300">
                                →
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>

                      {/* 어느 길로 갔는지 모르면 같은 입력에 다른 결과가 나와도 이유를 모른다 */}
                      {branchNodes(w).length > 0 && (
                        <div className="mt-3 rounded-lg bg-slate-50 p-3">
                          <p className="text-[11px] font-bold text-slate-600">탄 길</p>
                          <ul className="mt-1 flex flex-wrap gap-2">
                            {branchNodes(w).flatMap((n) =>
                              n.branches.map((br) => {
                                const hit = w.taken.find((t) => t.nodeId === n.id && t.branch === br)
                                const count = hit?.count ?? 0
                                return (
                                  <li
                                    key={`${n.id}-${br}`}
                                    className={`text-[11px] ${
                                      count === 0 ? 'font-bold text-amber-800' : 'text-slate-700'
                                    }`}
                                  >
                                    {br} {count}회
                                  </li>
                                )
                              }),
                            )}
                          </ul>
                        </div>
                      )}

                      {untaken.length > 0 && w.runs24h > 0 && (
                        <p className="mt-2 text-xs font-bold text-amber-800">
                          한 번도 안 탄 길 {untaken.length}개 (
                          {untaken.map((u) => u.branch).join(', ')}) — 죽은 길이거나 조건이 틀렸을
                          수 있습니다.
                        </p>
                      )}

                      {reviewNodes(w).length === 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          사람이 확인하는 지점이 없습니다. 조회만 하는 흐름이면 괜찮지만 결과가
                          문서나 지시로 이어지면 확인 지점이 있어야 합니다.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => toggle(w.id, !w.enabled)}
                        className="mt-3 min-h-11 rounded-lg border border-slate-300 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                      >
                        {w.enabled ? '끄기' : '켜기'}
                      </button>
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
