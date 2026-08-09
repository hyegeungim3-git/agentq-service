import { useCallback, useId, useState } from 'react'
import { Settings } from 'lucide-react'
import { DENSITY_LABEL, type Density } from '@shared/lib/adminPrefs'
import { useDismissable } from '@features/overlay/useDismissable'

/**
 * 상단바 톱니 — 원본에 있던 자리.
 *
 * **아무 일도 안 하는 톱니는 두지 않는다.** 지금 실제로 바뀌는 것은 표 밀도 하나뿐이고,
 * 그래서 하나만 있다. 나중에 서버가 붙어 계정별 설정이 생기면 여기가 그 자리다.
 */
export function AdminSettings({
  density,
  onDensity,
}: {
  density: Density
  onDensity: (d: Density) => void
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const boxRef = useDismissable<HTMLDivElement>(open, useCallback(() => setOpen(false), []))
  const groupId = useId()

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="화면 설정"
        className="flex size-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
      >
        <Settings className="size-4" aria-hidden="true" />
      </button>

      {/* 종과 같은 이유로 자리는 늘 둔다 */}
      <div
        hidden={!open}
        id={panelId}
        className="absolute top-12 right-0 z-40 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
      >
          <p id={groupId} className="text-[11px] font-bold text-slate-500">
            표 밀도
          </p>
          <div role="radiogroup" aria-labelledby={groupId} className="mt-2 flex gap-2">
            {(['comfortable', 'compact'] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={density === d}
                onClick={() => onDensity(d)}
                className={`min-h-11 flex-1 rounded-lg border text-xs font-bold ${
                  density === d
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {DENSITY_LABEL[d]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
            좁게 두면 한 화면에 더 많은 줄이 보이고, 손가락으로 짚기는 어려워집니다. 이 브라우저에만
            저장됩니다.
          </p>
      </div>
    </div>
  )
}
