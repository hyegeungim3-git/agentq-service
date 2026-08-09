/**
 * 관리자 탭 묶음.
 *
 * 버튼은 여기 없다 — 사용자 포털에도 같은 것이 있어 `shared/ui/Button`으로 올렸다.
 * 관리자 전용으로 두었더니 사용자 쪽이 같은 버튼을 다시 그리고 있었다.
 */

export type TabItem<T extends string> = { id: T; label: string }

/**
 * 탭 묶음 — 8화면이 같은 것을 따로 그리고 있었다.
 *
 * `role="tablist"`에 **이름을 반드시 준다.** 이름 없는 탭 묶음은 낭독기가
 * "탭 목록"이라고만 말하고 무엇을 고르는 것인지는 안 알려 준다.
 */
export function AdminTabs<T extends string>({
  label,
  items,
  value,
  onChange,
  layout = 'mt-4',
}: {
  label: string
  items: readonly TabItem<T>[]
  value: T
  onChange: (id: T) => void
  layout?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      /**
       * 탭이라고 말했으면 **탭처럼 움직여야 한다.**
       *
       * `role="tab"`을 들은 낭독기 사용자는 좌우 화살표로 옮겨 다닌다. 그런데
       * 화살표를 안 받으면 아무 일도 안 일어나고, 그때부터 이 묶음은 '고장 난 탭'이다.
       * 역할을 뗄 수도 있었지만, 실제로 탭처럼 쓰는 것이 맞으니 동작을 채운다.
       */
      onKeyDown={(e) => {
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
        if (step === 0) return
        e.preventDefault()
        const i = items.findIndex((t) => t.id === value)
        /* 끝에서 반대편으로 돈다 — 탭 묶음의 관례다 */
        const next = items[(i + step + items.length) % items.length]
        if (next) onChange(next.id)
      }}
      className={`${layout} flex flex-wrap gap-2`}
    >
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          /* 고른 것만 탭 순서에 둔다 — 안 그러면 탭 키로 묶음 전체를 지나야 한다 */
          tabIndex={value === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
          className={`min-h-11 rounded-full border px-4 text-sm font-bold ${
            value === t.id
              ? 'border-slate-900 bg-brand text-brand-fg'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
