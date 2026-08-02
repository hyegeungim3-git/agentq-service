import {
  byStatus,
  mappingStatusLabel,
  projectedRate,
  standardizedRate,
  unsolvableCount,
  type MappingResult,
  type MappingStatus,
} from '@entities/mapping/model'
import { useMapping, type MappingOptions } from '@features/mapping/useMapping'
import { formatCount } from '@shared/lib/format'

const STATUS_STYLE: Record<MappingStatus, string> = {
  auto: 'bg-emerald-100 text-emerald-800',
  review: 'bg-amber-100 text-amber-800',
  none: 'bg-slate-200 text-slate-700',
}

const FILTERS: { value: MappingStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'auto', label: '자동 확정 가능' },
  { value: 'review', label: '사람 확인 필요' },
  { value: 'none', label: '표준화 불가' },
]

export function MappingPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: MappingOptions }) {
  const m = useMapping(apiOptions ?? {})

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 min-h-11 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              ← 돌아가기
            </button>
          )}
          <h1 className="text-xl font-black text-slate-900">기준정보 표준화 에이전트</h1>
          <p className="mt-1 text-sm text-slate-600">
            설비 태그를 표준 체계로 매핑하고, 어디까지가 자동이고 어디부터 사람이 판단할지 나눕니다.
          </p>
        </header>

        <div className="space-y-5">
          <button
            type="button"
            onClick={() => void m.run()}
            disabled={m.phase.kind === 'running'}
            className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {m.phase.kind === 'running' ? '분석 중…' : '태그 수집·매핑 분석'}
          </button>

          {m.phase.kind === 'running' && (
            <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-700">수집된 태그를 표준 체계와 대조하고 있습니다…</p>
              <div className="mt-3 space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
                ))}
              </div>
            </div>
          )}

          {m.phase.kind === 'failed' && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
              <p className="text-sm font-bold text-rose-800">분석에 실패했습니다</p>
              <p className="mt-1 text-sm text-rose-700">{m.phase.message}</p>
            </div>
          )}

          {m.phase.kind === 'done' && (
            <MappingResultView
              result={m.phase.result}
              filter={m.filter}
              setFilter={m.setFilter}
              applied={m.applied}
              applyAuto={m.applyAuto}
              expanded={m.expanded}
              toggleExpand={m.toggleExpand}
            />
          )}
        </div>
      </div>
    </main>
  )
}

