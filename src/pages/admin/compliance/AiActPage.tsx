import { useState } from 'react'
import {
  ASSESSMENT_LABEL,
  DUTIES,
  DUTY_LABEL,
  IMPACT_VERDICTS,
  VERDICT_LABEL,
  highRisk,
  reviewingInService,
  unmetDuties,
  type ImpactVerdict,
} from '@entities/compliance/model'
import { fetchAiSystems, fetchAssessments, fetchLabelRules } from '@shared/api/compliance'
import {
  STORE_LABEL,
  browserOnly,
  noRecord,
  provableRatio,
  type EvidenceStore,
} from '@entities/evidence/model'
import { fetchEvidence } from '@shared/api/evidence'
import { useRemote } from '@features/remote/useRemote'
import { AdminTabs } from '@widgets/admin-shell/AdminControls'

/**
 * AI 기본법 대응.
 *
 * ⚠️ **이 화면은 법적 판단을 내리지 않는다.** 고영향 해당 여부는 사업자가 판단하고
 * 필요하면 소관 부처에 확인한다. 화면은 그 판단과 근거를 기록할 뿐이다.
 * 화면이 판정하는 것처럼 보이면, '비해당'이라고 떴다는 이유로 의무를 넘기게 된다.
 *
 * 두 가지를 먼저 드러낸다.
 *  ① 고영향인데 책무를 다 못 채운 시스템
 *  ② **판정이 안 끝났는데 이미 돌고 있는 시스템** — 대개 쓰면서 판단한다.
 *     그 상태를 감추면 화면이 안전한 것처럼 보인다.
 */

type Tab = 'systems' | 'label' | 'assessment' | 'evidence'

const TABS: { id: Tab; label: string }[] = [
  { id: 'systems', label: '고영향 AI 관리' },
  { id: 'label', label: '생성물 표시' },
  { id: 'assessment', label: '영향평가 현황' },
  { id: 'evidence', label: '감사 추적' },
]

const STORE_TONE: Record<EvidenceStore, string> = {
  server: 'bg-emerald-100 text-emerald-800',
  browser: 'bg-amber-100 text-amber-900',
  none: 'bg-rose-100 text-rose-800',
}

const VERDICT_TONE: Record<ImpactVerdict, string> = {
  high: 'bg-rose-100 text-rose-800',
  reviewing: 'bg-amber-100 text-amber-900',
  notHigh: 'bg-slate-100 text-slate-600',
}

const ARTICLES = [
  { no: '제31조', what: '투명성 확보 — AI 생성물 고지·표시' },
  { no: '제33조', what: '고영향 AI 해당 여부 확인' },
  { no: '제34조', what: '고영향 AI 사업자 책무' },
  { no: '제35조', what: '고영향 AI 영향평가' },
]

