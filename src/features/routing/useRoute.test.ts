import { describe, it, expect } from 'vitest'
import { parseRoute, routeToHash } from './useRoute'

/**
 * 주소와 화면이 서로를 정확히 되돌리는가.
 *
 * 한쪽만 맞으면 새로고침했을 때 다른 화면이 뜬다 — 그게 라우팅에서 가장 흔한 결함이다.
 */
describe('주소 ↔ 화면', () => {
  const cases = [
    ['#/', { name: 'portal' }],
    ['#/d/manufacturing/general', { name: 'shell', domainId: 'manufacturing', tab: 'general', agentId: null, scenario: false }],
    ['#/d/public/security', { name: 'shell', domainId: 'public', tab: 'security', agentId: null, scenario: false }],
    ['#/d/civic/handover', { name: 'shell', domainId: 'civic', tab: 'handover', agentId: null, scenario: false }],
    ['#/d/manufacturing/agents/ocr', { name: 'shell', domainId: 'manufacturing', tab: 'agents', agentId: 'ocr', scenario: false }],
    ['#/d/manufacturing/agents/scenario', { name: 'shell', domainId: 'manufacturing', tab: 'agents', agentId: null, scenario: true }],
    ['#/admin/system', { name: 'admin', menuId: 'system' }],
    ['#/admin/users.list', { name: 'admin', menuId: 'users.list' }],
  ] as const

  it('읽고 다시 쓰면 같은 주소가 된다', () => {
    for (const [hash, route] of cases) {
      expect(parseRoute(hash), hash).toEqual(route)
      expect(routeToHash(route), hash).toBe(hash)
    }
  })

  /* 비슷한 것으로 넘겨짚으면 남의 발주처를 열어 줄 수 있다 */
  it('모르는 주소는 추측하지 않는다', () => {
    expect(parseRoute('#/무엇')).toEqual({ name: 'portal' })
    expect(parseRoute('#/d')).toEqual({ name: 'portal' })
    expect(parseRoute('#/d/manufacturing/없는탭')).toEqual({ name: 'portal' })
  })

  /* 없는 에이전트는 허브로 — 화면을 못 찾았다고 첫 화면까지 쫓아내지는 않는다 */
  it('없는 에이전트는 허브로 보낸다', () => {
    expect(parseRoute('#/d/manufacturing/agents/없는것')).toEqual({
      name: 'shell',
      domainId: 'manufacturing',
      tab: 'agents',
      agentId: null,
      scenario: false,
    })
  })

  it('해시가 비면 첫 화면이다', () => {
    expect(parseRoute('')).toEqual({ name: 'portal' })
    expect(parseRoute('#')).toEqual({ name: 'portal' })
  })

  it('관리자 메뉴를 안 적으면 시스템 현황이다', () => {
    expect(parseRoute('#/admin')).toEqual({ name: 'admin', menuId: 'system' })
  })
})
