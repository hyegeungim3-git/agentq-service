import { useState } from 'react'
import {
  WO_LABEL,
  WO_NEXT_ACTION,
  nextStatus,
  openOrders,
  overdue,
  withoutDue,
  type WorkOrderStatus,
} from '@entities/field/model'
import { advanceWorkOrder, fetchWorkOrders } from '@shared/api/field'
import { fetchAsOf } from '@shared/api/users'
import { useRemote } from '@features/remote/useRemote'

/**
 * 작업지시 추적.
 *
 * 지시를 발행하고 끝나면 이 제품은 문서 생성기다. 발행 → 착수 → 완료 → 검증까지
 * 가야 "그래서 처리됐나"에 답할 수 있다.
 *
 * 두 가지를 먼저 말한다 — **기한이 지난 것**과 **기한이 아예 없는 것**.
 * 둘은 다른 문제다. 하나는 늦은 것이고, 하나는 아무도 언제 할지 모르는 것이다.
 *
 * ⚠️ **되돌리는 버튼을 두지 않는다.** 현장 기록은 정정이 아니라 추가로 남겨야
 * 추적이 된다 — 되돌릴 수 있으면 '언제 무엇이 있었나'가 사라진다.
 */

const TONE: Record<WorkOrderStatus, string> = {
  issued: 'bg-amber-100 text-amber-900',
  working: 'bg-sky-100 text-sky-900',
  done: 'bg-violet-100 text-violet-900',
  verified: 'bg-emerald-100 text-emerald-800',
}

export function WorkOrderPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const orders = useRemote(fetchWorkOrders, [])
  const asOf = useRemote(fetchAsOf, [])

  const advance = (id: string, to: WorkOrderStatus) => {
    void advanceWorkOrder(id, to).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">작업지시 추적</h1>
      <p className="mt-1 text-sm text-slate-600">
        발행한 지시가 실제로 조치되고 검증됐는지까지 봅니다.
      </p>

      {failure !== null && (
        <p role="alert" className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {orders.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">작업지시를 불러오는 중입니다</span>
        </div>
      )}

      {orders.kind === 'ready' && asOf.kind === 'ready' && (
        <>
          {(() => {
            const open = openOrders(orders.data)
            const late = overdue(orders.data, asOf.data)
            const noDue = withoutDue(orders.data)
            return (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { k: '전체 지시', v: `${orders.data.length}건`, tone: 'text-slate-900' },
                    { k: '안 닫힌 지시', v: `${open.length}건`, tone: open.length ? 'text-amber-800' : 'text-emerald-700' },
                    { k: '기한 지남', v: `${late.length}건`, tone: late.length ? 'text-rose-800' : 'text-emerald-700' },
                    { k: '기한 없음', v: `${noDue.length}건`, tone: noDue.length ? 'text-amber-800' : 'text-emerald-700' },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <dd className={`text-xl font-black ${s.tone}`}>{s.v}</dd>
                      <dt className="mt-0.5 text-[11px] text-slate-500">{s.k}</dt>
                    </div>
                  ))}
                </dl>

                {late.length > 0 && (
                  <p className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                    기한이 지났는데 안 끝난 지시 <b>{late.length}건</b> —{' '}
                    {late.map((o) => `${o.docNo}(${o.due})`).join(' · ')}
                  </p>
                )}
                {noDue.length > 0 && (
                  <p className="mt-2 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    기한이 없는 지시 <b>{noDue.length}건</b> — {noDue.map((o) => o.docNo).join(' · ')}.
                    늦은 것과는 다른 문제입니다. <b>언제까지 해야 하는지가 없으면 아무도 하지 않습니다.</b>
                  </p>
                )}
              </>
            )
          })()}

          <ul className="mt-4 space-y-2">
            {orders.data.map((o) => {
              const to = nextStatus(o.status)
              const action = WO_NEXT_ACTION[o.status]
              const late = o.due !== null && o.due < asOf.data && o.status !== 'verified'
              return (
                <li key={o.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{o.title}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                      {o.docNo}
                    </span>
                    <span className={`ml-auto rounded px-1.5 py-0.5 text-[11px] font-bold ${TONE[o.status]}`}>
                      {WO_LABEL[o.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {o.source} · {o.owner} · 기한{' '}
                    {o.due === null ? (
                      <b className="text-amber-800">없음</b>
                    ) : (
                      <span className={late ? 'font-bold text-rose-800' : ''}>
                        {o.due}
                        {late && ' (지남)'}
                      </span>
                    )}
                  </p>

                  {/* 언제 누가 바꿨는지가 있어야 추적이다 — 현재 상태만 있으면 현황판이다 */}
                  <ol className="mt-2 flex flex-wrap gap-1.5">
                    {o.history.map((h) => (
                      <li
                        key={h.status}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] text-slate-600"
                      >
                        {WO_LABEL[h.status]} · {h.at} · {h.by}
                      </li>
                    ))}
                  </ol>

                  {to !== null && action !== null && (
                    <button
                      type="button"
                      onClick={() => advance(o.id, to)}
                      className="mt-2 min-h-11 rounded-lg border border-slate-300 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {action}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>

          <p className="mt-3 max-w-3xl text-[11px] text-slate-500">
            되돌리는 버튼은 두지 않았습니다. <b>현장 기록은 정정이 아니라 추가로 남깁니다</b> —
            되돌릴 수 있으면 언제 무엇이 있었는지가 사라집니다.
          </p>
        </>
      )}
    </main>
  )
}
