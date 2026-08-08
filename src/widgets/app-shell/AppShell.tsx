import { useCallback, useState, type ReactNode } from 'react'
import {
  Bell,
  Bot,
  HelpCircle,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  User,
  type LucideIcon,
  ArrowRightLeft,
  ClipboardCheck,
  Layers,
  LayoutGrid,
} from 'lucide-react'
import type { Domain } from '@entities/domain/model'
import { AGENTS, type AgentId } from '@entities/agent/model'
import { sectorLabel } from '@entities/domain/model'
import { BrandLock } from '@shared/ui/Brand'
import { SkipToMain } from '@shared/ui/SkipLink'
import { useModalOverlay } from '@features/overlay/useModalOverlay'
import { brandVars } from '@shared/lib/brand'
import type { Workspace } from '@entities/workspace/model'
import type { Conversation } from '@features/conversations/useConversations'
import type { SignalLink, WorkSignal } from '@entities/signal/model'
import { FIELD_TABS, INFO_TABS, SHELL_TABS, shellTabDesc, shellTabLabel, type ShellTab } from './tabs'
import { t, type UiLang } from '@shared/i18n/strings'
import { SignalBell } from './SignalBell'

/**
 * 사용자 포털의 셸 — 사이드바와 탭.
 *
 * `<main>`은 각 화면이 갖고 있다. 셸은 `<nav>`와 배치만 맡는다 —
 * 셸에도 `<main>`을 두면 화면마다 main이 둘이 되어 보조기기가 본문을 못 찾는다.
 *
 * 발주처 브랜드 색은 **여기서 한 번만** 꽂는다(`brandVars`). 안쪽 화면들은
 * `bg-brand`·`text-brand`로만 부르므로 새 화면을 만들어도 색을 빠뜨릴 자리가 없다.
 */

/** 탭 아이콘 — 라벨과 같은 것을 두 번 말하지 않고, 좁은 화면에서 라벨 대신 선다 */
const TAB_ICON: Record<ShellTab, LucideIcon> = {
  general: MessageSquare,
  agents: Bot,
  security: Shield,
  notices: Bell,
  guide: HelpCircle,
  settings: Settings,
  handover: ArrowRightLeft,
  workorders: ClipboardCheck,
}

