import { useEffect, useId, useRef, useState } from 'react'
import {
  formatSignalTime,
  signalSeverityLabel,
  type SignalLink,
  type SignalSeverity,
  type WorkSignal,
} from '@entities/signal/model'

const SEVERITY_STYLE: Record<SignalSeverity, string> = {
  action: 'bg-rose-100 text-rose-800',
  watch: 'bg-amber-100 text-amber-800',
  info: 'bg-slate-100 text-slate-600',
}

/**
 * 알림 센터.
 *
 * 신호를 눌러 아무 데도 못 가면 '읽음 처리 버튼'일 뿐이다. 그래서 처리할 화면으로
 * 잇고, 이을 곳이 없는 신호는 링크를 만들지 않고 그렇다고 표시한다.
 */
export function SignalBell({
  signals,
  onOpen,
}: {
  signals: WorkSignal[]
  onOpen: (link: SignalLink) => void
}) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const actionCount = signals.filter((s) => s.severity === 'action').length

  /* 바깥을 누르거나 Esc를 누르면 닫힌다 — 열어 놓고 다른 걸 누르면 닫혀야 한다 */
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const summaryId = useId()

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        /* 이름은 **보이는 글자('알림')로 시작한다** — 음성 조작 사용자가 화면에 보이는
           대로 '알림 클릭'이라고 말할 수 있어야 한다(WCAG 2.5.3). 건수는 팝업이 다시
           말하므로 여기서는 처리할 것만 덧붙인다 */
        aria-label={actionCount > 0 ? `알림, 처리 필요 ${actionCount}건` : '알림'}
        className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
      >
        알림
        {actionCount > 0 && (
          <span className="ml-1 rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white">
            {actionCount}
          </span>
        )}
      </button>

      {/* 영역 이름을 따로 짓지 않는다. 지어 주면 버튼 이름 → 영역 이름 → 첫 줄까지
          같은 문장을 세 번 듣게 된다. 첫 줄이 곧 이름 노릇을 한다 */}
      {open && (
        <div
          role="region"
          /* 신호 제목·본문·출처가 전부 그 조직의 한국어 원문이다 */
          lang="ko"
          aria-labelledby={summaryId}
          className="absolute right-0 z-50 mt-1 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          <p id={summaryId} className="px-1 text-xs font-bold text-slate-600">
            업무 알림 {signals.length}건 · 처리 필요 {actionCount}건
          </p>
          {signals.length === 0 ? (
            <p className="px-1 py-3 text-sm text-slate-500">지금 처리할 알림이 없습니다.</p>
          ) : (
            <ul className="mt-2 max-h-96 space-y-2 overflow-y-auto">
              {signals.map((s) => (
                <li key={s.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${SEVERITY_STYLE[s.severity]}`}
                    >
                      {signalSeverityLabel(s.severity)}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatSignalTime(s.at)}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-900">{s.title}</p>
                  <p className="mt-0.5 text-sm text-slate-700">{s.detail}</p>
                  {/* 무엇이 이 알림을 만들었는지 — 근거 없는 알림은 확인할 방법이 없다 */}
                  <p className="mt-1 text-[11px] text-slate-400">출처 · {s.source}</p>
                  {s.link ? (
                    <button
                      type="button"
                      onClick={() => {
                        onOpen(s.link)
                        setOpen(false)
                      }}
                      className="mt-2 min-h-11 text-xs font-bold text-slate-700 underline hover:text-slate-900"
                    >
                      {s.link.label} →
                    </button>
                  ) : (
                    <p className="mt-2 text-[11px] text-slate-400">이어질 화면이 없는 안내입니다.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
