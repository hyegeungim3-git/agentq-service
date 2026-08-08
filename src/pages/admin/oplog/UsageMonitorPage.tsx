import { bucketRatio, daysToLimit } from '@entities/oplog/model'
import { fetchUsageBuckets, fetchBillingMonth } from '@shared/api/oplog'
import { useRemote } from '@features/remote/useRemote'

/**
 * 사용량 모니터링.
 *
 * **'이번 달 80% 소비'만 보여 주면 남은 날짜를 머리로 계산해야 한다.**
 * 지금 속도로 언제 한도를 넘는지 화면이 계산해서 말한다 — 그게 이 화면의 값어치다.
 *
 * 금액은 넣지 않았다. 과금 단가가 정해지지 않아 계산할 수 없다(리포트 화면과 같은
 * 이유). 토큰 수만 세고 금액이 없다는 사실을 적는다.
 */

const fmt = (n: number): string => n.toLocaleString('ko-KR')

export function UsageMonitorPage() {
  const state = useRemote(fetchUsageBuckets, [])
  /* 청구 주기 진행도는 **서버가 주는 값**이다. fixture 상수를 화면이 직접 읽으면
     서버가 붙어도 옛 진행도로 '며칠 뒤 한도 초과'를 계산해 틀린 날짜를 말한다 */
  const month = useRemote(fetchBillingMonth, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">사용량 모니터링</h1>
      <p className="mt-1 text-sm text-slate-600">
        {month.kind === 'ready' ? `이번 달 ${month.data.elapsedDays}일이 지났습니다. ` : ''}
        업무별 토큰 소비량입니다.
      </p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">사용량을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        month.kind === 'ready' &&
        (() => {
          const over = state.data.filter((b) => {
            const r = bucketRatio(b)
            return r !== null && r > 1
          })
          const soon = state.data.filter((b) => {
            const d = daysToLimit(b, month.data.elapsedDays, month.data.totalDays)
            return d !== null && d > 0
          })
          const total = state.data.reduce((n, b) => n + b.used, 0)
          return (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">이번 달 소비</dt>
                  <dd className="text-xl font-black text-slate-900">{fmt(total)}</dd>
                  <dd className="text-[10px] text-slate-400">토큰</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    over.length > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">한도 초과</dt>
                  <dd className={`text-xl font-black ${over.length > 0 ? 'text-rose-800' : 'text-slate-900'}`}>
                    {over.length}개
                  </dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    soon.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">이달 안에 넘을 것</dt>
                  <dd className="text-xl font-black text-slate-900">{soon.length}개</dd>
                </div>
              </dl>

              <ul className="mt-4 space-y-3">
                {state.data.map((b) => {
                  const ratio = bucketRatio(b)
                  const days = daysToLimit(b, month.data.elapsedDays, month.data.totalDays)
                  const isOver = ratio !== null && ratio > 1
                  return (
                    <li
                      key={b.id}
                      className={`rounded-xl border p-4 ${
                        isOver ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="text-sm font-black text-slate-900">{b.label}</p>
                        <p className="text-xs tabular-nums text-slate-600">
                          {fmt(b.used)} /{' '}
                          {/* 무제한을 0으로 두면 다 쓴 것처럼 보인다 */}
                          {b.limit === null ? '무제한' : fmt(b.limit)}
                        </p>
                        <p
                          className={`ml-auto text-sm font-black tabular-nums ${
                            isOver ? 'text-rose-800' : 'text-slate-900'
                          }`}
                        >
                          {ratio === null ? '—' : `${Math.round(ratio * 100)}%`}
                        </p>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${isOver ? 'bg-rose-600' : 'bg-slate-700'}`}
                          style={{ width: `${Math.min(100, (ratio ?? 0) * 100).toFixed(1)}%` }}
                        />
                      </div>
                      {/* 남은 날짜를 머리로 계산하게 하지 않는다 */}
                      <p className="mt-2 text-xs">
                        {isOver ? (
                          <span className="font-bold text-rose-800">
                            한도를 {fmt(b.used - (b.limit as number))}토큰 넘겼습니다. 지금은 넘어도
                            요청이 막히지 않습니다 — 초과 시 처리 방식은 정해지지 않았습니다.
                          </span>
                        ) : days !== null ? (
                          <span className="font-bold text-amber-800">
                            지금 속도면 약 {days}일 뒤 한도에 닿습니다.
                          </span>
                        ) : b.limit === null ? (
                          <span className="text-slate-500">한도가 없어 넘을 수 없습니다.</span>
                        ) : (
                          <span className="text-slate-500">이번 달 안에는 한도에 닿지 않습니다.</span>
                        )}
                      </p>
                    </li>
                  )
                })}
              </ul>

              {/* 금액이 없는 이유를 적는다 — 안 적으면 무료로 읽힌다 */}
              <p className="mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                금액은 표시하지 않습니다. 과금 단가가 정해지지 않아 토큰 수를 금액으로 바꿀 수
                없습니다 — 임의 단가로 계산하면 그 숫자가 예산 근거로 쓰이게 됩니다.
              </p>
            </>
          )
        })()}
    </main>
  )
}
