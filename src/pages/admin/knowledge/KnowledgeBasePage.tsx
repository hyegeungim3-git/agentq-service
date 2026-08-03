import { useState } from 'react'
import {
  INDEX_STATE_LABEL,
  SEARCH_MODE_LABEL,
  SECURITY_LABEL,
  hasGap,
  missing,
  needsReindex,
  notSearchable,
  type IndexState,
} from '@entities/knowledgebase/model'
import { fetchAreas, fetchIndexEntries, fetchRagConfig, runReindex } from '@shared/api/knowledgebase'
import { useRemote } from '@features/remote/useRemote'

/**
 * 지식 관리.
 *
 * 이 화면의 위험은 **목록에 있는데 검색에 안 잡히는 문서**다. '문서 797건 등록'을
 * 보면 다 찾을 수 있다고 믿는데, 색인 실패한 문서는 사용자에게 '그런 문서 없다'는
 * 답으로 돌아온다. 오류가 안 나기 때문에 아무도 모른다.
 *
 * 그래서 등록 건수와 **찾을 수 있는 건수를 따로 센다.** 못 찾는 문서는 왜 못 찾는지
 * 하나하나 적는다 — '몇 건 실패'만으로는 손쓸 수 없다.
 *
 * 재색인이 끝나지 않은 상태도 드러낸다. 옛 설정으로 색인된 문서가 섞여 있으면
 * 검색이 조용히 나빠진다.
 */

type Tab = 'areas' | 'index' | 'config'

const TABS: { id: Tab; label: string }[] = [
  { id: 'areas', label: '지식영역' },
  { id: 'index', label: '못 찾는 문서' },
  { id: 'config', label: 'RAG 설정' },
]

const STATE_TONE: Record<IndexState, string> = {
  indexed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-900',
  failed: 'bg-rose-100 text-rose-800',
  skipped: 'bg-slate-100 text-slate-600',
}

