import { brokenIntegrations } from '@entities/sysops/model'
import { fetchIntegrations } from '@shared/api/sysops'
import { useRemote } from '@features/remote/useRemote'

/**
 * 연계 SW 모니터링 — 외부 시스템 연동 상태.
 *
 * 대시보드의 '서비스 현황'과 다르다. 저기는 **우리가 돌리는 것**, 여기는
 * **남이 돌리는데 우리가 기대는 것**이다. 끊겨도 우리 서비스는 살아 있어서
 * 더 늦게 발견된다.
 *
 * 그래서 '연결됨/끊김'만 쓰지 않고 **끊기면 무엇이 멈추는지**를 함께 적는다.
 * 이름만 보고는 그 연동이 무엇을 떠받치는지 알 수 없다.
 */

export function IntegrationPage() {
  const state = useRemote(fetchIntegrations, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">연계 SW 모니터링</h1>
      <p className="mt-1 text-sm text-slate-600">
        바깥 시스템과의 연동 상태입니다. 끊겨도 이 서비스 자체는 계속 돕니다 — 그래서 더 늦게
        발견됩니다.
      </p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">연동 상태를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const broken = brokenIntegrations(state.data)
          const ok = state.data.filter((i) => i.connected)
          return (
            <>
              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">연동</dt>
                  <dd className="text-xl font-black text-slate-900">{state.data.length}개</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">정상</dt>
                  <dd className="text-xl font-black text-slate-900">{ok.length}개</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    broken.length > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">끊김</dt>
                  <dd className={`text-xl font-black ${broken.length > 0 ? 'text-rose-800' : 'text-slate-900'}`}>
                    {broken.length}개
                  </dd>
                </div>
              </dl>

              {/* 끊긴 것을 위로 — 정상 사이에 섞이면 그냥 넘어간다 */}
              <ul className="mt-4 grid gap-3 lg:grid-cols-2">
                {[...broken, ...ok].map((i) => (
                  <li
                    key={i.id}
                    className={`rounded-xl border p-4 ${
                      i.connected ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-slate-900">{i.name}</p>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {i.kind}
                      </span>
                      {/* 색만으로 알리지 않는다 */}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          i.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {i.connected ? '연결됨' : '끊김'}
                      </span>
                      <span className="ml-auto text-[11px] text-slate-500">
                        마지막 정상 {i.lastOkAt}
                      </span>
                    </div>

                    {i.downReason && (
                      <p className="mt-2 text-xs font-bold text-rose-800">{i.downReason}</p>
                    )}
                    {/* 이름만 보고는 그 연동이 무엇을 떠받치는지 알 수 없다 */}
                    <p className="mt-1 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-700">
                      {i.connected ? '끊기면 · ' : '지금 · '}
                      {i.impactIfDown}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )
        })()}
    </main>
  )
}
