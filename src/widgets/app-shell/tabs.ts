/**
 * 셸의 탭 정의.
 *
 * 컴포넌트 파일에서 분리한 이유는 두 가지다.
 * ① 컴포넌트와 상수를 한 파일에서 내보내면 개발 중 빠른 갱신이 깨진다(react-refresh 경고).
 * ② 탭 목록은 App이 라우팅에도 쓰므로 화면 구현과 따로 있는 편이 낫다.
 */
export type ShellTab = 'general' | 'agents' | 'security'

const TAB_LABEL: Record<ShellTab, string> = {
  general: '일반',
  agents: '에이전트',
  security: '보안',
}

const TAB_DESC: Record<ShellTab, string> = {
  general: '사내 문서를 근거로 답하는 챗봇',
  agents: '업무별 에이전트와 복합 업무',
  security: '데이터가 지금 어디서 처리되는지',
}

export const SHELL_TABS = Object.keys(TAB_LABEL) as ShellTab[]
export const shellTabLabel = (t: ShellTab): string => TAB_LABEL[t]
export const shellTabDesc = (t: ShellTab): string => TAB_DESC[t]
