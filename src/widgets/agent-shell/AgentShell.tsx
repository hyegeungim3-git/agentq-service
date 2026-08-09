import type { ReactNode } from 'react'
import { useId } from 'react'
import { ChevronLeft, FileText, Info, Play, Sparkles, type LucideIcon } from 'lucide-react'
import { formatSize } from '@entities/document/model'

import type { AgentId } from '@entities/agent/model'
import { AGENT_ICONS, FALLBACK_AGENT_ICON } from '@shared/ui/agentIcons'
import { AgentFlowTrail } from '@widgets/agent-flow/AgentFlowTrail'
import type { AgentInput, RunPhase } from '@features/agent-run/useAgentRun'
import type { UploadSlot } from '@entities/upload/model'
import { UploadZone } from '@widgets/upload/UploadZone'
import { Button } from '@shared/ui/Button'

/**
 * 문서 입력형 에이전트의 공통 화면 골격.
 *
 * 요약·번역·검토 세 화면을 각각 만들고 나서 뽑았다. 셋이 같은 뼈대를 반복하고
 * 있었다: 헤더 → 문서 선택 → 옵션 → 실행 → 로딩/실패 → 결과.
 *
 * 에이전트마다 다른 것은 **옵션 영역과 결과 영역**뿐이라 그 둘만 받는다.
 * 로딩·빈 목록·오류 상태를 여기 한 곳에 두는 것이 목적이다 —
 * 화면마다 따로 쓰면 어느 하나가 빠져도 아무도 모른다.
 */

export type AgentShellProps<R> = {
  title: string
  desc: string
  /** 아이콘을 고르는 데 쓴다. 허브 카드와 같은 아이콘이라야 같은 곳으로 읽힌다 */
  agentId?: AgentId
  onBack?: (() => void) | undefined

  phase: RunPhase<R>
  /** 문서일 수도, 데이터 파일일 수도 있다 — 목록이 쓰는 속성만 요구한다 */
  docs: AgentInput[]
  documentId: string | null
  onSelectDocument: (id: string) => void

  /** 문서 선택 절의 제목 — '요약할 문서' 처럼 에이전트마다 다르다 */
  docSectionLabel: string
  /** 문서가 없을 때 문구 */
  emptyDocsLabel: string
  /** 업로드 자리. 없으면 그리지 않는다 — 조회형 화면에는 올릴 파일이 없다 */
  upload?: UploadSlot | null | undefined

  /** 옵션 영역. 없으면 절 자체를 그리지 않는다 */
  options?: ReactNode
  optionsLabel?: string

  runLabel: string
  runningLabel: string
  runningMessage: string
  /** 옵션이 덜 채워졌을 때 실행을 막는다 */
  canRun?: boolean
  onRun: () => void
  onReset: () => void

  /** 결과 영역 — 완료 시에만 호출된다 */
  result: (result: R) => ReactNode
}

