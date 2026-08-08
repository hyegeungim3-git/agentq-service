import type { DistributionBar, TrendPoint } from '@entities/analysis/model'

/**
 * 차트 묶음 — **직접 그린다.**
 *
 * 전에는 recharts를 썼다. 화면 하나에서 쓰는 꺾은선 하나·막대 하나에
 * **370KB(gzip 105KB)** 를 내려받고 있었다 — 이 저장소에서 가장 큰 덩어리였고,
 * 첫 화면을 나눈 뒤로는 남은 것 중 제일 컸다.
 *
 * 바꿀 수 있었던 이유는 **차트가 데이터를 지고 있지 않기 때문**이다. 같은 수치를
 * 호출부가 표로 함께 내주고(캡션까지 붙어 있다) 차트는 `aria-hidden`이다.
 * 즉 차트가 하는 일은 '모양을 보여 주는 것' 하나뿐이라, 라이브러리가 주는
 * 축 계산·툴팁·애니메이션 중 실제로 쓰는 것이 거의 없었다.
 *
 * 그리는 방식 — **글자는 HTML, 늘어나는 도형만 SVG.**
 * SVG를 `preserveAspectRatio="none"`으로 늘리면 폭에 맞춰 채워지지만 글자와 원이
 * 같이 찌그러진다. 그래서 축 눈금·점·기준선 라벨은 HTML로 얹어 또렷하게 두고,
 * 늘어나도 되는 격자선·꺾은선만 SVG에 남겼다(선 두께는 `non-scaling-stroke`로 고정).
 *
 * 마우스를 올렸을 때의 값은 `title`로 준다 — 브라우저가 그려 주므로 스크립트가 없다.
 */

/**
 * 축 눈금 다섯 개.
 *
 * ⚠️ 처음에는 최대값을 그냥 4로 나눴다. 그랬더니 눈금이 0.15·0.45 같은 값이 되고,
 * 글자는 소수 한 자리로 반올림돼 **0.2·0.5로 적혔다** — 격자선과 숫자가 어긋난,
 * 말 그대로 거짓말하는 축이었다(스크린샷으로 잡았다).
 *
 * 그래서 사람이 읽는 단위(1·2·2.5·5·10 × 10ⁿ)로 올림한다. 덤으로 **꼭대기에
 * 여유가 생긴다** — 전에는 최대값이 축 천장에 딱 붙어 점이 잘려 나갔다.
 */
function ticksOf(max: number): number[] {
  if (max <= 0) return [0, 1]
  const rough = max / 4
  const mag = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rough) ?? 10 * mag
  return [0, 1, 2, 3, 4].map((i) => step * i)
}

/** 눈금 글자 — 부동소수 찌꺼기(0.30000000000000004)를 떼고 그대로 적는다 */
const tick = (n: number): string => String(Number(n.toFixed(4)))

function YAxis({ ticks, unit }: { ticks: number[]; unit: string }) {
  return (
    <div
      /* 검사가 눈금 글자를 집어 숫자로 되읽는다 — 글자와 실제 눈금이 어긋나는 것을
         그 방법으로만 잡을 수 있다(한 번 어긋난 채로 나갔다) */
      data-axis="y"
      className="flex w-11 shrink-0 flex-col-reverse justify-between py-[2px] text-right text-[11px] text-slate-500 tabular-nums"
    >
      {ticks.map((t) => (
        <span key={t}>
          {tick(t)}
          {unit}
        </span>
      ))}
    </div>
  )
}