export function KnowledgeBasePage() {
  const [tab, setTab] = useState<Tab>('areas')
  /* 'all'도 문자열이라 별도 타입을 만들지 않는다 */
  const [areaId, setAreaId] = useState('all')
  const [failure, setFailure] = useState<string | null>(null)
  const areas = useRemote(fetchAreas, [])
  const entries = useRemote(() => fetchIndexEntries(areaId), [areaId])
  const config = useRemote(fetchRagConfig, [])

  const reindex = (id: string) => {
    void runReindex(id).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">지식영역</h1>
      <p className="mt-1 text-sm text-slate-600">
        챗봇과 지식 검색이 뒤지는 문서들입니다. 못 찾는 문서가 <b>어느 단계에서 떨어졌는지</b>는{' '}
        <b>RAG 파이프라인</b>에서 봅니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      <div role="tablist" aria-label="지식 관리 항목" className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-full border px-4 text-sm font-bold ${
              tab === t.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'areas' && areas.kind === 'ready' && (
        <section className="mt-4">
          {(() => {
            const registered = areas.data.reduce((n, a) => n + a.registered, 0)
            const searchable = areas.data.reduce((n, a) => n + a.searchable, 0)
            const stale = areas.data.reduce((n, a) => n + a.staleCount, 0)
            const gaps = areas.data.filter(hasGap)
            return (
              <>
                <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <dt className="text-[11px] font-bold text-slate-500">등록 문서</dt>
                    <dd className="text-xl font-black text-slate-900">
                      {registered.toLocaleString('ko-KR')}
                    </dd>
                  </div>
                  {/* 등록 건수만 보면 다 찾을 수 있다고 믿는다 */}
                  <div
                    className={`rounded-xl border p-4 text-center ${
                      registered !== searchable ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <dt className="text-[11px] font-bold text-slate-500">못 찾는 문서</dt>
                    <dd
                      className={`text-xl font-black ${
                        registered !== searchable ? 'text-rose-800' : 'text-slate-900'
                      }`}
                    >
                      {registered - searchable}건
                    </dd>
                  </div>
                  <div
                    className={`rounded-xl border p-4 text-center ${
                      stale > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <dt className="text-[11px] font-bold text-slate-500">색인 뒤 바뀐 문서</dt>
                    <dd className="text-xl font-black text-slate-900">{stale}건</dd>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <dt className="text-[11px] font-bold text-slate-500">지식영역</dt>
                    <dd className="text-xl font-black text-slate-900">{areas.data.length}개</dd>
                  </div>
                </dl>

                {gaps.length > 0 && (
                  <p className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    등록됐지만 검색에 안 잡히는 문서가 <b>{registered - searchable}건</b>,
                    색인 뒤에 바뀐 문서가 <b>{stale}건</b> 있습니다. 사용자에게는 '그런 문서 없다'
                    또는 <b>옛 내용</b>으로 답이 나갑니다 — 오류가 나지 않으므로 화면이 말하지 않으면
                    아무도 모릅니다.
                  </p>
                )}

                <ul className="mt-4 grid gap-3 lg:grid-cols-2">
                  {areas.data.map((a) => {
                    const gap = missing(a)
                    return (
                      <li
                        key={a.id}
                        className={`rounded-xl border p-4 ${
                          hasGap(a) ? 'border-amber-200 bg-white' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-slate-900">{a.name}</p>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                            {SECURITY_LABEL[a.security]}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{a.purpose}</p>
                        <p className="mt-2 text-xs text-slate-700">
                          검색 가능 <b>{a.searchable}</b> / 등록 {a.registered}
                          {gap > 0 && <span className="ml-1 font-bold text-rose-700">· 못 찾음 {gap}건</span>}
                          {a.staleCount > 0 && (
                            <span className="ml-1 font-bold text-amber-800">
                              · 색인 뒤 바뀜 {a.staleCount}건
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">마지막 색인 {a.lastIndexedAt}</p>
                        <button
                          type="button"
                          onClick={() => reindex(a.id)}
                          className="mt-2 min-h-11 rounded-lg border border-slate-300 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                          재색인
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            )
          })()}
        </section>
      )}

      {tab === 'index' && entries.kind === 'ready' && areas.kind === 'ready' && (
        <section className="mt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="kb-area" className="block text-[11px] font-bold text-slate-500">
                지식영역
              </label>
              <select
                id="kb-area"
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="mt-1 min-h-11 rounded-lg border border-slate-300 px-2 text-sm"
              >
                <option value="all">전체</option>
                {areas.data.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* '몇 건 실패'만으로는 손쓸 수 없다 */}
          <p className="mt-3 text-xs text-slate-600">
            {entries.data.length}건 · 실패{' '}
            {entries.data.filter((e) => e.state === 'failed').length}건 · 대기{' '}
            {entries.data.filter((e) => e.state === 'pending').length}건 · 제외{' '}
            {entries.data.filter((e) => e.state === 'skipped').length}건
          </p>

          {entries.data.length === 0 ? (
            <p className="mt-2 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              이 영역은 등록된 문서를 모두 찾을 수 있습니다.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {notSearchable(entries.data).map((e) => (
                <li
                  key={e.id}
                  className={`rounded-xl border p-3 ${
                    e.state === 'failed' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${STATE_TONE[e.state]}`}>
                      {INDEX_STATE_LABEL[e.state]}
                    </span>
                    <p className="text-sm font-bold text-slate-800">{e.title}</p>
                    <span className="ml-auto text-[11px] text-slate-400">{e.updatedOn}</span>
                  </div>
                  {/* 왜 못 찾는지 하나하나 적는다 */}
                  {e.reason && <p className="mt-1 text-xs text-slate-700">{e.reason}</p>}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 max-w-3xl text-xs text-slate-500">
            '제외'는 일부러 뺀 것이고 '실패'는 넣으려다 못 넣은 것입니다. 둘을 한 칸에 세면
            고쳐야 할 것과 그냥 둬도 되는 것이 섞입니다.
          </p>
        </section>
      )}

      {tab === 'config' && config.kind === 'ready' && (
        <section className="mt-4 max-w-2xl">
          {/* 오류가 안 나기 때문에 화면이 말하지 않으면 아무도 모른다 */}
          {needsReindex(config.data) && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              설정이 바뀐 뒤 재색인이 <b>{Math.round(config.data.reindexedRatio * 100)}%</b>에서 멈춰
              있습니다. 나머지 {Math.round((1 - config.data.reindexedRatio) * 100)}%는 옛 설정으로
              색인된 채 섞여 있어 <b>검색 품질이 조용히 나빠집니다</b> — 오류가 나지 않으므로 알아채기
              어렵습니다.
            </p>
          )}

          <dl className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2">
              <dt className="text-xs font-bold text-slate-500">임베딩 모델</dt>
              <dd className="text-xs font-black text-slate-900">{config.data.embeddingModel}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2">
              <dt className="text-xs font-bold text-slate-500">청크 길이 / 겹침</dt>
              <dd className="text-xs font-black text-slate-900">
                {config.data.chunkSize}자 / {config.data.chunkOverlap}자
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2">
              <dt className="text-xs font-bold text-slate-500">검색 방식</dt>
              <dd className="text-xs font-black text-slate-900">
                {SEARCH_MODE_LABEL[config.data.searchMode]}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 py-2">
              <dt className="text-xs font-bold text-slate-500">가져오는 문단 수</dt>
              <dd className="text-xs font-black text-slate-900">{config.data.topK}개</dd>
            </div>
          </dl>

          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            임베딩 모델이나 청크 길이를 바꾸면 <b>전체를 다시 색인해야 합니다.</b> 옛 벡터와 새 벡터를
            섞어 두면 같은 질문에 다른 문단이 잡히고, 그게 왜인지 알 수 없게 됩니다. 설정 변경은
            서버가 붙은 뒤에 열립니다.
          </p>
        </section>
      )}
    </main>
  )
}
