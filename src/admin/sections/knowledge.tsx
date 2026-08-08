/**
 * 관리자 '지식 · RAG' 화면 묶음 — **이 섹션을 열 때 받는다.**
 *
 * 관리자 전체를 한 덩어리로 두면 시스템 현황만 보는 사람도 44화면을 다 받는다.
 * 섹션은 사이드바에서 눈에 보이는 경계라 나누기에 자연스럽다.
 */
import { KnowledgeBasePage } from '@pages/admin/knowledge/KnowledgeBasePage'
import { PipelinePage } from '@pages/admin/appinst/PipelinePage'

export function KnowledgeSection({ menuId }: { menuId: string }) {
  return (
    <>
      {menuId === 'knowledge.areas' && <KnowledgeBasePage />}
      {menuId === 'knowledge.pipeline' && <PipelinePage />}
    </>
  )
}
