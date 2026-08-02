/**
 * 셸의 화면 목록.
 *
 * 컴포넌트 파일에서 분리한 이유는 두 가지다.
 * ① 컴포넌트와 상수를 한 파일에서 내보내면 개발 중 빠른 갱신이 깨진다(react-refresh 경고).
 * ② 목록은 App이 라우팅에도 쓰므로 화면 구현과 따로 있는 편이 낫다.
 *
 * 주 탭 3개와 안내 2개를 나눈 이유: 안내는 업무 흐름이 아니라 참고 자료다.
 * 같은 줄에 섞으면 '보안'과 '공지사항'이 같은 무게로 보인다.
 */
export type ShellTab = 'general' | 'agents' | 'security' | 'notices' | 'guide'

const LABEL: Record<ShellTab, string> = {
  general: '일반',
  agents: '에이전트',
  security: '보안',
  notices: '공지사항',
  guide: '사용 가이드',
}

const DESC: Record<ShellTab, string> = {
  general: '사내 문서를 근거로 답하는 챗봇',
  agents: '업무별 에이전트와 복합 업무',
  security: '데이터가 지금 어디서 처리되는지',
  notices: '사내 공지와 기준 변경',
  guide: '할 수 있는 것과 못 하는 것',
}

/** 업무 탭 */
export const SHELL_TABS: ShellTab[] = ['general', 'agents', 'security']
/** 참고 자료 */
export const INFO_TABS: ShellTab[] = ['notices', 'guide']

export const shellTabLabel = (t: ShellTab): string => LABEL[t]
export const shellTabDesc = (t: ShellTab): string => DESC[t]
