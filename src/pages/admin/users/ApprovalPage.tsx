import { useState } from 'react'
import { APPROVAL_LABEL, waitingDays, type ApprovalRequest } from '@entities/user/model'
import { decideApproval, fetchApprovals, fetchAsOf } from '@shared/api/users'
import { useRemote } from '@features/remote/useRemote'
import { AdminButton } from '@widgets/admin-shell/AdminControls'

/**
 * 승인 관리.
 *
 * **오래 기다린 신청을 위로 올린다.** 접수순으로만 두면 8일째 방치된 신청이
 * 목록 어딘가에 묻힌다 — 신청자는 그동안 아무것도 못 한다.
 *
 * 사유를 안 적은 신청은 '사유 없음'이라고 말한다. 빈칸으로 두면 적었는데
 * 화면이 못 그린 것인지 구분할 수 없다.
 */

const LONG_WAIT_DAYS = 3

function Card({
  req,
  days,
  onDecide,
}: {
  req: ApprovalRequest
  days: number
  onDecide: (id: string, accept: boolean) => void
}) {
  const late = days >= LONG_WAIT_DAYS
  return (
    <li className={`rounded-xl border p-4 ${late ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
          {APPROVAL_LABEL[req.kind]}
        </span>
        <p className="text-sm font-black text-slate-900">
          {req.applicant} · {req.dept}
        </p>
        {/* 색만으로 알리지 않는다 */}
        <span className={`ml-auto text-[11px] font-bold ${late ? 'text-amber-900' : 'text-slate-500'}`}>
          {days}일 대기{late ? ' · 오래 기다림' : ''}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700">{req.detail}</p>
      <p className="mt-1 text-xs text-slate-500">
        신청 사유 · {req.reason ?? <span className="text-slate-400">적지 않음</span>}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <AdminButton tone="primary" size="sm" onClick={() => onDecide(req.id, true)}>
          승인
        </AdminButton>
        <AdminButton size="sm" onClick={() => onDecide(req.id, false)}>
          반려
        </AdminButton>
      </div>
    </li>
  )
}

export function ApprovalPage() {
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchApprovals, [])
  /* 기준 날짜는 **데이터를 준 쪽**이 말한다. fixture 상수를 화면이 직접 읽으면
     서버가 붙어도 옛 날짜로 계산해 조용히 틀린 일수를 보여 준다(AGENTS.md §9) */
  const asOf = useRemote(fetchAsOf, [])

  const decide = (id: string, accept: boolean) => {
    void decideApproval(id, accept).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">승인 관리</h1>
      <p className="mt-1 text-sm text-slate-600">
        가입·권한·한도 신청입니다. 오래 기다린 순으로 보여 줍니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">신청 목록을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' && state.data.length === 0 && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          처리할 신청이 없습니다.
        </p>
      )}

      {state.kind === 'ready' &&
        asOf.kind === 'ready' &&
        state.data.length > 0 &&
        (() => {
          const withDays = state.data
            .map((r) => ({ req: r, days: waitingDays(r, asOf.data) }))
            .sort((a, b) => b.days - a.days)
          const late = withDays.filter((x) => x.days >= LONG_WAIT_DAYS)
          return (
            <>
              <p className="mt-4 text-xs text-slate-600">
                대기 {withDays.length}건
                {late.length > 0 && (
                  <span className="ml-1 font-bold text-amber-800">
                    · {LONG_WAIT_DAYS}일 이상 기다린 신청 {late.length}건
                  </span>
                )}
              </p>
              <ul className="mt-2 grid gap-3 lg:grid-cols-2">
                {withDays.map((x) => (
                  <Card key={x.req.id} req={x.req} days={x.days} onDecide={decide} />
                ))}
              </ul>
            </>
          )
        })()}
    </main>
  )
}
