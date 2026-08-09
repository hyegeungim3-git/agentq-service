import { useState } from 'react'
import { INGEST_METHOD_LABEL, failing, silent } from '@entities/datainfra/model'
import { fetchIngestSources, runIngest } from '@shared/api/datainfra'
import { fetchAreas } from '@shared/api/knowledgebase'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'
import { Button } from '@shared/ui/Button'

/**
 * 자동 적재.
 *
 * ⚠️ **스케줄이 도는 것과 문서가 들어오는 것은 다르다.** 스케줄은 초록인데
 * 마지막 실행이 실패했을 수 있고, 성공했는데 0건일 수도 있다. 둘 다 화면이
 * 말하지 않으면 아무도 모른다 — 오류가 사용자에게 보이지 않기 때문이다.
 *
 * 그래서 '정상/실패'만 쓰지 않고 **마지막 실행에서 몇 건 가져왔는지**를 함께 본다.
 */


export function IngestPage() {
/* 이름은 **경계에서 받은 목록**으로 붙인다. fixture를 직접 읽으면 서버가 붙어도
   이 화면만 옛 목록을 쓴다 — 있는 항목을 id로 보여 주거나, 없어진 항목을 이름으로
   보여 주게 된다(AGENTS.md §9) */
  const areas = useRemote(fetchAreas, [])
  const areaName = (id: string): string =>
    (areas.kind === 'ready' ? areas.data.find((a) => a.id === id)?.name : undefined) ?? id
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchIngestSources, [])

  const run = (id: string) => {
    void runIngest(id).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">자동 적재</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        바깥에서 문서를 가져와 지식영역에 넣는 수집기입니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">수집기를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const bad = failing(state.data)
          const quiet = silent(state.data)
          const rest = state.data.filter((s) => !bad.includes(s) && !quiet.includes(s))
          return (
            <>
              {bad.length > 0 && (
                <div className="mt-4 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-black text-rose-900">
                    마지막 수집이 실패한 소스 {bad.length}건
                  </p>
                  <ul className="mt-2 space-y-1">
                    {bad.map((s) => (
                      <li key={s.id} className="text-xs text-rose-800">
                        <b>{s.name}</b> — {s.lastError}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-bold text-rose-900">
                    스케줄은 계속 돌고 있어 목록만 보면 정상으로 보입니다. 사용자에게는 오류가
                    보이지 않고, 그 영역의 문서가 낡아 갑니다.
                  </p>
                </div>
              )}

              {/* 성공했는데 0건 — 조용히 아무것도 안 가져온다 */}
              {quiet.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  성공했지만 한 건도 못 가져온 소스가 {quiet.length}건 있습니다(
                  {quiet.map((s) => s.name).join(', ')}). 원본에 새 문서가 없어서일 수도 있고,
                  가져오는 조건이 잘못됐을 수도 있습니다 — <b>성공 표시만으로는 구분되지
                  않습니다.</b>
                </p>
              )}

              <AdminTable label="자동 적재 소스" minW="min-w-[50rem]" wrap="mt-4">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">소스</th>
                      <th scope="col" className="px-3 py-2">방식</th>
                      <th scope="col" className="px-3 py-2">넣는 곳</th>
                      <th scope="col" className="px-3 py-2">주기</th>
                      <th scope="col" className="px-3 py-2">마지막 실행</th>
                      <th scope="col" className="px-3 py-2">가져온 수</th>
                      <th scope="col" className="px-3 py-2">누적</th>
                      <th scope="col" className="px-3 py-2">조치</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bad.length + quiet.length + rest.length === 0 && (
                      <EmptyRow cols={6}>등록된 적재 소스가 없습니다.</EmptyRow>
                    )}
                    {[...bad, ...quiet, ...rest].map((s) => (
                      <tr
                        key={s.id}
                        className={`border-t border-slate-100 ${
                          s.lastOk ? (s.fetched === 0 ? 'bg-amber-50' : '') : 'bg-rose-50'
                        }`}
                      >
                        <th scope="row" className="px-3 py-2 font-bold text-slate-800 text-left">{s.name}</th>
                        <td className="px-3 py-2 text-slate-600">{INGEST_METHOD_LABEL[s.method]}</td>
                        <td className="px-3 py-2 text-slate-600">{areaName(s.targetAreaId)}</td>
                        <td className="px-3 py-2 text-slate-600">{s.schedule}</td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">
                          {s.lastRunAt}
                          <span
                            className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              s.lastOk ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.lastOk ? '성공' : '실패'}
                          </span>
                        </td>
                        {/* 성공/실패만으로는 아무것도 안 들어온 것을 못 잡는다 */}
                        <td className="px-3 py-2 tabular-nums">
                          <span
                            className={
                              s.fetched === 0 ? 'font-bold text-amber-800' : 'text-slate-700'
                            }
                          >
                            {s.fetched}건
                          </span>
                        </td>
                        <td className="px-3 py-2 tabular-nums text-slate-600">{s.total}건</td>
                        <td className="px-3 py-2">
                          <Button size="sm" onClick={() => run(s.id)}>
                            지금 수집
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>

              <p className="mt-4 max-w-3xl text-xs text-slate-500">
                가져온 문서가 검색까지 가려면 색인을 거쳐야 합니다. 어느 단계에서 떨어졌는지는{' '}
                <b>지식 · RAG &gt; RAG 파이프라인</b>에서 봅니다 — 여기서 가져온 수와 거기서
                검색 가능한 수는 다를 수 있습니다.
              </p>
            </>
          )
        })()}
    </main>
  )
}
