import { useEffect, useRef, useState } from 'react'
import {
  FAQ_CATEGORIES,
  faqCategoryLabel,
  isUngrounded,
  needsCheck,
  type ChatMessage,
  type ChatSource,
} from '@entities/chat/model'
import { useChat, type ChatOptions } from '@features/chat/useChat'

export function ChatPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: ChatOptions }) {
  const c = useChat(apiOptions ?? {})
  const endRef = useRef<HTMLDivElement>(null)

  // 새 메시지가 오면 아래로 스크롤 — 대화가 길어지면 직접 내려야 하는 건 불편하다
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [c.messages.length, c.pending])

  return (
    <main className="flex min-h-dvh flex-col bg-slate-50">
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
            <h1 className="text-lg font-black text-slate-900">업무 챗봇</h1>
            <p className="text-sm text-slate-600">사내 문서를 근거로 답합니다.</p>
            {c.messages.length > 0 && (
              <button
                type="button"
                onClick={c.reset}
                className="ml-auto min-h-11 text-sm font-bold text-slate-500 hover:text-slate-900"
              >
                대화 지우기
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {c.messages.length === 0 && !c.pending && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">
              사내 규정·작업표준을 근거로 답변합니다. 근거를 찾지 못하면 지어내지 않고 모른다고 답합니다.
            </p>
            <p className="mt-2 text-xs text-slate-500">아래 자주 묻는 질문에서 골라 물어볼 수 있습니다.</p>
          </div>
        )}

        <ol className="space-y-4">
          {c.messages.map((m) => (
            <li key={m.id}>
              <MessageBubble message={m} />
            </li>
          ))}
        </ol>

        {c.pending && (
          <div role="status" aria-live="polite" className="mt-4 max-w-[85%] rounded-xl border border-slate-200 bg-white p-4">
            <span className="sr-only">답변을 작성하는 중입니다</span>
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
                className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
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
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            질문 입력
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
            className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            전송
          </button>
        </div>
      </div>
    </main>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white">{message.text}</p>
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
          </>
        )}
      </div>

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
