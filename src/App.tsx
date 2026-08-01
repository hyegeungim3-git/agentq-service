import { useEffect, useState } from 'react'
import type { AgentId } from '@entities/agent/model'
import type { Domain } from '@entities/domain/model'
import { fetchDomain } from '@shared/api/domains'
import { PortalPage } from '@pages/portal/PortalPage'
import { HubPage } from '@pages/hub/HubPage'
import { SummaryPage } from '@pages/summary/SummaryPage'
import { TranslatePage } from '@pages/translate/TranslatePage'
import { ReviewPage } from '@pages/review/ReviewPage'

/* 화면이 여럿이 됐지만 라우터는 아직 넣지 않는다.
   URL 공유·새로고침 복원이 요구사항으로 들어올 때 도입한다(가이드 §8, §12).
   그때 이 View 타입이 그대로 라우트 정의가 된다. */
type View =
  | { name: 'portal' }
  | { name: 'hub'; domainId: string }
  | { name: 'agent'; domainId: string; agentId: AgentId }

export default function App() {
  const [view, setView] = useState<View>({ name: 'portal' })
  /* 불러온 도메인을 id와 함께 들고 있는다.
     effect 안에서 setDomain(null)로 지우던 것을 없앤 이유:
     ① 렌더 중 동기 setState는 연쇄 렌더를 만든다(react-hooks/set-state-in-effect가 잡았다)
     ② 도메인을 바꿀 때 이전 도메인이 잠깐 보이는 문제도 같이 사라진다 —
        id가 다르면 아직 안 불러온 것으로 취급한다. */
  const [loaded, setLoaded] = useState<{ id: string; domain: Domain } | null>(null)

  const domainId = view.name === 'portal' ? null : view.domainId

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
    return <PortalPage onSelect={(id) => setView({ name: 'hub', domainId: id })} />
  }

  if (view.name === 'agent') {
    const back = () => setView({ name: 'hub', domainId: view.domainId })
    if (view.agentId === 'summary') return <SummaryPage onBack={back} />
    if (view.agentId === 'translate') return <TranslatePage onBack={back} />
    if (view.agentId === 'review') return <ReviewPage onBack={back} />
    // 허브가 준비된 에이전트만 열어 주므로 여기 오면 카탈로그와 라우팅이 어긋난 것이다
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div role="alert" className="max-w-sm text-center">
          <p className="font-bold text-slate-900">아직 준비되지 않은 에이전트입니다</p>
          <button type="button" onClick={back} className="mt-3 min-h-11 text-sm font-bold text-slate-600 underline">
            허브로 돌아가기
          </button>
        </div>
      </main>
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

  return (
    <HubPage
      domain={domain}
      onBack={() => setView({ name: 'portal' })}
      onOpen={(agentId) => setView({ name: 'agent', domainId: domain.id, agentId })}
    />
  )
}
