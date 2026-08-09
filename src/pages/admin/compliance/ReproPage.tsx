import { useState } from 'react'
import {
  PART_LABEL,
  canReproduce,
  driftCounts,
  drifted,
  missingSourceRev,
  type Snapshot,
} from '@entities/repro/model'
import { fetchSnapshots, runReproduction } from '@shared/api/repro'
import { useRemote } from '@features/remote/useRemote'
import { AdminButton } from '@widgets/admin-shell/AdminControls'

/**
 * 답변 재현성.
 *
 * "왜 지난달과 답이 다르냐"에 답하는 화면이다. 그러려면 그때의 구성이 남아 있어야 한다.
 *
 * ⚠️ **이 화면은 '같은 답이 나오는가'를 말하지 않는다.** 질의·답변 원문을 보관하지
 * 않기 때문이다(접근 로그·이용 이력과 같은 전제, §3-7). 여기서 말할 수 있는 것은
 * **'그때 구성 그대로 돌릴 수 있는가'까지**이며, 그 한계를 맨 위에서 밝힌다.
 * 그 이상을 말하려면 원문 보관을 정해야 하고, 정하는 것은 법무·백엔드다.
 *
 * 재현 가능 여부를 저장된 값으로 두지 않는다 — 구성이 바뀐 뒤에도 '가능'이 남는다.
 * 지금 구성과의 차이에서 계산한다.
 */

function ConfigRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] text-slate-400">{k}</dt>
      <dd className="text-[11px] font-bold text-slate-700">{v}</dd>
    </div>
  )
}

