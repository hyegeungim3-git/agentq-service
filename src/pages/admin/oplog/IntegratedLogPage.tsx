import { useState } from 'react'
import { OPLOG_KINDS, OPLOG_KIND_LABEL, type OpLogKind } from '@entities/oplog/model'
import { exportLogsCsv, fetchOpLogs } from '@shared/api/oplog'
import { useRemote } from '@features/remote/useRemote'

/**
 * 통합 로그 관리.
 *
 * **추출·출력 로그를 첫 탭에 둔다.** 문서가 밖으로 나간 기록은 감사에서 가장 먼저
 * 보는 것이다. 접속 로그 뒤에 묻어 두면 찾아 들어가야 한다.
 *
 * 접속 로그는 사용자 관리 > 접근 로그와 **같은 데이터**다. 화면이 둘인 이유를
 * 적어 두지 않으면 어느 쪽이 진짜인지 헷갈린다.
 *
 * 질의 이력에는 본문이 없다 — 다른 두 화면과 같은 기준이다.
 */

const NOTE: Partial<Record<OpLogKind, string>> = {
  export: '문서가 밖으로 나간 기록입니다. 감사에서 가장 먼저 보는 항목이라 앞에 둡니다.',
  access:
    '사용자 관리 > 접근 로그와 같은 데이터입니다. 저기서는 계정 관점으로 거부된 접근을 먼저 보고, 여기서는 운영 관점으로 종류별로 훑습니다.',
  query: '질의 본문은 남기지 않습니다 — 접근 로그·이용 이력과 같은 기준입니다.',
}

export function IntegratedLogPage() {
  const [kind, setKind] = useState<OpLogKind>('export')
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(() => fetchOpLogs(kind), [kind])

  const csv = () => {
    void exportLogsCsv(kind).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-black text-slate-900">통합 로그 관리</h1>
        <button
          type="button"
          onClick={csv}
          className="ml-auto min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          CSV 내보내기
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-600">추출·접속·작업·질의 기록을 한자리에서 봅니다.</p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      <div role="tablist" aria-label="로그 종류" className="mt-4 flex flex-wrap gap-2">
        {OPLOG_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
            className={`min-h-11 rounded-full border px-4 text-sm font-bold ${
              kind === k
                ? 'border-slate-900 bg-brand text-brand-fg'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {OPLOG_KIND_LABEL[k]}
          </button>
        ))}
      </div>

      {/* 왜 이 탭이 여기 있는지 말한다 */}
      {NOTE[kind] && (
        <p className="mt-3 max-w-3xl rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
          {NOTE[kind]}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">로그를 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' && (
        <>
          <p className="mt-4 text-xs text-slate-600">{state.data.length}건</p>
          <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
            <table className="w-full min-w-[46rem] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">일시</th>
                  <th scope="col" className="px-3 py-2">사용자</th>
                  <th scope="col" className="px-3 py-2">IP</th>
                  <th scope="col" className="px-3 py-2">행위</th>
                  <th scope="col" className="px-3 py-2">상세</th>
                </tr>
              </thead>
              <tbody>
                {state.data.map((e) => (
                  <tr key={e.id} className={`border-t border-slate-100 ${e.sensitive ? 'bg-amber-50' : ''}`}>
                    <td className="px-3 py-2 tabular-nums text-slate-600">{e.at}</td>
                    <td className="px-3 py-2">
                      <span className="font-bold text-slate-800">{e.actor}</span>
                      {e.dept !== '—' && <span className="ml-1 text-slate-500">{e.dept}</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{e.ip}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {e.action}
                      {e.sensitive && (
                        <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                          반출
                        </span>
                      )}
                    </td>
                    {/* 남기지 않는 것을 빈칸으로 두면 못 적은 것으로 읽힌다 */}
                    <td className="px-3 py-2 text-slate-600">
                      {e.detail ?? <span className="text-slate-400">본문 미보관</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}
