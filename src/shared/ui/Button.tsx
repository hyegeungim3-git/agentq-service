import type { ReactNode } from 'react'

/**
 * 동작 버튼 — 관리자와 사용자 포털이 함께 쓴다.
 *
 * 처음에는 관리자 쪽에만 뒀다. 그러고 나서 사용자 쪽을 재 보니 같은 일이 있었다 —
 * 버튼 80개 중 **같은 역할인데 서로 다른 것**이 여럿이었고, 심지어 마우스를 올렸을 때
 * 색이 다른 것도 있었다(`hover:bg-slate-50` / `hover:bg-slate-100`).
 *
 * 카드·칩·아이콘 원형처럼 **생김새 자체가 뜻인 버튼**은 여기 넣지 않는다. 그것까지
 * 밀어 넣으면 인자가 열 개가 되고, 결국 아무도 안 쓰게 된다. 여기는 '누르면 무슨 일이
 * 일어나는 네모난 버튼' 하나만 맡는다.
 *
 * **크기를 자유롭게 두지 않는다.** 색·여백을 덧대는 문이 있으면 지금 상태로
 * 돌아간다 — 자리 조정만 `layout`으로 받는다.
 */

export type ButtonTone = 'primary' | 'secondary' | 'danger' | 'link'
export type ButtonSize = 'md' | 'sm'

const TONE: Record<ButtonTone, string> = {
  primary: 'bg-brand text-brand-fg rounded-lg shadow-sm hover:opacity-90',
  secondary: 'rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50',
  /* 되돌릴 수 없는 일과 '다시 시도' 둘 다 여기 온다 — 붉은색은 '멈춰 보라'는 뜻이다 */
  danger: 'rounded-lg border border-rose-300 text-rose-800 hover:bg-rose-50',
  /* 가벼운 일에만. 되돌릴 수 없는 일에는 쓰지 않는다 */
  link: 'text-slate-600 underline underline-offset-2 hover:text-slate-900',
}

const SIZE: Record<ButtonSize, string> = {
  md: 'px-4 text-sm',
  sm: 'px-3 text-xs',
}

export function Button({
  tone = 'secondary',
  size = 'md',
  layout = '',
  type = 'button',
  disabled = false,
  onClick,
  children,
  ...rest
}: {
  tone?: ButtonTone
  size?: ButtonSize
  /** 자리만 — `ml-auto`·`mt-3`·`w-full` 같은 것 */
  layout?: string
  /** 폼 안에서 Enter로 보내는 버튼은 submit이어야 한다 */
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
      /* 44px은 손가락이 닿는 최소치다. 아이콘을 같이 넣는 버튼이 많아 가운데 정렬을 기본으로 둔다 */
      className={`inline-flex min-h-11 items-center justify-center gap-2 font-bold disabled:cursor-not-allowed disabled:opacity-50 ${TONE[tone]} ${pad} ${layout}`}
      {...rest}
    >
      {children}
    </button>
  )
}
