/**
 * 에이전트 화면 묶음 — **따로 내려받는다.**
 *
 * 13종을 App과 한 덩어리에 두면 챗봇만 쓰는 사람도 전부 받는다. 허브에서
 * 하나를 고르는 순간에 받으면 충분하다. 새 에이전트 화면은 **여기에** 넣는다.
 */
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
import type { AgentId } from '@entities/agent/model'

export function AgentApp({ agentId, onBack }: { agentId: AgentId; onBack: () => void }) {
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
