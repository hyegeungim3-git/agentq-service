import { lazy, useCallback, useEffect, useState } from 'react'
import { useRoute, type Route } from '@features/routing/useRoute'
import { AGENTS } from '@entities/agent/model'
import { useScreenChange, type ScreenChange } from '@features/screen-change/useScreenChange'
import type { Domain } from '@entities/domain/model'
import { fetchDomain } from '@shared/api/domains'
import { setActiveDomain } from '@shared/api/tenant'
import { useConversations } from '@features/conversations/useConversations'
import { unreadNotices, type Notice } from '@entities/notice/model'
import type { Workspace } from '@entities/workspace/model'
import { fetchWorkspaces } from '@shared/api/workspaces'
import { fetchNotices } from '@shared/api/notices'
import { fetchSignals } from '@shared/api/signals'
import { fetchLiveMetrics } from '@shared/api/metrics'
import type { LiveMetric } from '@entities/metric/model'
import type { SignalLink, WorkSignal } from '@entities/signal/model'
import { readJson, writeJson } from '@shared/lib/storage'
import { AppShell } from '@widgets/app-shell/AppShell'
import { NoticeBanner } from '@widgets/notice-banner/NoticeBanner'
import { shellTabLabel, type ShellTab } from '@widgets/app-shell/tabs'
import { Loadable } from '@shared/ui/Loadable'
import { PortalPage } from '@pages/portal/PortalPage'
import { HubPage } from '@pages/hub/HubPage'
import { SecurityPage } from '@pages/security/SecurityPage'
import { NoticesPage } from '@pages/notices/NoticesPage'
import { GuidePage } from '@pages/guide/GuidePage'
import { HandoverPage } from '@pages/field/HandoverPage'
import { WorkOrderPage } from '@pages/field/WorkOrderPage'
import { SettingsPage } from '@pages/settings/SettingsPage'
import { usePrefs } from '@features/prefs/usePrefs'
import { findMenu } from '@entities/admin/nav'
import { ChatPage } from '@pages/chat/ChatPage'
import { OrchestrationPage } from '@pages/orchestration/OrchestrationPage'

/**
 * 화면 상태 = 주소.
 *
 * 예전에는 메모리에만 뒀다. 새로고침하면 첫 화면으로 돌아갔고 링크로 줄 수도 없었다.
 * 지금은 `features/routing`이 해시와 이 타입을 오간다 — **여기 있던 View 타입이
 * 그대로 라우트 정의가 됐다.**
 */
type View = Route

/**
 * 관리자와 에이전트는 **따로 내려받는다.**
 *
 * 실측: 첫 청크가 1021KB(gzip 262KB)였고 관리자 44화면과 에이전트 13종이 통째로
 * 그 안에 있었다. 챗봇만 쓰는 사람도 전부 받는다는 뜻이다. 둘 다 사용자가 **직접
 * 골라 들어가는 곳**이라 경계가 분명하다.
 *
 * 새 화면을 추가할 때는 `AdminApp.tsx`·`AgentApp.tsx`에 넣어야 이 경계가 유지된다.
 * `App.tsx`에 직접 import하면 다시 첫 청크로 딸려 온다.
 */
const AdminApp = lazy(() => import('./AdminApp').then((m) => ({ default: m.AdminApp })))
const AgentApp = lazy(() => import('./AgentApp').then((m) => ({ default: m.AgentApp })))

const READ_KEY = 'agentq.readNotices.v1'

/* 관리자는 발주처 소속이 아니다 — 도메인 프로파일에서 가져오지 않는다.
   실제로는 로그인 사용자 정보에서 온다(API 제안서 §3 인증). */
const ADMIN = { name: '운영 담당자', org: 'AgentQ 플랫폼' }

const shell = (domainId: string, tab: ShellTab): View => ({
  name: 'shell',
  domainId,
  tab,
  agentId: null,
  scenario: false,
})

/**
 * 지금 어느 화면인가 — 창 제목과 알림에 쓸 이름.
 *
 * 발주처 넷의 제목이 전부 'AgentQ'로 같아서 낭독기로는 어느 발주처인지 알 수
 * 없었다. 조직 이름을 제목에 넣어 창 제목 읽기로 구분되게 한다.
 */
