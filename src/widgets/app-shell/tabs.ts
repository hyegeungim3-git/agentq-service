import { t, type UiKey, type UiLang } from '@shared/i18n/strings'

/**
 * 셸의 화면 목록.
 *
 * 컴포넌트 파일에서 분리한 이유는 두 가지다.
 * ① 컴포넌트와 상수를 한 파일에서 내보내면 개발 중 빠른 갱신이 깨진다(react-refresh 경고).
 * ② 목록은 App이 라우팅에도 쓰므로 화면 구현과 따로 있는 편이 낫다.
 *
 * 주 탭 3개와 안내 3개를 나눈 이유: 안내는 업무 흐름이 아니라 참고 자료다.
 * 같은 줄에 섞으면 '보안'과 '공지사항'이 같은 무게로 보인다.
 *
 * 이름은 사전에서 가져온다 — 화면 틀 언어를 바꾸면 여기도 함께 바뀌어야 한다.
 */
export type ShellTab = 'general' | 'agents' | 'security' | 'notices' | 'guide' | 'settings'

/** 업무 탭 */
export const SHELL_TABS: ShellTab[] = ['general', 'agents', 'security']
/** 참고 자료·설정 */
export const INFO_TABS: ShellTab[] = ['notices', 'guide', 'settings']

export const shellTabLabel = (tab: ShellTab, lang: UiLang): string =>
  t(lang, `tab.${tab}` as UiKey)
export const shellTabDesc = (tab: ShellTab, lang: UiLang): string =>
  t(lang, `tab.${tab}.desc` as UiKey)
