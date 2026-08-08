import { fetchAppSurfaces, fetchDomainExposure } from '@shared/api/agentops'
import { useRemote } from '@features/remote/useRemote'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'

/**
 * 애플리케이션.
 *
 * 사용자에게 열어 준 것과 아직 못 연 것을 함께 본다. **못 여는 것을 목록에서
 * 빼지 않는다** — 빼면 계획에 없는 것으로 읽힌다. 왜 못 여는지 적으면 무엇이
 * 갖춰지면 되는지가 그 자리에 남는다.
 *
 * 발주처별 노출은 **사용자 포털이 말하는 것과 같은 사실**이다. 포털에서
 * '업무 데이터 준비 중'으로 못 고르는 곳이 여기서도 0종으로 나온다.
 * 관리자에서만 열려 있는 것처럼 보이면 안 된다.
 */

export function AppSurfacePage() {
  const apps = useRemote(fetchAppSurfaces, [])
  const domains = useRemote(fetchDomainExposure, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">애플리케이션</h1>
      <p className="mt-1 text-sm text-slate-600">사용자에게 열어 준 화면 묶음입니다.</p>

      {apps.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">애플리케이션 목록을 불러오는 중입니다</span>
        </div>
      )}

      {apps.kind === 'ready' && (
        <section aria-labelledby="apps" className="mt-4">
          <h2 id="apps" className="sr-only">
            애플리케이션 목록
          </h2>
          <ul className="grid gap-3 lg:grid-cols-2">
            {apps.data.map((a) => (
              <li
                key={a.id}
                className={`rounded-xl border p-4 ${
                  a.live ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-slate-900">{a.name}</p>
                  {/* 색만으로 알리지 않는다 */}
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                      a.live ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {a.live ? '열림' : '못 엶'}
                  </span>
                  <span className="ml-auto text-[11px] text-slate-500">{a.audience}</span>
                </div>

                {/* 왜 못 여는지 적으면 무엇이 갖춰지면 되는지가 남는다 */}
                {a.blockedReason && (
                  <p className="mt-2 rounded-lg bg-white p-2 text-xs text-amber-900">
                    {a.blockedReason}
                  </p>
                )}

                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {a.includes.map((x) => (
                    <li
                      key={x}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700"
                    >
                      {x}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {domains.kind === 'ready' && (
        <section aria-labelledby="domains" className="mt-6">
          <h2 id="domains" className="text-sm font-black text-slate-900">
            발주처별 노출
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            사용자 포털에서 고를 수 있는 곳과 같은 기준입니다 — 여기서만 열려 있는 것처럼 보이면
            안 됩니다.
          </p>
          <AdminTable label="발주처별 노출 현황" minW="min-w-[36rem]">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">발주처</th>
                  <th scope="col" className="px-3 py-2">업무 데이터</th>
                  <th scope="col" className="px-3 py-2">열린 에이전트</th>
                  <th scope="col" className="px-3 py-2">비고</th>
                </tr>
              </thead>
              <tbody>
            {domains.data.length === 0 && (
              <EmptyRow cols={4}>표시할 발주처별 노출 현황이(가) 없습니다.</EmptyRow>
            )}
                {domains.data.map((d) => (
                  <tr key={d.domainId} className="border-t border-slate-100">
                    <th scope="row" className="px-3 py-2 font-bold text-slate-800 text-left">{d.orgName}</th>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          d.dataReady ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {d.dataReady ? '준비됨' : '준비 중'}
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-600">{d.openAgents}종</td>
                    <td className="px-3 py-2 text-slate-600">{d.note}</td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
        </section>
      )}
    </main>
  )
}
