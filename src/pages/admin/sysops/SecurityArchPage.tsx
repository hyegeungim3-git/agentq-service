import {
  ALLOWANCE_LABEL,
  GRADE_LABEL,
  crossing,
  expired,
  live,
  policyViolations,
  withoutMfa,
  type Allowance,
} from '@entities/secarch/model'
import { fetchBoundaryRules, fetchDataFlows, fetchExternalAccess } from '@shared/api/secarch'
import { fetchAsOf } from '@shared/api/users'
import { useRemote } from '@features/remote/useRemote'

/**
 * 보안 아키텍처.
 *
 * 보안 검토가 가장 먼저 요구하는 그림이다. 세 가지만 본다 —
 * 경계를 넘는 흐름, 등급별로 어디까지 허용하기로 했는가, 지금 들어와 있는 외부 접근.
 *
 * ⚠️ **정책 표가 '막고 있다'는 증거가 아니다.** 표에 '차단'이라 적혀 있다는 이유로
 * 막히고 있다고 믿게 되면, 이 화면은 없느니만 못하다. 그래서 정책과 실제 흐름을
 * **대조해서 어긋난 것을 찾아 준다** — 사람이 두 표를 손으로 맞춰 보지 않는다.
 */

const TONE: Record<Allowance, string> = {
  allow: 'bg-emerald-100 text-emerald-800',
  conditional: 'bg-amber-100 text-amber-900',
  block: 'bg-rose-100 text-rose-800',
}

