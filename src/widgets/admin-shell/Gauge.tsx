/**
 * 사용률 게이지.
 *
 * 원본 관리자 대시보드가 반원 게이지로 보여 주던 자리다(D-014). 숫자만 있으면
 * 5.3%와 58.4%가 같은 무게로 보인다 — 채워진 만큼이 보여야 한눈에 갈린다.
 *
 * SVG로 직접 그린다. 차트 라이브러리를 다시 들이지 않는다(D-011에서 뺐다) —
 * 반원 하나에 105KB를 쓸 이유가 없다.
 *
 * ⚠️ 색만으로 구분하지 않는다. 숫자와 라벨이 항상 함께 있고, 게이지는 보조다.
 */
export function Gauge({ label, value, unit }: { label: string; value: number; unit: string }) {
  /* 반원의 길이. r=42인 반원 둘레는 π·42 ≈ 132 */
  const LEN = 132
  const filled = Math.max(0, Math.min(100, value)) / 100
  const tone = value >= 80 ? 'stroke-rose-500' : value >= 60 ? 'stroke-amber-500' : 'stroke-emerald-500'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-center text-xs text-slate-600">{label}</p>
      <div className="relative mx-auto mt-2 w-full max-w-[132px]">
        <svg viewBox="0 0 100 56" className="w-full" role="img" aria-label={`${label} ${value}${unit}`}>
          <path
            d="M8 50 A42 42 0 0 1 92 50"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-slate-200"
          />
          <path
            d="M8 50 A42 42 0 0 1 92 50"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${LEN * filled} ${LEN}`}
            className={tone}
          />
        </svg>
        <p className="-mt-6 text-center text-xl font-black text-slate-900">
          {value}
          <span className="text-sm font-bold text-slate-500">{unit}</span>
        </p>
      </div>
    </div>
  )
}
