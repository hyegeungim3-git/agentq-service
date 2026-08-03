import { useState } from 'react'
import { APP_KINDS, APP_KIND_LABEL, down, unused, type AppKind } from '@entities/appinst/model'
import { fetchAppInstances, setInstanceLive } from '@shared/api/appinst'
import { useRemote } from '@features/remote/useRemote'

/**
 * 앱 인스턴스.
 *
 * 애플리케이션 화면과 나누는 기준: 저기는 **묶음**(사용자 포털·관리자·모바일),
 * 여기는 사람들이 그 안에 만든 **개별 앱**이다. 묶음이 열려 있어도 개별 앱은
 * 꺼져 있을 수 있다.
 *
 * 이전 데모는 채팅·보고서·데이터 분석을 메뉴 셋으로 나눠 뒀다. 화면이 같은
 * 모양이라 하나로 두고 **유형 필터**를 뒀다 — 같은 표를 세 벌 만들지 않는다.
 *
 * **내려간 앱은 왜 내렸는지 남긴다.** 이유가 없으면 다시 올려도 되는지 모르고,
 * 결국 아무도 안 건드린 채 남는다.
 */

export function AppInstancePage() {
  const [kind, setKind] = useState<AppKind | 'all'>('all')
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchAppInstances, [])

  const toggle = (id: string, live: boolean) => {
    void setInstanceLive(id, live).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">앱 인스턴스</h1>
      <p className="mt-1 text-sm text-slate-600">
        사람들이 만든 개별 앱입니다. 앱 묶음(포털·관리자·모바일)은{' '}
        <b>AI 서비스 &gt; 애플리케이션</b>에서 봅니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', ...APP_KINDS] as const).map((k) => (
          <label
            key={k}
            className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
          >
            <input
              type="radio"
              name="app-kind"
              value={k}
              checked={kind === k}
              onChange={() => setKind(k)}
              className="sr-only"
            />
            {k === 'all' ? '전체' : APP_KIND_LABEL[k]}
          </label>
        ))}
      </div>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">앱 목록을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const all = state.data
          const shown = kind === 'all' ? all : all.filter((a) => a.kind === kind)
          const offline = down(shown)
          const idle = unused(shown)
          const rest = shown.filter((a) => !offline.includes(a) && !idle.includes(a))
          return (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">앱</dt>
                  <dd className="text-xl font-black text-slate-900">{shown.length}개</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">열림</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {shown.filter((a) => a.live).length}개
                  </dd>
                </div>
                <div
                  className={`rounded-xl border p-4 text-center ${
                    offline.length > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">내려감</dt>
                  <dd className="text-xl font-black text-slate-900">{offline.length}개</dd>
                </div>
                {/* 0건은 '문제 없음'이 아니라 아무도 안 쓴다는 뜻이다 */}
                <div
                  className={`rounded-xl border p-4 text-center ${
                    idle.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">열렸는데 7일간 0건</dt>
                  <dd className="text-xl font-black text-slate-900">{idle.length}개</dd>
                </div>
              </dl>

              {idle.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  {idle.map((a) => a.title).join(', ')}는 열려 있지만 7일 동안 한 번도 쓰이지
                  않았습니다. 만들어 두고 잊힌 앱도 계속 자원을 잡고 답을 내놓습니다 — 쓸지 내릴지
                  정해야 합니다.
                </p>
              )}

              <ul aria-label="앱 인스턴스" className="mt-4 space-y-3">
                {[...offline, ...idle, ...rest].map((a) => (
                  <li
                    key={a.id}
                    className={`rounded-xl border p-4 ${
                      a.live ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-slate-900">{a.title}</p>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {APP_KIND_LABEL[a.kind]}
                      </span>
                      {/* 색만으로 알리지 않는다 */}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          a.live ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {a.live ? '열림' : '내려감'}
                      </span>
                      <span className="ml-auto text-[11px] text-slate-500">
                        {a.owner} · {a.group}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      7일 사용{' '}
                      {a.uses7d === 0 ? (
                        <span className="font-bold text-amber-800">0건</span>
                      ) : (
                        <span className="font-bold text-slate-800">{a.uses7d}건</span>
                      )}{' '}
                      · 만든 날 {a.createdOn} · <span className="font-mono">{a.id}</span>
                    </p>

                    {/* 이유가 없으면 다시 올려도 되는지 모른다 */}
                    {a.downReason && (
                      <p className="mt-2 rounded-lg bg-white p-2 text-xs text-rose-800">
                        내린 이유 · {a.downReason}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => toggle(a.id, !a.live)}
                      className="mt-2 min-h-11 rounded-lg border border-slate-300 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {a.live ? '내리기' : '올리기'}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )
        })()}
    </main>
  )
}
