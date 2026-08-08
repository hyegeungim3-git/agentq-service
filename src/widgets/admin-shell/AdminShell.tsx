import { useCallback, useState, type ReactNode } from 'react'
import { Grid2x2, LayoutGrid, Menu, User } from 'lucide-react'
import {
  ADMIN_SECTIONS,
  childrenOf,
  findMenu,
  landingOf,
  menusOf,
  plannedCount,
  readyCount,
} from '@entities/admin/nav'
import { BrandLock } from '@shared/ui/Brand'
import { SkipToMain } from '@shared/ui/SkipLink'
import { useModalOverlay } from '@features/overlay/useModalOverlay'
import { FALLBACK_ICON, MENU_ICONS, menuIcon } from './menuIcons'

/**
 * 관리자 셸 — 좌측 메뉴와 상단 바.
 *
 * `<main>`은 각 화면이 갖는다. 셸은 `<nav>`와 배치만 맡는다.
 *
 * **아직 안 만든 메뉴를 감추지 않는다.** 감추면 '이 제품에는 사용자 관리가 없다'로
 * 읽힌다. 목록에 두되 '준비 중'으로 구분하고, 몇 개가 준비 중인지 위에서 먼저 말한다.
 * 눌러도 아무 일 없는 항목이 아니라, 무엇이 언제 오는지 말하는 화면으로 간다.
 */

/**
 * 지금 어느 구역의 어느 화면인지.
 *
 * 메뉴가 55개라 화면 제목만으론 위치를 모른다. **제목(h1)은 각 화면이 갖는다** —
 * 여기는 그 위의 길만 말한다. 둘을 같은 곳에서 만들면 또 갈라진다.
 */
function Crumb({ menuId }: { menuId: string }) {
  const here = findMenu(menuId)
  if (!here) return <span className="text-sm font-bold text-slate-800">관리자</span>
  const parent = here.parentId === null ? null : findMenu(here.parentId)
  /* 표에서 바로 꺼낸다. 함수로 감싸면 린트가 '렌더 중에 컴포넌트를 만든다'로 본다 —
     아이콘은 모듈 상수라 매 렌더 같은 것이지만, 규칙은 호출식을 구분하지 못한다 */
  const Icon = MENU_ICONS[parent?.id ?? here.id] ?? FALLBACK_ICON
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="bg-brand-soft flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Icon className="text-brand size-4" aria-hidden="true" />
      </span>
      <span className="hidden min-w-0 truncate text-xs text-slate-500 sm:block">
        {here.section}
        {parent && ` · ${parent.label}`}
      </span>
      <span className="truncate text-sm font-bold text-slate-800">{here.label}</span>
    </span>
  )
}

export type AdminShellProps = {
  menuId: string
  onMenu: (id: string) => void
  onExitAdmin: () => void
  onUserPortal: () => void
  admin: { name: string; org: string }
  children: ReactNode
}

