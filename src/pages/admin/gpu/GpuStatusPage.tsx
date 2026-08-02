import {
  GPU_HOT_CELSIUS,
  GPU_OVERLOAD_UTIL,
  gpuSummary,
  isOverloaded,
  type GpuCard,
  type GpuNode,
} from '@entities/infra/model'
import { fetchGpuNodes } from '@shared/api/infra'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'

/**
 * GPU 현황.
 *
 * 과부하 판정은 화면이 아니라 모델(`isOverloaded`)이 한다. 화면마다 기준을 쓰면
 * 요약 카드의 '과부하 1'과 카드 배지가 서로 다른 기준으로 세어질 수 있다.
 *
 * 판정 기준을 화면에 적는다. '과부하'라고만 하면 무엇을 넘은 것인지 알 수 없다.
 */

const pct = (r: number): string => `${Math.round(r * 100)}%`

function Card({ card }: { card: GpuCard }) {
  const over = isOverloaded(card)
  return (
    <div
      className={`rounded-lg border p-3 ${over ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
    >
      <div className="flex items-center gap-2">
        <p className="text-xs font-black text-slate-900">GPU {card.index}</p>
        {/* 색만으로 알리지 않는다 */}
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
            over ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {over ? '과부하' : '정상'}
        </span>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <dt className="text-slate-500">사용률</dt>
        <dd className="text-right font-bold tabular-nums text-slate-800">{pct(card.utilRatio)}</dd>
        <dt className="text-slate-500">VRAM</dt>
        <dd className="text-right font-bold tabular-nums text-slate-800">{pct(card.vramRatio)}</dd>
        <dt className="text-slate-500">온도</dt>
        <dd
          className={`text-right font-bold tabular-nums ${
            card.celsius >= GPU_HOT_CELSIUS ? 'text-rose-700' : 'text-slate-800'
          }`}
        >
          {card.celsius}°C
        </dd>
        <dt className="text-slate-500">전력</dt>
        <dd className="text-right font-bold tabular-nums text-slate-800">{card.watt}W</dd>
      </dl>
    </div>
  )
}

function NodeBlock({ node }: { node: GpuNode }) {
  const over = node.cards.filter(isOverloaded).length
  return (
    <section aria-labelledby={`gpu-${node.name}`} className="mt-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 id={`gpu-${node.name}`} className="text-sm font-black text-slate-900">
          {node.name}
        </h2>
        <p className="text-xs text-slate-500">
          {node.model} × {node.cards.length} ({node.vramGb}GB)
        </p>
        {over > 0 && (
          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
            과부하 {over}장
          </span>
        )}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {node.cards.map((c) => (
          <Card key={c.index} card={c} />
        ))}
      </div>
    </section>
  )
}

export function GpuStatusPage() {
  const state = useRemote(fetchGpuNodes, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">GPU 현황</h1>
        <ExampleBadge />
      </div>
      {/* '과부하'가 무엇을 넘은 것인지 밝힌다 */}
      <p className="mt-1 text-sm text-slate-600">
        사용률 {Math.round(GPU_OVERLOAD_UTIL * 100)}% 이상 또는 {GPU_HOT_CELSIUS}°C 이상이면
        과부하로 봅니다.
      </p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-5 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">GPU 상태를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'error' && (
        <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {state.message}
        </p>
      )}

      {state.kind === 'ready' &&
        (() => {
          const s = gpuSummary(state.data)
          return (
            <>
              <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">총 GPU</dt>
                  <dd className="text-xl font-black text-slate-900">{s.total}장</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">평균 사용률</dt>
                  <dd className="text-xl font-black text-slate-900">{pct(s.avgUtil)}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">평균 온도</dt>
                  <dd className="text-xl font-black text-slate-900">{s.avgCelsius}°C</dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    s.overloaded > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">과부하</dt>
                  <dd
                    className={`text-xl font-black ${s.overloaded > 0 ? 'text-rose-800' : 'text-slate-900'}`}
                  >
                    {s.overloaded}장
                  </dd>
                </div>
              </dl>

              {state.data.map((n) => (
                <NodeBlock key={n.name} node={n} />
              ))}
            </>
          )
        })()}
    </main>
  )
}
