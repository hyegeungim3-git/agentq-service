import { useEffect, useRef, useState } from 'react'
import {
  SCAN_KIND_LABEL,
  cameraScanSupported,
  lookupCode,
  type ScanTarget,
} from '@entities/scan/model'
import { fetchScanTargets } from '@shared/api/scan'
import { useRemote } from '@features/remote/useRemote'
import { useModalOverlay } from '@features/overlay/useModalOverlay'

/**
 * 코드로 찾기.
 *
 * 카메라가 되면 카메라로, 안 되면 목록과 직접 입력으로. **셋을 한 화면에 둔다** —
 * 카메라에만 기대면 지원 안 하는 기기·권한 거부·어두운 현장에서 없는 기능이 된다.
 *
 * 고른 결과는 **바로 보내지 않고 입력창에 채운다.** 코드 인식도 오인식이 있고,
 * 옆 설비 코드를 읽은 채 질의가 나가면 남의 설비 상태를 자기 것으로 읽는다.
 */

export function ScanDialog({
  onPick,
  onClose,
}: {
  onPick: (target: ScanTarget) => void
  onClose: () => void
}) {
  const [manual, setManual] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [camera, setCamera] = useState<'idle' | 'unsupported' | 'denied' | 'live'>('idle')
  const targets = useRemote(fetchScanTargets, [])
  const streamRef = useRef<MediaStream | null>(null)
  /* 덮어 여는 것은 대화상자다 — 포커스를 안으로, Tab을 안에 가두고, Esc로 닫는다 */
  const boxRef = useModalOverlay(true, onClose, Number.MAX_SAFE_INTEGER)

  /* 화면을 닫을 때 카메라를 반드시 끈다 — 안 끄면 표시등이 계속 켜져 있다 */
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  const startCamera = async () => {
    setError(null)
    if (!cameraScanSupported()) {
      setCamera('unsupported')
      return
    }
    try {
      /* 뒷면 카메라를 요청한다 — 설비에 붙은 코드는 앞면으로 찍을 수 없다 */
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCamera('live')
    } catch {
      setCamera('denied')
    }
  }

  const submit = (raw: string) => {
    if (targets.kind !== 'ready') return
    const hit = lookupCode(targets.data, raw)
    if (hit === null) {
      /* 비슷한 코드로 넘겨짚지 않는다 — 옆 설비를 이 설비로 읽게 된다 */
      setError(`등록되지 않은 코드입니다: ${raw.trim()}`)
      return
    }
    onPick(hit)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="코드로 찾기 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-title"
        className="relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 sm:rounded-2xl"
      >
        <h2 id="scan-title" className="text-sm font-black text-slate-900">
          코드로 찾기
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          설비·로트·작업지시에 붙은 코드로 바로 물어봅니다.
        </p>

        <div className="mt-3 rounded-xl border border-slate-200 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void startCamera()}
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              카메라로 찍기
            </button>
            {camera === 'live' && (
              <span role="status" className="text-[11px] font-bold text-emerald-700">
                카메라를 켰습니다
              </span>
            )}
          </div>

          {camera === 'unsupported' && (
            <p className="mt-2 text-[11px] text-slate-600">
              이 브라우저는 코드 인식을 지원하지 않습니다. <b>아래 목록이나 직접 입력을 쓰십시오.</b>
            </p>
          )}
          {camera === 'denied' && (
            <p role="alert" className="mt-2 text-[11px] font-bold text-rose-700">
              카메라 권한이 없어 켜지 못했습니다. 아래 목록이나 직접 입력을 쓰십시오.
            </p>
          )}
          {camera === 'live' && (
            <p className="mt-2 text-[11px] text-amber-800">
              읽은 코드는 <b>바로 보내지 않고 입력창에 채웁니다.</b> 옆 설비 코드를 잘못 읽었을 때
              그대로 질의가 나가면 남의 설비 상태를 자기 것으로 읽게 됩니다.
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(manual)
          }}
          className="mt-3"
        >
          <label htmlFor="scan-code" className="block text-[11px] font-bold text-slate-500">
            코드 직접 입력
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            <input
              id="scan-code"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="예: PRS-C03"
              className="min-h-11 min-w-48 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
            />
            <button
              type="submit"
              disabled={manual.trim() === ''}
              className="bg-brand text-brand-fg min-h-11 rounded-lg px-4 text-sm font-bold hover:opacity-90 disabled:opacity-40"
            >
              찾기
            </button>
          </div>
        </form>

        {error !== null && (
          <p role="alert" className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">
            {error}
          </p>
        )}

        {targets.kind === 'ready' && (
          <>
            <p className="mt-4 text-[11px] font-bold text-slate-500">등록된 코드</p>
            <ul className="mt-1 space-y-1.5">
              {targets.data.map((t) => (
                <li key={t.code}>
                  <button
                    type="button"
                    onClick={() => onPick(t)}
                    className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 text-left text-xs hover:bg-slate-50"
                  >
                    {/* 줄을 나눠 쓴 요소 사이에는 JSX가 공백을 남기지 않는다. 그대로 두면
                        낭독기가 '설비PRS-C03프레스 3호기'로 붙여 읽는다 — 눈으로는 gap이
                        벌려 주지만 이름에는 없다. 공백을 명시한다(플렉스에서 무시된다) */}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {SCAN_KIND_LABEL[t.kind]}
                    </span>{' '}
                    <span className="font-mono text-[11px] text-slate-700">{t.code}</span>{' '}
                    <span className="text-slate-600">{t.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
