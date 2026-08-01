import { useState } from 'react'
import { PortalPage } from '@pages/portal/PortalPage'

export default function App() {
  const [domainId, setDomainId] = useState<string | null>(null)

  // 라우팅은 아직 붙이지 않았다 — 화면이 하나뿐인 시점에 라우터를 넣으면
  // 요구사항보다 큰 구조가 된다(가이드 §8). 두 번째 화면이 생길 때 도입한다.
  if (domainId) {
    return (
      <main className="min-h-dvh grid place-items-center">
        <p className="text-sm text-slate-600">선택한 도메인: {domainId}</p>
      </main>
    )
  }
  return <PortalPage onSelect={setDomainId} />
}
