import { useState, type ReactNode } from 'react'
import type { Domain } from '@entities/domain/model'
import { sectorLabel } from '@entities/domain/model'
import type { Conversation } from '@features/conversations/useConversations'
import { SHELL_TABS, shellTabDesc, shellTabLabel, type ShellTab } from './tabs'

/**
 * 사용자 포털의 셸 — 사이드바와 탭.
 *
 * `<main>`은 각 화면이 갖고 있다. 셸은 `<nav>`와 배치만 맡는다 —
 * 셸에도 `<main>`을 두면 화면마다 main이 둘이 되어 보조기기가 본문을 못 찾는다.
 *
 * 이전 데모의 사이드바에는 워크스페이스·공지사항·사용 가이드도 있었지만
 * 뒤에 아무 동작이 없어 옮기지 않았다. 눌러도 아무 일이 없는 항목은
 * 기능이 있는 것처럼 보이기만 한다.
 */

export function AppShell({
  domain,
  tab,
  onTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onExit,
  children,
}: {
  domain: Domain
  tab: ShellTab
  onTab: (t: ShellTab) => void
  conversations: Conversation[]
  activeConversationId: string
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onExit: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  const sidebar = (
    <nav aria-label="작업 영역" className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
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

      <ul className="border-b border-slate-200 p-2">
        {SHELL_TABS.map((t) => (
          <li key={t}>
            <button
              type="button"
              onClick={() => {
                onTab(t)
                setOpen(false)
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
            setOpen(false)
          }}
          className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          + 새 대화
        </button>

        <p className="mt-4 px-3 text-[11px] font-bold text-slate-500">최근 대화</p>
        {conversations.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-400">아직 없습니다.</p>
        ) : (
          <ul className="mt-1 min-h-0 flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectConversation(c.id)
                    onTab('general')
                    setOpen(false)
                  }}
                  aria-current={c.id === activeConversationId ? 'true' : undefined}
                  className={`min-h-11 w-full truncate rounded-lg px-3 text-left text-sm ${
                    c.id === activeConversationId
                      ? 'bg-slate-100 font-bold text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* 저장 여부를 사실대로 말한다 — 보안 탭에 자세히 있다 */}
        <p className="mt-2 px-3 text-[11px] text-slate-400">
          이 세션에만 남습니다. 새로고침하면 사라집니다.
        </p>
      </div>

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
      {/* 데스크톱 — 항상 보인다 */}
      <div className="hidden lg:block">{sidebar}</div>

      {/* 모바일 — 오버레이 */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="사이드바 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="absolute inset-y-0 left-0">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="사이드바 열기"
            className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700"
          >
            ☰
          </button>
          <span className="text-sm font-bold text-slate-800">{shellTabLabel(tab)}</span>
        </div>
        {children}
      </div>
    </div>
  )
}