function SnapshotCard({
  s,
  open,
  onToggle,
  onRun,
  running,
}: {
  s: Snapshot
  open: boolean
  onToggle: () => void
  onRun: () => void
  running: boolean
}) {
  const ok = canReproduce(s)
  const noRev = s.sources.some((x) => x.rev.trim() === '')
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-slate-900">{s.topic}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
          {s.agentLabel}
        </span>
        <span
          className={`ml-auto rounded px-1.5 py-0.5 text-[11px] font-bold ${
            ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
          }`}
        >
          {ok ? '그때 구성 그대로' : `구성이 바뀜 ${s.drift.length}곳`}
        </span>
      </div>

      <p className="mt-1 text-[11px] text-slate-500">
        {s.at} · {s.model} {s.modelVersion} · {s.knowledgeRev} · 프롬프트 {s.promptVersion}
      </p>

      {noRev && (
        <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] text-rose-900">
          근거 문서의 <b>개정 버전이 안 남았습니다</b> — 같은 이름의 문서를 찾아도 그때와 같은
          내용이라고 말할 수 없습니다.
        </p>
      )}

      <AdminButton tone="link" size="sm" layout="mt-2" onClick={onToggle} aria-expanded={open}>
        {open ? '구성 상세 접기' : '구성 상세 보기'}
      </AdminButton>

      {open && (
        <div className="mt-2 border-t border-slate-100 pt-3">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ConfigRow k="모델" v={`${s.model} ${s.modelVersion}`} />
            <ConfigRow k="지식베이스" v={s.knowledgeRev} />
            <ConfigRow k="프롬프트" v={s.promptVersion} />
            <ConfigRow k="가드레일" v={s.guardrailVersion} />
            <ConfigRow k="temperature" v={String(s.temperature)} />
          </dl>

          <p className="mt-3 text-[11px] font-bold text-slate-500">그때 검색된 근거 문서</p>
          <ul className="mt-1 space-y-1">
            {s.sources.map((src) => (
              <li
                key={src.name}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5"
              >
                <span className="text-[11px] font-bold text-slate-700">{src.name}</span>
                <span className={`ml-auto text-[10px] ${src.rev ? 'text-slate-400' : 'font-bold text-rose-700'}`}>
                  {src.rev === '' ? '개정 버전 없음' : src.rev}
                </span>
              </li>
            ))}
          </ul>

          {s.drift.length > 0 && (
            <>
              <p className="mt-3 text-[11px] font-bold text-amber-800">지금 구성과의 차이</p>
              <ul className="mt-1 space-y-1">
                {s.drift.map((d) => (
                  <li
                    key={d.part}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-900"
                  >
                    <b>{PART_LABEL[d.part]}</b> — 그때 {d.was} → 지금 {d.now}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="mt-3">
        <AdminButton size="sm" onClick={onRun} disabled={running}>
          {running ? '재현 시도 중…' : '이 구성으로 재현'}
        </AdminButton>
      </div>
    </li>
  )
}

export function ReproPage() {
  const [open, setOpen] = useState<string | null>(null)
  const [running, setRunning] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const snapshots = useRemote(fetchSnapshots, [])

  const run = (id: string) => {
    setRunning(id)
    void runReproduction(id).then((res) => {
      setRunning(null)
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">답변 재현성</h1>
      <p className="mt-1 text-sm text-slate-600">
        과거 답변을 그때의 구성 그대로 다시 돌릴 수 있는지 봅니다.
      </p>

      {/* 이 화면이 어디까지 답할 수 있는지를 먼저 말한다 */}
      <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <b>질의·답변 원문은 보관하지 않습니다.</b> 접근 로그·이용 이력도 같은 전제로 서 있습니다.
        그래서 여기서 말할 수 있는 것은 <b>'그때 구성 그대로 돌릴 수 있는가'까지</b>이며,
        '같은 답이 나오는가'는 원문 보관이 정해져야 답할 수 있습니다(제안서 §3-7 · 법무 결정).
      </p>

      {failure && (
        <p role="alert" className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {snapshots.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">스냅샷을 불러오는 중입니다</span>
        </div>
      )}

      {snapshots.kind === 'ready' && (
        <>
          {(() => {
            const gone = drifted(snapshots.data)
            const noRev = missingSourceRev(snapshots.data)
            const counts = driftCounts(snapshots.data)
            return (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { k: '보관 스냅샷', v: `${snapshots.data.length}건`, tone: 'text-slate-900' },
                    {
                      k: '그때 구성 그대로',
                      v: `${snapshots.data.length - gone.length}건`,
                      tone: 'text-emerald-700',
                    },
                    { k: '구성이 바뀜', v: `${gone.length}건`, tone: gone.length ? 'text-amber-800' : 'text-emerald-700' },
                    {
                      k: '근거 개정 버전 없음',
                      v: `${noRev.length}건`,
                      tone: noRev.length ? 'text-rose-800' : 'text-emerald-700',
                    },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <dd className={`text-xl font-black ${s.tone}`}>{s.v}</dd>
                      <dt className="mt-0.5 text-[11px] text-slate-500">{s.k}</dt>
                    </div>
                  ))}
                </dl>

                {/* 재현 불가 자체는 결함이 아니다 — 무엇이 바뀌었는지 말할 수 있으면 된다 */}
                {gone.length > 0 && (
                  <div className="mt-3 max-w-3xl rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-bold text-slate-900">
                      구성이 바뀌어 그대로 못 돌리는 스냅샷 {gone.length}건
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      모델도 색인도 바뀌는 것이 정상입니다. <b>재현 불가 자체는 결함이 아니고</b>,
                      심사에서 요구받는 것은 무엇이 언제 바뀌었는지 말할 수 있는가입니다.
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {counts.map((c) => (
                        <li
                          key={c.part}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700"
                        >
                          {PART_LABEL[c.part]} 바뀜 <b>{c.count}건</b>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <ul className="mt-3 space-y-2">
                  {snapshots.data.map((s) => (
                    <SnapshotCard
                      key={s.id}
                      s={s}
                      open={open === s.id}
                      onToggle={() => setOpen(open === s.id ? null : s.id)}
                      onRun={() => run(s.id)}
                      running={running === s.id}
                    />
                  ))}
                </ul>
              </>
            )
          })()}
        </>
      )}
    </main>
  )
}
