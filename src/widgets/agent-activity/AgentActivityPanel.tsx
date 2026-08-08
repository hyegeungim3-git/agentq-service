import { Activity, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { AGENTS, type AgentId } from '@entities/agent/model'
import { recentlyUsed, totalRuns, type AgentActivity } from '@entities/agentusage/model'

/**
 * 내 에이전트 활동 — 원본 허브 오른쪽 패널이다(D-014).
 *
 * 세 가지를 둔다.
 *  ① **빠른 실행** — 최근에 쓴 것부터. 13장을 다시 훑지 않게 한다
 *  ② **최근 작업** — 무엇을 했고 무엇이 나왔는지
 *  ③ **지금 하면 좋을 일** — 업무 상태에서 나온 것
 *
 * ⚠️ ③을 'AI 추천'이라고 부르지 않는다. 지금 이 목록은 업무 맥락을 적어 둔 것이고,
 * 서버가 붙어도 추천의 **근거를 댈 수 있을 때만** 그렇게 부를 수 있다.
 * 근거 없는 추천은 사용자가 왜 그런지 물었을 때 답할 것이 없다.
 */

const nameOf = (id: AgentId): string => AGENTS.find((a) => a.id === id)?.name ?? id

export function AgentActivityPanel({
  activity,
  onOpen,
}: {
  activity: AgentActivity
  onOpen: (id: AgentId) => void
}) {
  const quick = recentlyUsed(activity.recent, 4)

  return (
    <aside
      aria-label="내 에이전트 활동"
      className="hidden h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-slate-50 xl:flex"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3">
        <Activity className="text-brand size-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm font-black text-slate-900">내 에이전트 활동</p>
        <span className="bg-brand-soft text-brand shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
          이번 달 {totalRuns(activity.usage)}회
        </span>
      </div>

      {quick.length > 0 && (
        <div className="border-b border-slate-200 p-3">
          <p className="text-[11px] font-bold text-slate-500">빠른 실행</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {quick.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onOpen(id)}
                  /* 허브 카드와 이름이 겹치지 않게 자리를 덧붙인다 */
                  aria-label={`${nameOf(id)} 빠른 실행에서 열기`}
                  className="min-h-11 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                >
                  {nameOf(id)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-b border-slate-200 p-3">
        <p className="text-[11px] font-bold text-slate-500">최근 작업</p>
        <ul className="mt-1.5 space-y-2">
          {activity.recent.map((r) => (
            <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-slate-900">{r.title}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-600">{r.detail}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="size-3" aria-hidden="true" />
                  {r.at}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3">
        <p className="text-[11px] font-bold text-slate-500">지금 하면 좋을 일</p>
        <ul className="mt-1.5 space-y-2">
          {activity.hints.map((h) => (
            <li key={h.id} className="border-brand-soft bg-brand-soft rounded-xl border p-3">
              <p className="text-xs font-bold text-slate-900">{h.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{h.body}</p>
              <button
                type="button"
                onClick={() => onOpen(h.agentId)}
                className="bg-brand text-brand-fg mt-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-[11px] font-bold hover:opacity-90"
              >
                {h.action}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        {/* 추천이라고 부르지 않는 이유를 화면이 밝힌다 */}
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
          업무 상태에서 뽑은 것입니다. AI가 판단한 추천이 아닙니다.
        </p>
      </div>
    </aside>
  )
}