export type ShellProps = {
  /** 본문 위에 띄울 띠 — 지금은 공지. 없으면 안 그린다 */
  banner?: React.ReactNode
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

  /** 지금 열려 있는 에이전트. 허브면 null */
  activeAgentId: AgentId | null
  /** 에이전트로 이동. null이면 허브로 */
  onAgent: (id: AgentId | null) => void

  unreadNotices: number
  signals: WorkSignal[]
  onOpenSignal: (link: SignalLink) => void
  onExit: () => void
  /** 화면 틀 언어 — 업무 콘텐츠는 이 값과 무관하게 원문 그대로다 */
  uiLang: UiLang
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
  activeAgentId,
  onAgent,
  unreadNotices,
  signals,
  onOpenSignal,
  onExit,
  uiLang,
  children,
  banner,
}: ShellProps) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const current = workspaces.find((w) => w.id === workspaceId)
  /* 좁은 화면에서 사이드바는 본문을 덮는다 — 덮으면 대화상자여야 한다 */
  const panelRef = useModalOverlay(open, close)

  const sidebar = (
    <nav
      aria-label={t(uiLang, 'nav.workArea')}
      className="flex h-full w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white"
    >
      {/* 로고를 누르면 홈(일반)으로 — 이전 데모와 같은 동작이다 */}
      <button
        type="button"
        onClick={() => {
          onTab('general')
          close()
        }}
        aria-label={t(uiLang, 'nav.home')}
        className="flex h-16 w-full shrink-0 items-center border-b border-slate-200 px-4 text-left hover:bg-slate-50"
      >
        <BrandLock context={sectorLabel(domain.sector)} />
      </button>

      {/* 화면 틀을 English로 바꿔도 **업무 콘텐츠는 원문 그대로** 둔다(strings.ts의 결정).
          옳은 결정인데 표시를 안 하면 영어 음성 엔진이 한국어를 읽어 뭉갠다 —
          원문 그대로 두는 자리마다 lang을 붙인다(WCAG 3.1.2 Language of Parts) */}
      <div lang="ko" className="border-b border-slate-200 px-4 py-3">
        <p className="font-black text-slate-900">{domain.orgName}</p>
        <p className="text-xs text-slate-500">{domain.tagline}</p>
      </div>

      {/* 워크스페이스를 **목록으로** 보여 준다(원본 배치, D-014).
          접어 둔 셀렉트는 몇 개가 있는지·지금 어디인지를 열어 봐야 안다.
          바꾸면 아래 대화 목록이 실제로 바뀐다 */}
      <div className="border-b border-slate-200 p-2">
        <p className="px-2 pb-1 text-[11px] font-bold tracking-wide text-slate-400">
          {t(uiLang, 'nav.workspace')}
        </p>
        <ul lang="ko">
          {workspaces.map((w) => {
            const on = w.id === workspaceId
            return (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => onWorkspace(w.id)}
                  aria-current={on ? 'true' : undefined}
                  title={w.purpose}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] ${
                    on ? 'bg-brand-soft font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Layers
                    className={`size-4 shrink-0 ${on ? 'text-brand' : 'text-slate-400'}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{w.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
        {current && (
          <p lang="ko" className="px-2 pt-1 text-[11px] text-slate-500">
            {current.purpose}
          </p>
        )}
      </div>

      {/* 에이전트 탭에서는 **에이전트 목록**이 이 자리에 온다(원본 배치, D-014).
          허브로 돌아가 카드를 찾는 대신 옆에서 바로 옮겨 다닌다 —
          하루에 여러 에이전트를 오가는 것이 이 제품의 실제 동선이다 */}
      {tab === 'agents' && (
        <div lang="ko" className="border-b border-slate-200 p-2">
          <p className="px-2 pb-1 text-[11px] font-bold tracking-wide text-slate-400">AI 에이전트</p>
          <ul>
            <li>
              <button
                type="button"
                onClick={() => {
                  onAgent(null)
                  close()
                }}
                aria-current={activeAgentId === null ? 'true' : undefined}
                /* 허브 카드에도 같은 이름이 있다. 이름이 겹치면 **음성으로 골라 누를 수
                   없다** — 보이는 글자를 그대로 담고 뒤에 자리를 덧붙여 갈라 둔다
                   (WCAG 2.5.3은 보이는 글자가 이름 안에 있으면 된다) */
                aria-label="전체 허브 목록에서 열기"
                className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] ${
                  activeAgentId === null
                    ? 'bg-brand-soft font-bold text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid
                  className={`size-4 shrink-0 ${activeAgentId === null ? 'text-brand' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                전체 허브
              </button>
            </li>
            {AGENTS.map((a) => {
              const on = activeAgentId === a.id
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onAgent(a.id)
                      close()
                    }}
                    aria-current={on ? 'true' : undefined}
                    aria-label={`${a.name} 목록에서 열기`}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] ${
                      on ? 'bg-brand-soft font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${on ? 'bg-brand' : 'bg-slate-300'}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 truncate">{a.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* 업무 탭 — 세로 목록이 아니라 한 덩어리 스위처다. 셋이 나란히 있어야
          '지금 어느 쪽에 있는지'와 '옆에 무엇이 있는지'가 함께 보인다 */}
      <div className="border-b border-slate-200 p-3">
        <ul className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          {SHELL_TABS.map((tab_) => {
            const Icon = TAB_ICON[tab_]
            const on = tab === tab_
            return (
              <li key={tab_} className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    onTab(tab_)
                    close()
                  }}
                  aria-current={on ? 'page' : undefined}
                  className={`flex min-h-11 w-full items-center justify-center gap-1 rounded-lg text-[11px] font-bold transition-colors ${
                    on
                      ? 'bg-brand text-brand-fg shadow-sm'
                      : 'text-slate-500 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {shellTabLabel(tab_, uiLang)}
                </button>
              </li>
            )
          })}
        </ul>
        {/* 라벨만으론 무엇을 하는 곳인지 모른다 — 지금 있는 탭의 설명을 한 줄로 */}
        <p className="mt-2 px-1 text-[11px] text-slate-500">{shellTabDesc(tab, uiLang)}</p>
      </div>

      {/* 대화 목록 칸.
          `flex-1`만 주면 세로가 모자랄 때 이 칸이 줄어드는데, 안에 든 버튼·머리글은
          줄지 않아 **아래 묶음 위로 넘친다**. 넘친 자리는 눌리지 않는다.
          그래서 줄지 않게 하고(`shrink-0`) 최소 높이를 준다 — 모자라면 사이드바
          전체가 스크롤된다(`nav`의 `overflow-y-auto`). */}
      <div className="flex min-h-40 shrink-0 grow flex-col overflow-hidden p-2">
        <button
          type="button"
          onClick={() => {
            onNewConversation()
            onTab('general')
            close()
          }}
          /* 원본과 같이 **채운 버튼**이다 — 사이드바에서 제일 먼저 누르는 것이라
             테두리만 있으면 목록에 묻힌다 */
          className="bg-brand text-brand-fg min-h-11 rounded-lg px-3 text-sm font-bold shadow-sm hover:opacity-90"
        >
          {t(uiLang, 'nav.newChat')}
        </button>

        <div className="mt-4 flex items-center justify-between px-3">
          <p className="text-[11px] font-bold text-slate-500">{t(uiLang, 'nav.recent')}</p>
          {conversations.length > 0 && (
            <button
              type="button"
              onClick={onClearConversations}
              className="min-h-11 text-[11px] font-bold text-slate-400 underline hover:text-slate-700"
            >
              {t(uiLang, 'nav.clearAll')}
            </button>
          )}
        </div>

        {conversations.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-400">{t(uiLang, 'nav.empty')}</p>
        ) : (
          /* 대화 제목은 사용자가 물어본 한국어 문장 그대로다 */
          <ul lang="ko" className="mt-1 min-h-0 flex-1 overflow-y-auto">
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
                  /* 이름 안에서는 언어를 나눌 수 없다 — `aria-label`은 한 덩어리 문자열이라
                     '어디부터 한국어'를 표시할 방법이 없다. 이 이름은 대부분이 한국어
                     대화 제목이므로 **덩어리 전체를 한국어로** 맞춘다. 화면 틀이 English여도
                     여기에 'Delete'를 섞으면 한국어 음성이 그 한 낱말을 뭉개 읽는다 */
                  lang="ko"
                  aria-label={`${c.title} 삭제`}
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
          {t(uiLang, conversationsPersisted ? 'nav.saved' : 'nav.notSaved')}
        </p>
      </div>

      {/* 묻고 시키는 자리(위)와 이미 벌어진 일을 닫는 자리(여기)를 나눈다.
          `shrink-0`이 없으면 세로가 모자랄 때 이 묶음이 줄면서 **내용이 넘쳐
          대화 목록을 덮는다** — 덮인 버튼은 눌리지 않는다(2026-08-08 CI가 잡음) */}
      <ul className="shrink-0 border-t border-slate-200 p-2" aria-label={t(uiLang, 'nav.field')}>
        <li className="px-3 pb-1 text-[11px] font-bold text-slate-400">{t(uiLang, 'nav.field')}</li>
        {FIELD_TABS.map((tab_) => {
          const Icon = TAB_ICON[tab_]
          return (
            <li key={tab_}>
              <button
                type="button"
                onClick={() => {
                  onTab(tab_)
                  close()
                }}
                aria-current={tab === tab_ ? 'page' : undefined}
                className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm ${
                  tab === tab_ ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                {shellTabLabel(tab_, uiLang)}
              </button>
            </li>
          )
        })}
      </ul>

      <ul className="shrink-0 border-t border-slate-200 p-2 grid grid-cols-2 gap-1">
        {INFO_TABS.map((tab_) => {
          const Icon = TAB_ICON[tab_]
          return (
          <li key={tab_}>
            <button
              type="button"
              onClick={() => {
                onTab(tab_)
                close()
              }}
              aria-current={tab === tab_ ? 'page' : undefined}
              className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border px-2 text-center text-[12px] ${
                tab === tab_
                  ? 'border-slate-300 bg-slate-100 font-bold text-slate-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              {shellTabLabel(tab_, uiLang)}
              {tab_ === 'notices' && unreadNotices > 0 && (
                <span className="ml-auto rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadNotices}
                </span>
              )}
            </button>
          </li>
          )
        })}
      </ul>

      <div className="border-t border-slate-200 p-3">
        {/* 원본처럼 카드로 묶는다 — 사이드바 맨 아래에서 '내가 누구로 들어와 있는지'가
            한 덩어리로 보여야 한다 */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <span className="bg-brand-soft border-brand-soft flex size-9 shrink-0 items-center justify-center rounded-full border">
            <User className="text-brand size-4" aria-hidden="true" />
          </span>
          {/* 이름·직급·부서는 그 조직의 한국어 원문이다 */}
          <span lang="ko" className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold text-slate-800">
                {domain.user.name} {domain.user.title}
              </span>
              {/* 어떻게 들어왔는지 — 원본 배지를 그대로 옮긴다(D-014) */}
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                SSO
              </span>
            </span>
            <span className="block truncate text-xs text-slate-500">{domain.user.dept}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="mt-2 min-h-11 text-xs font-bold text-slate-500 underline hover:text-slate-900"
        >
          {t(uiLang, 'nav.exit')}
        </button>
      </div>
    </nav>
  )

  return (
    <div className="flex min-h-dvh bg-slate-50" style={brandVars(domain.brandColor)}>
      {/* 첫 정지점 — 여기가 첫 번째가 아니면 있으나 마나다 */}
      <SkipToMain label={t(uiLang, 'nav.skip')} />

      {/* 모바일에서 열렸을 때만 깔리는 막 */}
      {open && (
        <button
          type="button"
          aria-label={t(uiLang, 'nav.close')}
          onClick={close}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* 사이드바는 **한 번만** 그린다.
          데스크톱용과 모바일용을 따로 그리면 같은 id가 DOM에 둘 생기고,
          label htmlFor가 먼저 나온 쪽(숨은 쪽)에 붙어 뒤엣것이 이름을 잃는다.
          실제로 모바일에서 워크스페이스 선택이 이름 없는 콤보박스가 됐다. */}
      {/* 데스크톱에서는 붙어 있는다 — 본문을 내려도 로고·탭이 따라 사라지면
          '지금 어디에 있는지'가 사라진다 */}
      <div
        ref={panelRef}
        /* 덮고 있을 때만 대화상자다. 넓은 화면에서는 나란히 놓인 탐색일 뿐이라
           역할을 붙이면 '대화상자'라고 잘못 읽힌다 */
        {...(open
          ? { role: 'dialog' as const, 'aria-modal': true, 'aria-label': t(uiLang, 'nav.workArea') }
          : {})}
        tabIndex={open ? -1 : undefined}
        className={`${open ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} lg:sticky lg:top-0 lg:z-auto lg:block lg:h-dvh`}
      >
        {sidebar}
      </div>

      {/* 열려 있는 동안 뒤 화면은 **없는 것으로 친다.** 안 끄면 낭독기 스와이프가
          화면에 보이지도 않는 FAQ 목록을 읽는다 */}
      <div inert={open || undefined} className="flex min-w-0 flex-1 flex-col">
        {/* 상단 바는 모든 폭에서 보인다 — 알림은 좁은 화면에서만 필요한 것이 아니다 */}
        {/* 높이를 h-14로 못박는다 — 아래 화면이 이 높이만큼 비켜서 붙기 때문이다
            (대화 화면의 근거 패널이 `top-14`로 이 값을 쓴다) */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t(uiLang, 'nav.open')}
            className="relative min-h-11 rounded-lg border border-slate-200 px-3 text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
            {unreadNotices > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-600" />
            )}
          </button>
          {/* 지금 어느 탭에 있는지 — 아이콘은 사이드바의 스위처와 같은 것을 쓴다 */}
          <span className="bg-brand-soft flex size-8 items-center justify-center rounded-lg">
            {(() => {
              const Icon = TAB_ICON[tab]
              return <Icon className="text-brand size-4" aria-hidden="true" />
            })()}
          </span>
          <span className="text-sm font-bold text-slate-800">{shellTabLabel(tab, uiLang)}</span>
          {/* 나가는 길은 사이드바 아래 한 곳뿐이다 — 같은 동작을 두 곳에 두지 않는다 */}
          {/* 알림은 아직 화면 틀 번역 대상이 아니다 — 버튼 이름도 신호 내용도 한국어다.
              번역하는 척하지 말고 한국어라고 표시한다 */}
          <div lang="ko" className="ml-auto">
            <SignalBell signals={signals} onOpen={onOpenSignal} />
          </div>
        </div>
        {/* 본문은 통째로 업무 콘텐츠다 — 챗봇 답변·문서명·규정 조항·에이전트 결과가
            전부 한국어 원문이므로 여기서 한 번에 표시한다. 화면 틀이 영어인 화면
            (환경설정)은 자기 쪽에서 다시 덮어쓴다 — 가까운 lang이 이긴다 */}
        {/* 공지는 업무 화면 위에 띄운다 — 공지 탭에만 두면 아무도 안 본다 */}
        {banner}
        <div lang="ko" className="contents">
          {children}
        </div>
      </div>
    </div>
  )
}
