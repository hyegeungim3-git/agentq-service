import { useEffect, useState } from 'react'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import type { Domain } from '@entities/domain/model'
import { sectorLabel } from '@entities/domain/model'
import { fetchDomains } from '@shared/api/domains'
import { BrandLock } from '@shared/ui/Brand'
import { brandVars } from '@shared/lib/brand'

/* 화면 상태 — 가이드 §10이 요구하는 기본·로딩·빈·오류를 처음부터 넣는다.
   이전 데모는 mock이라 로딩·오류가 아예 없었고, 서버가 붙는 순간 전부 새로 만들어야 했다. */
type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; domains: Domain[] }

export function PortalPage({
  onSelect,
  onAdmin,
}: {
  onSelect: (id: string) => void
  onAdmin: () => void
}) {
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
    /* 분야 선택 화면은 기관명·소개가 전부 한국어 원문이다. 화면 틀 언어를 English로
       두고 나왔을 때 영어 음성이 기관명을 뭉개지 않도록 여기서 표시한다 */
    <main lang="ko" className="min-h-dvh bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <BrandLock heading />
          <p className="mt-4 text-sm text-slate-600">
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
            {state.domains.map((d) => {
              const ready = d.status === 'ready'
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(d.id)}
                    disabled={!ready}
                    aria-describedby={ready ? undefined : `${d.id}-status`}
                    /* 카드마다 브랜드 변수를 꽂는다 — 안쪽은 전부 토큰으로만 부른다 */
                    style={brandVars(d.brandColor)}
                    className="group relative min-h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-5 text-left transition-all outline-brand focus-visible:outline-2 focus-visible:outline-offset-2 enabled:hover:-translate-y-0.5 enabled:hover:border-brand-soft enabled:hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                  >
                    {/* 브랜드 색 띠 — 어느 발주처인지 한눈에 */}
                    <span className="bg-brand absolute inset-x-0 top-0 h-1" aria-hidden="true" />
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="bg-brand text-brand-fg inline-block rounded px-2 py-0.5 text-[11px] font-bold">
                        {sectorLabel(d.sector)}
                      </span>
                      {!ready && (
                        <span
                          id={`${d.id}-status`}
                          className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600"
                        >
                          업무 데이터 준비 중
                        </span>
                      )}
                    </span>
                    <span className="mt-2 flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{d.orgName}</span>
                      {ready && (
                        <ArrowRight
                          className="text-brand size-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">{d.tagline}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {/* 관리자는 발주처가 아니라 플랫폼 전체를 다룬다 — 분야 목록과 줄을 나눈다 */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={onAdmin}
            /* 발주처 카드와 같은 포커스 표시 — 이 버튼만 브라우저 기본 테두리였다 */
            className="flex w-full items-center gap-4 rounded-xl border border-slate-300 bg-white p-5 text-left outline-slate-900 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900">
              <SlidersHorizontal className="size-5 text-white" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-slate-900">관리자 시스템</span>
              <span className="mt-0.5 block text-sm text-slate-600">
                대시보드·모델 운영·사용자 관리. 발주처와 무관하게 플랫폼 전체를 봅니다.
              </span>
            </span>
          </button>
        </div>

        {/* 왜 못 고르는지 화면이 말한다 — 눌리지 않는 이유를 사용자가 추측하게 두지 않는다 */}
        {state.kind === 'ready' && state.domains.some((d) => d.status !== 'ready') && (
          <p className="mt-4 text-xs text-slate-500">
            업무 데이터가 준비된 발주처만 선택할 수 있습니다. 준비 중인 곳을 열면 다른 발주처의 문서와
            수치가 그대로 보이므로 막아 두었습니다.
          </p>
        )}
      </div>
    </main>
  )
}
