import { OUTCOME_LABEL, disputed, passedThrough, type BlockOutcome } from '@entities/compliance/model'
import { fetchGuardrailHits } from '@shared/api/compliance'
import { useRemote } from '@features/remote/useRemote'

/**
 * 가드레일 — 실제로 무엇이 걸렸는지.
 *
 * 규칙을 켜고 끄는 것은 **신뢰성 관리**에서 한다. 같은 목록을 두 화면에 두면
 * 어느 쪽이 진짜인지 알 수 없다. 여기는 이력과 증거만 본다.
 *
 * **'경고만'을 차단과 같은 칸에 세지 않는다.** 경고만 한 건은 실제로는 나갔다.
 * 합계에 섞으면 다 막은 것처럼 읽힌다.
 *
 * ⚠️ 걸린 내용의 원문은 없다. 개인정보를 가리려고 만든 규칙의 이력에 그
 * 개인정보가 실려 있으면 앞뒤가 안 맞는다.
 */

const TONE: Record<BlockOutcome, string> = {
  blocked: 'bg-rose-100 text-rose-800',
  masked: 'bg-amber-100 text-amber-900',
  warned: 'bg-slate-100 text-slate-600',
}

export function GuardrailPage() {
  const state = useRemote(fetchGuardrailHits, [])

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">가드레일</h1>
      <p className="mt-1 text-sm text-slate-600">
        규칙에 걸린 실제 기록입니다. 규칙을 켜고 끄는 것은 <b>LLM 운영 &gt; 신뢰성 관리</b>에서
        합니다 — 같은 목록을 두 화면에 두지 않았습니다.
      </p>

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">차단 이력을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const hits = state.data
          const passed = passedThrough(hits)
          const claims = disputed(hits)
          const stopped = hits.filter((h) => h.outcome !== 'warned')
          return (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">걸린 건수</dt>
                  <dd className="text-xl font-black text-slate-900">{hits.length}건</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">막거나 가림</dt>
                  <dd className="text-xl font-black text-slate-900">{stopped.length}건</dd>
                </div>
                {/* 경고만 한 건은 실제로는 나갔다 */}
                <div
                  className={`rounded-xl border p-4 text-center ${
                    passed.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <dt className="text-[11px] font-bold text-slate-500">경고만 — 나갔음</dt>
                  <dd className="text-xl font-black text-amber-900">{passed.length}건</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">이의 제기</dt>
                  <dd className="text-xl font-black text-slate-900">{claims.length}건</dd>
                </div>
              </dl>

              {passed.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  경고만 한 {passed.length}건은 <b>실제로 사용자에게 나갔습니다.</b> 위 '걸린 건수'를
                  차단 건수로 읽으면 안 됩니다. 막을지 경고만 할지는 신뢰성 관리에서 규칙별로
                  정합니다.
                </p>
              )}

              {claims.length > 0 && (
                <p className="mt-3 max-w-3xl rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                  이의 제기 {claims.length}건은 <b>막은 것이 맞았는지 확인이 필요한 건</b>입니다.
                  규칙이 너무 세면 일을 못 하게 되고, 느슨하면 나가면 안 되는 것이 나갑니다.
                </p>
              )}

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
                <table className="w-full min-w-[48rem] text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">시각</th>
                      <th scope="col" className="px-3 py-2">규칙</th>
                      <th scope="col" className="px-3 py-2">화면</th>
                      <th scope="col" className="px-3 py-2">사용자</th>
                      <th scope="col" className="px-3 py-2">걸린 것</th>
                      <th scope="col" className="px-3 py-2">처리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 경고만 한 것을 위로 — 놓치면 안 되는 쪽이다 */}
                    {[...passed, ...stopped].map((h) => (
                      <tr key={h.id} className={`border-t border-slate-100 ${h.outcome === 'warned' ? 'bg-amber-50' : ''}`}>
                        <td className="px-3 py-2 tabular-nums text-slate-600">{h.at}</td>
                        <td className="px-3 py-2 font-bold text-slate-800">{h.ruleName}</td>
                        <td className="px-3 py-2 text-slate-600">{h.agentLabel}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {h.actor}
                          {h.disputed && (
                            <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              이의
                            </span>
                          )}
                        </td>
                        {/* 원문이 아니라 종류만 */}
                        <td className="px-3 py-2 text-slate-600">{h.what}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TONE[h.outcome]}`}>
                            {OUTCOME_LABEL[h.outcome]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 max-w-3xl text-xs text-slate-500">
                걸린 내용의 원문은 남기지 않습니다. 개인정보를 가리려고 만든 규칙의 이력에 그
                개인정보가 그대로 있으면 앞뒤가 맞지 않습니다 — 종류와 건수만 남습니다.
              </p>
            </>
          )
        })()}
    </main>
  )
}
