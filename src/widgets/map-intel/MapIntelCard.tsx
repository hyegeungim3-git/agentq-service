import { useId, useState } from 'react'
import { topicParticle } from '@shared/lib/korean'
import {
  averageValue,
  intensity,
  needsAttention,
  withData,
  withoutData,
  type MapIntel,
  type SiteMetric,
} from '@entities/mapintel/model'

/**
 * 지도 인텔리전스 카드.
 *
 * 지도처럼 보이는데 위치가 틀리면 그게 제일 위험하다. 지리 좌표가 없으므로
 * **'배치 도식'이라고 먼저 말한다.**
 *
 * 값이 없는 사업장을 빼지 않는다 — 빼면 남은 것이 전부인 줄 알게 된다.
 * 빈칸으로 그리고 왜 없는지 말한다. 평균도 값이 있는 곳만 센 것이라고 밝힌다.
 *
 * 색만으로 알리지 않는다. 조치가 필요한 칸은 색과 함께 테두리·라벨로도 표시한다.
 *
 * ⚠️ 라벨은 **지표 방향에 따라 뒤집힌다.** '미달'로만 적어 두면 기준을 넘어서
 * 문제인 지표(병상 가동률·민원 접수)에 뜻이 정반대인 말이 붙는다.
 */

const COLS = 3
const ROWS = 3

/** 조치가 필요한 상태를 뭐라고 부르는가 — 방향이 반대면 말도 반대다 */
const attentionLabel = (m: MapIntel): string => (m.lowerIsWorse ? '기준 미달' : '기준 초과')

function Sparkline({ trend, low }: { trend: number[]; low: boolean }) {
  if (trend.length < 2) return null
  const min = Math.min(...trend)
  const max = Math.max(...trend)
  const span = max - min || 1
  const pts = trend
    .map((v, i) => {
      const x = (i / (trend.length - 1)) * 100
      const y = 24 - ((v - min) / span) * 22
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="h-6 w-full" aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        className={low ? 'stroke-rose-600' : 'stroke-slate-500'}
      />
    </svg>
  )
}

function Tile({
  site,
  map,
  selected,
  onSelect,
}: {
  site: SiteMetric
  map: MapIntel
  selected: boolean
  onSelect: () => void
}) {
  const value = site.value
  const attention =
    value !== null && (map.lowerIsWorse ? value < map.threshold : value > map.threshold)
  /* 진하기를 세게 주면 라이트에서 진한 칸의 글자가 안 읽힌다.
     범위를 좁게 잡아 어느 쪽 스킨에서도 글자 대비가 남게 한다 */
  const alpha = value === null ? 0 : 6 + intensity(map, value) * 26

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-20 flex-col justify-between rounded-lg border p-2 text-left transition ${
        selected ? 'border-slate-900 ring-2 ring-slate-900' : 'border-slate-200'
      } ${value === null ? 'border-dashed bg-slate-50' : 'hover:border-slate-400'}`}
      /* 색을 직접 쓰지 않고 팔레트 변수를 섞는다 — 다크 스킨에서 함께 뒤집힌다.
         고정 rgb를 쓰면 어두운 배경 위에 어두운 칸이 얹혀 안 보인다 */
      style={
        value === null
          ? undefined
          : {
              backgroundColor: `color-mix(in oklab, var(--color-${
                attention ? 'rose-600' : 'slate-900'
              }) ${alpha.toFixed(0)}%, transparent)`,
            }
      }
    >
      <span className="text-[11px] font-bold text-slate-700">{site.name}</span>
      {value !== null ? (
        <span className="text-sm font-black tabular-nums text-slate-900">
          {value.toFixed(1)}
          <span className="ml-0.5 text-[10px] font-bold text-slate-500">{map.unit}</span>
        </span>
      ) : (
        /* 값이 없는 칸을 0으로 그리면 '가동률 0%'로 읽힌다 */
        <span className="text-[11px] font-bold text-slate-400">값 없음</span>
      )}
      {attention && (
        <span className="text-[10px] font-bold text-rose-700">{attentionLabel(map)}</span>
      )}
    </button>
  )
}

export function MapIntelCard({ map }: { map: MapIntel }) {
  const headingId = useId()
  const has = withData(map)
  const missing = withoutData(map)
  const attention = needsAttention(map)
  const avg = averageValue(map)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = map.sites.find((s) => s.id === selectedId) ?? null

  return (
    <section
      aria-labelledby={headingId}
      className="mt-3 rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={headingId} className="text-sm font-black text-slate-900">
          {map.siteLabel}별 {map.metricLabel}
        </h3>
        {/* 지리 좌표가 아니라는 사실을 그림보다 먼저 */}
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
          배치 도식 — 실제 지리 좌표 아님
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{map.period}</p>

      <div
        className="mt-3 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const col = (i % COLS) + 1
          const row = Math.floor(i / COLS) + 1
          const site = map.sites.find((s) => s.col === col && s.row === row)
          if (!site) return <div key={`empty-${String(i)}`} aria-hidden="true" />
          return (
            <Tile
              key={site.id}
              site={site}
              map={map}
              selected={site.id === selectedId}
              onSelect={() => setSelectedId(site.id === selectedId ? null : site.id)}
            />
          )
        })}
      </div>

      {selected && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-900">
            {selected.name} · {selected.region}
          </p>
          {selected.value === null ? (
            <p className="mt-1 text-xs text-rose-800">값 없음 — {selected.missingReason}</p>
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-600">
                최근 추이 · {selected.trend[0]?.toFixed(1)}
                {map.unit} → {selected.value.toFixed(1)}
                {map.unit}
              </p>
              <Sparkline
                trend={selected.trend}
                low={map.lowerIsWorse ? selected.value < map.threshold : selected.value > map.threshold}
              />
            </>
          )}
        </div>
      )}

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-[10px] font-bold text-slate-500">수집 {map.siteLabel}</dt>
          <dd className="text-sm font-black text-slate-900">
            {has.length} / {map.sites.length}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-[10px] font-bold text-slate-500">평균({map.unit})</dt>
          <dd className="text-sm font-black text-slate-900">{avg === null ? '—' : avg.toFixed(1)}</dd>
        </div>
        <div className="rounded-lg bg-rose-50 p-2">
          <dt className="text-[10px] font-bold text-rose-700">{attentionLabel(map)}</dt>
          <dd className="text-sm font-black text-rose-800">{attention.length}곳</dd>
        </div>
      </dl>

      {/* 평균이 전사 평균으로 읽히면 안 된다 */}
      {missing.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-bold text-amber-900">
            {missing.length}개 {map.siteLabel}
            {topicParticle(map.siteLabel)} 값이 없어 평균에서 빠졌습니다 — 전체 평균이 아닙니다
          </p>
          <ul className="mt-1 space-y-0.5">
            {missing.map((s) => (
              <li key={s.id} className="text-[11px] text-amber-800">
                {s.name} · {s.missingReason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