/** 가로 격자 — 눈금과 같은 자리에 긋는다 */
function Grid({ count }: { count: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => {
        const y = (i / (count - 1)) * 100
        return (
          <line
            key={i}
            x1="0"
            x2="100"
            y1={y}
            y2={y}
            className="stroke-slate-200"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}

export function TrendChart({ data, unit }: { data: TrendPoint[]; unit: string }) {
  if (data.length === 0) return null

  const limit = data[0]?.limit
  /* 축 최대값은 실측과 기준선 **둘 다** 담아야 한다 — 기준선이 축 밖으로 나가면
     '넘었다'가 그림에서 안 보인다 */
  const max = Math.max(...data.map((d) => d.value), limit ?? 0)
  const ticks = ticksOf(max)
  const top = ticks[ticks.length - 1] ?? 1

  /**
   * 점이 하나뿐이면 가운데(나누기에서 0이 되는 것을 막는다).
   *
   * 양 끝을 0%·100%에 붙이면 **첫 점과 끝 점이 반씩 잘린다.** 안쪽으로 조금 들여
   * 그린다 — x축 글자도 같은 자리에 놓이므로 함께 안 잘린다.
   */
  const PAD = 4
  const xOf = (i: number) =>
    data.length === 1 ? 50 : PAD + (i / (data.length - 1)) * (100 - PAD * 2)
  const yOf = (v: number) => 100 - (v / top) * 100

  return (
    <figure aria-hidden="true" className="mt-2">
      <div className="flex h-56 gap-1">
        <YAxis ticks={ticks} unit={unit} />
        <div className="relative min-w-0 flex-1">
          <Grid count={ticks.length} />

          {/* 꺾은선 — 늘어나도 되는 도형이라 SVG에 둔다 */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {limit !== undefined && (
              <line
                x1="0"
                x2="100"
                y1={yOf(limit)}
                y2={yOf(limit)}
                className="stroke-amber-500"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            )}
            <polyline
              points={data.map((d, i) => `${xOf(i)},${yOf(d.value)}`).join(' ')}
              fill="none"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="stroke-slate-900"
            />
          </svg>

          {/* 점은 HTML로 얹는다 — SVG를 늘리면 원이 타원이 된다 */}
          {data.map((d, i) => (
            <span
              key={d.period}
              title={`${d.period} · ${d.value}${unit}`}
              style={{ left: `${xOf(i)}%`, top: `${yOf(d.value)}%` }}
              className={`absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${
                limit !== undefined && d.value > limit ? 'bg-rose-600' : 'bg-slate-900'
              }`}
            />
          ))}

          {limit !== undefined && (
            <span
              style={{ top: `${yOf(limit)}%` }}
              className="absolute right-0 -translate-y-full pr-0.5 text-[10px] font-bold text-amber-700"
            >
              관리 기준 {tick(limit)}
              {unit}
            </span>
          )}
        </div>
      </div>

      {/**
       * x축은 칸 가운데가 아니라 **점 자리**에 맞춘다.
       *
       * 두 가지를 손봤다(375폭 스크린샷으로 잡았다).
       *  ① 양 끝 글자는 가운데 정렬하면 화면 밖으로 반쯤 나간다 — 끝은 안쪽으로 붙인다
       *  ② 좁은 화면에서는 글자가 서로 붙는다 — 처음·가운데·끝만 남긴다.
       *     기간을 다 읽어야 하는 사람은 **바로 아래 표**에 전부 있으므로 잃는 것이 없다
       */}
      <div className="relative mt-1 ml-12 h-4">
        {data.map((d, i) => {
          const last = data.length - 1
          const keep = i === 0 || i === last || i === Math.floor(last / 2)
          const anchor =
            i === 0 ? 'translate-x-0' : i === last ? '-translate-x-full' : '-translate-x-1/2'
          return (
            <span
              key={d.period}
              style={{ left: `${xOf(i)}%` }}
              className={`absolute text-[11px] whitespace-nowrap text-slate-500 ${anchor} ${
                keep ? '' : 'hidden sm:inline'
              }`}
            >
              {d.period}
            </span>
          )
        })}
      </div>
    </figure>
  )
}

export function DistributionChart({ data }: { data: DistributionBar[] }) {
  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.count))
  const ticks = ticksOf(max)
  const top = ticks[ticks.length - 1] ?? 1

  return (
    <figure aria-hidden="true" className="mt-2">
      <div className="flex h-56 gap-1">
        <YAxis ticks={ticks} unit="" />
        <div className="relative min-w-0 flex-1">
          <Grid count={ticks.length} />
          {/* 막대는 HTML이면 충분하다 — 늘어나도 찌그러질 것이 없다 */}
          <div className="absolute inset-0 flex items-end gap-1.5">
            {data.map((d) => (
              <div
                key={d.label}
                title={`${d.label} · ${d.count}건`}
                style={{ height: `${(d.count / top) * 100}%` }}
                className="min-h-[2px] flex-1 rounded-t bg-slate-900"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-1 ml-12 flex gap-1.5">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 truncate text-center text-[11px] text-slate-500"
            title={d.label}
          >
            {d.label}
          </span>
        ))}
      </div>
    </figure>
  )
}
