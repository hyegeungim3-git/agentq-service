import { METRIC_SPEEDS, type LiveMetric, type MetricSpeed } from '@entities/metric/model'
import { useLiveMetric } from '@features/metrics/useLiveMetric'
import { Button } from '@shared/ui/Button'

/**
 * 라이브 지표 카드.
 *
 * 계기판처럼 보이는데 지어낸 숫자면 그게 제일 위험하다. 그래서 값보다 먼저
 * **'예시 값'이라는 사실**과 출처를 말한다. 서버가 붙으면 이 배지가 사라지는 것으로
 * 연결 여부를 눈으로 확인할 수 있다.
 */
export function LiveMetricCard({ metric }: { metric: LiveMetric }) {
  const m = useLiveMetric(metric)
  const pct = Math.min(100, (m.value / (metric.threshold * 1.6)) * 100)

  return (
    <section aria-labelledby="live-metric" className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="live-metric" className="text-sm font-black text-slate-900">
          {metric.label}
        </h2>
        {/* 실측이 아니라는 사실을 값보다 먼저 */}
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
          서버 미연결 — 예시 값
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <output
          aria-live="off"
          className={`text-2xl font-black tabular-nums ${m.over ? 'text-rose-700' : 'text-slate-900'}`}
        >
          {m.value.toFixed(2)}
        </output>
        <span className="text-sm text-slate-500">{metric.unit}</span>
        <span className="ml-auto text-xs text-slate-500">
          관리 기준 {metric.threshold}
          {metric.unit}
        </span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full ${m.over ? 'bg-rose-600' : 'bg-slate-800'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/**
       * 색만으로 알리지 않는다 — 그리고 **소리로도** 알린다.
       *
       * 숫자 쪽은 `aria-live="off"`가 맞다. 1초마다 값을 읽으면 아무것도 못 한다.
       * 그런데 그 탓에 관리 기준을 넘는 순간에도 낭독기가 끝까지 조용했다 —
       * 화면은 빨개지고 경고 문장이 나타나는데 소리로는 아무 일도 없었다.
       *
       * 이 문장을 그대로 `role="alert"`로 삼는다. 문장은 `m.over`가 뒤집힐 때만
       * 바뀌므로 **넘는 순간과 되돌아오는 순간에 한 번씩만** 말한다. 따로 sr-only
       * 알림을 두면 같은 말이 화면에도 소리에도 있어 훑을 때 두 번 들린다.
       */}
      <p role="alert" className={`mt-2 text-sm font-bold ${m.over ? 'text-rose-800' : 'text-slate-600'}`}>
        {m.over
          ? `관리 기준 ${metric.threshold}${metric.unit}를 넘었습니다. ${metric.overAdvice}`
          : '관리 기준 이내입니다.'}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500">재생 배속</span>
        {METRIC_SPEEDS.map((s: MetricSpeed) => (
          <label
            key={s}
            className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
          >
            <input
              type="radio"
              name="metric-speed"
              value={s}
              checked={m.speed === s}
              onChange={() => m.setSpeed(s)}
              className="sr-only"
            />
            {s}×
          </label>
        ))}
        {m.finished && (
          <Button tone="link" size="sm" onClick={m.reset}>
            처음부터
          </Button>
        )}
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        출처 · {metric.source}
        {m.finished && ' · 예시 구간이 끝나 마지막 값을 유지합니다'}
      </p>
    </section>
  )
}
