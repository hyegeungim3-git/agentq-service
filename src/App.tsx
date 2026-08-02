import { useCallback, useEffect, useState } from 'react'
import type { AgentId } from '@entities/agent/model'
import type { Domain } from '@entities/domain/model'
import { fetchDomain } from '@shared/api/domains'
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
import type { ShellTab } from '@widgets/app-shell/tabs'
import { PortalPage } from '@pages/portal/PortalPage'
import { HubPage } from '@pages/hub/HubPage'
import { SecurityPage } from '@pages/security/SecurityPage'
import { NoticesPage } from '@pages/notices/NoticesPage'
import { GuidePage } from '@pages/guide/GuidePage'
import { SettingsPage } from '@pages/settings/SettingsPage'
import { usePrefs } from '@features/prefs/usePrefs'
import { SummaryPage } from '@pages/summary/SummaryPage'
import { TranslatePage } from '@pages/translate/TranslatePage'
import { ReviewPage } from '@pages/review/ReviewPage'
import { ReportPage } from '@pages/report/ReportPage'
import { MeetingPage } from '@pages/meeting/MeetingPage'
import { RegulationPage } from '@pages/regulation/RegulationPage'
import { KnowledgePage } from '@pages/knowledge/KnowledgePage'
import { OcrPage } from '@pages/ocr/OcrPage'
import { SafetyPage } from '@pages/safety/SafetyPage'
import { DataQueryPage } from '@pages/dataquery/DataQueryPage'
import { AnalysisPage } from '@pages/analysis/AnalysisPage'
import { MappingPage } from '@pages/mapping/MappingPage'
import { ChatPage } from '@pages/chat/ChatPage'
import { OrchestrationPage } from '@pages/orchestration/OrchestrationPage'
import { AdminShell } from '@widgets/admin-shell/AdminShell'
import { findMenu } from '@entities/admin/nav'
import { SystemStatusPage } from '@pages/admin/system/SystemStatusPage'
import { ServiceStatusPage } from '@pages/admin/service/ServiceStatusPage'
import { GpuStatusPage } from '@pages/admin/gpu/GpuStatusPage'
import { TrainerStatusPage } from '@pages/admin/trainer/TrainerStatusPage'
import { PlannedPage } from '@pages/admin/planned/PlannedPage'
import { UserListPage } from '@pages/admin/users/UserListPage'
import { ApprovalPage } from '@pages/admin/users/ApprovalPage'
import { QuotaPage } from '@pages/admin/users/QuotaPage'
import { AccessLogPage } from '@pages/admin/users/AccessLogPage'
import { BlockRulePage } from '@pages/admin/users/BlockRulePage'
import { ModelPage } from '@pages/admin/llmops/ModelPage'
import { ReliabilityPage } from '@pages/admin/llmops/ReliabilityPage'
import { QualityPage } from '@pages/admin/llmops/QualityPage'
import { UsageHistoryPage } from '@pages/admin/analytics/UsageHistoryPage'
import { SatisfactionPage } from '@pages/admin/analytics/SatisfactionPage'
import { UsageStatsPage } from '@pages/admin/analytics/UsageStatsPage'
import { ReportPage as AnalyticsReportPage } from '@pages/admin/analytics/ReportPage'
import { IntegratedLogPage } from '@pages/admin/oplog/IntegratedLogPage'
import { UsageMonitorPage } from '@pages/admin/oplog/UsageMonitorPage'
import { ContentPage } from '@pages/admin/content/ContentPage'
import { HrSyncPage } from '@pages/admin/sysops/HrSyncPage'
import { ApiPromptPage } from '@pages/admin/sysops/ApiPromptPage'
import { IntegrationPage } from '@pages/admin/sysops/IntegrationPage'
import { AdminHomePage } from '@pages/admin/sysops/AdminHomePage'

/* 화면이 여럿이 됐지만 라우터는 아직 넣지 않는다.
   URL 공유·새로고침 복원이 요구사항으로 들어올 때 도입한다(가이드 §8, §12).
   그때 이 View 타입이 그대로 라우트 정의가 된다. */
type View =
  | { name: 'portal' }
  /** 셸 안. tab이 무엇을 보여 줄지, agentId·scenario가 에이전트 탭의 안쪽을 정한다 */
  | { name: 'shell'; domainId: string; tab: ShellTab; agentId: AgentId | null; scenario: boolean }
  /** 관리자. 발주처와 무관하다 — 플랫폼 전체를 본다 */
  | { name: 'admin'; menuId: string }

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

