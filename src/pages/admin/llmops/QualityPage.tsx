import { useMemo, useState } from 'react'
import {
  VERDICTS,
  VERDICT_LABEL,
  defectRatio,
  type ReviewVerdict,
} from '@entities/llmops/model'
import { fetchQualityReviews } from '@shared/api/llmops'
import { useRemote } from '@features/remote/useRemote'
import { readFeedbackSummary } from '@features/feedback/useFeedback'

/**
 * AI 답변 품질 관리.
 *
 * 두 갈래를 함께 본다.
 *  ① 전문가 검토 — 사람이 답변을 열어 보고 판정한 것
 *  ② 사용자 피드백 — 포털에서 누른 👍/👎
 *
 * ②는 **이 브라우저에 남은 것만** 보인다. 서버가 없어 다른 사람이 누른 것은 여기
 * 없고, 메시지 id가 새로고침마다 다시 매겨져 어떤 질문이었는지도 이어 붙일 수 없다.
 * 그 한계를 숫자 옆에 그대로 적는다 — 안 적으면 전사 집계로 읽힌다.
 *
 * 할루시네이션 판정 건은 맨 위에 둔다. 정확 판정 사이에 섞이면 그냥 넘어간다.
 */

const VERDICT_TONE: Record<ReviewVerdict, string> = {
  accurate: 'bg-emerald-100 text-emerald-800',
  needsFix: 'bg-amber-100 text-amber-900',
  hallucination: 'bg-rose-100 text-rose-800',
}

const ORDER: Record<ReviewVerdict, number> = { hallucination: 0, needsFix: 1, accurate: 2 }

export function QualityPage() {
  const [filter, setFilter] = useState<ReviewVerdict | 'all'>('all')
  const state = useRemote(fetchQualityReviews, [])
  // 읽을 때 한 번만 센다 — 렌더마다 저장소를 뒤지면 목록이 흔들린다
  const feedback = useMemo(() => readFeedbackSummary(), [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">AI 답변 품질 관리</h1>
      <p className="mt-1 text-sm text-slate-600">전문가 검토 결과와 사용자 피드백입니다.</p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">검토 내역을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const all = state.data
          const ratio = defectRatio(all)
          const shown = (filter === 'all' ? all : all.filter((r) => r.verdict === filter))
            .slice()
            .sort((a, b) => ORDER[a.verdict] - ORDER[b.verdict])
          return (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">검토</dt>
                  <dd className="text-xl font-black text-slate-900">{all.length}건</dd>
                </div>
                {VERDICTS.map((v) => {
                  const n = all.filter((r) => r.verdict === v).length
                  return (
                    <div
                      key={v}
                      className={`rounded-xl border p-4 text-center ${
                        v === 'hallucination' && n > 0
                          ? 'border-rose-200 bg-rose-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <dt className="text-[11px] font-bold text-slate-500">{VERDICT_LABEL[v]}</dt>
                      <dd
                        className={`text-xl font-black ${
                          v === 'hallucination' && n > 0 ? 'text-rose-800' : 'text-slate-900'
                        }`}
                      >
                        {n}건
                      </dd>
                    </div>
                  )
                })}
              </dl>

              {/* 평균 신뢰도만 보여 주면 '높으니 괜찮다'로 읽힌다 — 손봐야 하는 비율을 먼저 */}
              {ratio !== null && (
                <p className="mt-3 text-sm text-slate-700">
                  검토한 {all.length}건 중{' '}
                  <span className="font-black text-slate-900">{Math.round(ratio * 100)}%</span>가 손봐야
                  하는 답변입니다.
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {(['all', ...VERDICTS] as const).map((v) => (
                  <label
                    key={v}
                    className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
                  >
                    <input
                      type="radio"
                      name="verdict"
                      value={v}
                      checked={filter === v}
                      onChange={() => setFilter(v)}
                      className="sr-only"
                    />
                    {v === 'all' ? '전체' : VERDICT_LABEL[v]}
                  </label>
                ))}
              </div>

              <p className="mt-2 text-xs text-slate-600">{shown.length}건</p>
              <ul className="mt-2 space-y-3">
                {shown.map((r) => (
                  <li
                    key={r.id}
                    className={`rounded-xl border p-4 ${
                      r.verdict === 'hallucination' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${VERDICT_TONE[r.verdict]}`}>
                        {VERDICT_LABEL[r.verdict]}
                      </span>
                      <p className="text-sm font-black text-slate-900">{r.agentLabel}</p>
                      <span className="ml-auto text-[11px] text-slate-500">
                        신뢰도 {Math.round(r.confidence * 100)}% · {r.reviewedOn} · {r.reviewer}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-700">Q · {r.question}</p>
                    <p className="mt-0.5 text-xs text-slate-500">A · {r.answer}</p>
                    {/* 판정만 있고 이유가 없으면 무엇을 고쳐야 하는지 알 수 없다 */}
                    <p className="mt-2 text-xs font-bold text-slate-800">
                      검토 의견 ·{' '}
                      {r.note ?? <span className="font-normal text-slate-400">남기지 않음</span>}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )
        })()}

      <section
        aria-labelledby="user-feedback"
        className="mt-6 max-w-3xl rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="user-feedback" className="text-sm font-black text-slate-900">
            사용자 피드백
          </h2>
          {/* 안 적으면 전사 집계로 읽힌다 */}
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
            이 브라우저에 남은 것만
          </span>
        </div>

        {feedback.up + feedback.down === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            이 브라우저에 남은 피드백이 없습니다. 사용자 포털에서 답변에 👍/👎를 누르면 여기에 쌓입니다.
          </p>
        ) : (
          <>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <dt className="text-[11px] font-bold text-slate-500">도움됨</dt>
                <dd className="text-lg font-black text-slate-900">{feedback.up}건</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <dt className="text-[11px] font-bold text-slate-500">아쉬움</dt>
                <dd className="text-lg font-black text-slate-900">{feedback.down}건</dd>
              </div>
            </dl>
            {feedback.reasons.length > 0 && (
              <ul className="mt-3 space-y-1">
                {feedback.reasons.map((r) => (
                  <li key={r.reason} className="text-xs text-slate-700">
                    {r.reason} · <span className="font-bold">{r.count}건</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <p className="mt-3 text-[11px] text-slate-500">
          서버가 없어 다른 사람이 누른 피드백은 여기 없습니다. 어떤 질문이었는지도 이어 붙일 수
          없습니다 — 메시지 번호가 새로고침마다 다시 매겨지기 때문입니다. 서버가 붙으면 질문·답변과
          함께 집계됩니다.
        </p>
      </section>
    </main>
  )
}
