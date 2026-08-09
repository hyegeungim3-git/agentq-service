import type { ReactNode } from 'react'

/**
 * 관리자 조작 부품 — 버튼과 탭.
 *
 * 재 보니 버튼 39개가 **클래스 20종**이었다. 역할은 셋뿐인데(주요 동작 · 보조 동작 ·
 * 링크처럼 쓰는 것) 화면마다 여백과 글자 크기가 조금씩 달랐다. 하나씩 보면 눈에 안
 * 띄지만 51화면을 이어서 보면 같은 제품 같지 않다.
 *
 * **크기를 자유롭게 두지 않는다.** 부르는 쪽이 `className`으로 색이나 여백을 덧대면
 * 지금 상태로 되돌아간다 — 그래서 그 문이 없다. 자리 조정(`ml-auto`·`mt-3` 같은 것)만
 * `layout`으로 받는다.
 */

type Tone = 'primary' | 'secondary' | 'link'
type Size = 'md' | 'sm'

const TONE: Record<Tone, string> = {
  primary: 'bg-brand text-brand-fg rounded-lg hover:opacity-90',
  secondary: 'rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50',
  /* 되돌릴 수 없는 일에는 쓰지 않는다 — 링크처럼 보이는 것은 가벼운 일에만 */
  link: 'text-slate-600 underline underline-offset-2 hover:text-slate-900',
}

const SIZE: Record<Size, string> = {
  md: 'px-4 text-sm',
  sm: 'px-3 text-[11px]',
}

export function AdminButton({
  tone = 'secondary',
  size = 'md',
  layout = '',
  type = 'button',
  disabled = false,
  onClick,
  children,
  ...rest
}: {
  tone?: Tone
  size?: Size
  /** 자리만 — `ml-auto`·`mt-3` 같은 것. 색·여백은 받지 않는다 */
  layout?: string
  /** 폼 안에서 Enter로 보내는 버튼은 submit이어야 한다 — 기본값은 button */
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
} & { 'aria-label'?: string; title?: string }) {
  const pad = tone === 'link' ? '' : SIZE[size]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      /* 44px은 손가락이 닿는 최소치다. 관리자라고 마우스만 쓰는 것이 아니다 */
      className={`min-h-11 font-bold disabled:cursor-not-allowed disabled:opacity-50 ${TONE[tone]} ${pad} ${layout}`}
      {...rest}
    >
      {children}
    </button>
  )
}

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
    <div role="tablist" aria-label={label} className={`${layout} flex flex-wrap gap-2`}>
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
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