export default function App() {
  const [view, setView] = useState<View>({ name: 'portal' })
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

  useEffect(() => {
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
  }, [])

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

  const domainId = view.name === 'shell' ? view.domainId : null

  useEffect(() => {
    if (!domainId) return
    let alive = true
    void fetchDomain(domainId).then((res) => {
      if (alive && res.ok) setLoaded({ id: domainId, domain: res.data })
    })
    return () => {
      alive = false
    }
  }, [domainId])

  const domain = loaded && loaded.id === domainId ? loaded.domain : null

  if (view.name === 'portal') {
    return (
      <PortalPage
        onSelect={(id) => setView(shell(id, 'general'))}
        onAdmin={() => setView({ name: 'admin', menuId: 'system' })}
      />
    )
  }

  if (view.name === 'admin') {
    const menu = findMenu(view.menuId)
    return (
      <AdminShell
        menuId={view.menuId}
        onMenu={(id) => setView({ name: 'admin', menuId: id })}
        onExitAdmin={() => setView({ name: 'portal' })}
        onUserPortal={() => setView({ name: 'portal' })}
        admin={ADMIN}
      >
        {view.menuId === 'system' && <SystemStatusPage />}
        {view.menuId === 'service' && <ServiceStatusPage />}
        {view.menuId === 'gpu' && <GpuStatusPage />}
        {view.menuId === 'trainer' && <TrainerStatusPage />}
        {view.menuId === 'users.list' && <UserListPage />}
        {view.menuId === 'users.approval' && <ApprovalPage />}
        {view.menuId === 'users.quota' && <QuotaPage />}
        {view.menuId === 'users.log' && <AccessLogPage />}
        {view.menuId === 'users.block' && <BlockRulePage />}
        {view.menuId === 'llmops.models' && <ModelPage />}
        {view.menuId === 'llmops.reliability' && <ReliabilityPage />}
        {view.menuId === 'llmops.quality' && <QualityPage />}
        {view.menuId === 'analytics.history' && <UsageHistoryPage />}
        {view.menuId === 'analytics.satisfaction' && <SatisfactionPage />}
        {view.menuId === 'analytics.stats' && <UsageStatsPage />}
        {view.menuId === 'analytics.report' && <AnalyticsReportPage />}
        {view.menuId === 'logs.integrated' && <IntegratedLogPage />}
        {view.menuId === 'logs.usage' && <UsageMonitorPage />}
        {view.menuId === 'content' && <ContentPage />}
        {view.menuId === 'hr' && <HrSyncPage />}
        {view.menuId === 'prompts' && <ApiPromptPage />}
        {view.menuId === 'sysops.integration' && <IntegrationPage />}
        {view.menuId === 'sysops.home' && (
          <AdminHomePage onOpen={(id) => setView({ name: 'admin', menuId: id })} />
        )}
        {menu !== null && menu.status === 'planned' && <PlannedPage menu={menu} />}
      </AdminShell>
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
      unreadNotices={unreadNotices(notices, readIds).length}
      signals={signals}
      onOpenSignal={openSignal}
      onExit={() => setView({ name: 'portal' })}
      uiLang={prefs.prefs.uiLang}
    >
      {view.tab === 'general' && (
        <ChatPage store={conv.store} signals={signals} onOpenSignal={openSignal} metrics={metrics} />
      )}
      {view.tab === 'security' && <SecurityPage />}
      {view.tab === 'notices' && <NoticesPage onRead={markRead} />}
      {view.tab === 'guide' && <GuidePage />}
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
        <AgentView agentId={view.agentId} onBack={backToAgents} />
      )}
    </AppShell>
  )
}

/** 에이전트 화면 선택 — 허브가 준비된 것만 열어 주므로 여기 오면 카탈로그와 어긋난 것이다 */
function AgentView({ agentId, onBack }: { agentId: AgentId; onBack: () => void }) {
  if (agentId === 'summary') return <SummaryPage onBack={onBack} />
  if (agentId === 'translate') return <TranslatePage onBack={onBack} />
  if (agentId === 'review') return <ReviewPage onBack={onBack} />
  if (agentId === 'report') return <ReportPage onBack={onBack} />
  if (agentId === 'meeting') return <MeetingPage onBack={onBack} />
  if (agentId === 'internalreg') return <RegulationPage onBack={onBack} />
  if (agentId === 'knowledge') return <KnowledgePage onBack={onBack} />
  if (agentId === 'ocr') return <OcrPage onBack={onBack} />
  if (agentId === 'safety') return <SafetyPage onBack={onBack} />
  if (agentId === 'dbquery') return <DataQueryPage onBack={onBack} />
  if (agentId === 'dataanalysis') return <AnalysisPage onBack={onBack} />
  if (agentId === 'address') return <MappingPage onBack={onBack} />
  if (agentId === 'chatbot') return <ChatPage onBack={onBack} />
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div role="alert" className="max-w-sm text-center">
        <p className="font-bold text-slate-900">아직 준비되지 않은 에이전트입니다</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 min-h-11 text-sm font-bold text-slate-600 underline"
        >
          허브로 돌아가기
        </button>
      </div>
    </main>
  )
}