export function AgentShell<R>({
  title,
  desc,
  agentId,
  onBack,
  phase,
  docs,
  documentId,
  onSelectDocument,
  docSectionLabel,
  emptyDocsLabel,
  upload,
  options,
  optionsLabel,
  runLabel,
  runningLabel,
  runningMessage,
  canRun = true,
  onRun,
  onReset,
  result,
}: AgentShellProps<R>) {
  const busy = phase.kind === 'running'
  const Icon = (agentId && AGENT_ICONS[agentId]) ?? FALLBACK_AGENT_ICON
  const docSectionId = useId()

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 flex items-start gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="에이전트 허브로 돌아가기"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          )}
          <span className="bg-brand flex size-11 shrink-0 items-center justify-center rounded-xl">
            <Icon className="text-brand-fg size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">{desc}</p>
          </div>
        </header>

        {phase.kind === 'loadingDocs' && (
          <div
            role="status"
            aria-live="polite"
            className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
          >
            <span className="sr-only">문서 목록을 불러오는 중입니다</span>
          </div>
        )}

        {phase.kind === 'docsError' && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-bold text-rose-800">문서 목록을 불러오지 못했습니다</p>
            <p className="mt-1 text-sm text-rose-700">{phase.message}</p>
          </div>
        )}

        {phase.kind !== 'loadingDocs' && phase.kind !== 'docsError' && (
          <div className="space-y-5">
            <section
              /* 제목을 영역 이름으로 잇는다. 안 이으면 낭독기가 '무엇을 고르는
                 목록인지' 말하지 않고 파일 이름만 읽는다 */
              aria-labelledby={docSectionId}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <h2 id={docSectionId} className="mb-3 text-sm font-black text-slate-900">
                1 · {docSectionLabel}
              </h2>
              {docs.length === 0 ? (
                <p className="text-sm text-slate-600">{emptyDocsLabel}</p>
              ) : (
                /* 라디오 묶음에 이름을 준다 — 개별 라디오만 읽히면 '4개 중 1'이라고만
                   들리고 무슨 목록인지 알 수 없다. `role`은 감싸는 div에 준다.
                   `<ul>`에 주면 목록 역할이 덮여 `<li>`가 고아가 된다(axe `listitem`이 잡았다) */
                <div role="radiogroup" aria-labelledby={docSectionId}>
                  <ul className="space-y-2">
                    {docs.map((d) => (
                      <li key={d.id}>
                        <label className="has-checked:border-brand has-checked:bg-brand-soft flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                          <input
                            type="radio"
                            name="document"
                            value={d.id}
                            checked={documentId === d.id}
                            onChange={() => onSelectDocument(d.id)}
                            className="size-4"
                          />
                          <FileText className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-slate-800">{d.name}</span>
                            <span className="block text-xs text-slate-500">
                              {d.detail ? `${d.detail} · ` : ''}
                              {formatSize(d.sizeBytes)}
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {upload && <UploadZone slot={upload} />}
            </section>

            {options && (
              <section className="rounded-xl border border-slate-200 bg-white p-5">
                {optionsLabel && (
                  <h2 className="mb-3 text-sm font-black text-slate-900">2 · {optionsLabel}</h2>
                )}
                {options}
              </section>
            )}

            <div className="flex items-center gap-3">
              <Button tone="primary" layout="flex-1 sm:flex-none" onClick={onRun} disabled={busy || !documentId || !canRun}>
                <Play className="size-4" aria-hidden="true" />
                {busy ? runningLabel : runLabel}
              </Button>
              {phase.kind === 'done' && (
                <Button onClick={onReset}>
                  다시 설정
                </Button>
              )}
            </div>

            {/* 알림 자리는 **처음부터 있어야 한다.** 상태가 바뀔 때 비로소 만들어지는
                라이브 리전은 낭독기가 첫 변화를 놓치는 경우가 있다.
                자리는 늘 두고 내용만 채운다 */}
            <p role="status" aria-live="polite" className="sr-only">
              {busy ? runningMessage : ''}
            </p>

            {/* 같은 문장이 위 라이브 리전에 이미 있다. 여기까지 읽히면 훑을 때마다
                두 번 들린다 — 눈으로 보는 사람에게만 보여 준다 */}
            {busy && (
              <div aria-hidden="true" className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-slate-700">{runningMessage}</p>
                <div className="mt-3 space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              </div>
            )}

            {phase.kind === 'failed' && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
                <p className="text-sm font-bold text-rose-800">실행에 실패했습니다</p>
                <p className="mt-1 text-sm text-rose-700">{phase.message}</p>
                <Button tone="danger" layout="mt-3" onClick={onRun}>
                  다시 시도
                </Button>
              </div>
            )}

            {/* 이 결과가 무엇을 거쳐 나왔는지 — 결과를 받는 사람에게도 보인다.
                접어 두는 이유는 평소에 필요한 정보가 아니어서지, 숨기려는 것이 아니다 */}
            {agentId && <AgentFlowTrail agentId={agentId} />}

            {phase.kind === 'done' && result(phase.result)}
          </div>
        )}
      </div>
    </main>
  )
}

/**
 * 에이전트 화면 머리 — 셸을 쓰지 않는 화면(질문 입력형·릴레이)이 쓴다.
 *
 * 셸을 안 쓴다고 머리까지 제각각이면, 같은 '에이전트 탭' 안에서 화면마다
 * 다른 제품처럼 보인다. 아이콘은 허브 카드와 **같은 것**을 쓴다 —
 * 카드에서 본 모양이 그대로 나와야 같은 곳으로 읽힌다.
 */
export function AgentPageHeader({
  agentId,
  icon,
  title,
  desc,
  onBack,
  aside,
}: {
  agentId?: AgentId
  /** 카탈로그에 없는 화면(복합 업무 릴레이 등)이 쓸 아이콘 */
  icon?: LucideIcon
  title: string
  desc: ReactNode
  onBack?: (() => void) | undefined
  /** 오른쪽에 붙는 것(부제 배지 등). 없으면 안 그린다 */
  aside?: ReactNode
}) {
  const Icon = icon ?? (agentId && AGENT_ICONS[agentId]) ?? FALLBACK_AGENT_ICON
  return (
    <header className="mb-6 flex items-start gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          /* 셸 쪽(:91)과 **같은 이름**이어야 한다. 여기만 '돌아가기'로 두면 13종 중
             5화면(데이터 조회·지식 검색·기준정보 표준화·내규 조회·복합 업무)에서만
             어디로 가는지 안 들린다 — 실제로 그 상태였다. 부르는 곳은 전부
             `backToAgents`(App.tsx)라 목적지도 같다 */
          aria-label="에이전트 허브로 돌아가기"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
      )}
      <span className="bg-brand flex size-11 shrink-0 items-center justify-center rounded-xl">
        <Icon className="text-brand-fg size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-black text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{desc}</p>
      </div>
      {aside}
    </header>
  )
}

