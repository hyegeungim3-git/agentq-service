import { useCallback, useEffect, useState } from 'react'
import { readJson, writeJson } from '@shared/lib/storage'
import { UI_LANGS, type UiLang } from '@shared/i18n/strings'

/**
 * 화면 표시 설정 — 밝기와 화면 틀 언어.
 *
 * ⚠️ 계정 설정이 아니라 **이 브라우저 설정**이다. 서버가 없으므로 다른 기기에서
 * 열면 기본값이다. 계정 설정처럼 보이면 다른 기기에서도 따라올 줄 안다.
 *
 * 밝기는 `<html data-theme>`에 쓴다 — CSS 팔레트 변수가 그 선택자를 보고 뒤집힌다.
 * 리액트 트리 안쪽에 두면 배경 여백이 라이트로 남는다.
 */

export type Theme = 'light' | 'dark'

export type Prefs = {
  theme: Theme
  uiLang: UiLang
}

export const DEFAULT_PREFS: Prefs = { theme: 'light', uiLang: 'ko' }

const KEY = 'agentq.prefs.v1'

function isPrefs(v: unknown): v is Prefs {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    (o['theme'] === 'light' || o['theme'] === 'dark') &&
    UI_LANGS.includes(o['uiLang'] as UiLang)
  )
}

export type PrefsStore = {
  prefs: Prefs
  set: (patch: Partial<Prefs>) => void
  reset: () => void
  /** 저장이 막힌 환경이면 그렇다고 말해야 한다 */
  persisted: boolean
}

export function usePrefs(): PrefsStore {
  const [prefs, setPrefs] = useState<Prefs>(() => readJson<Prefs>(KEY, isPrefs) ?? DEFAULT_PREFS)
  const [persisted, setPersisted] = useState(true)

  // 팔레트는 문서 루트에서 뒤집힌다
  useEffect(() => {
    document.documentElement.dataset['theme'] = prefs.theme
  }, [prefs.theme])

  // 화면 틀 언어가 바뀌면 문서 언어도 바뀐다 — 보조기기가 읽는 방식이 달라진다
  useEffect(() => {
    document.documentElement.lang = prefs.uiLang
  }, [prefs.uiLang])

  const apply = useCallback((next: Prefs) => {
    setPrefs(next)
    setPersisted(writeJson(KEY, next))
  }, [])

  /* 갱신 함수 안에서 저장하지 않는다 — StrictMode가 두 번 부르면 부수효과도 두 번 난다 */
  const set = useCallback(
    (patch: Partial<Prefs>) => {
      apply({ ...prefs, ...patch })
    },
    [apply, prefs],
  )

  const reset = useCallback(() => {
    apply(DEFAULT_PREFS)
  }, [apply])

  return { prefs, set, reset, persisted }
}
