import { useState, type ReactNode } from 'react'
import { ADMIN_SECTIONS, childrenOf, landingOf, menusOf, plannedCount, readyCount } from '@entities/admin/nav'

/**
 * 관리자 셸 — 좌측 메뉴와 상단 바.
 *
 * `<main>`은 각 화면이 갖는다. 셸은 `<nav>`와 배치만 맡는다.
 *
 * **아직 안 만든 메뉴를 감추지 않는다.** 감추면 '이 제품에는 사용자 관리가 없다'로
 * 읽힌다. 목록에 두되 '준비 중'으로 구분하고, 몇 개가 준비 중인지 위에서 먼저 말한다.
 * 눌러도 아무 일 없는 항목이 아니라, 무엇이 언제 오는지 말하는 화면으로 간다.
 */

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
  const close = () => setOpen(false)

  const nav = (
    <nav
      aria-label="관리자 메뉴"
      className="flex h-full w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 p-4">
        <p className="font-black text-slate-900">AgentQ Admin</p>
        <p className="text-xs text-slate-500">{admin.org}</p>
        {/* 목록을 보기 전에 얼마가 준비 중인지 먼저 말한다 */}
        <p className="mt-2 text-[11px] text-slate-500">
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
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onMenu(landingOf(m.id))
                      close()
                    }}
                    aria-current={menuId === m.id ? 'page' : undefined}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm ${
                      active && kids.length === 0
                        ? 'bg-slate-900 font-bold text-white'
                        : m.status === 'ready'
                          ? 'font-bold text-slate-700 hover:bg-slate-50'
                          : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{m.label}</span>
                    {/* 색만으로 구분하지 않는다 */}
                    {m.status === 'planned' && (
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          active && kids.length === 0
                            ? 'bg-white text-slate-900'
                            : 'bg-slate-100 text-slate-500'
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
                            className={`flex min-h-11 w-full items-center rounded-lg px-3 text-left text-xs ${
                              menuId === k.id
                                ? 'bg-slate-900 font-bold text-white'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
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
        <p className="text-sm font-bold text-slate-800">{admin.name}</p>
        <p className="text-xs text-slate-500">관리자</p>
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
    <div className="flex min-h-dvh bg-slate-50">
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
        className={`${open ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} lg:static lg:block lg:z-auto`}
      >
        {nav}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="메뉴 열기"
            className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 lg:hidden"
          >
            ☰
          </button>
          <span className="text-sm font-bold text-slate-800">관리자</span>
        </div>
        {children}
      </div>
    </div>
  )
}
