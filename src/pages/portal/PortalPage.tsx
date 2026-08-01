import { useEffect, useState } from 'react'
import type { Domain } from '@entities/domain/model'
import { sectorLabel } from '@entities/domain/model'
import { fetchDomains } from '@shared/api/domains'

/* 화면 상태 — 가이드 §10이 요구하는 기본·로딩·빈·오류를 처음부터 넣는다.
   이전 데모는 mock이라 로딩·오류가 아예 없었고, 서버가 붙는 순간 전부 새로 만들어야 했다. */
type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; domains: Domain[] }

export function PortalPage({ onSelect }: { onSelect: (id: string) => void }) {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let alive = true
    void fetchDomains().then((res) => {
      if (!alive) return
      setState(res.ok ? { kind: 'ready', domains: res.data } : { kind: 'error', message: res.error })
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <p className="text-xs font-bold tracking-widest text-slate-400">OCUBE</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">AgentQ</h1>
          <p className="mt-2 text-sm text-slate-600">
            분야를 선택하면 해당 조직의 업무 환경으로 들어갑니다.
          </p>
        </header>

        {state.kind === 'loading' && (
          <div role="status" aria-live="polite" className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
            <span className="sr-only">분야 목록을 불러오는 중입니다</span>
          </div>
        )}

        {state.kind === 'error' && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-bold text-rose-800">분야 목록을 불러오지 못했습니다</p>
            <p className="mt-1 text-sm text-rose-700">{state.message}</p>
            <button
              type="button"
              onClick={() => setState({ kind: 'loading' })}
              className="mt-3 rounded-lg border border-rose-300 px-3 py-2 text-sm font-bold text-rose-800 hover:bg-rose-100"
            >
              다시 시도
            </button>
          </div>
        )}

        {state.kind === 'ready' && state.domains.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            표시할 분야가 없습니다.
          </p>
        )}

        {state.kind === 'ready' && state.domains.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {state.domains.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onSelect(d.id)}
                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ outlineColor: d.brandColor }}
                >
                  <span
                    className="inline-block rounded px-2 py-0.5 text-[11px] font-bold text-white"
                    style={{ backgroundColor: d.brandColor }}
                  >
                    {sectorLabel(d.sector)}
                  </span>
                  <span className="mt-2 block font-bold text-slate-900">{d.orgName}</span>
                  <span className="mt-0.5 block text-sm text-slate-600">{d.tagline}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
