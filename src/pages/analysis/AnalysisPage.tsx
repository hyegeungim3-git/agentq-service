import { Suspense, lazy } from 'react'
import {
  ANALYSIS_KINDS,
  analysisKindDesc,
  analysisKindLabel,
  breaches,
  isPartial,
  statusLabel,
  type AnalysisResult,
  type StatRow,
} from '@entities/analysis/model'
import { useAnalysis, type AnalysisOptions } from '@features/analysis/useAnalysis'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'

/* 차트는 이 화면에서만 쓰므로 지연 로딩한다 — recharts가 초기 번들에 들어가지 않게 */
const TrendChart = lazy(() =>
  import('@widgets/charts/AnalysisCharts').then((m) => ({ default: m.TrendChart })),
)
const DistributionChart = lazy(() =>
  import('@widgets/charts/AnalysisCharts').then((m) => ({ default: m.DistributionChart })),
)

const STATUS_STYLE: Record<StatRow['status'], string> = {
  good: 'text-emerald-700',
  watch: 'text-amber-700',
  bad: 'text-rose-700',
}

const ChartFallback = () => (
  <div role="status" className="h-56 w-full animate-pulse rounded-lg bg-slate-100">
    <span className="sr-only">차트를 불러오는 중입니다</span>
  </div>
)

export function AnalysisPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: AnalysisOptions }) {
  const a = useAnalysis(apiOptions ?? {})

  return (
    <AgentShell<AnalysisResult>
      title="공정 데이터 분석 에이전트"
      agentId="dataanalysis"
      desc="추이와 분포를 차트로 보여 주고, 분석에 쓰이지 못한 데이터를 함께 밝힙니다."
      onBack={onBack}
      phase={a.phase}
      docs={a.docs}
      documentId={a.documentId}
      onSelectDocument={a.setDocumentId}
      docSectionLabel="분석할 데이터"
      emptyDocsLabel="분석할 데이터가 없습니다."
      upload={a.upload}
      optionsLabel="분석 유형"
      runLabel="분석 실행"
      runningLabel="분석 중…"
      runningMessage="데이터를 집계하고 있습니다…"
      onRun={() => void a.run()}
      onReset={a.reset}
      options={
        <fieldset>
          <legend className="sr-only">분석 유형 선택</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ANALYSIS_KINDS.map((k) => (
              <label
                key={k}
                className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand-soft"
              >
                <input
                  type="radio"
                  name="analysis-kind"
                  value={k}
                  checked={a.kind === k}
                  onChange={() => a.setKind(k)}
                  className="mt-0.5 size-4"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-800">{analysisKindLabel(k)}</span>
                  <span className="block text-xs text-slate-500">{analysisKindDesc(k)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      }
      result={(res) => {
        const over = breaches(res.trend)
        return (
          <>
            <ResultSection
              id="analysis-result"
              title={`${analysisKindLabel(res.kind)} 결과`}
              stats={res.stats.map((s) => [s.metric, s.value] as [string, string])}
            >
              {/* 부분 데이터로 낸 결론을 전체 결론처럼 읽으면 안 된다 */}
              {isPartial(res) && (
                <p className="-mt-1 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
                  분석에 쓰인 데이터는 전체의 {Math.round(res.coverage * 100)}%입니다. 아래 결론은 전체가 아니라
                  이 범위에 대한 것입니다.
                </p>
              )}

              <Suspense fallback={<ChartFallback />}>
                {res.kind === 'trend' ? (
                  <TrendChart data={res.trend} unit={res.unit} />
                ) : (
                  <DistributionChart data={res.distribution} />
                )}
              </Suspense>

              {/* 차트는 스크린리더가 못 읽는다 — 같은 데이터를 표로도 준다 */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[22rem] text-sm">
                  <caption className="sr-only">{analysisKindLabel(res.kind)} 데이터</caption>
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                      {res.kind === 'trend' ? (
                        <>
                          <th scope="col" className="py-2 pr-3 font-bold">기간</th>
                          <th scope="col" className="py-2 pr-3 font-bold">실측</th>
                          <th scope="col" className="py-2 font-bold">관리 기준</th>
                        </>
                      ) : (
                        <>
                          <th scope="col" className="py-2 pr-3 font-bold">원인</th>
                          <th scope="col" className="py-2 font-bold">건수</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {res.kind === 'trend'
                      ? res.trend.map((p) => (
                          <tr key={p.period} className="border-b border-slate-100 last:border-0">
                            <td className="py-2 pr-3 text-slate-600">{p.period}</td>
                            <td
                              className={`py-2 pr-3 tabular-nums ${
                                p.value > p.limit ? 'font-bold text-amber-700' : 'text-slate-700'
                              }`}
                            >
                              {p.value}
                              {res.unit}
                              {p.value > p.limit ? ' · 기준 초과' : ''}
                            </td>
                            <td className="py-2 tabular-nums text-slate-500">
                              {p.limit}
                              {res.unit}
                            </td>
                          </tr>
                        ))
                      : res.distribution.map((d) => (
                          <tr key={d.label} className="border-b border-slate-100 last:border-0">
                            <td className="py-2 pr-3 text-slate-600">{d.label}</td>
                            <td className="py-2 tabular-nums text-slate-700">{d.count}건</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {over.length > 0 && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
                  관리 기준을 넘은 기간이 {over.length}개월 있습니다 ({over.map((o) => o.period).join(', ')}).
                </p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {res.stats.map((s) => (
                  <div key={s.metric} className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="text-[11px] text-slate-500">{s.metric}</dt>
                    <dd className="text-sm font-black text-slate-900">
                      {s.value}
                      {s.change && (
                        <span className={`ml-1 text-[11px] font-bold ${STATUS_STYLE[s.status]}`}>
                          {s.change} · {statusLabel(s.status)}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </ResultSection>

            <ResultSection
              id="analysis-excluded"
              title="분석에서 빠진 데이터"
              notice="AI가 집계한 결과입니다. 의사결정 전 원본 데이터로 확인하십시오."
            >
              {/* 빠진 게 없으면 그렇다고 말한다 — 빈 목록만 두면 '아직 안 채운 칸'으로 읽힌다 */}
              {res.excludedReasons.length === 0 ? (
                <p className="text-sm text-slate-700">
                  빠진 데이터가 없습니다. 수집 구간 전체가 분석에 쓰였습니다.
                </p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {res.excludedReasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </ResultSection>
          </>
        )
      }}
    />
  )
}