export function AdminShell({
  menuId,
  onMenu,
  onExitAdmin,
  onUserPortal,
  admin,
  children,
}: AdminShellProps) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  /* 좁은 화면에서 메뉴는 본문을 덮는다 — 덮으면 대화상자여야 한다 */
  const panelRef = useModalOverlay(open, close)

  const nav = (
    <nav
      aria-label="관리자 메뉴"
      className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white"
    >
      {/* 원본처럼 머리를 브랜드 색으로 채운다 — 관리자 콘솔에 들어와 있다는 표시가
          화면 맨 위에 있어야 사용자 포털과 헷갈리지 않는다(둘 다 흰 사이드바였다) */}
      <div className="bg-brand p-4">
        <BrandLock context="관리자" size="sm" tone="onBrand" />
        <p className="mt-2 text-xs text-white/90">{admin.org}</p>
        {/* 목록을 보기 전에 얼마가 준비 중인지 먼저 말한다 */}
        <p className="mt-1 text-[11px] text-white/90">
          화면 {readyCount()}개 사용 가능 · {plannedCount()}개 준비 중
        </p>
      </div>

      {ADMIN_SECTIONS.map((section) => (
        <div key={section} className="border-b border-slate-200 p-2">
          <p className="px-3 py-1 text-[11px] font-bold tracking-wide text-slate-400">{section}</p>
          <ul>
            {menusOf(section).map((m) => {
              const kids = childrenOf(m.id)
              /* 상위 항목 자체에는 화면이 없다 — 첫 하위 메뉴로 보낸다 */
              const active = menuId === m.id || kids.some((k) => k.id === menuId)
              const Icon = menuIcon(m.id)
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onMenu(landingOf(m.id))
                      close()
                    }}
                    aria-current={menuId === m.id ? 'page' : undefined}
                    /* 원본은 지금 보고 있는 곳을 **연한 배경 + 브랜드 글씨 + 왼쪽 굵은 바**로
                       표시한다. 진한 색으로 꽉 채우면 메뉴 55개 중 한 줄만 크게 튀어
                       목록 전체의 결이 끊긴다 */
                    className={`flex min-h-11 w-full items-center gap-2 rounded-lg border-l-[3px] px-3 text-left text-sm ${
                      active
                        ? 'border-brand bg-brand-soft text-brand font-bold'
                        : m.status === 'ready'
                          ? 'border-transparent font-bold text-slate-700 hover:bg-slate-50'
                          : 'border-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`size-4 shrink-0 ${active ? '' : 'text-slate-400'}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate">{m.label}</span>
                    {/* 색만으로 구분하지 않는다 */}
                    {m.status === 'planned' && (
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          active ? 'text-brand bg-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        준비 중
                      </span>
                    )}
                  </button>

                  {/* 하위 메뉴는 그 묶음 안에 있을 때만 편다 — 늘 펴 두면 24개가 60개로 보인다 */}
                  {kids.length > 0 && active && (
                    <ul className="mb-1 ml-3 border-l border-slate-200 pl-2">
                      {kids.map((k) => (
                        <li key={k.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onMenu(k.id)
                              close()
                            }}
                            aria-current={menuId === k.id ? 'page' : undefined}
                            className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-xs ${
                              menuId === k.id
                                ? 'bg-brand-soft text-brand font-bold'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {/* 원본의 점 마커 — 들여쓰기만으로는 상위와 하위가 안 갈린다 */}
                            <span
                              aria-hidden="true"
                              className={`size-1.5 shrink-0 rounded-full ${
                                menuId === k.id ? 'bg-brand' : 'bg-slate-300'
                              }`}
                            />
                            {k.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <div className="mt-auto border-t border-slate-200 p-4">
        <div className="flex items-center gap-2.5">
          <span className="bg-brand-soft border-brand-soft flex size-9 shrink-0 items-center justify-center rounded-full border">
            <User className="text-brand size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-800">{admin.name}</span>
            <span className="block text-xs text-slate-500">관리자</span>
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onUserPortal}
            className="min-h-11 text-xs font-bold text-slate-500 underline hover:text-slate-900"
          >
            사용자 포털로
          </button>
          <button
            type="button"
            onClick={onExitAdmin}
            className="min-h-11 text-xs font-bold text-slate-500 underline hover:text-slate-900"
          >
            포털 선택으로
          </button>
        </div>
      </div>
    </nav>
  )

  return (
    /* 관리자는 화면 틀 언어 전환 대상이 아니다 — 메뉴 55개와 본문이 전부 한국어다.
       그런데 `<html lang>`은 사용자가 고른 화면 틀 언어를 따라가므로, English로 두고
       관리자로 들어오면 한국어가 통째로 영어 아래 놓인다. 여기서 한 번에 표시한다 */
    <div lang="ko" className="flex min-h-dvh bg-slate-50">
      {/* 첫 정지점 — 관리자는 메뉴 버튼 55개를 지나야 본문에 닿는다 */}
      <SkipToMain label="본문으로 건너뛰기" />

      {open && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={close}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* 사이드바는 한 번만 그린다 — 두 번 그리면 같은 id가 DOM에 둘 생긴다 */}
      <div
        ref={panelRef}
        /* 덮고 있을 때만 대화상자다 — 넓은 화면에서는 나란히 놓인 탐색일 뿐이다 */
        {...(open ? { role: 'dialog' as const, 'aria-modal': true, 'aria-label': '관리 메뉴' } : {})}
        tabIndex={open ? -1 : undefined}
        className={`${open ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} lg:sticky lg:top-0 lg:z-auto lg:block lg:h-dvh`}
      >
        {nav}
      </div>

      {/* 열려 있는 동안 뒤 화면은 없는 것으로 친다 */}
      <div inert={open || undefined} className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="메뉴 열기"
            className="min-h-11 rounded-lg border border-slate-200 px-3 text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <Crumb menuId={menuId} />

          {/* 원본처럼 오른쪽에 **나가는 길과 지금 누구인지**를 둔다(D-014).
              사이드바 아래에도 같은 길이 있지만, 관리자는 화면이 길어 아래까지
              내려가야 나갈 수 있었다 — 위에서도 닿게 한다 */}
          <div className="ml-auto flex items-center gap-2">
            {/* 원본은 '포털 선택'과 '사용자 포털 전환'을 나란히 둔다. 사이드바 아래에도
                같은 길이 있지만 화면이 길어 거기까지 내려가야 나갈 수 있었다 */}
            <button
              type="button"
              onClick={onExitAdmin}
              className="hidden min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 lg:inline-flex"
            >
              <Grid2x2 className="size-3.5" aria-hidden="true" />
              포털 선택
            </button>
            <button
              type="button"
              onClick={onUserPortal}
              /* 여기가 원본에서 유일하게 강조된 버튼이다 — 관리자가 가장 자주 쓰는 길 */
              className="border-brand text-brand hover:bg-brand-soft hidden min-h-11 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold sm:inline-flex"
            >
              <LayoutGrid className="size-3.5" aria-hidden="true" />
              사용자 포털
            </button>
            <span className="flex items-center gap-2 border-l border-slate-200 pl-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">
                {admin.name.slice(0, 1)}
              </span>
              <span className="hidden text-xs sm:block">
                <span className="block font-bold text-slate-800">{admin.name}</span>
                <span className="block text-slate-500">{admin.org}</span>
              </span>
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
