import { describe, it, expect, beforeEach } from 'vitest'
import { readJson, writeJson, clearAll, globalKey, domainKey, STORAGE_SCHEMA_VERSION } from './demoStorage'

describe('demoStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('쓴 값을 그대로 읽는다', () => {
    writeJson(globalKey('pref'), { lang: 'ko' })
    expect(readJson(globalKey('pref'), { lang: 'en' })).toEqual({ lang: 'ko' })
  })

  it('값이 없으면 fallback을 준다', () => {
    expect(readJson(globalKey('missing'), 'default')).toBe('default')
  })

  it('깨진 JSON이면 fallback을 준다 — 조용히 던지지 않는다', () => {
    localStorage.setItem(globalKey('broken'), '{not json')
    expect(readJson(globalKey('broken'), 'safe')).toBe('safe')
  })

  it('스키마 버전이 다르면 fallback을 준다', () => {
    localStorage.setItem(globalKey('old'), JSON.stringify({ v: STORAGE_SCHEMA_VERSION + 1, data: 'x' }))
    expect(readJson(globalKey('old'), 'safe')).toBe('safe')
  })

  it('봉투 없는 구버전 값은 버린다', () => {
    localStorage.setItem(globalKey('legacy'), JSON.stringify({ lang: 'ko' }))
    expect(readJson(globalKey('legacy'), null)).toBeNull()
  })

  /* 이 두 건이 이 파일의 존재 이유다 — 보안 세션 무저장을 코드로 강제한다 */
  it('sensitive면 쓰지 않는다', () => {
    const ok = writeJson(globalKey('secure'), 'secret', { sensitive: true })
    expect(ok).toBe(false)
    expect(localStorage.getItem(globalKey('secure'))).toBeNull()
  })

  it('sensitive면 이미 저장된 값이 있어도 읽지 않는다', () => {
    writeJson(globalKey('secure'), 'leftover')
    expect(readJson(globalKey('secure'), 'none', { sensitive: true })).toBe('none')
  })

  it('도메인 키는 네임스페이스로 분리된다', () => {
    expect(domainKey('convos', 'manufacturing')).toBe('agentq.convos.manufacturing')
  })

  it('clearAll은 이 앱 키만 지운다', () => {
    writeJson(globalKey('mine'), 1)
    localStorage.setItem('other-app.key', 'keep')
    clearAll()
    expect(localStorage.getItem(globalKey('mine'))).toBeNull()
    expect(localStorage.getItem('other-app.key')).toBe('keep')
  })
})