function describeScreen(view: View, domain: Domain | null): ScreenChange & { key: string } {
  if (view.name === 'portal') {
    return { key: 'portal', title: '분야 선택', say: '분야 선택 화면입니다.' }
  }
  if (view.name === 'admin') {
    const menu = findMenu(view.menuId)
    const label = menu?.label ?? '관리자'
    return {
      key: `admin:${view.menuId}`,
      title: label,
      org: '관리자 시스템',
      say: `${label} 화면입니다.`,
    }
  }
  const org = domain?.orgName
  if (view.tab === 'agents' && view.scenario) {
    return {
      key: `${view.domainId}:scenario`,
      title: '복합 업무',
      org,
      say: '복합 업무 릴레이 화면입니다.',
    }
  }
  if (view.tab === 'agents' && view.agentId) {
    const name = AGENTS.find((a) => a.id === view.agentId)?.name ?? '에이전트'
    return {
      key: `${view.domainId}:agent:${view.agentId}`,
      title: name,
      org,
      say: `${name} 에이전트 화면입니다.`,
    }
  }
  /* 화면 틀 언어와 무관하게 **한국어 이름**을 쓴다. 다른 가지(에이전트명·관리자 메뉴)가
     전부 한국어 원문이라, 여기만 영어로 두면 'Chat 화면입니다'처럼 반씩 섞인다 */
  const tab = shellTabLabel(view.tab, 'ko')
  return { key: `${view.domainId}:${view.tab}`, title: tab, org, say: `${tab} 화면입니다.` }
}

