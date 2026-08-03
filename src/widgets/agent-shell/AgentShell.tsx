import type { ReactNode } from 'react'
import { useId, useRef, useState } from 'react'
import { formatSize } from '@entities/document/model'
import { acceptAttr } from '@entities/upload/model'
import type { AgentInput, RunPhase, UploadSlot } from '@features/agent-run/useAgentRun'

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

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 min-h-11 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              ← 돌아가기
            </button>
          )}
          <h1 className="text-xl font-black text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
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
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-black text-slate-900">1 · {docSectionLabel}</h2>
              {docs.length === 0 ? (
                <p className="text-sm text-slate-600">{emptyDocsLabel}</p>
              ) : (
                <ul className="space-y-2">
                  {docs.map((d) => (
                    <li key={d.id}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-50">
                        <input
                          type="radio"
                          name="document"
                          value={d.id}
                          checked={documentId === d.id}
                          onChange={() => onSelectDocument(d.id)}
                          className="size-4"
                        />
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
              <button
                type="button"
                onClick={onRun}
                disabled={busy || !documentId || !canRun}
                className="min-h-11 rounded-lg bg-brand px-5 text-sm font-bold text-brand-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? runningLabel : runLabel}
              </button>
              {phase.kind === 'done' && (
                <button
                  type="button"
                  onClick={onReset}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  다시 설정
                </button>
              )}
            </div>

            {busy && (
              <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5">
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
                <button
                  type="button"
                  onClick={onRun}
                  className="mt-3 min-h-11 rounded-lg border border-rose-300 px-3 text-sm font-bold text-rose-800 hover:bg-rose-100"
                >
                  다시 시도
                </button>
              </div>
            )}

            {phase.kind === 'done' && result(phase.result)}
          </div>
        )}
      </div>
    </main>
  )
}

/**
 * 파일 업로드 자리.
 *
 * 부모 안에서 정의하지 않는다 — 매 렌더 새 타입이 되어 리마운트되고,
 * 드래그 상태와 파일 입력이 초기화된다(AGENTS.md §6, 이전 데모에서 난 사고).
 *
 * 형식·용량 검사는 훅이 먼저 하고, 여기는 그 결과를 보여 주기만 한다.
 */
function UploadZone({ slot }: { slot: UploadSlot }) {
  const inputId = useId()
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const take = (files: FileList | null) => {
    const file = files?.[0]
    if (file) slot.select(file)
    // 같은 파일을 다시 고를 수 있게 비운다 — 안 그러면 두 번째 선택이 조용히 무시된다
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="mt-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          take(e.dataTransfer.files)
        }}
        className={`rounded-lg border border-dashed p-4 text-center transition-colors ${
          over ? 'border-slate-900 bg-slate-50' : 'border-slate-300'
        }`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptAttr(slot.constraint)}
          disabled={slot.busy}
          onChange={(e) => take(e.target.files)}
          aria-describedby={slot.error ? errorId : undefined}
          className="sr-only"
        />
        <label
          htmlFor={inputId}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
        >
          {slot.busy ? '올리는 중…' : '파일 선택 또는 끌어다 놓기'}
        </label>
        <p className="mt-2 text-xs text-slate-500">{slot.constraint.hint}</p>
      </div>

      {/* 실패를 조용히 넘기지 않는다 — 무엇이 왜 안 됐는지 말한다 */}
      {slot.error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800"
        >
          {slot.error}
        </p>
      )}
    </div>
  )
}

/** 결과 절 공용 — 제목과 지표 카드가 반복돼 함께 뺐다. */
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
  notice?: string
}) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 id={id} className="text-sm font-black text-slate-900">
        {title}
      </h2>
      {stats && stats.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([k, v]) => (
            <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-[11px] text-slate-500">{k}</dt>
              <dd className="text-sm font-black text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-4">{children}</div>
      {notice && <p className="mt-5 text-xs text-slate-400">{notice}</p>}
    </section>
  )
}
