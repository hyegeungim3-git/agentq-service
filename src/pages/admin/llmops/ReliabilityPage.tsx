import { useState } from 'react'
import { averageGain } from '@entities/llmops/model'
import { fetchConfidencePolicy, fetchGuardrails, fetchPipelines, toggleGuardrail } from '@shared/api/llmops'
import { useRemote } from '@features/remote/useRemote'

/**
 * 신뢰성 관리.
 *
 * 이 화면의 위험은 **효과를 숫자로 적어 두면 검증된 것처럼 보인다**는 점이다.
 * '+18.4%'는 언제 몇 건으로 쟀는지 없으면 뜻이 없다. 측정값에 표본 수와 시점을
 * 붙이고, **아직 안 잰 것은 '측정 전'이라고 쓰고 평균에서 뺀다.**
 * 0으로 세면 효과가 없는 것으로 읽히고 평균이 무너진다.
 *
 * 가드레일은 **껐을 때 무엇이 통과하게 되는지**를 스위치 옆에 적는다.
 * 끄기 전에 알아야 하는 정보다.
 *
 * RAG 파이프라인 탭은 두지 않았다 — **지식 관리에서 다룬다**(만들어 뒀다).
 * 같은 것을 두 화면에 두면 어느 쪽이 진짜인지 알 수 없게 된다.
 */

type Tab = 'rerank' | 'guardrail' | 'confidence'

const TABS: { id: Tab; label: string }[] = [
  { id: 'rerank', label: 'Re-rank 설정' },
  { id: 'guardrail', label: '출력 가드레일' },
  { id: 'confidence', label: '신뢰도 임계값' },
]

const pct = (r: number): string => `${(r * 100).toFixed(1)}%`

export function ReliabilityPage() {
  const [tab, setTab] = useState<Tab>('rerank')
  const [failure, setFailure] = useState<string | null>(null)
  const pipelines = useRemote(fetchPipelines, [])
  const guardrails = useRemote(fetchGuardrails, [])
  const policy = useRemote(fetchConfidencePolicy, [])

  const toggle = (id: string, next: boolean) => {
    void toggleGuardrail(id, next).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">신뢰성 관리</h1>
      <p className="mt-1 text-sm text-slate-600">
        답변이 근거에서 벗어나지 않게 하는 설정입니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      <div role="tablist" aria-label="신뢰성 설정" className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-full border px-4 text-sm font-bold ${
              tab === t.id
                ? 'border-slate-900 bg-brand text-brand-fg'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rerank' && pipelines.kind === 'ready' && (
        <section className="mt-4">
          {(() => {
            const on = pipelines.data.filter((p) => p.enabled)
            const avg = averageGain(on)
            const unmeasured = on.filter((p) => p.measurement.gain === null)
            return (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-[11px] font-bold text-slate-500">켜진 파이프라인</p>
                    <p className="text-xl font-black text-slate-900">
                      {on.length} / {pipelines.data.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-[11px] font-bold text-slate-500">평균 정확도 향상</p>
                    <p className="text-xl font-black text-slate-900">
                      {avg.value === null ? '측정 전' : `+${pct(avg.value)}`}
                    </p>
                    {/* 몇 개를 세서 나온 평균인지 밝힌다 */}
                    <p className="text-[10px] text-slate-400">{avg.counted}개 측정값의 평균</p>
                  </div>
                  <div
                    className={`rounded-xl border p-4 text-center ${
                      unmeasured.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="text-[11px] font-bold text-slate-500">아직 안 잰 것</p>
                    <p className="text-xl font-black text-slate-900">{unmeasured.length}개</p>
                  </div>
                </div>

                {unmeasured.length > 0 && (
                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    {unmeasured.map((p) => p.agentLabel).join(', ')}는 아직 효과를 재지 않았습니다.
                    위 평균에 포함하지 않았습니다 — 0으로 세면 효과가 없는 것처럼 보입니다.
                  </p>
                )}

                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
                  <table className="w-full min-w-[48rem] text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] text-slate-500">
                      <tr>
                        <th scope="col" className="px-3 py-2">대상</th>
                        <th scope="col" className="px-3 py-2">Re-rank 모델</th>
                        <th scope="col" className="px-3 py-2">Top-K</th>
                        <th scope="col" className="px-3 py-2">임계값</th>
                        <th scope="col" className="px-3 py-2">정확도 향상</th>
                        <th scope="col" className="px-3 py-2">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pipelines.data.map((p) => (
                        <tr key={p.id} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-bold text-slate-800">{p.agentLabel}</td>
                          <td className="px-3 py-2 text-slate-600">{p.model}</td>
                          <td className="px-3 py-2 tabular-nums text-slate-600">{p.topK}</td>
                          <td className="px-3 py-2 tabular-nums text-slate-600">{p.threshold}</td>
                          {/* '-'로 두면 효과가 없는 것으로 읽힌다 */}
                          <td className="px-3 py-2">
                            {p.measurement.gain === null ? (
                              <span className="text-amber-800">측정 전</span>
                            ) : (
                              <span className="tabular-nums font-bold text-slate-800">
                                +{pct(p.measurement.gain)}
                                <span className="ml-1 font-normal text-slate-400">
                                  ({p.measurement.samples}건 · {p.measurement.measuredOn})
                                </span>
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                                p.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {p.enabled ? '켜짐' : '꺼짐'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          })()}
        </section>
      )}

      {tab === 'guardrail' && guardrails.kind === 'ready' && (
        <section className="mt-4">
          <p className="text-xs text-slate-600">
            켜짐 {guardrails.data.filter((g) => g.enabled).length} / {guardrails.data.length} · 최근 7일
            적용 {guardrails.data.reduce((n, g) => n + g.hits, 0)}건
          </p>
          <ul className="mt-2 grid gap-3 lg:grid-cols-2">
            {guardrails.data.map((g) => (
              <li
                key={g.id}
                className={`rounded-xl border p-4 ${
                  g.enabled ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-slate-900">{g.name}</p>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      g.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {g.enabled ? '켜짐' : '꺼짐'}
                  </span>
                  <span className="ml-auto text-[11px] text-slate-500">7일 {g.hits}건</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{g.description}</p>
                {/* 끄기 전에 알아야 한다 */}
                <p className="mt-2 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-700">
                  {g.enabled ? '끄면 · ' : '꺼져 있어 지금 · '}
                  {g.riskIfOff}
                </p>
                <button
                  type="button"
                  onClick={() => toggle(g.id, !g.enabled)}
                  className="mt-2 min-h-11 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {g.enabled ? '끄기' : '켜기'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'confidence' && policy.kind === 'ready' && (
        <section className="mt-4 max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-black text-slate-900">
            자동 응답 임계값 · {Math.round(policy.data.autoAnswerThreshold * 100)}%
          </p>
          {/* 값만 보여 주면 무슨 뜻인지 알 수 없다 */}
          <p className="mt-2 text-sm text-slate-700">
            신뢰도가 이 값 아래이면 · {policy.data.belowAction}
          </p>
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            임계값을 올리면 확인 표시가 붙는 답변이 늘고, 내리면 줄어듭니다. 답변 자체를 막는 설정이
            아니므로 '임계값을 넘겼다'는 것이 곧 '맞다'는 뜻은 아닙니다.
          </p>
        </section>
      )}
    </main>
  )
}
