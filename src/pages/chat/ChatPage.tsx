import { useCallback, useEffect, useRef, useState } from 'react'
import { useModalOverlay } from '@features/overlay/useModalOverlay'
import {
  FAQ_CATEGORIES,
  answerAsText,
  faqCategoryLabel,
  isUngrounded,
  needsCheck,
  type ChatMessage,
  type ChatSource,
  type Xai,
} from '@entities/chat/model'
import { useChat, type ChatOptions, type ChatStore } from '@features/chat/useChat'
import type { SignalLink, WorkSignal } from '@entities/signal/model'
import { BriefingCards } from '@widgets/briefing/BriefingCards'
import type { LiveMetric } from '@entities/metric/model'
import { LiveMetricCard } from '@widgets/live-metric/LiveMetricCard'
import { DOWN_REASONS, useFeedback, type FeedbackEntry } from '@features/feedback/useFeedback'
import { MapIntelCard } from '@widgets/map-intel/MapIntelCard'
import { ChatSidePanel } from '@widgets/chat-panel/ChatSidePanel'
import { BookOpen, MessageSquare, Paperclip } from 'lucide-react'
import { DOCUMENT_UPLOAD, validateUpload } from '@entities/upload/model'
import { uploadDocument } from '@shared/api/documents'

export function ChatPage({
  onBack,
  apiOptions,
  /** 셸이 대화를 소유할 때 넘긴다. 없으면 이 화면이 스스로 들고 있는다 */
  store,
  /** 빈 화면에 오늘의 브리핑을 띄운다. 셸 밖에서 단독으로 쓰면 없다 */
  signals = [],
  onOpenSignal,
  metrics = [],
}: {
  onBack?: () => void
  apiOptions?: ChatOptions
  store?: ChatStore
  signals?: WorkSignal[]
  onOpenSignal?: ((link: SignalLink) => void) | undefined
  metrics?: LiveMetric[]
}) {
  const c = useChat(apiOptions ?? {}, store)
  const fb = useFeedback()
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  /**
   * 첨부 — **형식·용량까지는 여기서 거르고, 전송은 서버가 해야 한다.**
   *
   * 서버가 없으니 지금은 반드시 실패한다. 성공한 척 파일 이름만 붙여 두면
   * 사용자는 그 문서를 근거로 답할 거라고 믿는다(D-009와 같은 처리).
   * 검사는 서버가 붙어도 그대로 남는다 — 큰 파일을 다 올린 뒤에 거절당하지 않게.
   */
  const attach = async (files: FileList | null) => {
    const file = files?.[0]
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return
    const invalid = validateUpload(file, DOCUMENT_UPLOAD)
    if (invalid !== null) {
      setAttachError(invalid)
      return
    }
    const res = await uploadDocument(file)
    setAttachError(res.ok ? null : res.error)
  }
  const closePanel = useCallback(() => setPanelOpen(false), [])
  /* 넓은 화면(xl)에서는 옆에 붙어 있으므로 대화상자가 아니다 — 덮는 폭에서만 잠근다 */
  const panelRef = useModalOverlay(panelOpen, closePanel, 1280)

  // 새 메시지가 오면 아래로 스크롤 — 대화가 길어지면 직접 내려야 하는 건 불편하다
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [c.messages.length, c.pending])

  /**
   * **답변이 도착했다는 것을 말한다.**
   *
   * 예전에는 질문을 보내야 비로소 '작성 중' 리전이 생기고, 답이 오면 그 리전이
   * 통째로 사라지면서 목록에 항목만 추가됐다 — 낭독기에는 **완전한 침묵**이었다.
   * 화면에서는 말풍선이 눈에 띄지만 소리로는 아무 일도 안 일어난 것과 같다.
   *
   * 답 전체를 읽어 주지는 않는다. 길어서 끊을 수도 없고, 사용자가 직접 읽으러 갈
   * 수 있어야 한다. 대신 **도착했다는 사실과 근거 유무**만 말한다 — 근거 없는 답을
   * 근거 있는 답과 구분하는 것이 이 제품의 안전장치이기 때문이다.
   */
  const answered = useRef(0)
  const [arrival, setArrival] = useState('')
  useEffect(() => {
    const last = c.messages[c.messages.length - 1]
    if (!last || last.role !== 'assistant') return
    if (c.messages.length === answered.current) return
    answered.current = c.messages.length
    const basis =
      last.sources.length > 0 ? `근거 ${last.sources.length}건` : '근거를 찾지 못한 답변입니다'
    const conf =
      last.confidence === null ? '' : ` 신뢰도 ${Math.round(last.confidence * 100)}%.`
    setArrival(`답변이 도착했습니다. ${basis}.${conf}`)
  }, [c.messages])

  return (
    <div className="flex min-h-dvh">
    {/* 근거 패널이 덮고 있는 동안 본문은 없는 것으로 친다 — 안 끄면 낭독기 스와이프가
        화면에 보이지도 않는 FAQ 버튼 열몇 개를 먼저 읽는다 */}
    <main
      inert={panelOpen || undefined}
      className="flex min-h-dvh min-w-0 flex-1 flex-col bg-slate-50"
    >
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto w-full max-w-3xl">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-2 min-h-11 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              ← 돌아가기
            </button>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-brand flex size-9 shrink-0 items-center justify-center rounded-xl">
              <MessageSquare className="text-brand-fg size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-slate-900">업무 챗봇</h1>
              <p className="text-sm text-slate-600">사내 문서를 근거로 답합니다.</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* 좁은 화면에서는 근거 패널을 접어 둔다 — 열 수 있다는 것은 보여 준다 */}
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="flex min-h-11 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50 xl:hidden"
              >
                <BookOpen className="size-4" aria-hidden="true" />
                답변 근거
              </button>
              {c.messages.length > 0 && (
                <button
                  type="button"
                  onClick={c.reset}
                  className="min-h-11 text-sm font-bold text-slate-500 hover:text-slate-900"
                >
                  대화 지우기
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {/* 빈 화면에서 가장 먼저 봐야 하는 것은 오늘 처리할 일이다 */}
        {c.messages.length === 0 && !c.pending && onOpenSignal && (
          <div className="mb-4 space-y-4">
            <BriefingCards signals={signals} onOpen={onOpenSignal} />
            {metrics.map((m) => (
              <LiveMetricCard key={m.id} metric={m} />
            ))}
          </div>
        )}

        {c.messages.length === 0 && !c.pending && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">
              사내 규정과 업무 문서를 근거로 답변합니다. 근거를 찾지 못하면 지어내지 않고 모른다고 답합니다.
            </p>
            <p className="mt-2 text-xs text-slate-500">아래 자주 묻는 질문에서 골라 물어볼 수 있습니다.</p>
          </div>
        )}

        <ol className="space-y-4">
          {c.messages.map((m) => (
            <li key={m.id}>
              <MessageBubble
                message={m}
                feedback={fb.entries[m.id] ?? null}
                onRate={fb.rate}
                onReason={fb.setReason}
                feedbackPersisted={fb.persisted}
              />
            </li>
          ))}
        </ol>

        {/* 알림 자리는 **처음부터 있어야 한다.** 상태가 바뀔 때 비로소 만들어지는
            리전은 낭독기가 첫 변화를 놓치는 경우가 있다. 자리는 늘 두고 내용만 채운다 */}
        <p role="status" aria-live="polite" className="sr-only">
          {c.pending ? '답변을 작성하는 중입니다' : arrival}
        </p>

        {c.pending && (
          <div aria-hidden="true" className="mt-4 max-w-[85%] rounded-xl border border-slate-200 bg-white p-4">
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          </div>
        )}

        {c.error && (
          <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-bold text-rose-800">{c.error}</p>
          </div>
        )}

        <div ref={endRef} />

        <section aria-labelledby="faq-title" className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 id="faq-title" className="text-sm font-black text-slate-900">
            자주 묻는 질문
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['all', ...FAQ_CATEGORIES] as const).map((cat) => (
              <label
                key={cat}
                className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
              >
                <input
                  type="radio"
                  name="faq-category"
                  value={cat}
                  checked={c.faqCategory === cat}
                  onChange={() => c.setFaqCategory(cat)}
                  className="sr-only"
                />
                {cat === 'all' ? '전체' : faqCategoryLabel(cat)}
              </label>
            ))}
          </div>

          {c.faq.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">이 범주에 등록된 질문이 없습니다.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {c.faq.map((f) => (
                <li key={f.question}>
                  <button
                    type="button"
                    onClick={() => void c.ask(f.question)}
                    disabled={c.pending}
                    className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {faqCategoryLabel(f.category)}
                    </span>
                    <span className="text-sm text-slate-700">{f.question}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* FAQ에 있다고 다 답할 수 있는 것은 아니다 */}
          <p className="mt-3 text-xs text-slate-400">
            목록에 있어도 지식베이스에 근거가 없으면 답하지 않고 없다고 말합니다.
          </p>
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto w-full max-w-3xl">
          {/* 올린 파일이 왜 안 되는지는 **올려 본 자리에서** 말한다. 가이드에만 적어 두면
              올리고 나서야 안 된다는 걸 알고, 그때는 이미 기다린 뒤다 */}
          {attachError !== null && (
            <p role="alert" className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">
              {attachError}
            </p>
          )}
        <div className="flex w-full items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            질문 입력
          </label>
          <input
            ref={fileRef}
            id="chat-attach"
            type="file"
            accept={DOCUMENT_UPLOAD.extensions.map((e) => `.${e}`).join(',')}
            onChange={(e) => void attach(e.target.files)}
            className="sr-only"
          />
          <label
            htmlFor="chat-attach"
            title={DOCUMENT_UPLOAD.hint}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-slate-200 px-3 text-slate-600 hover:bg-slate-50"
          >
            <Paperclip className="size-4" aria-hidden="true" />
            <span className="sr-only">파일 첨부</span>
          </label>
          <textarea
            id="chat-input"
            value={c.input}
            onChange={(e) => c.setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter로 전송, Shift+Enter는 줄바꿈 — 안내한 대로 실제로 동작해야 한다
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void c.send()
              }
            }}
            rows={2}
            placeholder="궁금한 내용을 입력하세요 (Enter로 전송)"
            className="min-h-11 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="button"
            onClick={() => void c.send()}
            disabled={!c.canSend}
            className="bg-brand text-brand-fg min-h-11 rounded-lg px-4 text-sm font-bold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            전송
          </button>
        </div>
        </div>
      </div>
    </main>

      {/* 넓은 화면에서는 옆에 붙여 둔다. `top-14`는 셸 상단 바 높이(h-14)다 —
          본문을 내려도 근거 패널이 같이 사라지면 볼 이유가 없다 */}
      <div className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] xl:block">
        <ChatSidePanel />
      </div>

      {/* 좁은 화면에서는 덮어서 연다 — 같은 패널을 두 번 그리지 않는다.
          덮는 순간부터는 대화상자다: 안 그러면 낭독기가 뒤에 깔린 FAQ 버튼 열몇 개를
          먼저 읽고, Esc로 닫히지도 않는다 */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
          <button
            type="button"
            /* '배경'은 구현 용어다. 화면 전체를 덮는 버튼이라 훑으면 반드시 걸리는데,
               눌렀을 때 무슨 일이 일어나는지가 이름이어야 한다 */
            aria-label="답변 근거 닫기"
            onClick={closePanel}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="답변 근거"
            tabIndex={-1}
            className="relative h-dvh"
          >
            <ChatSidePanel onClose={closePanel} />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 답변을 클립보드로.
 *
 * `navigator.clipboard`는 **실패할 수 있다** — 권한이 없거나 보안 컨텍스트가 아니면
 * 거절된다. 조용히 넘기면 사용자는 복사된 줄 알고 다른 곳에 붙여 넣는다.
 * 그래서 성공/실패를 그 자리에서 말한다.
 */
function CopyButton({ message }: { message: ChatMessage }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')

  const copy = () => {
    const text = answerAsText(message)
    const api = navigator.clipboard
    if (api === undefined) {
      setState('failed')
      return
    }
    void api.writeText(text).then(
      () => setState('done'),
      () => setState('failed'),
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        /* 보이는 글자가 이름 안에 있어야 한다 — 음성 조작 사용자는 보이는 대로 말한다 */
        aria-label="답변 복사, 근거와 함께 복사합니다"
        className="min-h-11 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
      >
        답변 복사
      </button>
      {state === 'done' && (
        <span role="status" className="text-[11px] font-bold text-emerald-700">
          근거까지 복사했습니다
        </span>
      )}
      {state === 'failed' && (
        <span role="alert" className="text-[11px] font-bold text-rose-700">
          복사하지 못했습니다 — 브라우저가 클립보드 접근을 막았습니다
        </span>
      )}
    </>
  )
}

function MessageBubble({
  message,
  feedback,
  onRate,
  onReason,
  feedbackPersisted,
}: {
  message: ChatMessage
  feedback: FeedbackEntry | null
  onRate: (id: string, v: 'up' | 'down') => void
  onReason: (id: string, reason: string) => void
  feedbackPersisted: boolean
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="bg-brand text-brand-fg max-w-[85%] rounded-xl px-4 py-2.5 text-sm">{message.text}</p>
      </div>
    )
  }

  const ungrounded = isUngrounded(message)

  return (
    <div className="max-w-[85%]">
      <div
        className={`rounded-xl border p-4 ${
          ungrounded ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
        }`}
      >
        <p className="text-sm leading-relaxed text-slate-800">{message.text}</p>

        {/* 근거 없는 답변은 다르게 그린다 — 같아 보이면 사용자가 구분하지 못한다 */}
        {ungrounded ? (
          <p className="mt-3 text-xs font-bold text-amber-900">근거 문서 없음 · 담당 부서 확인 필요</p>
        ) : (
          <>
            <div className="mt-3">
              <p className="text-[11px] font-bold text-slate-500">근거</p>
              <ul className="mt-1 space-y-1.5">
                {message.sources.map((s) => (
                  <li key={`${s.title}-${s.locator}`}>
                    <SourceItem source={s} />
                  </li>
                ))}
              </ul>
            </div>
            {message.confidence !== null && (
              <p
                className={`mt-2 text-[11px] font-bold ${
                  needsCheck(message) ? 'text-amber-700' : 'text-slate-400'
                }`}
              >
                신뢰도 {Math.round(message.confidence * 100)}%
                {needsCheck(message) ? ' · 원문 확인 권장' : ''}
              </p>
            )}

            {/* 신뢰도 숫자만으로는 무엇을 보고 그 숫자가 나왔는지 알 수 없다 */}
            {message.xai && <XaiPanel xai={message.xai} />}

            {/* 사업장별 지표는 표보다 배치로 봐야 어디가 처지는지 보인다 */}
            {message.map && <MapIntelCard map={message.map} />}
          </>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <CopyButton message={message} />
      </div>

      <FeedbackBar
        messageId={message.id}
        entry={feedback}
        onRate={onRate}
        onReason={onReason}
        persisted={feedbackPersisted}
      />

      {message.handoff && (
        <p className="mt-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <span className="font-bold text-slate-800">{message.handoff.agentLabel} 에이전트 </span>
          {message.handoff.reason}
        </p>
      )}
    </div>
  )
}

/**
 * 출처를 눌러 원문을 펼친다.
 *
 * 출처 이름만 대면 사용자는 확인할 방법이 없다. 원문을 못 찾았으면
 * 그것도 그대로 말한다 — 조용히 빈칸으로 두면 근거가 있는 것처럼 보인다.
 *
 * 부모 안에서 정의하지 않는다 — 매 렌더 새 타입이 되어 펼침 상태가 초기화된다.
 */
function SourceItem({ source }: { source: ChatSource }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="min-h-11 text-left text-xs font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
      >
        {source.title} · {source.locator}
        {source.revisedOn && <span className="ml-1 font-normal text-slate-400">({source.revisedOn} 개정)</span>}
      </button>

      {open && (
        <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
          {source.passage ?? '원문을 찾지 못했습니다. 원본 문서에서 직접 확인하십시오.'}
        </p>
      )}
    </div>
  )
}

/**
 * 왜 이 답변인가.
 *
 * 무엇이 얼마나 기여했는지 나누고, **이 답변만으로 결정하면 안 되는 이유**를 함께 적는다.
 * 기여도만 보여 주면 근거가 탄탄하다는 인상만 남는다.
 */
function XaiPanel({ xai }: { xai: Xai }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="min-h-11 text-[11px] font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
      >
        왜 이 답변인가
      </button>

      {open && (
        <div className="mt-1 rounded-lg bg-slate-50 p-3">
          <ul className="space-y-2">
            {xai.factors.map((f) => (
              <li key={f.label}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{f.label}</span>
                  <span className="ml-auto text-[11px] tabular-nums text-slate-500">
                    {Math.round(f.weight * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-slate-700" style={{ width: `${f.weight * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-600">{f.detail}</p>
              </li>
            ))}
          </ul>
          {/* 기여도만 보여 주면 근거가 탄탄하다는 인상만 남는다 */}
          <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-bold text-amber-900">
            확인할 것 · {xai.caveat}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * 답변 피드백.
 *
 * 서버가 없어 보낼 곳이 없다. 보낸 척하면 개선 요청이 접수된 줄 안다 —
 * 어디에 남는지 그대로 말한다.
 */
function FeedbackBar({
  messageId,
  entry,
  onRate,
  onReason,
  persisted,
}: {
  messageId: string
  entry: FeedbackEntry | null
  onRate: (id: string, v: 'up' | 'down') => void
  onReason: (id: string, reason: string) => void
  persisted: boolean
}) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2">
      {(['up', 'down'] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onRate(messageId, v)}
          aria-pressed={entry?.verdict === v}
          /* 보이는 글자('도움됨'·'아쉬움')가 이름 안에 있어야 한다 — 음성 조작 사용자가
             화면에 보이는 대로 말해야 눌린다(WCAG 2.5.3 Label in Name). 그 전에는 보이는
             글자와 이름이 아예 달랐다 */
          aria-label={v === 'up' ? '도움됨, 도움이 됐어요' : '아쉬움, 도움이 안 됐어요'}
          className={`min-h-11 rounded-lg border px-3 text-xs font-bold ${
            entry?.verdict === v
              ? 'border-slate-900 bg-brand text-brand-fg'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {v === 'up' ? '👍 도움됨' : '👎 아쉬움'}
        </button>
      ))}

      {entry?.verdict === 'down' && (
        <span className="flex flex-wrap items-center gap-1.5">
          {DOWN_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onReason(messageId, r)}
              aria-pressed={entry.reason === r}
              className={`min-h-11 rounded-full border px-2.5 text-[11px] font-bold ${
                entry.reason === r
                  ? 'border-slate-900 bg-slate-100 text-slate-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </span>
      )}

      {entry && (
        <span className="text-[11px] text-slate-400">
          {persisted
            ? '이 브라우저에만 남습니다 — 서버로 보내지 않습니다'
            : '저장하지 못했습니다 — 이 화면을 벗어나면 사라집니다'}
        </span>
      )}
    </div>
  )
}
