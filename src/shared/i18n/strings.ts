/**
 * 화면 틀의 표시 언어.
 *
 * **번역하는 것은 화면 틀뿐이다** — 메뉴·버튼·안내 문구. 업무 콘텐츠(문서 본문,
 * 챗봇 답변, 보고서, 규정 조항)는 원문 언어로 둔다.
 *
 * 콘텐츠까지 기계 번역하면 원문과 달라진 것을 사용자가 알 수 없다. 규정 조항이
 * 조금 다르게 번역되면 그게 원문인 줄 알고 인용하게 된다. 인용 원문을 보여 주는
 * 이유와 같은 이유로, 원문은 원문으로 둔다. 화면이 그 사실을 설정에서 말한다.
 *
 * 두 사전의 키가 어긋나면 한쪽 언어에서 빈 문구가 뜬다. 그래서 키 집합이
 * 같은지 테스트로 강제한다 — 빠뜨림은 조용히 지나가는 종류의 결함이다.
 */

export type UiLang = 'ko' | 'en'
export const UI_LANGS: UiLang[] = ['ko', 'en']

const KO = {
  'tab.general': '일반',
  'tab.agents': '에이전트',
  'tab.security': '보안',
  'tab.notices': '공지사항',
  'tab.guide': '사용 가이드',
  'tab.settings': '환경설정',
  'tab.general.desc': '사내 문서를 근거로 답하는 챗봇',
  'tab.agents.desc': '업무별 에이전트와 복합 업무',
  'tab.security.desc': '데이터가 지금 어디서 처리되는지',
  'tab.notices.desc': '사내 공지와 기준 변경',
  'tab.guide.desc': '할 수 있는 것과 못 하는 것',
  'tab.settings.desc': '화면 표시 방식',

  'nav.workArea': '작업 영역',
  'nav.workspace': '워크스페이스',
  'nav.newChat': '+ 새 대화',
  'nav.recent': '최근 대화',
  'nav.clearAll': '전체 지우기',
  'nav.empty': '이 워크스페이스에는 아직 없습니다.',
  'nav.saved': '이 브라우저에 저장됩니다. 지우려면 위 전체 지우기를 누르세요.',
  'nav.notSaved': '이 브라우저에 저장하지 못했습니다. 새로고침하면 사라집니다.',
  'nav.exit': '분야 선택으로',
  'nav.open': '사이드바 열기',
  'nav.close': '사이드바 닫기',
  'nav.delete': '삭제',

  'settings.title': '환경설정',
  'settings.lead': '이 브라우저에만 적용됩니다. 계정 설정이 아닙니다.',
  'settings.theme': '화면 밝기',
  'settings.theme.light': '밝게',
  'settings.theme.dark': '어둡게',
  'settings.lang': '화면 틀 언어',
  'settings.lang.ko': '한국어',
  'settings.lang.en': 'English',
  'settings.lang.note':
    '메뉴·버튼 같은 화면 틀만 바뀝니다. 문서 본문·챗봇 답변·규정 조항은 원문 그대로 둡니다 — 번역하면 원문과 달라진 것을 확인할 수 없기 때문입니다.',
  'settings.saved': '이 브라우저에 저장됩니다.',
  'settings.notSaved': '이 브라우저에 저장하지 못했습니다. 새로고침하면 되돌아갑니다.',
  'settings.reset': '기본값으로',
} as const

export type UiKey = keyof typeof KO

const EN: Record<UiKey, string> = {
  'tab.general': 'Chat',
  'tab.agents': 'Agents',
  'tab.security': 'Security',
  'tab.notices': 'Notices',
  'tab.guide': 'Guide',
  'tab.settings': 'Settings',
  'tab.general.desc': 'Answers grounded in internal documents',
  'tab.agents.desc': 'Task agents and multi-step work',
  'tab.security.desc': 'Where your data is processed right now',
  'tab.notices.desc': 'Internal notices and standard changes',
  'tab.guide.desc': 'What it can and cannot do',
  'tab.settings.desc': 'How this screen is displayed',

  'nav.workArea': 'Work area',
  'nav.workspace': 'Workspace',
  'nav.newChat': '+ New chat',
  'nav.recent': 'Recent chats',
  'nav.clearAll': 'Clear all',
  'nav.empty': 'Nothing here yet in this workspace.',
  'nav.saved': 'Saved in this browser. Use Clear all above to remove.',
  'nav.notSaved': 'Could not save in this browser. Refreshing will lose these.',
  'nav.exit': 'Back to sector',
  'nav.open': 'Open sidebar',
  'nav.close': 'Close sidebar',
  'nav.delete': 'Delete',

  'settings.title': 'Settings',
  'settings.lead': 'Applies to this browser only. These are not account settings.',
  'settings.theme': 'Appearance',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.lang': 'Interface language',
  'settings.lang.ko': '한국어',
  'settings.lang.en': 'English',
  'settings.lang.note':
    'Only the interface — menus and buttons — changes. Document text, chat answers and regulation clauses stay in their original language, because a translated original leaves no way to tell what was changed.',
  'settings.saved': 'Saved in this browser.',
  'settings.notSaved': 'Could not save in this browser. Refreshing will revert this.',
  'settings.reset': 'Reset to defaults',
}

export const UI_STRINGS: Record<UiLang, Record<UiKey, string>> = { ko: KO, en: EN }

export const t = (lang: UiLang, key: UiKey): string => UI_STRINGS[lang][key]

export const uiLangLabel = (l: UiLang): string => (l === 'ko' ? '한국어' : 'English')
