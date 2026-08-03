import { useState } from 'react'
import {
  PACK_ITEMS,
  PACK_ITEM_LABEL,
  REQUIRED_ITEMS,
  meetsMinimum,
  packMissing,
  packRatio,
} from '@entities/packops/model'
import { createPack, fetchPacks } from '@shared/api/packops'
import { withSubject } from '@shared/lib/korean'
import { useRemote } from '@features/remote/useRemote'

/**
 * 도메인 팩 스튜디오.
 *
 * 애플리케이션 화면의 '발주처별 노출'과 짝이다 — 저기는 결과(0종), 여기는
 * **이유**(무엇이 비었나). 두 화면이 같은 사실을 다른 각도에서 말한다.
 *
 * ⚠️ **채움 비율만 보여 주지 않는다.** '67% 준비'는 무엇을 더 해야 하는지 알려
 * 주지 않는다. 비어 있는 항목을 이름으로 적고, 그중 **포털에 들어가려면 반드시
 * 필요한 것**을 따로 표시한다.
 */

export function PackStudioPage() {
  const [name, setName] = useState('')
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchPacks, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    void createPack(name).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">도메인 팩 스튜디오</h1>
      <p className="mt-1 text-sm text-slate-600">
        발주처별 업무 데이터입니다. 여기가 채워져야 사용자 포털에서 그 발주처를 고를 수 있습니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">팩 목록을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const usable = state.data.filter((p) => p.usable)
          /* 거의 다 된 것부터 — 무엇을 먼저 해야 하는지 알려면 순서가 중요하다 */
          const sorted = [...state.data].sort((a, b) => packRatio(b) - packRatio(a))
          return (
            <>
              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">등록 팩</dt>
                  <dd className="text-xl font-black text-slate-900">{state.data.length}개</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">포털에서 선택 가능</dt>
                  <dd className="text-xl font-black text-slate-900">{usable.length}개</dd>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <dt className="text-[11px] font-bold text-amber-900">준비 중</dt>
                  <dd className="text-xl font-black text-amber-900">
                    {state.data.length - usable.length}개
                  </dd>
                </div>
              </dl>

              <ul aria-label="발주처 팩" className="mt-4 grid gap-3 lg:grid-cols-2">
                {sorted.map((p) => {
                  const gaps = packMissing(p)
                  const blockers = gaps.filter((k) => REQUIRED_ITEMS.includes(k))
                  return (
                    <li
                      key={p.domainId}
                      className={`rounded-xl border p-4 ${
                        p.usable ? 'border-slate-200 bg-white' : 'border-amber-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-slate-900">{p.orgName}</p>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {p.sector}
                        </span>
                        {/* 색만으로 알리지 않는다 */}
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                            p.usable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {p.usable ? '포털에서 선택 가능' : '포털에서 못 고름'}
                        </span>
                        <span className="ml-auto text-xs font-black tabular-nums text-slate-700">
                          {p.filled.length} / {PACK_ITEMS.length}
                        </span>
                      </div>

                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${p.usable ? 'bg-slate-800' : 'bg-amber-500'}`}
                          style={{ width: `${(packRatio(p) * 100).toFixed(0)}%` }}
                        />
                      </div>

                      {/* 비율만 보여 주면 무엇을 더 해야 하는지 알 수 없다 */}
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {PACK_ITEMS.map((k) => {
                          const has = p.filled.includes(k)
                          const required = REQUIRED_ITEMS.includes(k)
                          return (
                            <li
                              key={k}
                              className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                                has
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : required
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {PACK_ITEM_LABEL[k]}
                              {has ? '' : required ? ' 없음(필수)' : ' 없음'}
                            </li>
                          )
                        })}
                      </ul>

                      {!meetsMinimum(p) && (
                        <p className="mt-2 text-xs font-bold text-rose-800">
                          {/* '문서이(가)'처럼 괄호로 얼버무리지 않는다 — 받침으로 고른다 */}
                          {withSubject(blockers.map((k) => PACK_ITEM_LABEL[k]).join(', '))} 없어
                          포털에서 고를 수 없습니다. 이게 없으면 다른 발주처의 자료가 그대로
                          보입니다.
                        </p>
                      )}
                      {meetsMinimum(p) && !p.usable && (
                        <p className="mt-2 text-xs text-amber-800">
                          필수 항목은 채워졌지만 아직 열지 않았습니다. 남은 것 ·{' '}
                          {gaps.map((k) => PACK_ITEM_LABEL[k]).join(', ')}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>

              <form onSubmit={submit} className="mt-5 max-w-xl rounded-xl border border-slate-200 bg-white p-4">
                <label htmlFor="pack-name" className="block text-[11px] font-bold text-slate-500">
                  새 발주처 이름
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <input
                    id="pack-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 한울에너지공사"
                    className="min-h-11 min-w-48 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={name.trim() === ''}
                    className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    팩 만들기
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  이름만으로는 팩이 되지 않습니다. 업무 문서와 조직 정보를 올려야 포털에서 고를 수
                  있습니다.
                </p>
              </form>
            </>
          )
        })()}
    </main>
  )
}