export function SecurityArchPage() {
  const flows = useRemote(fetchDataFlows, [])
  const rules = useRemote(fetchBoundaryRules, [])
  const access = useRemote(fetchExternalAccess, [])
  const asOf = useRemote(fetchAsOf, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">보안 아키텍처</h1>
      <p className="mt-1 text-sm text-slate-600">
        데이터가 망 경계를 넘는 지점과, 그 경계에서 무엇을 막기로 했는지를 봅니다.
      </p>

      {flows.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">데이터 흐름을 불러오는 중입니다</span>
        </div>
      )}

      {flows.kind === 'ready' && rules.kind === 'ready' && (
        <>
          {(() => {
            const cross = crossing(flows.data)
            const bad = policyViolations(flows.data, rules.data)
            return (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { k: '전체 흐름', v: `${flows.data.length}개`, tone: 'text-slate-900' },
                    { k: '경계를 넘는 흐름', v: `${cross.length}개`, tone: 'text-amber-800' },
                    { k: '정책과 어긋남', v: `${bad.length}개`, tone: bad.length ? 'text-rose-800' : 'text-emerald-700' },
                    { k: '내부에서만 처리', v: `${flows.data.length - cross.length}개`, tone: 'text-emerald-700' },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <dd className={`text-xl font-black ${s.tone}`}>{s.v}</dd>
                      <dt className="mt-0.5 text-[11px] text-slate-500">{s.k}</dt>
                    </div>
                  ))}
                </dl>

                {/* 두 표를 사람이 대조하지 않는다 — 화면이 어긋난 것을 찾아 준다 */}
                {bad.length > 0 && (
                  <div className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3">
                    <p className="text-xs font-bold text-rose-900">
                      막기로 한 등급이 실제로 경계를 넘고 있습니다 {bad.length}건
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {bad.map((f) => (
                        <li key={f.id} className="text-[11px] text-rose-900">
                          {f.name} — {GRADE_LABEL[f.grade]} 등급이 {f.processedAt}에서 처리됩니다 ({f.protection})
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 text-[11px] text-rose-800">
                      정책 표와 실제 흐름 중 하나는 사실이 아닙니다. 둘을 맞추기 전까지 이 흐름은
                      '승인된 예외'가 아니라 <b>설명되지 않은 통과</b>입니다.
                    </p>
                  </div>
                )}
              </>
            )
          })()}

          <h2 className="mt-5 text-sm font-black text-slate-900">데이터 흐름</h2>
          <div
            className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white"
            role="region"
            aria-label="표 — 가로로 스크롤됩니다"
            tabIndex={0}
          >
            <table className="w-full min-w-[52rem] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">흐름</th>
                  <th scope="col" className="px-3 py-2">경로</th>
                  <th scope="col" className="px-3 py-2">등급</th>
                  <th scope="col" className="px-3 py-2">경계</th>
                  <th scope="col" className="px-3 py-2">양</th>
                  <th scope="col" className="px-3 py-2">보호</th>
                </tr>
              </thead>
              <tbody>
                {flows.data.map((f) => (
                  <tr key={f.id} className="border-t border-slate-100">
                    <th scope="row" className="px-3 py-2 text-left font-bold text-slate-900">
                      {f.name}
                    </th>
                    <td className="px-3 py-2 text-slate-600">
                      {f.from} → {f.processedAt} → {f.to}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{GRADE_LABEL[f.grade]}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          f.crossesBoundary ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {f.crossesBoundary ? '경계 넘음' : '내부에서만'}
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-600">{f.volume}</td>
                    <td className="px-3 py-2 text-slate-500">{f.protection}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-5 text-sm font-black text-slate-900">등급별 경계 정책</h2>
          <p className="mt-1 max-w-3xl text-xs text-slate-600">
            <b>이 표는 정책이지 실제 통제가 아닙니다.</b> '차단'이라고 적혀 있다는 것은 그렇게
            막기로 정했다는 뜻이며, 지금 실제로 막고 있는지는 게이트웨이가 답해야 합니다.
          </p>
          <div
            className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white"
            role="region"
            aria-label="표 — 가로로 스크롤됩니다"
            tabIndex={0}
          >
            <table className="w-full min-w-[40rem] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">등급</th>
                  <th scope="col" className="px-3 py-2">내부망</th>
                  <th scope="col" className="px-3 py-2">게이트웨이 경유</th>
                  <th scope="col" className="px-3 py-2">외부 직접</th>
                  <th scope="col" className="px-3 py-2">비고</th>
                </tr>
              </thead>
              <tbody>
                {rules.data.map((r) => (
                  <tr key={r.grade} className="border-t border-slate-100">
                    <th scope="row" className="px-3 py-2 text-left font-bold text-slate-900">
                      {GRADE_LABEL[r.grade]}
                    </th>
                    {[r.internal, r.gateway, r.external].map((a, i) => (
                      <td key={i} className="px-3 py-2">
                        <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TONE[a]}`}>
                          {ALLOWANCE_LABEL[a]}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-2 text-slate-500">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {access.kind === 'ready' && asOf.kind === 'ready' && (
        <>
          <h2 className="mt-5 text-sm font-black text-slate-900">외부에서 들어오는 접근</h2>
          {(() => {
            const gone = expired(access.data, asOf.data)
            const noMfa = withoutMfa(live(access.data, asOf.data))
            return (
              <>
                {gone.length > 0 && (
                  <p className="mt-2 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    기간이 지난 접근 <b>{gone.length}건</b> — {gone.map((a) => `${a.org}(${a.expiresOn})`).join(' · ')}.
                    목록에 남아 있다고 계정이 닫힌 것은 아닙니다. 닫혔는지는 서버가 답해야 합니다.
                  </p>
                )}
                {noMfa.length > 0 && (
                  <p className="mt-2 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                    2단계 인증 없이 살아 있는 외부 접근 <b>{noMfa.length}건</b> —{' '}
                    {noMfa.map((a) => a.org).join(' · ')}. 비밀번호 하나가 뚫리면 그대로 들어옵니다.
                  </p>
                )}
                <div
                  className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white"
                  role="region"
                  aria-label="표 — 가로로 스크롤됩니다"
                  tabIndex={0}
                >
                  <table className="w-full min-w-[44rem] text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] text-slate-500">
                      <tr>
                        <th scope="col" className="px-3 py-2">조직</th>
                        <th scope="col" className="px-3 py-2">범위</th>
                        <th scope="col" className="px-3 py-2">등급</th>
                        <th scope="col" className="px-3 py-2">기간</th>
                        <th scope="col" className="px-3 py-2">2단계 인증</th>
                        <th scope="col" className="px-3 py-2">마지막 접근</th>
                      </tr>
                    </thead>
                    <tbody>
                      {access.data.map((a) => {
                        const over = a.expiresOn < asOf.data
                        return (
                          <tr key={a.id} className="border-t border-slate-100">
                            <th scope="row" className="px-3 py-2 text-left font-bold text-slate-900">
                              {a.org}
                            </th>
                            <td className="px-3 py-2 text-slate-600">{a.scope}</td>
                            <td className="px-3 py-2 text-slate-600">{GRADE_LABEL[a.grade]}</td>
                            <td className={`px-3 py-2 tabular-nums ${over ? 'font-bold text-amber-800' : 'text-slate-600'}`}>
                              {a.expiresOn}
                              {over && ' (지남)'}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                                  a.mfa ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {a.mfa ? '있음' : '없음'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-500">{a.lastAccessAt}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )
          })()}
        </>
      )}
    </main>
  )
}