export default function App() {
  const [view, setView] = useRoute()

  /**
   * **발주처를 경계에 꽂는 곳은 여기 하나다.**
   *
   * 화면이 요청마다 발주처를 넘기는 대신 `shared/api`가 그 값을 들고 있다
   * (제안서 §3-2의 헤더 방식과 같다).
   *
   * 예전에는 포털에서 들어가는 **이동 함수**에서 꽂았다. 주소로 화면을 기억하게 되자
   * 그 함수를 안 거치는 길이 생겼다 — 링크로 바로 들어오거나 새로고침하면 발주처가
   * 안 꽂힌 채 자식들이 데이터를 부른다. 실제로 새로고침 뒤 대화 목록이 비었다.
   *
   * effect가 아니라 **렌더 중**에 부른다. 자식 effect는 부모 effect보다 먼저 돌기
   * 때문에, effect에 두면 아직 발주처가 안 정해진 채로 요청이 나간다.
   * `setActiveDomain`은 React 상태가 아니라 모듈 값이라 렌더 중 호출이 안전하다.
   */
  setActiveDomain(view.name === 'shell' ? view.domainId : null)
  /* 불러온 도메인을 id와 함께 들고 있는다.
     effect 안에서 setDomain(null)로 지우던 것을 없앤 이유:
     ① 렌더 중 동기 setState는 연쇄 렌더를 만든다(react-hooks/set-state-in-effect가 잡았다)
     ② 도메인을 바꿀 때 이전 도메인이 잠깐 보이는 문제도 같이 사라진다 —
        id가 다르면 아직 안 불러온 것으로 취급한다. */
  const [loaded, setLoaded] = useState<{ id: string; domain: Domain } | null>(null)

  /* 워크스페이스·공지는 셸이 함께 들고 있는다 — 대화가 워크스페이스에 속하기 때문이다 */
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [notices, setNotices] = useState<Notice[]>([])
  const [signals, setSignals] = useState<WorkSignal[]>([])
  const [metrics, setMetrics] = useState<LiveMetric[]>([])
  const [readIds, setReadIds] = useState<string[]>(
    () => readJson<string[]>(READ_KEY, (v): v is string[] => Array.isArray(v)) ?? [],
  )

  const domainId = view.name === 'shell' ? view.domainId : null

  /* 발주처가 정해진 뒤에만 부른다. 예전에는 마운트 시 한 번([]) 불렀는데,
     그때는 아직 어느 발주처인지 모르는 상태였다 — 팩이 하나뿐이라 안 드러났을 뿐이다 */
  useEffect(() => {
    if (!domainId) return
    let alive = true
    void fetchWorkspaces().then((res) => {
      if (!alive || !res.ok) return
      setWorkspaces(res.data)
      setWorkspaceId((prev) => prev || (res.data[0]?.id ?? ''))
    })
    void fetchNotices().then((res) => {
      if (alive && res.ok) setNotices(res.data)
    })
    void fetchSignals().then((res) => {
      if (alive && res.ok) setSignals(res.data)
    })
    void fetchLiveMetrics().then((res) => {
      if (alive && res.ok) setMetrics(res.data)
    })
    return () => {
      alive = false
    }
  }, [domainId])

  const markRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const next = [...new Set([...prev, ...ids])]
      if (next.length === prev.length) return prev
      writeJson(READ_KEY, next)
      return next
    })
  }, [])

  /* 대화는 셸이 소유한다 — 탭을 옮겨도, 다른 대화를 골라도 남아야 한다 */
  const conv = useConversations(workspaceId)
  const prefs = usePrefs()


  useEffect(() => {
    if (!domainId) return
    let alive = true
    void fetchDomain(domainId).then((res) => {
      if (!alive) return
      if (res.ok) {
        setLoaded({ id: domainId, domain: res.data })
        return
      }
      /* 주소가 없는 발주처를 가리켰다. 기다리는 척하며 영원히 도는 대신 첫 화면으로
         보낸다 — 링크를 잘못 받은 사람이 빈 화면을 보고 있게 두지 않는다 */
      setView({ name: 'portal' })
    })
    return () => {
      alive = false
    }
    /* setView는 useRoute가 useCallback으로 고정해 준다 — 넣어도 다시 안 돈다 */
  }, [domainId, setView])

  const domain = loaded && loaded.id === domainId ? loaded.domain : null

  /**
   * 화면이 바뀐 것을 낭독기에도 알린다.
   *
   * 훅이라 이른 반환보다 위에 있어야 한다 — 그래서 어느 화면인지를 여기서 한 번에
   * 계산한다. `key`가 같으면 아무 일도 하지 않으므로, 같은 화면 안에서 상태가
   * 바뀔 때는 조용하다.
   */
  const screen = describeScreen(view, domain)
  useScreenChange(screen.key, screen)

  if (view.name === 'portal') {
    return (
      <PortalPage
        onSelect={(id) => setView(shell(id, 'general'))}
        onAdmin={() => setView({ name: 'admin', menuId: 'system' })}
      />
    )
  }

  if (view.name === 'admin') {
    return (
      <Loadable>
        <AdminApp
          menuId={view.menuId}
          onMenu={(id) => setView({ name: 'admin', menuId: id })}
          onExit={() => setView({ name: 'portal' })}
          onUserPortal={() => setView({ name: 'portal' })}
          admin={ADMIN}
        />
      </Loadable>
    )
  }

  if (!domain) {
    return (
      <main role="status" aria-live="polite" className="min-h-dvh grid place-items-center">
        <span className="sr-only">불러오는 중입니다</span>
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
      </main>
    )
  }

  /* 배지와 배너가 같은 목록을 본다 — 두 곳에서 따로 세면 어긋난다 */
  const unread = unreadNotices(notices, readIds)

  const backToAgents = () => setView(shell(domain.id, 'agents'))

  /* 알림·브리핑에서 처리할 화면으로 잇는다 — 이을 곳이 없으면 아무 것도 하지 않는다 */
  const openSignal = (link: SignalLink) => {
    if (!link) return
    if (link.kind === 'scenario') {
      setView({ name: 'shell', domainId: domain.id, tab: 'agents', agentId: null, scenario: true })
      return
    }
    setView({ name: 'shell', domainId: domain.id, tab: 'agents', agentId: link.agentId, scenario: false })
  }

  return (
    <AppShell
      domain={domain}
      tab={view.tab}
      onTab={(tab) => setView(shell(domain.id, tab))}
      workspaces={workspaces}
      workspaceId={workspaceId}
      onWorkspace={setWorkspaceId}
      conversations={conv.listed}
      activeConversationId={conv.activeId}
      onSelectConversation={conv.select}
      onNewConversation={conv.startNew}
      onDeleteConversation={conv.remove}
      onClearConversations={conv.clearAll}
      conversationsPersisted={conv.persisted}
      unreadNotices={unread.length}
      signals={signals}
      onOpenSignal={openSignal}
      onExit={() => setView({ name: 'portal' })}
      uiLang={prefs.prefs.uiLang}
      banner={
        view.tab !== 'notices' && unread.length > 0 ? (
          <NoticeBanner
            notices={unread}
            onRead={markRead}
            onOpen={() => setView(shell(domain.id, 'notices'))}
          />
        ) : null
      }
    >
      {view.tab === 'general' && (
        <ChatPage store={conv.store} signals={signals} onOpenSignal={openSignal} metrics={metrics} />
      )}
      {view.tab === 'security' && <SecurityPage />}
      {view.tab === 'notices' && <NoticesPage onRead={markRead} />}
      {view.tab === 'guide' && <GuidePage />}
      {view.tab === 'handover' && <HandoverPage />}
      {view.tab === 'workorders' && <WorkOrderPage />}
      {view.tab === 'settings' && <SettingsPage store={prefs} />}
      {view.tab === 'agents' && view.scenario && <OrchestrationPage onBack={backToAgents} />}
      {view.tab === 'agents' && !view.scenario && view.agentId === null && (
        <HubPage
          domain={domain}
          onOpen={(agentId) => setView({ ...view, agentId })}
          onOpenScenario={() => setView({ ...view, scenario: true })}
        />
      )}
      {view.tab === 'agents' && !view.scenario && view.agentId !== null && (
        <Loadable>
          <AgentApp agentId={view.agentId} onBack={backToAgents} />
        </Loadable>
      )}
    </AppShell>
  )
}

/** 에이전트 화면 선택 — 허브가 준비된 것만 열어 주므로 여기 오면 카탈로그와 어긋난 것이다 */
