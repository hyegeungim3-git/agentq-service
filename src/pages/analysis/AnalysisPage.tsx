import { Suspense, lazy } from 'react'
import {
  ANALYSIS_KINDS,
  analysisKindDesc,
  analysisKindLabel,
  breaches,
  findOutliers,
  isPartial,
  statusLabel,
  OUTLIER_FACTOR,
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

/**
 * 이상으로 본 것 — 무엇을, 무엇과 견줘, 왜.
 *
 * **판정 규칙을 화면이 먼저 말한다.** 규칙을 안 밝히면 사용자는 '왜 이건 빠졌지'를
 * 물을 수 없고, 물을 수 없는 목록은 결국 안 본다. 이전 데모의 이상치 탐지가
 * 그랬다 — 목록만 있고 기준이 없었다.
 */
function OutlierTable({ result }: { result: AnalysisResult }) {
  const rows = findOutliers(result)

  return (
    <div className="mt-4">
      <p className="mb-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        관리 기준을 넘은 구간과, 항목 평균의 {OUTLIER_FACTOR}배를 넘은 항목을 이상으로 봤습니다.
        표준편차 기준은 쓰지 않습니다 — 한쪽으로 쏠린 데이터에서 멀쩡한 값을 이상이라고
        말하기 때문입니다.
      </p>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">
          이 기준으로는 이상 항목이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto" role="region" aria-label="이상 항목 표 — 가로로 스크롤됩니다" tabIndex={0}>
          <table className="w-full min-w-[26rem] text-sm">
            <caption className="sr-only">이상으로 본 항목</caption>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th scope="col" className="py-2 pr-3 font-bold">항목</th>
                <th scope="col" className="py-2 pr-3 font-bold">값</th>
                <th scope="col" className="py-2 pr-3 font-bold">견준 기준</th>
                <th scope="col" className="py-2 font-bold">왜 이상인가</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.label}-${r.value}`} className="border-b border-slate-100 last:border-0">
                  <th scope="row" className="py-2 pr-3 text-left font-bold text-slate-800">
                    {r.label}
                    {/* 색만으로 급한 것을 구분하지 않는다 */}
                    {r.severity === 'high' && (
                      <span className="ml-1.5 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                        즉시 확인
                      </span>
                    )}
                  </th>
                  <td className="py-2 pr-3 tabular-nums text-slate-700">{r.value}</td>
                  <td className="py-2 pr-3 text-slate-500">{r.basis}</td>
                  <td className="py-2 text-slate-700">{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
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
      title="데이터 분석 에이전트"
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
                {/* 이상치도 추이 위에서 봐야 한다 — 어느 구간이 튀었는지는
                    기준선과 함께 볼 때만 읽힌다 */}
                {res.kind === 'distribution' ? (
                  <DistributionChart data={res.distribution} />
                ) : (
                  <TrendChart data={res.trend} unit={res.unit} />
                )}
              </Suspense>

              {res.kind === 'outlier' && <OutlierTable result={res} />}

              {/* 차트는 스크린리더가 못 읽는다 — 같은 데이터를 표로도 준다 */}
              <div className="mt-4 overflow-x-auto" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
                <table className="w-full min-w-[22rem] text-sm">
                  <caption className="sr-only">{analysisKindLabel(res.kind)} 데이터</caption>
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                      {res.kind !== 'distribution' ? (
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
                    {res.kind !== 'distribution'
                      ? res.trend.map((p) => (
                          <tr key={p.period} className="border-b border-slate-100 last:border-0">
                            <th scope="row" className="py-2 pr-3 text-slate-600 text-left">{p.period}</th>
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
                            <th scope="row" className="py-2 pr-3 text-slate-600 text-left">{d.label}</th>
                            <td className="py-2 tabular-nums text-slate-700">{d.count}건</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {res.kind !== 'outlier' && over.length > 0 && (
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
