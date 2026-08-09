import { useState } from 'react'
import {
  DUTY_STATUS_LABEL,
  actionable,
  autoCollected,
  cycleOf,
  daysBetween,
  incompleteTraining,
  metRatio,
  openActions,
  staleEvidence,
  trainingGap,
  type DutyStatus,
} from '@entities/safetyact/model'
import { fetchRiskAssessments, fetchSafetyDuties, fetchSafetyTrainings } from '@shared/api/safetyact'
import { fetchAsOf } from '@shared/api/users'
import { useRemote } from '@features/remote/useRemote'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'
import { AdminTabs } from '@widgets/admin-shell/AdminControls'

/**
 * 중대재해처벌법 대응.
 *
 * ⚠️ **이 화면은 법적 판단을 내리지 않는다.** 의무 이행 여부는 사업주·경영책임자가
 * 판단한다. 화면은 그 판단과 증빙이 어디 있는지를 기록할 뿐이다(AI 기본법 대응과 같은 규율).
 *
 * 이행률을 크게 쓰지 않는다. **한 번 '이행'으로 적으면 표는 영원히 초록색**이라
 * 비율은 시간이 지날수록 실제보다 좋아 보인다. 그래서 두 가지를 비율보다 먼저 말한다.
 *  ① 조치가 필요한 호 — 이미 드러나 있는 것
 *  ② **'이행'인데 갱신 주기를 넘긴 호** — 표만 보면 안 보이는 것
 *
 * 주기는 호마다 다르다(연 1회·반기·상시). 한 숫자로 다 재면 연 1회짜리가 7개월 만에
 * 빨간색이 되고, 그러면 아무도 그 경고를 안 본다.
 *
 * 기준 날짜는 데이터를 준 쪽이 말한다(`fetchAsOf`). 브라우저 시계를 쓰면
 * 사용자 시계가 어긋난 만큼 서버와 다른 일수를 말하게 된다.
 */

type Tab = 'duty' | 'risk' | 'training'

const TABS: { id: Tab; label: string }[] = [
  { id: 'duty', label: '의무 이행 현황' },
  { id: 'risk', label: '위험성평가 이력' },
  { id: 'training', label: '교육·점검' },
]

const STATUS_TONE: Record<DutyStatus, string> = {
  met: 'bg-emerald-100 text-emerald-800',
  attention: 'bg-amber-100 text-amber-900',
  unmet: 'bg-rose-100 text-rose-800',
}

