import { useState, type ReactNode } from 'react'
import type { Domain } from '@entities/domain/model'
import { sectorLabel } from '@entities/domain/model'
import type { Workspace } from '@entities/workspace/model'
import type { Conversation } from '@features/conversations/useConversations'
import type { SignalLink, WorkSignal } from '@entities/signal/model'
import { INFO_TABS, SHELL_TABS, shellTabDesc, shellTabLabel, type ShellTab } from './tabs'
import { SignalBell } from './SignalBell'

/**
 * 사용자 포털의 셸 — 사이드바와 탭.
 *
 * `<main>`은 각 화면이 갖고 있다. 셸은 `<nav>`와 배치만 맡는다 —
 * 셸에도 `<main>`을 두면 화면마다 main이 둘이 되어 보조기기가 본문을 못 찾는다.
 */

export type ShellProps = {
  domain: Domain
  tab: ShellTab
  onTab: (t: ShellTab) => void

  workspaces: Workspace[]
  workspaceId: string
  onWorkspace: (id: string) => void

  conversations: Conversation[]
  activeConversationId: string
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onClearConversations: () => void
  /** 저장이 막힌 환경이면 그렇다고 말해야 한다 */
  conversationsPersisted: boolean

  unreadNotices: number
  signals: WorkSignal[]
  onOpenSignal: (link: SignalLink) => void
  onExit: () => void
  children: ReactNode
}

export function AppShell({
  domain,
  tab,
  onTab,
  workspaces,
  workspaceId,
  onWorkspace,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearConversations,
  conversationsPersisted,
  unreadNotices,
  signals,
  onOpenSignal,
  onExit,
  children,
}: ShellProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const current = workspaces.find((w) => w.id === workspaceId)

  const sidebar = (
    <nav
      aria-label="작업 영역"
      className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 p-4">
        <span
          className="inline-block rounded px-2 py-0.5 text-[11px] font-bold text-white"
          style={{ backgroundColor: domain.brandColor }}
        >
          {sectorLabel(domain.sector)}
        </span>
        <p className="mt-2 font-black text-slate-900">{domain.orgName}</p>
        <p className="text-xs text-slate-500">{domain.tagline}</p>
      </div>

      {/* 워크스페이스를 바꾸면 아래 대화 목록이 실제로 바뀐다 */}
      <div className="border-b border-slate-200 p-3">
        <label htmlFor="ws" className="block text-[11px] font-bold text-slate-500">
          워크스페이스
        </label>
        <select
          id="ws"
          value={workspaceId}
          onChange={(e) => onWorkspace(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-2 text-sm"
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        {current && <p className="mt-1 text-[11px] text-slate-500">{current.purpose}</p>}
      </div>

      <ul className="border-b border-slate-200 p-2">
        {SHELL_TABS.map((t) => (
          <li key={t}>
            <button
              type="button"
              onClick={() => {
                onTab(t)
                close()
              }}
              aria-current={tab === t ? 'page' : undefined}
              className={`min-h-11 w-full rounded-lg px-3 text-left text-sm font-bold ${
                tab === t ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {shellTabLabel(t)}
              <span
                className={`block text-[11px] font-normal ${tab === t ? 'text-slate-300' : 'text-slate-500'}`}
              >
                {shellTabDesc(t)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex min-h-0 flex-1 flex-col p-2">
        <button
          type="button"
          onClick={() => {
            onNewConversation()
            onTab('general')
            close()
          }}
          className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          + 새 대화
        </button>

        <div className="mt-4 flex items-center justify-between px-3">
          <p className="text-[11px] font-bold text-slate-500">최근 대화</p>
          {conversations.length > 0 && (
            <button
              type="button"
              onClick={onClearConversations}
              className="min-h-11 text-[11px] font-bold text-slate-400 underline hover:text-slate-700"
            >
              전체 지우기
            </button>
          )}
        </div>

        {conversations.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-400">이 워크스페이스에는 아직 없습니다.</p>
        ) : (
          <ul className="mt-1 min-h-0 flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <li key={c.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectConversation(c.id)
                    onTab('general')
                    close()
                  }}
                  aria-current={c.id === activeConversationId ? 'true' : undefined}
                  className={`min-h-11 min-w-0 flex-1 truncate rounded-lg px-3 text-left text-sm ${
                    c.id === activeConversationId
                      ? 'bg-slate-100 font-bold text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.title}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteConversation(c.id)}
                  aria-label={`${c.title ?? '대화'} 삭제`}
                  className="min-h-11 px-2 text-xs text-slate-400 hover:text-rose-700"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* 저장 사실과 막혔을 때를 모두 말한다 */}
        <p className="mt-2 px-3 text-[11px] text-slate-400">
          {conversationsPersisted
            ? '이 브라우저에 저장됩니다. 지우려면 위 전체 지우기를 누르세요.'
            : '이 브라우저에 저장하지 못했습니다. 새로고침하면 사라집니다.'}
        </p>
      </div>

      <ul className="border-t border-slate-200 p-2">
        {INFO_TABS.map((t) => (
          <li key={t}>
            <button
              type="button"
              onClick={() => {
                onTab(t)
                close()
              }}
              aria-current={tab === t ? 'page' : undefined}
              className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm ${
                tab === t ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {shellTabLabel(t)}
              {t === 'notices' && unreadNotices > 0 && (
                <span className="ml-auto rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadNotices}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-200 p-4">
        <p className="text-sm font-bold text-slate-800">
          {domain.user.name} {domain.user.title}
        </p>
        <p className="text-xs text-slate-500">{domain.user.dept}</p>
        <button
          type="button"
          onClick={onExit}
          className="mt-2 min-h-11 text-xs font-bold text-slate-500 underline hover:text-slate-900"
        >
          분야 선택으로
        </button>
      </div>
    </nav>
  )

  return (
    <div className="flex min-h-dvh bg-slate-50">
      {/* 모바일에서 열렸을 때만 깔리는 막 */}
      {open && (
        <button
          type="button"
          aria-label="사이드바 닫기"
          onClick={close}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* 사이드바는 **한 번만** 그린다.
          데스크톱용과 모바일용을 따로 그리면 같은 id가 DOM에 둘 생기고,
          label htmlFor가 먼저 나온 쪽(숨은 쪽)에 붙어 뒤엣것이 이름을 잃는다.
          실제로 모바일에서 워크스페이스 선택이 이름 없는 콤보박스가 됐다. */}
      <div className={`${open ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} lg:static lg:block lg:z-auto`}>
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 상단 바는 모든 폭에서 보인다 — 알림은 좁은 화면에서만 필요한 것이 아니다 */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="사이드바 열기"
            className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 lg:hidden"
          >
            ☰
            {unreadNotices > 0 && <span className="ml-1 text-[10px] text-rose-600">●</span>}
          </button>
          <span className="text-sm font-bold text-slate-800">{shellTabLabel(tab)}</span>
          <div className="ml-auto">
            <SignalBell signals={signals} onOpen={onOpenSignal} />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
