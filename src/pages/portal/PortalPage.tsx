import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Lock, ShieldCheck, User } from 'lucide-react'
import type { Domain } from '@entities/domain/model'
import { ADMIN_FEATURES } from '@entities/domain/model'
import { fetchDomains } from '@shared/api/domains'
import { OcubeMark } from '@shared/ui/Brand'
import { brandVars } from '@shared/lib/brand'
import { Button } from '@shared/ui/Button'

/**
 * 첫 화면.
 *
 * **원본 데모의 배치를 따른다**(D-014) — 가운데 히어로, 우상단 발주처 스위처,
 * 카드 두 장(사용자 포털 / 관리자 시스템). 발주처를 먼저 고르고 그다음 역할을 고른다.
 *
 * 두 단계인 이유: 발주처는 **무엇을 보느냐**를 정하고, 역할은 **어디로 들어가느냐**를
 * 정한다. 한 줄에 다섯 개를 늘어놓으면 둘이 같은 무게로 보인다.
 *
 * ⚠️ 상태 칩(`시스템 정상 가동 중 …`)은 **서버가 확인한 상태가 아니다.** 원본 문구를
 * 그대로 쓴다(D-014). 서버가 붙으면 그 자리가 실제 가동 상태가 된다.
 */

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; domains: Domain[] }

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-600">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  )
}

export function PortalPage({
  onSelect,
  onAdmin,
}: {
  onSelect: (id: string) => void
  onAdmin: () => void
}) {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [pickedId, setPickedId] = useState<string | null>(null)

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

  const domains = state.kind === 'ready' ? state.domains : []
  const picked = domains.find((d) => d.id === pickedId) ?? domains[0] ?? null

  return (
    /* 기관명·소개가 전부 한국어 원문이다. 화면 틀 언어를 English로 두고 나왔을 때
       영어 음성이 기관명을 뭉개지 않도록 여기서 표시한다 */
    <main lang="ko" style={picked ? brandVars(picked.brandColor) : undefined} className="min-h-dvh bg-slate-50">
      {state.kind === 'ready' && domains.length > 0 && (
        <nav aria-label="발주처 선택" className="flex justify-end px-4 pt-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
            <span className="px-2 text-[11px] font-bold text-slate-400">데모 도메인</span>
            {domains.map((d) => {
              const on = picked?.id === d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setPickedId(d.id)}
                  aria-current={on ? 'true' : undefined}
                  disabled={d.status !== 'ready'}
                  className={`min-h-11 rounded-full px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
                    on ? 'bg-brand text-brand-fg' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {d.orgName}
                </button>
              )
            })}
          </div>
        </nav>
      )}

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12 sm:px-8">
        {state.kind === 'loading' && (
          <div role="status" aria-live="polite" className="mt-10 grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
            <span className="sr-only">발주처 목록을 불러오는 중입니다</span>
          </div>
        )}

        {state.kind === 'error' && (
          <div role="alert" className="mt-10 rounded-xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-bold text-rose-800">발주처 목록을 불러오지 못했습니다</p>
            <p className="mt-1 text-sm text-rose-700">{state.message}</p>
            <Button tone="danger" layout="mt-3" onClick={() => setState({ kind: 'loading' })}>
              다시 시도
            </Button>
          </div>
        )}

        {state.kind === 'ready' && domains.length === 0 && (
          <p className="mt-10 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            표시할 분야가 없습니다.
          </p>
        )}

        {picked !== null && (
          <>
            <header className="flex flex-col items-center text-center">
              {/* 심볼은 다시 그리지 않고 있는 것을 쓴다 — 재창작은 이 저장소가 한 번 데었다 */}
              <OcubeMark />
              <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                <span className="text-brand mr-2 tracking-[0.2em]">{picked.orgShort}</span>
                {picked.orgName} {picked.tagline.replace(/ 생성형 AI 플랫폼$/, '')} AI 플랫폼
              </h1>
              <p className="mt-3 text-sm text-slate-600">
                {picked.orgName} {picked.tagline}에 오신 것을 환영합니다.
                <br />
                접속 유형을 선택해 주세요.
              </p>
              {/* 서버가 확인한 상태가 아니다 — 원본 문구를 그대로 쓴다(D-014) */}
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {picked.statusNote}
              </p>
            </header>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onSelect(picked.id)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm outline-brand transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="bg-brand absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
                <span className="flex items-center gap-3">
                  <span className="bg-brand-soft flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <User className="text-brand size-5" aria-hidden="true" />
                  </span>
                  <span>
                    {/* 브랜드 색은 **면**에만 쓴다. 작은 글자에 쓰면 다크에서 명암비가
                        3.26:1까지 떨어진다(검사가 잡았다) */}
                    <span className="block text-[11px] font-black tracking-wide text-slate-500">일반 직원</span>
                    <span className="block text-lg font-black text-slate-900">사용자 포털</span>
                  </span>
                </span>
                <span className="mt-4 block text-[13px] leading-relaxed text-slate-600">
                  업무 질의응답, 문서 검토, 번역·요약, 보고서 작성 등<br />
                  일상 업무를 AI로 간편하게 처리하세요.
                </span>
                <FeatureList items={picked.features} />
                <span className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-800">사용자 포털 입장</span>
                  <span className="flex size-8 items-center justify-center rounded-full border border-slate-200 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-4 text-slate-500" aria-hidden="true" />
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={onAdmin}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm outline-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="absolute inset-x-0 top-0 h-1.5 bg-slate-900" aria-hidden="true" />
                <span className="flex items-center gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <ShieldCheck className="size-5 text-slate-700" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-black tracking-wide text-slate-500">
                      시스템 관리자
                    </span>
                    <span className="block text-lg font-black text-slate-900">관리자 시스템</span>
                  </span>
                </span>
                <span className="mt-4 block text-[13px] leading-relaxed text-slate-600">
                  GPU·서빙 인프라, LLM 학습·배포, 에이전트 빌더, 데이터셋·벡터DB 및 사용자 운영을 통합
                  관리합니다.
                </span>
                {/* 관리자는 발주처와 무관하게 같은 일을 한다 — 목록도 하나다 */}
                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {ADMIN_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-600">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-black text-slate-800">
                    <Lock className="size-3.5" aria-hidden="true" />
                    관리자 시스템 입장
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full border border-slate-200 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-4 text-slate-500" aria-hidden="true" />
                  </span>
                </span>
              </button>
            </div>

            {/* 왜 못 고르는지 화면이 말한다 — 눌리지 않는 이유를 추측하게 두지 않는다 */}
            {domains.some((d) => d.status !== 'ready') && (
              <p className="mt-6 text-center text-xs text-slate-500">
                업무 데이터가 준비된 발주처만 선택할 수 있습니다. 준비 중인 곳을 열면 다른 발주처의
                문서와 수치가 그대로 보이므로 막아 두었습니다.
              </p>
            )}

            <footer className="mt-10 text-center text-[11px] leading-relaxed text-slate-400">
              <p>{picked.footer[0]}</p>
              <p>{picked.footer[1]}</p>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}
