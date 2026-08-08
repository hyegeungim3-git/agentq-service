/**
 * 관리자 'AI 서비스' 화면 묶음 — **이 섹션을 열 때 받는다.**
 *
 * 관리자 전체를 한 덩어리로 두면 시스템 현황만 보는 사람도 44화면을 다 받는다.
 * 섹션은 사이드바에서 눈에 보이는 경계라 나누기에 자연스럽다.
 */
import { AgentOpsPage } from '@pages/admin/agentops/AgentOpsPage'
import { AiActPage } from '@pages/admin/compliance/AiActPage'
import { AppInstancePage } from '@pages/admin/appinst/AppInstancePage'
import { AppSurfacePage } from '@pages/admin/agentops/AppSurfacePage'
import { FlowBuilderPage } from '@pages/admin/agentdef/FlowBuilderPage'
import { GuardrailPage } from '@pages/admin/compliance/GuardrailPage'
import { PackStudioPage } from '@pages/admin/packops/PackStudioPage'
import { ScenarioBuilderPage } from '@pages/admin/agentdef/ScenarioBuilderPage'
import { ToolDeployPage } from '@pages/admin/packops/ToolDeployPage'
import { WorkflowPage } from '@pages/admin/agentdef/WorkflowPage'

export function AiSection({ menuId }: { menuId: string }) {
  return (
    <>
      {menuId === 'guardrail' && <GuardrailPage />}
      {menuId === 'aiact' && <AiActPage />}
      {menuId === 'agents.ops' && <AgentOpsPage />}
      {menuId === 'agents.flow' && <FlowBuilderPage />}
      {menuId === 'agents.scenario' && <ScenarioBuilderPage />}
      {menuId === 'agents.workflow' && <WorkflowPage />}
      {menuId === 'apps.surface' && <AppSurfacePage />}
      {menuId === 'apps.instance' && <AppInstancePage />}
      {menuId === 'packstudio' && <PackStudioPage />}
      {menuId === 'deploy' && <ToolDeployPage />}
    </>
  )
}
