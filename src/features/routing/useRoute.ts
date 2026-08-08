import { useCallback, useEffect, useState } from 'react'
import { AGENTS, type AgentId } from '@entities/agent/model'
import type { ShellTab } from '@widgets/app-shell/tabs'

/**
 * 주소로 화면을 기억한다.
 *
 * 지금까지는 화면 상태를 메모리에만 뒀다. 새로고침하면 첫 화면으로 돌아갔고,
 * 보고 있던 곳을 **남에게 링크로 줄 수도 없었다** — 회의 중에 "여기 보세요"가 안 된다.
 *
 * 해시(`#/…`)를 쓴다. GitHub Pages 같은 정적 호스팅은 `/manufacturing/agents` 같은
 * 경로로 새로고침하면 **서버가 404를 준다**(그 파일이 없으니까). 해시는 서버에
 * 안 가므로 그 문제가 없다. 이전 데모도 같은 이유로 해시였다.
 *
 * 주소 형태 — 사람이 읽을 수 있게, 그리고 하나가 하나를 뜻하게 둔다.
 *   `#/`                              첫 화면
 *   `#/d/manufacturing/general`       발주처 안, 일반 탭
 *   `#/d/manufacturing/agents/ocr`    에이전트 안쪽
 *   `#/d/manufacturing/agents/scenario`  복합 업무 릴레이
 *   `#/admin/system`                  관리자 화면
 *
 * ⚠️ **모르는 주소를 추측하지 않는다.** 없는 발주처·없는 에이전트를 적으면 첫 화면으로
 * 보낸다. 비슷한 것으로 넘겨짚으면 남의 발주처 데이터를 열어 줄 수 있다.
 */

export type Route =
  | { name: 'portal' }
  | { name: 'shell'; domainId: string; tab: ShellTab; agentId: AgentId | null; scenario: boolean }
  | { name: 'admin'; menuId: string }

const TABS: ShellTab[] = [
  'general',
  'agents',
  'security',
  'handover',
  'workorders',
  'notices',
  'guide',
  'settings',
]

const isTab = (s: string): s is ShellTab => (TABS as string[]).includes(s)
const isAgent = (s: string): s is AgentId => AGENTS.some((a) => a.id === s)

/** 주소 → 화면. 못 읽으면 첫 화면이다 */
export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [head, ...rest] = parts

  if (head === 'admin') {
    const menuId = rest[0]
    /* 메뉴 id가 실제로 있는지는 화면이 판단한다 — 여기서 목록을 또 들고 있으면
       메뉴가 늘 때마다 두 곳을 고쳐야 한다 */
    return menuId === undefined ? { name: 'admin', menuId: 'system' } : { name: 'admin', menuId }
  }

  if (head === 'd') {
    const domainId = rest[0]
    if (domainId === undefined) return { name: 'portal' }
    const tabPart = rest[1] ?? 'general'
    if (!isTab(tabPart)) return { name: 'portal' }
    const inner = rest[2]
    if (tabPart === 'agents' && inner === 'scenario') {
      return { name: 'shell', domainId, tab: 'agents', agentId: null, scenario: true }
    }
    if (tabPart === 'agents' && inner !== undefined) {
      /* 없는 에이전트를 비슷한 것으로 열지 않는다 */
      if (!isAgent(inner)) return { name: 'shell', domainId, tab: 'agents', agentId: null, scenario: false }
      return { name: 'shell', domainId, tab: 'agents', agentId: inner, scenario: false }
    }
    return { name: 'shell', domainId, tab: tabPart, agentId: null, scenario: false }
  }

  return { name: 'portal' }
}

/** 화면 → 주소 */
export function routeToHash(r: Route): string {
  if (r.name === 'portal') return '#/'
  if (r.name === 'admin') return `#/admin/${r.menuId}`
  if (r.tab === 'agents' && r.scenario) return `#/d/${r.domainId}/agents/scenario`
  if (r.tab === 'agents' && r.agentId !== null) return `#/d/${r.domainId}/agents/${r.agentId}`
  return `#/d/${r.domainId}/${r.tab}`
}

/**
 * 주소와 화면을 함께 움직인다.
 *
 * 뒤로가기가 실제로 뒤로 가야 한다 — 화면을 바꿀 때 기록을 **쌓는다**(`push`).
 * 주소창을 직접 고치거나 뒤로 가면 그 주소를 읽어 화면을 맞춘다.
 */
export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((next: Route) => {
    const hash = routeToHash(next)
    /* 같은 주소면 기록을 쌓지 않는다 — 뒤로가기를 여러 번 눌러야 나가는 일이 생긴다 */
    if (window.location.hash === hash) {
      setRoute(next)
      return
    }
    window.location.hash = hash
    setRoute(next)
  }, [])

  return [route, go]
}
