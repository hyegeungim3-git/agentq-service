/**
 * 관리자 메뉴 구조.
 *
 * 이전 데모의 관리자를 실측해 그대로 옮겼다. 상위 항목 아래 하위 메뉴가 있는
 * 구조라 `parentId`로 두 단계를 만든다.
 *
 * 하위 메뉴는 **그 구역을 만들 때 실측해서 채운다.** 지금 이름만 나열해 두면
 * 만들지도 않은 화면이 있는 것처럼 보인다.
 *
 * ⚠️ **아직 안 만든 메뉴를 감추지 않는다.** 감추면 '이 제품에는 사용자 관리가 없다'로
 * 읽힌다. 대신 `planned`로 표시하고, 눌렀을 때 무엇이 언제 오는지 말한다.
 * '눌러도 아무 일 없는 항목'을 만들지 않는다는 규칙(SCOPE-PLAN §3-3)은
 * 껍데기 화면을 복제하지 말라는 뜻이지, 상태를 감추라는 뜻이 아니다.
 */

export type AdminSection = '대시보드' | '인프라 · 개발' | 'AI 서비스' | '지식 · RAG' | '운영 · 관리'

export type AdminPhase = 'P1' | 'P2' | 'P3' | 'P4'

export type AdminMenu = {
  id: string
  label: string
  section: AdminSection
  /** 상위 항목 id. 최상위면 null */
  parentId: string | null
  /** 만들어진 화면인가 */
  status: 'ready' | 'planned'
  /** 아직이면 어느 단계에서 만드는가 */
  phase: AdminPhase
  /** 이 화면이 무엇을 하는가 — 준비 중 화면이 이걸 보여 준다 */
  summary: string
}

export const ADMIN_SECTIONS: AdminSection[] = [
  '대시보드',
  '인프라 · 개발',
  'AI 서비스',
  '지식 · RAG',
  '운영 · 관리',
]