export function SafetyActPage() {
  const [tab, setTab] = useState<Tab>('duty')
  const duties = useRemote(fetchSafetyDuties, [])
  const risks = useRemote(fetchRiskAssessments, [])
  const trainings = useRemote(fetchSafetyTrainings, [])
  const asOf = useRemote(fetchAsOf, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">중대재해처벌법 대응</h1>
      <p className="mt-1 text-sm text-slate-600">
        안전보건 확보 의무의 이행 상태와 그 증빙이 어디 있는지를 봅니다.
      </p>

      <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <b>이 화면은 법적 판단을 내리지 않습니다.</b> 의무를 이행했는지는 사업주·경영책임자가
        판단하고 필요하면 노동관서에 확인합니다. 여기 적힌 상태는 그 판단을 <b>기록</b>한 것입니다.
      </p>

      <div className="mt-3 max-w-3xl rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-xs font-bold text-slate-900">
          중대재해 처벌 등에 관한 법률 시행령 제4조
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
          안전보건관리체계의 구축 및 이행에 관한 조치를 9개 호로 정하고 있습니다. 아래는 각 호의
          이행 상태와 증빙입니다.
        </p>
      </div>

      {duties.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">의무 이행 현황을 불러오는 중입니다</span>
        </div>
      )}

      {duties.kind === 'ready' && asOf.kind === 'ready' && (
        <>
          {(() => {
            const todo = actionable(duties.data)
            const stale = staleEvidence(duties.data, asOf.data)
            const auto = autoCollected(duties.data)
            return (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { k: '이행으로 적힌 호', v: `${metRatio(duties.data)}%`, tone: 'text-slate-900' },
                    { k: '조치 필요', v: `${todo.length}건`, tone: todo.length ? 'text-amber-800' : 'text-emerald-700' },
                    { k: '갱신 주기 지남', v: `${stale.length}건`, tone: stale.length ? 'text-rose-800' : 'text-emerald-700' },
                    { k: '플랫폼이 자동 축적', v: `${auto.length}개 호`, tone: 'text-slate-900' },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <dd className={`text-xl font-black ${s.tone}`}>{s.v}</dd>
                      <dt className="mt-0.5 text-[11px] text-slate-500">{s.k}</dt>
                    </div>
                  ))}
                </dl>

                {/* 표만 보면 안 보이는 것을 먼저 말한다 */}
                {stale.length > 0 && (
                  <div className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3">
                    <p className="text-xs font-bold text-rose-900">
                      '이행'으로 적혀 있지만 정한 갱신 주기를 넘긴 호 {stale.length}건
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {stale.map((d) => (
                        <li key={d.id} className="text-[11px] text-rose-900">
                          {d.clause} {d.name} — {d.evidenceAt} 이후 {daysBetween(d.evidenceAt, asOf.data)}일째
                          갱신 없음 (주기 {cycleOf(d)}일 · {d.owner})
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 text-[11px] text-rose-800">
                      한 번 이행으로 적으면 표는 계속 초록색입니다. 지금도 유효한지는 증빙을 다시
                      올려야 알 수 있습니다. 주기는 <b>조직이 정한 값</b>이며 법정 주기가 아닙니다.
                    </p>
                  </div>
                )}

                {todo.length > 0 && (
                  <p className="mt-2 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    조치가 필요한 호 <b>{todo.length}건</b> — {todo.map((d) => `${d.clause} ${d.name}`).join(' · ')}
                  </p>
                )}
              </>
            )
          })()}
        </>
      )}

      {/* 탭은 데이터를 기다리지 않는다 — 의무 목록이 늦게 와도 다른 탭으로 갈 수 있어야 한다 */}
      <AdminTabs label="이행 항목" items={TABS} value={tab} onChange={setTab} />

      {tab === 'duty' && duties.kind === 'ready' && asOf.kind === 'ready' && (
            <AdminTable label="중대재해처벌법 의무 이행 현황" minW="min-w-[52rem]" wrap="mt-3">
                <thead className="bg-slate-50 text-[11px] text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-2">호</th>
                    <th scope="col" className="px-3 py-2">의무</th>
                    <th scope="col" className="px-3 py-2">상태</th>
                    <th scope="col" className="px-3 py-2">증빙</th>
                    <th scope="col" className="px-3 py-2">마지막 갱신</th>
                    <th scope="col" className="px-3 py-2">주기</th>
                    <th scope="col" className="px-3 py-2">담당</th>
                  </tr>
                </thead>
                <tbody>
            {duties.data.length === 0 && (
              <EmptyRow cols={7}>점검할 의무 항목이 없습니다.</EmptyRow>
            )}
                  {duties.data.map((d) => {
                    const age = daysBetween(d.evidenceAt, asOf.data)
                    const old = d.status === 'met' && age > cycleOf(d)
                    return (
                      <tr key={d.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-bold text-slate-700">{d.clause}</td>
                        <th scope="row" className="px-3 py-2 text-left font-bold text-slate-900">
                          {d.name}
                          {d.auto && (
                            <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              자동 축적
                            </span>
                          )}
                        </th>
                        <td className="px-3 py-2">
                          <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${STATUS_TONE[d.status]}`}>
                            {DUTY_STATUS_LABEL[d.status]}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{d.evidence}</td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">
                          {d.evidenceAt}
                          <span className={old ? 'ml-1 font-bold text-rose-800' : 'ml-1 text-slate-400'}>
                            ({age}일 전)
                          </span>
                        </td>
                        <td className="px-3 py-2 tabular-nums text-slate-500">{cycleOf(d)}일</td>
                        <td className="px-3 py-2 text-slate-500">{d.owner}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </AdminTable>
      )}

      {tab === 'risk' && risks.kind === 'ready' && (
        <section className="mt-3">
          {openActions(risks.data).length > 0 && (
            <p className="max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              평가를 한 것과 위험이 없어진 것은 다릅니다. <b>조치가 남은 평가 {openActions(risks.data).length}건</b>
            </p>
          )}
          <ul className="mt-2 space-y-2">
            {risks.data.map((r) => {
              const left = r.risks - r.actionsDone
              return (
                <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{r.task}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                      {r.docNo}
                    </span>
                    <span
                      className={`ml-auto rounded px-1.5 py-0.5 text-[11px] font-bold ${
                        left > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {left > 0 ? `조치 ${left}건 남음` : '조치 완료'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {r.assessedOn} · {r.by} · 위험요인 {r.risks}건 중 {r.actionsDone}건 조치
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {tab === 'training' && trainings.kind === 'ready' && (
        <section className="mt-3">
          {incompleteTraining(trainings.data).length > 0 && (
            <p className="max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              아직 안 받은 사람이 있는 교육 <b>{incompleteTraining(trainings.data).length}건</b> — 이수율만
              보면 끝난 것처럼 보입니다. 남은 인원 수를 함께 적습니다.
            </p>
          )}
          <ul className="mt-2 space-y-2">
            {trainings.data.map((t) => {
              const gap = trainingGap(t)
              const pct = Math.round((t.done / (t.total || 1)) * 100)
              return (
                <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{t.name}</span>
                    <span className="text-[11px] text-slate-500">· {t.target}</span>
                    <span
                      className={`ml-auto rounded px-1.5 py-0.5 text-[11px] font-bold ${
                        gap > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {gap > 0 ? `${gap}명 미이수` : '전원 이수'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${gap > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[11px] font-bold tabular-nums text-slate-700">
                      {t.done}/{t.total}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">{t.heldOn}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </main>
  )
}