/**
 * 결과 절 공용 — 제목과 지표 카드가 반복돼 함께 뺐다.
 *
 * **입력 카드와 같은 모양이면 안 된다.** 문서 고르기·옵션·결과가 전부 흰 카드라
 * 스크롤하다 보면 어디부터가 AI가 만든 것인지 모른다. 그래서 결과에만 머리 띠를 두고
 * 브랜드 색을 쓴다 — 이 아래가 사람이 고른 것이 아니라 **모델이 만든 것**이다.
 *
 * `notice`(AI 생성물 고지)는 예전에 가장 흐린 회색 한 줄이었다. 규제상 붙여야 하는
 * 문구인데 화면에서 가장 안 보이는 자리에 있었다 — 블록으로 세운다.
 */
export function ResultSection({
  id,
  title,
  stats,
  children,
  notice,
}: {
  id: string
  title: string
  stats?: [string, string][]
  children: ReactNode
  notice?: string | undefined
}) {
  return (
    <section
      aria-labelledby={id}
      className="border-brand-soft overflow-hidden rounded-xl border bg-white"
    >
      <div className="bg-brand-soft border-brand-soft flex items-center gap-2 border-b px-5 py-3">
        <Sparkles className="text-brand size-4 shrink-0" aria-hidden="true" />
        <h2 id={id} className="min-w-0 text-sm font-black text-slate-900">
          {title}
        </h2>
      </div>

      <div className="p-5">
        {stats && stats.length > 0 && (
          <dl className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(([k, v]) => (
              <div key={k} className="rounded-lg border border-slate-200 px-3 py-2">
                <dt className="text-[11px] text-slate-500">{k}</dt>
                <dd className="text-brand text-base font-black">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {children}
        {notice && (
          <p className="mt-5 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span>{notice}</span>
          </p>
        )}
      </div>
    </section>
  )
}