export const ADMIN_MENUS: AdminMenu[] = [
  {
    id: 'system',
    label: '시스템 현황',
    section: '대시보드',
    parentId: null,
    status: 'ready',
    phase: 'P1',
    summary: '클러스터 자원과 노드·파드 상태',
  },
  {
    id: 'service',
    label: '서비스 현황',
    section: '대시보드',
    parentId: null,
    status: 'ready',
    phase: 'P1',
    summary: '구성 요소별 가동 상태와 주의 사유',
  },
  {
    id: 'gpu',
    label: 'GPU 현황',
    section: '대시보드',
    parentId: null,
    status: 'ready',
    phase: 'P1',
    summary: '노드별 GPU 사용률·온도·전력',
  },
  {
    id: 'trainer',
    label: '트레이너 현황',
    section: '대시보드',
    parentId: null,
    status: 'ready',
    phase: 'P1',
    summary: '학습 작업 집계와 자원 배분',
  },

  { id: 'data', label: '데이터 관리', section: '인프라 · 개발', parentId: null, status: 'planned', phase: 'P4', summary: '학습·평가에 쓰는 데이터셋의 등록과 버전 관리' },
  { id: 'devenv', label: '개발 환경', section: '인프라 · 개발', parentId: null, status: 'planned', phase: 'P4', summary: '노트북·워크스페이스 자원 할당' },
  { id: 'registry', label: '모델 레지스트리', section: '인프라 · 개발', parentId: null, status: 'planned', phase: 'P4', summary: '모델 버전·아티팩트·배포 이력' },
  { id: 'training', label: '학습 · 튜닝', section: '인프라 · 개발', parentId: null, status: 'planned', phase: 'P4', summary: 'LoRA·QLoRA 등 학습 작업 생성과 추적' },
  { id: 'evaluation', label: '모델 평가', section: '인프라 · 개발', parentId: null, status: 'planned', phase: 'P4', summary: '평가 세트별 지표 비교' },

  { id: 'guardrail', label: '가드레일', section: 'AI 서비스', parentId: null, status: 'planned', phase: 'P3', summary: '금칙어·개인정보·유해 표현 필터와 차단 이력' },
  { id: 'aiact', label: 'AI 기본법 대응', section: 'AI 서비스', parentId: null, status: 'planned', phase: 'P3', summary: '고영향 AI 관리·생성물 표시·영향평가' },
  { id: 'packstudio', label: '도메인 팩 스튜디오', section: 'AI 서비스', parentId: null, status: 'planned', phase: 'P3', summary: '발주처별 업무 데이터 구성' },
  { id: 'deploy', label: '도구 · 배포', section: 'AI 서비스', parentId: null, status: 'planned', phase: 'P3', summary: '도구 등록과 배포 대상 관리' },
  { id: 'agents', label: '에이전트', section: 'AI 서비스', parentId: null, status: 'planned', phase: 'P3', summary: '에이전트 정의·태스크플로우·시나리오' },
  { id: 'apps', label: '애플리케이션', section: 'AI 서비스', parentId: null, status: 'planned', phase: 'P3', summary: '사용자에게 열어 주는 앱 구성' },

  { id: 'knowledge', label: '지식 관리', section: '지식 · RAG', parentId: null, status: 'planned', phase: 'P3', summary: '문서 수집·청킹·색인과 RAG 파이프라인' },

  { id: 'users', label: '사용자 관리', section: '운영 · 관리', parentId: null, status: 'ready', phase: 'P2', summary: '계정·승인·권한 부여' },
  { id: 'users.list', label: '사용자 목록', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: '계정 검색과 상태 확인' },
  { id: 'users.approval', label: '승인 관리', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: '가입·권한·한도 신청 처리' },
  { id: 'users.quota', label: '할당량', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: '사용자별 한도와 사용량' },
  { id: 'users.log', label: '접근 로그', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: '누가 언제 무엇에 접근했는지' },
  { id: 'users.block', label: '접근권한·차단', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: 'IP·계정 차단 규칙' },
  { id: 'hr', label: 'HR 연계·그룹 관리', section: '운영 · 관리', parentId: null, status: 'planned', phase: 'P2', summary: '인사 시스템 연동과 조직 그룹' },
  { id: 'llmops', label: 'LLM 운영', section: '운영 · 관리', parentId: null, status: 'planned', phase: 'P2', summary: '모델 라우팅·한도·비용' },
  { id: 'analytics', label: '서비스 분석', section: '운영 · 관리', parentId: null, status: 'planned', phase: 'P2', summary: '이용 통계와 답변 품질' },
  { id: 'logs', label: '로그·모니터링', section: '운영 · 관리', parentId: null, status: 'planned', phase: 'P2', summary: '접근 로그·감사 추적·알림' },
  { id: 'content', label: '콘텐츠 관리', section: '운영 · 관리', parentId: null, status: 'planned', phase: 'P2', summary: '공지·가이드·FAQ 편집' },
  { id: 'prompts', label: 'API·프롬프트', section: '운영 · 관리', parentId: null, status: 'planned', phase: 'P2', summary: '시스템 프롬프트와 외부 연동 키' },
  { id: 'settings', label: '시스템 설정', section: '운영 · 관리', parentId: null, status: 'planned', phase: 'P2', summary: '전역 설정과 보관 정책' },
]

/** 구역의 최상위 항목만 — 하위 메뉴는 `childrenOf`로 편다 */
export const menusOf = (s: AdminSection): AdminMenu[] =>
  ADMIN_MENUS.filter((m) => m.section === s && m.parentId === null)

export const childrenOf = (id: string): AdminMenu[] =>
  ADMIN_MENUS.filter((m) => m.parentId === id)

/** 상위 항목은 첫 하위 메뉴로 보낸다 — 그룹 자체에는 화면이 없다 */
export function landingOf(id: string): string {
  const kids = childrenOf(id)
  return kids[0]?.id ?? id
}
export const findMenu = (id: string): AdminMenu | null => ADMIN_MENUS.find((m) => m.id === id) ?? null

/** 화면인 것만 센다 — 상위 항목은 묶음일 뿐 화면이 아니다 */
const isScreen = (m: AdminMenu): boolean => childrenOf(m.id).length === 0

export const readyCount = (): number =>
  ADMIN_MENUS.filter((m) => isScreen(m) && m.status === 'ready').length
export const plannedCount = (): number =>
  ADMIN_MENUS.filter((m) => isScreen(m) && m.status === 'planned').length
