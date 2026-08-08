import { useState } from 'react'
import { isActiveRule, type BlockRule } from '@entities/user/model'
import { createBlockRule, fetchBlockRules, fetchAsOf } from '@shared/api/users'
import { useRemote } from '@features/remote/useRemote'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'

/**
 * 접근권한·차단.
 *
 * **만료된 규칙을 '차단 중'으로 그리지 않는다.** 막고 있다고 믿게 되는데
 * 실제로는 이미 뚫려 있다. 만료된 것을 따로 모아 언제 풀렸는지 말한다.
 *
 * 규칙 추가는 성공한 척하지 않는다. 서버가 없으면 실제로 막히는 것이 없다.
 */

function Row({ rule, active }: { rule: BlockRule; active: boolean }) {
  return (
    <tr className="border-t border-slate-100">
      <td className="px-3 py-2">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
          {rule.kind === 'ip' ? 'IP' : '계정'}
        </span>
      </td>
      {/* 행 머리글은 **그 행을 가리키는 값**이어야 한다. 첫 칸은 종류 배지(IP/계정)라
          머리글로 삼으면 '차단 중'을 들을 때 'IP'만 따라온다 — 어느 주소인지가 빠진다 */}
      <th
        scope="row"
        className="px-3 py-2 text-left font-mono text-[11px] font-bold text-slate-800"
      >
        {rule.value}
      </th>
      <td className="px-3 py-2 text-slate-600">{rule.reason}</td>
      <td className="px-3 py-2 tabular-nums text-slate-600">
        {rule.until === null ? '무기한' : rule.until}
      </td>
      <td className="px-3 py-2">
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
            active ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {active ? '차단 중' : '만료됨'}
        </span>
      </td>
      <td className="px-3 py-2 text-slate-500">{rule.createdBy}</td>
    </tr>
  )
}

export function BlockRulePage() {
  const [failure, setFailure] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const state = useRemote(fetchBlockRules, [])
  /* 기준 날짜는 **데이터를 준 쪽**이 말한다. fixture 상수를 화면이 직접 읽으면
     서버가 붙어도 옛 날짜로 계산해 조용히 틀린 일수를 보여 준다(AGENTS.md §9) */
  const asOf = useRemote(fetchAsOf, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    void createBlockRule({
      kind: 'ip',
      value,
      reason: '관리자 직접 추가',
      until: null,
      createdBy: '운영 담당자',
    }).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">접근권한·차단</h1>
      <p className="mt-1 text-sm text-slate-600">IP·계정 차단 규칙입니다.</p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">차단 규칙을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        asOf.kind === 'ready' &&
        (() => {
          const active = state.data.filter((r) => isActiveRule(r, asOf.data))
          const expired = state.data.filter((r) => !isActiveRule(r, asOf.data))
          return (
            <>
              <p className="mt-4 text-xs text-slate-600">
                차단 중 {active.length}건
                {/* 만료된 것을 '차단 중'에 섞으면 막고 있다고 믿게 된다 */}
                {expired.length > 0 && (
                  <span className="ml-1 font-bold text-amber-800">
                    · 만료돼 더 이상 막지 않는 규칙 {expired.length}건
                  </span>
                )}
              </p>

              <AdminTable label="차단 규칙" minW="min-w-[46rem]">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">종류</th>
                      <th scope="col" className="px-3 py-2">대상</th>
                      <th scope="col" className="px-3 py-2">사유</th>
                      <th scope="col" className="px-3 py-2">만료</th>
                      <th scope="col" className="px-3 py-2">상태</th>
                      <th scope="col" className="px-3 py-2">등록</th>
                    </tr>
                  </thead>
                  <tbody>
            {active.length === 0 && (
              <EmptyRow cols={6}>등록된 차단 규칙이 없습니다.</EmptyRow>
            )}
                    {active.map((r) => (
                      <Row key={r.id} rule={r} active />
                    ))}
                    {expired.map((r) => (
                      <Row key={r.id} rule={r} active={false} />
                    ))}
                  </tbody>
                </AdminTable>

              {expired.length > 0 && (
                <div className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-900">
                    만료된 규칙 {expired.length}건은 지금 아무 것도 막지 않습니다
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {expired.map((r) => (
                      <li key={r.id} className="text-[11px] text-amber-900">
                        {r.value} · {r.until}에 풀렸습니다 — {r.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )
        })()}

      <form onSubmit={submit} className="mt-5 max-w-xl rounded-xl border border-slate-200 bg-white p-4">
        <label htmlFor="rule-value" className="block text-[11px] font-bold text-slate-500">
          차단할 IP 또는 대역
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            id="rule-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="예: 203.0.113.0/24"
            className="min-h-11 min-w-48 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
          />
          <button
            type="submit"
            disabled={value.trim() === ''}
            className="min-h-11 rounded-lg bg-brand px-4 text-sm font-bold text-brand-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            규칙 추가
          </button>
        </div>
      </form>
    </main>
  )
}
