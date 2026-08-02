import { HEALTH_LABEL, type HealthLevel } from '@entities/infra/model'
import { fetchServices } from '@shared/api/infra'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'

/**
 * 서비스 현황.
 *
 * 이전 데모는 `Warning` 배지만 띄웠다. 무엇이 잘못됐고 무엇을 해야 하는지 없으면
 * 관리자는 손쓸 수 없다 — 상태를 아는 것과 조치할 수 있는 것은 다르다.
 * 그래서 정상이 아닌 서비스에는 **사유와 조치**를 함께 붙였다.
 *
 * 정상이 아닌 것을 위로 올린다. 목록 순서를 고정하면 6개 중 1개를 찾아 훑어야 한다.
 */

const TONE: Record<HealthLevel, string> = {
  ok: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-900',
  down: 'bg-rose-100 text-rose-800',
}

const uptime = (hours: number): string =>
  hours >= 24 ? `${Math.floor(hours / 24)}일 ${hours % 24}시간` : `${hours}시간`

export function ServiceStatusPage() {
  const state = useRemote(fetchServices, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">서비스 현황</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">구성 요소별 가동 상태입니다.</p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-5 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
          ))}
          <span className="sr-only">서비스 상태를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'error' && (
        <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {state.message}
        </p>
      )}

      {state.kind === 'ready' && (
        <>
          {(() => {
            const bad = state.data.filter((s) => s.level !== 'ok')
            const good = state.data.filter((s) => s.level === 'ok')
            return (
              <>
                <dl className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <dt className="text-[11px] font-bold text-slate-500">전체</dt>
                    <dd className="text-xl font-black text-slate-900">{state.data.length}</dd>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <dt className="text-[11px] font-bold text-slate-500">정상</dt>
                    <dd className="text-xl font-black text-slate-900">{good.length}</dd>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                    <dt className="text-[11px] font-bold text-amber-900">조치 필요</dt>
                    <dd className="text-xl font-black text-amber-900">{bad.length}</dd>
                  </div>
                </dl>

                {/* 정상이 아닌 것을 위로 — 6개 중 1개를 훑어 찾게 하지 않는다 */}
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[...bad, ...good].map((s) => (
                    <li
                      key={s.id}
                      className={`rounded-xl border p-4 ${
                        s.level === 'ok' ? 'border-slate-200 bg-white' : 'border-amber-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-slate-900">{s.name}</p>
                        <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TONE[s.level]}`}>
                          {HEALTH_LABEL[s.level]}
                        </span>
                        <span className="ml-auto text-[11px] text-slate-500">
                          연속 가동 {uptime(s.uptimeHours)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{s.role}</p>

                      {/* 상태만 알려 주면 손쓸 수 없다 */}
                      {s.reason && (
                        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">{s.reason}</p>
                      )}
                      {s.action && (
                        <p className="mt-1 text-xs font-bold text-slate-700">조치 · {s.action}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )
          })()}
        </>
      )}
    </main>
  )
}
