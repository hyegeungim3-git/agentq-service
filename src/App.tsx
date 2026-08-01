import { useState } from 'react'
import { PortalPage } from '@pages/portal/PortalPage'
import { SummaryPage } from '@pages/summary/SummaryPage'

/* 화면이 둘이 됐지만 아직 라우터를 넣지 않는다.
   URL로 직접 접근할 화면이 생길 때(공유·새로고침 복원이 필요할 때) 도입한다.
   지금 넣으면 요구사항보다 큰 구조가 된다(가이드 §8). */
type View = { name: 'portal' } | { name: 'summary'; domainId: string }

export default function App() {
  const [view, setView] = useState<View>({ name: 'portal' })

  if (view.name === 'summary') {
    return <SummaryPage onBack={() => setView({ name: 'portal' })} />
  }
  return <PortalPage onSelect={(domainId) => setView({ name: 'summary', domainId })} />
}
