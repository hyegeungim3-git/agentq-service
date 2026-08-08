import {
  RELEVANCE_LABEL,
  onlyFarBenchmarks,
  type Benchmark,
} from '@entities/datainfra/model'
import { fetchBenchmarkRuns, fetchBenchmarks } from '@shared/api/datainfra'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'

/**
 * 평가 지표 (벤치마크).
 *
 * ⚠️ **점수가 높다고 우리 업무를 잘한다는 뜻이 아니다.** MTEB는 공개 문서 검색을,
 * KorQuAD는 위키 독해를 잰다. 점수만 나란히 세우면 위키 독해를 잘하는 모델을
 * 사내 문서 QA용으로 고르게 된다.
 *
 * 그래서 **벤치마크가 무엇을 재는지와 우리 업무와 얼마나 가까운지**를 점수보다
 * 먼저 말하고, 업무와 다른 벤치마크로만 잰 모델을 따로 드러낸다.
 *
 * 모델 평가 화면과 나누는 기준: 저기는 **우리 평가셋** 결과(학습셋 겹침 판정 포함),
 * 여기는 **공개 벤치마크**다.
 */

const pct = (r: number): string => `${(r * 100).toFixed(1)}%`

const TONE: Record<Benchmark['relevance'], string> = {
  close: 'bg-emerald-100 text-emerald-800',
  partial: 'bg-amber-100 text-amber-900',
  far: 'bg-slate-200 text-slate-600',
}

export function BenchmarkPage() {
  const benchmarks = useRemote(fetchBenchmarks, [])
  const runs = useRemote(fetchBenchmarkRuns, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">평가 지표</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        공개 벤치마크 점수입니다. 우리 평가셋 결과는 <b>인프라 · 개발 &gt; 모델 평가</b>에서
        봅니다.
      </p>

      {benchmarks.kind === 'ready' && runs.kind === 'ready' && (
        <>
          {(() => {
            const models = [...new Set(runs.data.map((r) => r.modelName))]
            const risky = models.filter((m) => onlyFarBenchmarks(runs.data, benchmarks.data, m))
            return (
              risky.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    업무와 다른 벤치마크로만 잰 모델 {risky.length}종
                  </p>
                  <p className="mt-1 text-xs text-rose-800">
                    {risky.join(', ')} — 점수는 있지만 <b>사내 문서 QA를 잘한다는 근거가 되지
                    않습니다.</b> 배포 판단에 쓰려면 사내 평가셋으로 다시 재야 합니다.
                  </p>
                </div>
              )
            )
          })()}

          {/* 무엇을 재는 지표인지 점수보다 먼저 */}
          <section aria-labelledby="what" className="mt-5">
            <h2 id="what" className="text-sm font-black text-slate-900">
              이 지표들이 무엇을 재는가
            </h2>
            <ul className="mt-2 grid gap-2 lg:grid-cols-2">
              {benchmarks.data.map((b) => (
                <li key={b.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-slate-900">{b.name}</p>
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TONE[b.relevance]}`}>
                      {RELEVANCE_LABEL[b.relevance]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{b.measures}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{b.relevanceNote}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="runs" className="mt-6">
            <h2 id="runs" className="text-sm font-black text-slate-900">
              평가 실행 기록
            </h2>
            <AdminTable label="모델 평가 실행 결과" minW="min-w-[48rem]">
                <thead className="bg-slate-50 text-[11px] text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-2">실행</th>
                    <th scope="col" className="px-3 py-2">모델</th>
                    <th scope="col" className="px-3 py-2">지표</th>
                    <th scope="col" className="px-3 py-2">업무 근접도</th>
                    <th scope="col" className="px-3 py-2">점수</th>
                    <th scope="col" className="px-3 py-2">표본</th>
                    <th scope="col" className="px-3 py-2">소요</th>
                  </tr>
                </thead>
                <tbody>
            {runs.data.length === 0 && (
              <EmptyRow cols={7}>평가를 실행한 적이 없습니다.</EmptyRow>
            )}
                  {runs.data.map((r) => {
                    const b = benchmarks.data.find((x) => x.id === r.benchmarkId)
                    return (
                      <tr key={r.id} className="border-t border-slate-100">
                        <th scope="row" className="px-3 py-2 font-mono text-[11px] font-bold text-slate-800 text-left">
                          {r.id}
                        </th>
                        <td className="px-3 py-2 text-slate-700">
                          {r.modelName}
                          <span className="ml-1 font-mono text-[11px] text-slate-500">
                            {r.modelVersion}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{b?.name ?? r.benchmarkId}</td>
                        <td className="px-3 py-2">
                          {b && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TONE[b.relevance]}`}
                            >
                              {RELEVANCE_LABEL[b.relevance]}
                            </span>
                          )}
                        </td>
                        {/* 안 끝난 실행의 0을 점수로 그리면 최악으로 읽힌다 */}
                        <td className="px-3 py-2 tabular-nums font-black text-slate-900">
                          {r.state === 'done' ? (
                            pct(r.score)
                          ) : (
                            <span className="font-normal text-amber-800">
                              {r.state === 'running' ? '실행 중' : '실패'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">
                          {r.samples.toLocaleString('ko-KR')}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">{r.elapsed}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </AdminTable>
          </section>

          <p className="mt-4 max-w-3xl text-xs text-slate-500">
            서로 다른 지표의 점수를 나란히 두고 비교하지 마십시오. 재는 것이 다르면 큰 숫자가
            더 나은 모델이라는 뜻이 아닙니다 — 같은 지표 안에서만 비교할 수 있습니다.
          </p>
        </>
      )}
    </main>
  )
}
