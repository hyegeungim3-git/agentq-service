import {
  actionable,
  formatSignalTime,
  signalSeverityLabel,
  type SignalLink,
  type WorkSignal,
} from '@entities/signal/model'

/**
 * 오늘의 업무 브리핑.
 *
 * 알림 센터와 **같은 데이터**를 쓴다. 따로 두면 한쪽만 고쳐져 서로 다른 말을 한다.
 * 다만 보여 주는 방식이 다르다 — 벨은 전부를 시간순으로, 브리핑은 **처리해야 하는 것**을
 * 먼저 크게. 빈 화면에서 사용자가 가장 먼저 봐야 하는 것이 그것이기 때문이다.
 */
export function BriefingCards({
  signals,
  onOpen,
}: {
  signals: WorkSignal[]
  onOpen: (link: SignalLink) => void
}) {
  if (signals.length === 0) return null
  const todo = actionable(signals)
  const rest = signals.filter((s) => s.severity !== 'action')

  return (
    <section aria-labelledby="briefing" className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 id="briefing" className="text-sm font-black text-slate-900">
        오늘의 업무 브리핑
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        {todo.length > 0
          ? `지금 처리해야 하는 일이 ${todo.length}건 있습니다.`
          : '지금 처리해야 하는 일은 없습니다.'}
      </p>

      {todo.length > 0 && (
        <ul className="mt-3 space-y-2">
          {todo.map((s) => (
            <li key={s.id} className="rounded-lg border border-rose-200 bg-rose-50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {signalSeverityLabel(s.severity)}
                </span>
                <span className="text-[11px] text-rose-900">{formatSignalTime(s.at)}</span>
              </div>
              <p className="mt-1 text-sm font-bold text-rose-900">{s.title}</p>
              <p className="mt-0.5 text-sm text-rose-900">{s.detail}</p>
              {s.link && (
                <button
                  type="button"
                  onClick={() => onOpen(s.link)}
                  className="mt-2 min-h-11 rounded-lg bg-rose-700 px-3 text-xs font-bold text-white hover:bg-rose-800"
                >
                  {s.link.label} →
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {rest.length > 0 && (
        <>
          <p className="mt-4 text-xs font-bold text-slate-600">그 밖에</p>
          <ul className="mt-1 space-y-1.5">
            {rest.map((s) => (
              <li key={s.id} className="flex flex-wrap items-baseline gap-2 text-sm">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {signalSeverityLabel(s.severity)}
                </span>
                <span className="text-slate-700">{s.title}</span>
                {s.link && (
                  <button
                    type="button"
                    onClick={() => onOpen(s.link)}
                    className="min-h-11 text-xs font-bold text-slate-500 underline hover:text-slate-900"
                  >
                    {s.link.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
