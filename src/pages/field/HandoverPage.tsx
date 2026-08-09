import { useState } from 'react'
import {
  HANDOVER_KIND_LABEL,
  unacknowledged,
  unresolvedPending,
  type HandoverKind,
} from '@entities/field/model'
import { confirmHandover, fetchReceivedHandover, fetchShifts } from '@shared/api/field'
import { useRemote } from '@features/remote/useRemote'
import { Button } from '@shared/ui/Button'

/**
 * 교대 인수인계.
 *
 * 3교대 현장에서 사고·품질 문제가 가장 많이 새는 지점이다. 받은 인계를 확인했는지,
 * 무엇이 확인 없이 남아 있는지를 먼저 말한다.
 *
 * ⚠️ **확인을 화면에만 남기지 않는다.** 다음 조가 열었을 때 그대로면 인계가 이 조에서
 * 끊긴다. 확인 처리는 서버가 해야 남고, 서버가 없으면 그 사실을 그대로 말한다.
 *
 * 미결(pending)을 따로 세는 이유: 이상·경보는 이미 조치가 돌지만, 미결은
 * **다음 조가 안 보면 아무도 안 한다.**
 */

const TONE: Record<HandoverKind, string> = {
  alarm: 'bg-rose-100 text-rose-800',
  action: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-900',
  note: 'bg-slate-100 text-slate-700',
}

export function HandoverPage() {
  const [checked, setChecked] = useState<string[]>([])
  const [failure, setFailure] = useState<string | null>(null)
  const shifts = useRemote(fetchShifts, [])
  const received = useRemote(fetchReceivedHandover, [])

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const confirm = () => {
    void confirmHandover(checked).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">교대 인수인계</h1>
      <p className="mt-1 text-sm text-slate-600">
        직전 조가 넘긴 내용을 확인하고, 무엇이 아직 안 닫혔는지 봅니다.
      </p>

      {shifts.kind === 'ready' && (
        <p className="mt-2 text-xs text-slate-500">
          {shifts.data.shifts.map((s) => `${s.label} ${s.time}`).join(' · ')} · 지금은{' '}
          <b className="text-slate-800">
            {shifts.data.shifts.find((s) => s.id === shifts.data.currentId)?.label ?? '—'}
          </b>
        </p>
      )}

      {received.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">인계 내용을 불러오는 중입니다</span>
        </div>
      )}

      {failure !== null && (
        <p role="alert" className="mt-3 max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {received.kind === 'ready' && (
        <>
          {(() => {
            const open = unacknowledged(received.data)
            const pending = unresolvedPending(received.data)
            return (
              <>
                {pending.length > 0 && (
                  <div className="mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-bold text-amber-900">
                      확인 없이 넘어온 미결 {pending.length}건
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {pending.map((i) => (
                        <li key={i.id} className="text-[11px] text-amber-900">
                          {i.text}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 text-[11px] text-amber-800">
                      이상·경보는 조치가 이미 돌지만 <b>미결은 다음 조가 안 보면 아무도 하지 않습니다.</b>
                    </p>
                  </div>
                )}

                <p className="mt-3 text-xs text-slate-600">
                  {received.data.author} · {received.data.at} 인계 · 전체 {received.data.items.length}건 중
                  확인 안 된 것 <b className={open.length > 0 ? 'text-amber-800' : 'text-emerald-700'}>{open.length}건</b>
                </p>

                <ul className="mt-2 space-y-2">
                  {received.data.items.map((i) => {
                    const already = received.data.acknowledged.includes(i.id)
                    return (
                      <li key={i.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-start gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TONE[i.kind]}`}>
                            {HANDOVER_KIND_LABEL[i.kind]}
                          </span>
                          <span className="min-w-0 flex-1 text-sm text-slate-800">{i.text}</span>
                          {already ? (
                            <span className="text-[11px] font-bold text-emerald-700">확인됨</span>
                          ) : (
                            <label className="flex min-h-11 cursor-pointer items-center gap-1.5 text-[11px] font-bold text-slate-600">
                              <input
                                type="checkbox"
                                checked={checked.includes(i.id)}
                                onChange={() => toggle(i.id)}
                                className="size-4"
                              />
                              확인
                            </label>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <Button tone="primary" layout="mt-4" onClick={confirm} disabled={checked.length === 0}>
                  확인 {checked.length}건 저장
                </Button>
                <p className="mt-2 max-w-3xl text-[11px] text-slate-500">
                  확인은 <b>다음 조가 볼 수 있어야</b> 의미가 있습니다. 서버에 남지 않으면 이 화면에서만
                  확인한 것이 됩니다.
                </p>
              </>
            )
          })()}
        </>
      )}
    </main>
  )
}
