import type { QueryResult } from '@entities/dataquery/model'
import { useDataQuery, type DataQueryOptions } from '@features/dataquery/useDataQuery'
import { AgentPageHeader, ResultSection } from '@widgets/agent-shell/AgentShell'
import { Play } from 'lucide-react'

/**
 * 데이터 조회는 질문 입력형이라 AgentShell을 쓰지 않는다(내규 조회와 같은 이유).
 */
export function DataQueryPage({
  onBack,
  apiOptions,
}: {
  onBack?: () => void
  apiOptions?: DataQueryOptions
}) {
  const q = useDataQuery(apiOptions ?? {})

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <AgentPageHeader
          agentId="dbquery"
          title="데이터 조회 에이전트"
          desc={
            <>
              자연어를 SQL로 바꿔 조회하고, AI가 무엇을 가정했는지 함께 보여 줍니다.
            </>
          }
          onBack={onBack}
        />

        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <fieldset>
              <legend className="text-sm font-black text-slate-900">1 · 데이터 소스</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {q.sources.map((s) => (
                  <label
                    key={s.code}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand-soft"
                  >
                    <input
                      type="radio"
                      name="source"
                      value={s.code}
                      checked={q.source === s.code}
                      onChange={() => q.changeSource(s.code)}
                      className="size-4"
                    />
                    <span className="text-sm font-bold text-slate-800">{s.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <label htmlFor="question" className="block text-sm font-black text-slate-900">
              2 · 무엇을 조회할까요?
            </label>
            <textarea
              id="question"
              value={q.question}
              onChange={(e) => q.setQuestion(e.target.value)}
              rows={2}
              className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </section>

          <button
            type="button"
            onClick={() => void q.run()}
            disabled={!q.canRun || q.phase.kind === 'running'}
            className="bg-brand text-brand-fg flex min-h-11 items-center gap-2 rounded-lg px-5 text-sm font-bold shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="size-4" aria-hidden="true" />
            {q.phase.kind === 'running' ? '조회 중…' : '조회 실행'}
          </button>

          {/* 알림 자리는 **처음부터 있어야 한다.** 실행하는 순간 비로소 만들어지는
              라이브 리전은 낭독기가 첫 변화를 놓치는 경우가 있다. 자리는 늘 두고
              내용만 채우고, 보이는 카드는 같은 말을 두 번 읽히지 않게 내린다 */}
          <p role="status" aria-live="polite" className="sr-only">
            {q.phase.kind === 'running' ? '질의를 SQL로 변환해 조회하고 있습니다' : ''}
          </p>

          {q.phase.kind === 'running' && (
            <div aria-hidden="true" className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-700">질의를 SQL로 변환해 조회하고 있습니다…</p>
              <div className="mt-3 space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
                ))}
              </div>
            </div>
          )}

          {q.phase.kind === 'failed' && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
              <p className="text-sm font-bold text-rose-800">조회에 실패했습니다</p>
              <p className="mt-1 text-sm text-rose-700">{q.phase.message}</p>
            </div>
          )}

          {q.phase.kind === 'done' && (
            <QueryResultView
              result={q.phase.result}
              sourceLabel={
                q.sources.find((s) => s.code === q.source)?.label ?? q.phase.result.source
              }
            />
          )}
        </div>
      </div>
    </main>
  )
}

function QueryResultView({ result, sourceLabel }: { result: QueryResult; sourceLabel: string }) {
  return (
    <>
      <ResultSection
        id="query-rows"
        title={`조회 결과 — ${sourceLabel} ${result.rows.length}건`}
        stats={[
          ['조회 건수', `${result.rows.length}건`],
          ['소요', `${result.elapsedSeconds}초`],
        ]}
      >
        <div className="overflow-x-auto" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
          <table className="w-full min-w-[30rem] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                {result.columns.map((c) => (
                  <th key={c.key} scope="col" className={`py-2 pr-3 font-bold ${c.numeric ? 'text-right' : ''}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  {result.columns.map((c, ci) => {
                    const cls = `py-2 pr-3 ${c.numeric ? 'text-right tabular-nums text-slate-700' : 'text-slate-600'}`
                    const cell = row[c.key] ?? '-'
                    /* 첫 칸만 행 머리글이다. 여기는 칸을 반복해서 그리므로 자리를
                       봐야 첫 칸을 안다 — 전부 머리글로 만들면 낭독기가 값마다
                       자기 값을 머리글로 다시 읽는다 */
                    return ci === 0 ? (
                      <th key={c.key} scope="row" className={`${cls} text-left font-normal`}>
                        {cell}
                      </th>
                    ) : (
                      <td key={c.key} className={cls}>
                        {cell}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ResultSection>

      {/* 이 절이 이 에이전트의 값어치다 — 말없이 가정하면 틀린 수치를 맞다고 믿는다 */}
      <ResultSection
        id="query-basis"
        title="질의 해석 근거"
        notice="AI가 생성한 조회입니다. 수치를 인용하기 전 가정과 주의 사항을 확인하십시오."
      >
        <div className="overflow-x-auto" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
          <table className="w-full min-w-[26rem] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th scope="col" className="py-2 pr-3 font-bold">입력한 표현</th>
                <th scope="col" className="py-2 pr-3 font-bold">컬럼</th>
                <th scope="col" className="py-2 font-bold">조건</th>
              </tr>
            </thead>
            <tbody>
              {result.terms.map((t) => (
                <tr key={t.phrase} className="border-b border-slate-100 last:border-0">
                  <th scope="row" className="py-2 pr-3 text-left font-normal text-slate-700">
                    {t.phrase}
                  </th>
                  <td className="py-2 pr-3 font-mono text-xs text-slate-600">{t.column}</td>
                  <td className="py-2 font-mono text-xs text-slate-600">
                    {t.operator} {t.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result.assumptions.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <h3 className="text-xs font-bold text-amber-900">질의에 없어 AI가 가정한 조건</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-amber-900">
              {result.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {result.unmapped.length > 0 && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
            <h3 className="text-xs font-bold text-rose-900">변환하지 못한 표현</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-rose-900">
              {result.unmapped.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-bold text-slate-600">생성된 SQL 보기</summary>
          <pre tabIndex={0} className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
            {result.sql}
          </pre>
        </details>

        {result.cautions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-600">결과 해석 시 주의</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {result.cautions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}

      </ResultSection>
    </>
  )
}