function MappingResultView({
  result,
  filter,
  setFilter,
  applied,
  applyAuto,
  expanded,
  toggleExpand,
}: {
  result: MappingResult
  filter: MappingStatus | 'all'
  setFilter: (f: MappingStatus | 'all') => void
  applied: Set<string>
  applyAuto: () => void
  expanded: string | null
  toggleExpand: (id: string) => void
}) {
  const autoList = byStatus(result, 'auto')
  const shown = filter === 'all' ? result.candidates : byStatus(result, filter)
  const unmatched = result.totalTags - result.standardized
  const unsolvable = unsolvableCount(result)

  return (
    <>
      <section aria-labelledby="map-summary" className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 id="map-summary" className="text-sm font-black text-slate-900">
          표준화 현황
        </h2>

        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['수집 태그', `${formatCount(result.totalTags)}개`],
            ['표준화', `${Math.round(standardizedRate(result) * 100)}%`],
            ['미매칭', `${formatCount(unmatched)}개`],
            ['소요', `${result.elapsedSeconds}초`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-[11px] text-slate-500">{k}</dt>
              <dd className="text-sm font-black text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-600">표준 명명규칙</p>
          <p className="mt-1 font-mono text-sm text-slate-800">{result.namingPattern}</p>
          <p className="mt-0.5 font-mono text-xs text-slate-500">예) {result.namingExample}</p>
        </div>

        {/* AI로 해결되는 것과 아닌 것을 섞으면 계획이 어긋난다 */}
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-bold text-amber-900">
            미매칭 {formatCount(unmatched)}개 중 {formatCount(unsolvable)}개는 AI로 해결되지 않습니다.
          </p>
          <p className="mt-1 text-sm text-amber-900">
            설비·시스템 조치가 선행돼야 하며, 그 전까지 표준화율은{' '}
            {Math.round(((result.totalTags - unsolvable) / result.totalTags) * 100)}%가 상한입니다.
          </p>
        </div>
      </section>

      <section aria-labelledby="map-reasons" className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 id="map-reasons" className="text-sm font-black text-slate-900">
          미매칭 사유
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th scope="col" className="py-2 pr-3 font-bold">사유</th>
                <th scope="col" className="py-2 pr-3 font-bold">건수</th>
                <th scope="col" className="py-2 pr-3 font-bold">AI 처리</th>
                <th scope="col" className="py-2 font-bold">필요한 조치</th>
              </tr>
            </thead>
            <tbody>
              {result.reasons.map((r) => (
                <tr key={r.label} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-3 text-slate-700">{r.label}</td>
                  <td className="py-2 pr-3 tabular-nums text-slate-700">{formatCount(r.count)}</td>
                  {/* 색이 아니라 글자로 구분한다 */}
                  <td className={`py-2 pr-3 font-bold ${r.aiSolvable ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {r.aiSolvable ? '가능' : '불가'}
                  </td>
                  <td className="py-2 text-slate-600">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="map-candidates" className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="map-candidates" className="text-sm font-black text-slate-900">
            매핑 후보
          </h2>
          {/* 목록은 전체가 아니라 예시다 — 7행으로 4,820개를 대표한다고 오해하면 안 된다 */}
          <span className="text-xs text-slate-500">
            예시 {result.candidates.length}건 (자동 {autoList.length} · 확인{' '}
            {byStatus(result, 'review').length} · 불가 {byStatus(result, 'none').length})
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`min-h-11 rounded-full border px-3 text-xs font-bold ${
                filter === f.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={applyAuto}
            disabled={applied.size > 0 || autoList.length === 0}
            className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            자동 확정 {formatCount(result.autoConfirmable)}건 반영
          </button>
          {applied.size > 0 && (
            <p className="text-sm font-bold text-emerald-700">
              {formatCount(result.autoConfirmable)}건 반영 — 표준화{' '}
              {Math.round(standardizedRate(result) * 100)}% →{' '}
              {Math.round(projectedRate(result, result.autoConfirmable) * 100)}%
            </p>
          )}
        </div>

        <ul className="mt-4 space-y-2">
          {shown.map((c) => {
            const isApplied = applied.has(c.id)
            const open = expanded === c.id
            return (
              <li key={c.id} className="rounded-lg border border-slate-200">
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[c.status]}`}>
                    {mappingStatusLabel(c.status)}
                  </span>
                  <span className="font-mono text-xs text-slate-600">{c.source}</span>
                  <span className="text-slate-300">→</span>
                  <span className="font-mono text-xs font-bold text-slate-800">{c.suggested}</span>
                  {c.confidence > 0 && (
                    <span className="text-[11px] text-slate-500">{Math.round(c.confidence * 100)}%</span>
                  )}
                  {isApplied && (
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      반영됨
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleExpand(c.id)}
                    aria-expanded={open}
                    className="ml-auto min-h-11 text-xs font-bold text-slate-500 hover:text-slate-900"
                  >
                    {open ? '근거 닫기' : '근거 보기'}
                  </button>
                </div>

                {open && (
                  <div className="border-t border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">
                      {c.sourceSystem} · {c.standardName}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {c.basis.map((b) => (
                        <li key={b.label} className="text-sm text-slate-700">
                          <span className="font-bold">{b.label} · </span>
                          {b.detail}
                        </li>
                      ))}
                    </ul>

                    {c.alternatives.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-slate-600">다른 후보</p>
                        <ul className="mt-1 space-y-1">
                          {c.alternatives.map((a) => (
                            <li key={a.code} className="text-sm text-slate-600">
                              <span className="font-mono text-xs">{a.code}</span> · {a.name} (
                              {Math.round(a.confidence * 100)}%) — {a.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI가 못 하는 일을 못 한다고 말하는 자리 */}
                    {c.blocker && (
                      <p className="mt-3 rounded border border-rose-200 bg-rose-50 px-2.5 py-2 text-sm font-bold text-rose-900">
                        {c.blocker}
                      </p>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <p className="mt-5 text-xs text-slate-400">
          자동 확정은 신뢰도가 높은 건만 반영됩니다. 확인 필요·불가 건은 담당자 판단이 필요합니다.
        </p>
      </section>
    </>
  )
}