export function AiActPage() {
  const [tab, setTab] = useState<Tab>('systems')
  const [filter, setFilter] = useState<ImpactVerdict | 'all'>('all')
  const systems = useRemote(fetchAiSystems, [])
  const labels = useRemote(fetchLabelRules, [])
  const assessments = useRemote(fetchAssessments, [])
  const evidence = useRemote(fetchEvidence, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">AI 기본법 대응</h1>
      <p className="mt-1 text-sm text-slate-600">
        「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」 이행 기록입니다.
      </p>

      {/* 화면이 판정하는 것처럼 보이면 의무를 화면에 넘기게 된다 */}
      <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <b>이 화면은 법적 판단을 내리지 않습니다.</b> 고영향 해당 여부는 사업자가 판단하고 필요하면
        소관 부처에 확인합니다. 여기 적힌 판정은 그 판단을 <b>기록</b>한 것이며, 화면에 '비해당'으로
        보인다는 것이 의무가 없다는 뜻은 아닙니다.
      </p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {ARTICLES.map((a) => (
          <li key={a.no} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600">
            <b className="text-slate-900">{a.no}</b> {a.what}
          </li>
        ))}
      </ul>

      <AdminTabs label="이행 항목" items={TABS} value={tab} onChange={setTab} />

      {tab === 'systems' && systems.kind === 'ready' && (
        <section className="mt-4">
          {(() => {
            const gaps = highRisk(systems.data)
            const running = reviewingInService(systems.data)
            const shown =
              filter === 'all' ? systems.data : systems.data.filter((s) => s.verdict === filter)
            return (
              <>
                {gaps.length > 0 && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-black text-rose-900">
                      고영향인데 책무를 다 못 채운 시스템 {gaps.length}건
                    </p>
                    <ul className="mt-2 space-y-1">
                      {gaps.map((s) => (
                        <li key={s.id} className="text-xs text-rose-800">
                          <b>{s.name}</b> — 남은 책무:{' '}
                          {unmetDuties(s)
                            .map((d) => DUTY_LABEL[d])
                            .join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 판정이 안 끝났는데 돌고 있는 것을 감추면 안전한 것처럼 보인다 */}
                {running.length > 0 && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-black text-amber-900">
                      해당 여부를 확인 중인데 이미 운영 중인 시스템 {running.length}건
                    </p>
                    <ul className="mt-2 space-y-1">
                      {running.map((s) => (
                        <li key={s.id} className="text-xs text-amber-900">
                          <b>{s.name}</b> · {s.dept} — {s.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {(['all', ...IMPACT_VERDICTS] as const).map((v) => (
                    <label
                      key={v}
                      className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
                    >
                      <input
                        type="radio"
                        name="verdict"
                        value={v}
                        checked={filter === v}
                        onChange={() => setFilter(v)}
                        className="sr-only"
                      />
                      {v === 'all' ? '전체' : VERDICT_LABEL[v]}
                    </label>
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-600">{shown.length}개 시스템</p>
                <ul className="mt-2 space-y-3">
                  {shown.map((s) => {
                    const unmet = unmetDuties(s)
                    return (
                      <li key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${VERDICT_TONE[s.verdict]}`}>
                            {VERDICT_LABEL[s.verdict]}
                          </span>
                          <p className="text-sm font-black text-slate-900">{s.name}</p>
                          <span className="text-xs text-slate-500">{s.dept}</span>
                          <span className="ml-auto text-[11px] text-slate-500">{s.owner}</span>
                        </div>
                        {/* 판정만 있고 근거가 없으면 다시 판단할 수 없다 */}
                        <p className="mt-2 text-xs text-slate-700">판정 근거 · {s.reason}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {DUTIES.map((d) => {
                            const met = s.duties.includes(d)
                            return (
                              <span
                                key={d}
                                className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                                  met ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {DUTY_LABEL[d]} {met ? '이행' : '미이행'}
                              </span>
                            )
                          })}
                        </div>
                        {s.verdict === 'high' && unmet.length > 0 && (
                          <p className="mt-2 text-xs font-bold text-rose-800">
                            제34조 책무 {DUTIES.length - unmet.length}/{DUTIES.length} 이행 — 남은 것을
                            채우기 전까지 이 시스템은 의무 위반 상태입니다.
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </>
            )
          })()}
        </section>
      )}

      {tab === 'label' && labels.kind === 'ready' && (
        <section className="mt-4">
          {(() => {
            const off = labels.data.filter((l) => !l.enabled)
            return (
              <>
                <p className="text-xs text-slate-600">
                  {labels.data.length - off.length} / {labels.data.length}개 적용 중
                  {off.length > 0 && (
                    <span className="ml-1 font-bold text-amber-800">· 미적용 {off.length}개</span>
                  )}
                </p>
                {/* 적용률만 보여 주면 남은 것이 무엇인지 알 수 없다 */}
                {off.length > 0 && (
                  <p className="mt-2 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    미적용 {off.length}개는 제31조 표시 의무를 지금 채우지 못하고 있습니다 —{' '}
                    {off.map((l) => l.target).join(', ')}.
                  </p>
                )}
                <ul className="mt-3 space-y-2">
                  {labels.data.map((l) => (
                    <li
                      key={l.id}
                      className={`rounded-xl border p-3 ${
                        l.enabled ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-slate-900">{l.target}</p>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                            l.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {l.enabled ? '적용' : '미적용'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{l.how}</p>
                    </li>
                  ))}
                </ul>
              </>
            )
          })()}
        </section>
      )}

      {tab === 'evidence' && evidence.kind === 'ready' && (
        <section className="mt-4">
          {(() => {
            const none = noRecord(evidence.data)
            const browser = browserOnly(evidence.data)
            const ratio = provableRatio(evidence.data)
            return (
              <>
                {/* '이행했다'와 '이행을 증명할 수 있다'는 다르다 */}
                <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-black text-slate-900">
                    지금 서버 기록으로 증명할 수 있는 책무 ·{' '}
                    {evidence.data.filter((e) => e.store === 'server').length} /{' '}
                    {evidence.data.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    제34조 책무를 <b>지켰다는 것</b>과 <b>지켰다고 증명할 수 있는 것</b>은 다릅니다.
                    고영향 AI 관리 탭에서 '이행'으로 표시된 항목도, 감사에서 근거를 물으면 내놓을
                    기록이 있어야 합니다.
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-slate-800"
                      style={{ width: `${(ratio * 100).toFixed(0)}%` }}
                    />
                  </div>
                </div>

                {none.length > 0 && (
                  <div className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-black text-rose-900">
                      아무 데도 기록이 남지 않는 항목 {none.length}건
                    </p>
                    <ul className="mt-2 space-y-1">
                      {none.map((e) => (
                        <li key={e.duty} className="text-xs text-rose-800">
                          <b>{DUTY_LABEL[e.duty]}</b> — {e.what}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs font-bold text-rose-900">
                      지금 감사를 받으면 이 항목들은 근거로 내놓을 것이 없습니다.
                    </p>
                  </div>
                )}

                {browser.length > 0 && (
                  <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    브라우저에만 남는 항목이 {browser.length}건 있습니다. 그 사람이 브라우저를
                    지우면 사라지고, 다른 사람 것은 볼 수 없습니다 — <b>기관 차원의 기록이
                    아닙니다.</b>
                  </p>
                )}

                <ul aria-label="이행 증거" className="mt-4 space-y-2">
                  {[...none, ...browser, ...evidence.data.filter((e) => e.store === 'server')].map(
                    (e) => (
                      <li
                        key={e.duty}
                        className={`rounded-xl border p-4 ${
                          e.store === 'none'
                            ? 'border-rose-200 bg-rose-50'
                            : e.store === 'browser'
                              ? 'border-amber-200 bg-white'
                              : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-slate-900">{DUTY_LABEL[e.duty]}</p>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${STORE_TONE[e.store]}`}
                          >
                            {STORE_LABEL[e.store]}
                          </span>
                          {/* 어디서 볼 수 있는지 없으면 확인할 방법이 없다 */}
                          {e.where && (
                            <span className="ml-auto text-[11px] text-slate-500">{e.where}</span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-700">{e.what}</p>
                        <p className="mt-1 text-[11px] text-slate-600">{e.note}</p>
                      </li>
                    ),
                  )}
                </ul>

                <p className="mt-4 max-w-3xl text-xs text-slate-500">
                  서버가 붙어 기록이 쌓이기 시작하면 이 표의 '남지 않음'이 '서버 기록'으로
                  바뀝니다. 지금 숫자가 낮은 것은 잘못된 것이 아니라 사실입니다 — 감추면
                  이행한 것처럼 보이게 됩니다.
                </p>
              </>
            )
          })()}
        </section>
      )}

      {tab === 'assessment' && assessments.kind === 'ready' && (
        <section className="mt-4">
          <ul className="space-y-2">
            {assessments.data.map((a) => (
              <li
                key={a.id}
                className={`rounded-xl border p-4 ${
                  a.status === 'done' ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                      a.status === 'done'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {ASSESSMENT_LABEL[a.status]}
                  </span>
                  <p className="text-sm font-black text-slate-900">{a.systemName}</p>
                  <span className="ml-auto text-[11px] text-slate-500">
                    기한 {a.dueOn}
                    {a.completedOn ? ` · 완료 ${a.completedOn}` : ''}
                  </span>
                </div>
                {/* 안 끝난 것은 무엇이 남았는지 */}
                {a.remaining && <p className="mt-1 text-xs text-amber-900">남은 것 · {a.remaining}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
