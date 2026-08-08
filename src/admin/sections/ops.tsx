/**
 * 관리자 '운영 · 관리' 화면 묶음 — **이 섹션을 열 때 받는다.**
 *
 * 관리자 전체를 한 덩어리로 두면 시스템 현황만 보는 사람도 44화면을 다 받는다.
 * 섹션은 사이드바에서 눈에 보이는 경계라 나누기에 자연스럽다.
 */
import { AccessLogPage } from '@pages/admin/users/AccessLogPage'
import { AdminHomePage } from '@pages/admin/sysops/AdminHomePage'
import { ApiPromptPage } from '@pages/admin/sysops/ApiPromptPage'
import { ApprovalPage } from '@pages/admin/users/ApprovalPage'
import { BlockRulePage } from '@pages/admin/users/BlockRulePage'
import { ContentPage } from '@pages/admin/content/ContentPage'
import { HrSyncPage } from '@pages/admin/sysops/HrSyncPage'
import { IntegratedLogPage } from '@pages/admin/oplog/IntegratedLogPage'
import { IntegrationPage } from '@pages/admin/sysops/IntegrationPage'
import { ModelPage } from '@pages/admin/llmops/ModelPage'
import { QualityPage } from '@pages/admin/llmops/QualityPage'
import { QuotaPage } from '@pages/admin/users/QuotaPage'
import { ReliabilityPage } from '@pages/admin/llmops/ReliabilityPage'
import { ReportPage as AnalyticsReportPage } from '@pages/admin/analytics/ReportPage'
import { SatisfactionPage } from '@pages/admin/analytics/SatisfactionPage'
import { UsageHistoryPage } from '@pages/admin/analytics/UsageHistoryPage'
import { UsageMonitorPage } from '@pages/admin/oplog/UsageMonitorPage'
import { UsageStatsPage } from '@pages/admin/analytics/UsageStatsPage'
import { UserListPage } from '@pages/admin/users/UserListPage'

/* 관리 홈은 다른 화면으로 보내는 카드가 있다 — 그 이동을 셸에서 받아 넘긴다 */
export function OpsSection({ menuId, onMenu }: { menuId: string; onMenu: (id: string) => void }) {
  return (
    <>
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
      {menuId === 'prompts' && <ApiPromptPage />}
      {menuId === 'sysops.integration' && <IntegrationPage />}
      {menuId === 'sysops.home' && (
        <AdminHomePage onOpen={onMenu} />
      )}
    </>
  )
}
