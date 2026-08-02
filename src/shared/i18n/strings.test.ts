import { describe, it, expect } from 'vitest'
import { UI_LANGS, UI_STRINGS, t, type UiKey } from './strings'

describe('화면 틀 사전', () => {
  /* 한쪽에만 있는 키는 다른 언어에서 빈 문구가 된다 — 조용히 지나가는 결함이다 */
  it('모든 언어가 같은 키를 갖는다', () => {
    const base = Object.keys(UI_STRINGS.ko).sort()
    for (const lang of UI_LANGS) {
      expect(Object.keys(UI_STRINGS[lang]).sort(), `${lang} 사전`).toEqual(base)
    }
  })

  it('빈 문구가 없다', () => {
    for (const lang of UI_LANGS) {
      for (const [key, value] of Object.entries(UI_STRINGS[lang])) {
        expect(value.trim(), `${lang}.${key}`).not.toBe('')
      }
    }
  })

  /* 셸이 `tab.<id>`·`tab.<id>.desc`를 조합해서 부른다.
     탭을 추가하고 사전을 빠뜨리면 여기서 걸린다 */
  it('탭마다 이름과 설명이 있다', () => {
    for (const tab of ['general', 'agents', 'security', 'notices', 'guide', 'settings']) {
      for (const lang of UI_LANGS) {
        expect(t(lang, `tab.${tab}` as UiKey), `${lang}.${tab}`).toBeTruthy()
        expect(t(lang, `tab.${tab}.desc` as UiKey), `${lang}.${tab}.desc`).toBeTruthy()
      }
    }
  })

  it('언어가 다르면 문구도 다르다', () => {
    expect(t('ko', 'tab.agents')).toBe('에이전트')
    expect(t('en', 'tab.agents')).toBe('Agents')
  })
})
