/**
 * 관리자 화면 묶음 — **따로 내려받는다.**
 *
 * 44개 화면이 App과 한 덩어리에 있으면 업무 화면만 쓰는 사람도 관리자 코드를 전부
 * 받는다. 실측: 첫 청크가 1021KB(gzip 262KB)였고 관리자가 통째로 그 안에 있었다.
 * 관리자는 포털에서 따로 들어가는 곳이라 경계가 분명하다 — 여기서 끊는다.
 *
 * `App`은 이 파일을 `lazy()`로만 부른다. 그래서 여기서 import하는 것은 전부
 * 관리자 청크로 따라간다. 새 관리자 화면은 **App.tsx가 아니라 여기에** 넣어야
 * 그 경계가 유지된다.
 */
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
import { GuardrailPage } from '@pages/admin/compliance/GuardrailPage'
import { AiActPage } from '@pages/admin/compliance/AiActPage'
import { KnowledgeBasePage } from '@pages/admin/knowledge/KnowledgeBasePage'
import { AgentOpsPage } from '@pages/admin/agentops/AgentOpsPage'
import { AppSurfacePage } from '@pages/admin/agentops/AppSurfacePage'
import { FlowBuilderPage } from '@pages/admin/agentdef/FlowBuilderPage'
import { ScenarioBuilderPage } from '@pages/admin/agentdef/ScenarioBuilderPage'
import { WorkflowPage } from '@pages/admin/agentdef/WorkflowPage'
import { AppInstancePage } from '@pages/admin/appinst/AppInstancePage'
import { PipelinePage } from '@pages/admin/appinst/PipelinePage'
import { VectorDbPage } from '@pages/admin/datainfra/VectorDbPage'
import { IngestPage } from '@pages/admin/datainfra/IngestPage'
import { BenchmarkPage } from '@pages/admin/datainfra/BenchmarkPage'
import { PackStudioPage } from '@pages/admin/packops/PackStudioPage'
import { ToolDeployPage } from '@pages/admin/packops/ToolDeployPage'
import { DatasetPage } from '@pages/admin/mlops/DatasetPage'
import { DevEnvPage } from '@pages/admin/mlops/DevEnvPage'
import { VolumePage } from '@pages/admin/mlops/VolumePage'
import { RegistryPage } from '@pages/admin/mlops/RegistryPage'
import { TrainingPage } from '@pages/admin/mlops/TrainingPage'
import { EvaluationPage } from '@pages/admin/mlops/EvaluationPage'

export type AdminAppProps = {
  menuId: string
  onMenu: (id: string) => void
  onExit: () => void
  onUserPortal: () => void
  admin: { name: string; org: string }
}

export function AdminApp({ menuId, onMenu, onExit, onUserPortal, admin }: AdminAppProps) {
  const menu = findMenu(menuId)
  return (
    <AdminShell
      menuId={menuId}
      onMenu={onMenu}
      onExitAdmin={onExit}
      onUserPortal={onUserPortal}
      admin={admin}
    >
      {menuId === 'system' && <SystemStatusPage />}
      {menuId === 'service' && <ServiceStatusPage />}
      {menuId === 'gpu' && <GpuStatusPage />}
      {menuId === 'trainer' && <TrainerStatusPage />}
      {menuId === 'users.list' && <UserListPage />}
      {menuId === 'users.approval' && <ApprovalPage />}
      {menuId === 'users.quota' && <QuotaPage />}
      {menuId === 'users.log' && <AccessLogPage />}
      {menuId === 'users.block' && <BlockRulePage />}
      {menuId === 'llmops.models' && <ModelPage />}
      {menuId === 'llmops.reliability' && <ReliabilityPage />}
      {menuId === 'llmops.quality' && <QualityPage />}
      {menuId === 'analytics.history' && <UsageHistoryPage />}
      {menuId === 'analytics.satisfaction' && <SatisfactionPage />}
      {menuId === 'analytics.stats' && <UsageStatsPage />}
      {menuId === 'analytics.report' && <AnalyticsReportPage />}
      {menuId === 'logs.integrated' && <IntegratedLogPage />}
      {menuId === 'logs.usage' && <UsageMonitorPage />}
      {menuId === 'content' && <ContentPage />}
      {menuId === 'hr' && <HrSyncPage />}
      {menuId === 'guardrail' && <GuardrailPage />}
      {menuId === 'aiact' && <AiActPage />}
      {menuId === 'knowledge.areas' && <KnowledgeBasePage />}
      {menuId === 'knowledge.pipeline' && <PipelinePage />}
      {menuId === 'agents.ops' && <AgentOpsPage />}
      {menuId === 'agents.flow' && <FlowBuilderPage />}
      {menuId === 'agents.scenario' && <ScenarioBuilderPage />}
      {menuId === 'agents.workflow' && <WorkflowPage />}
      {menuId === 'apps.surface' && <AppSurfacePage />}
      {menuId === 'apps.instance' && <AppInstancePage />}
      {menuId === 'packstudio' && <PackStudioPage />}
      {menuId === 'deploy' && <ToolDeployPage />}
      {menuId === 'data.sets' && <DatasetPage />}
      {menuId === 'data.vector' && <VectorDbPage />}
      {menuId === 'data.ingest' && <IngestPage />}
      {menuId === 'devenv.workspace' && <DevEnvPage />}
      {menuId === 'devenv.volume' && <VolumePage />}
      {menuId === 'registry' && <RegistryPage />}
      {menuId === 'training' && <TrainingPage />}
      {menuId === 'evaluation.internal' && <EvaluationPage />}
      {menuId === 'evaluation.benchmark' && <BenchmarkPage />}
      {menuId === 'prompts' && <ApiPromptPage />}
      {menuId === 'sysops.integration' && <IntegrationPage />}
      {menuId === 'sysops.home' && (
        <AdminHomePage onOpen={onMenu} />
      )}
      {menu !== null && menu.status === 'planned' && <PlannedPage menu={menu} />}
    </AdminShell>
  )
}
