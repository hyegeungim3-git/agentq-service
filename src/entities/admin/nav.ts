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

/* P5 = 전체 재검수(2026-08-03)에서 뒤늦게 찾은 하위 메뉴들 — SCOPE-PLAN §6 */
export type AdminPhase = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'

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

  { id: 'data', label: '데이터 관리', section: '인프라 · 개발', parentId: null, status: 'ready', phase: 'P4', summary: '데이터셋·벡터 DB·자동 적재' },
  { id: 'data.sets', label: '데이터셋', section: '인프라 · 개발', parentId: 'data', status: 'ready', phase: 'P4', summary: '학습·평가 데이터셋과 출처·개인정보' },
  { id: 'data.vector', label: '벡터 DB', section: '인프라 · 개발', parentId: 'data', status: 'ready', phase: 'P5', summary: '컬렉션과 임베딩 차원' },
  { id: 'data.ingest', label: '자동 적재', section: '인프라 · 개발', parentId: 'data', status: 'ready', phase: 'P5', summary: '외부에서 문서를 가져오는 수집기' },
  { id: 'devenv', label: '개발 환경', section: '인프라 · 개발', parentId: null, status: 'ready', phase: 'P4', summary: '작업 공간과 공유 볼륨' },
  { id: 'devenv.workspace', label: '작업 공간', section: '인프라 · 개발', parentId: 'devenv', status: 'ready', phase: 'P4', summary: '사람별 작업 공간과 잡고 있는 GPU' },
  { id: 'devenv.volume', label: '공유 볼륨', section: '인프라 · 개발', parentId: 'devenv', status: 'ready', phase: 'P5', summary: '함께 쓰는 저장소와 남은 용량' },
  { id: 'registry', label: '모델 레지스트리', section: '인프라 · 개발', parentId: null, status: 'ready', phase: 'P4', summary: '모델 버전과 계보(어떤 데이터로 학습했나)' },
  { id: 'training', label: '학습 · 튜닝', section: '인프라 · 개발', parentId: null, status: 'ready', phase: 'P4', summary: '학습 작업 하나하나 — 집계는 트레이너 현황' },
  { id: 'evaluation', label: '모델 평가', section: '인프라 · 개발', parentId: null, status: 'ready', phase: 'P4', summary: '사내 평가셋 결과와 공개 벤치마크' },
  { id: 'evaluation.internal', label: '평가 결과', section: '인프라 · 개발', parentId: 'evaluation', status: 'ready', phase: 'P4', summary: '사내 평가셋 — 믿을 수 없는 결과는 순위에서 뺀다' },
  { id: 'evaluation.benchmark', label: '평가 지표', section: '인프라 · 개발', parentId: 'evaluation', status: 'ready', phase: 'P5', summary: '공개 벤치마크 — 무엇을 재는지 먼저' },

  { id: 'guardrail', label: '가드레일', section: 'AI 서비스', parentId: null, status: 'ready', phase: 'P3', summary: '규칙에 걸린 실제 기록 — 규칙 설정은 신뢰성 관리' },
  { id: 'aiact', label: 'AI 기본법 대응', section: 'AI 서비스', parentId: null, status: 'ready', phase: 'P3', summary: '고영향 AI 관리·생성물 표시·영향평가' },
  { id: 'packstudio', label: '도메인 팩 스튜디오', section: 'AI 서비스', parentId: null, status: 'ready', phase: 'P3', summary: '발주처별 업무 데이터 — 채워져야 포털에서 고를 수 있다' },
  { id: 'deploy', label: '도구 · 배포', section: 'AI 서비스', parentId: null, status: 'ready', phase: 'P3', summary: '에이전트가 부르는 도구와 떠 있는 버전' },
  { id: 'agents', label: '에이전트', section: 'AI 서비스', parentId: null, status: 'ready', phase: 'P3', summary: '에이전트 운영·정의·시나리오' },
  { id: 'agents.ops', label: '에이전트 운영', section: 'AI 서비스', parentId: 'agents', status: 'ready', phase: 'P3', summary: '지금 어떻게 돌고 있나 — 목록은 포털과 같은 카탈로그' },
  { id: 'agents.flow', label: '태스크플로우 빌더', section: 'AI 서비스', parentId: 'agents', status: 'ready', phase: 'P5', summary: '에이전트가 밟는 단계와 능력' },
  { id: 'agents.scenario', label: '시나리오 빌더', section: 'AI 서비스', parentId: 'agents', status: 'ready', phase: 'P5', summary: '여러 에이전트를 잇는 복합 업무 — 갈림 없이 순서대로' },
  { id: 'agents.workflow', label: '워크플로우', section: 'AI 서비스', parentId: 'agents', status: 'ready', phase: 'P5', summary: '조건에 따라 길이 갈리는 흐름' },
  { id: 'apps', label: '애플리케이션', section: 'AI 서비스', parentId: null, status: 'ready', phase: 'P3', summary: '앱 묶음과 개별 앱' },
  { id: 'apps.surface', label: '앱 구성', section: 'AI 서비스', parentId: 'apps', status: 'ready', phase: 'P3', summary: '열어 주는 묶음과 발주처별 노출' },
  { id: 'apps.instance', label: '앱 인스턴스', section: 'AI 서비스', parentId: 'apps', status: 'ready', phase: 'P5', summary: '사람들이 만든 개별 앱 — 채팅·보고서·데이터 분석' },

  { id: 'knowledge', label: '지식 관리', section: '지식 · RAG', parentId: null, status: 'ready', phase: 'P3', summary: '지식영역과 색인 파이프라인' },
  { id: 'knowledge.areas', label: '지식영역', section: '지식 · RAG', parentId: 'knowledge', status: 'ready', phase: 'P3', summary: '영역별 검색 가능 문서와 RAG 설정' },
  { id: 'knowledge.pipeline', label: 'RAG 파이프라인', section: '지식 · RAG', parentId: 'knowledge', status: 'ready', phase: 'P5', summary: '문서가 어느 단계에서 떨어졌나' },

  { id: 'users', label: '사용자 관리', section: '운영 · 관리', parentId: null, status: 'ready', phase: 'P2', summary: '계정·승인·권한 부여' },
  { id: 'users.list', label: '사용자 목록', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: '계정 검색과 상태 확인' },
  { id: 'users.approval', label: '승인 관리', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: '가입·권한·한도 신청 처리' },
  { id: 'users.quota', label: '할당량', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: '사용자별 한도와 사용량' },
  { id: 'users.log', label: '접근 로그', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: '누가 언제 무엇에 접근했는지' },
  { id: 'users.block', label: '접근권한·차단', section: '운영 · 관리', parentId: 'users', status: 'ready', phase: 'P2', summary: 'IP·계정 차단 규칙' },
  { id: 'hr', label: 'HR 연계·그룹 관리', section: '운영 · 관리', parentId: null, status: 'ready', phase: 'P2', summary: '인사 시스템 연동과 조직 그룹' },
  { id: 'llmops', label: 'LLM 운영', section: '운영 · 관리', parentId: null, status: 'ready', phase: 'P2', summary: '모델 설정·신뢰성·답변 품질' },
  { id: 'llmops.models', label: 'LLM 설정', section: '운영 · 관리', parentId: 'llmops', status: 'ready', phase: 'P2', summary: '등록 모델과 각 모델이 맡은 업무' },
  { id: 'llmops.reliability', label: '신뢰성 관리', section: '운영 · 관리', parentId: 'llmops', status: 'ready', phase: 'P2', summary: 'Re-rank·가드레일·신뢰도 임계값' },
  { id: 'llmops.quality', label: 'AI 품질 관리', section: '운영 · 관리', parentId: 'llmops', status: 'ready', phase: 'P2', summary: '전문가 검토 결과와 사용자 피드백' },
  { id: 'analytics', label: '서비스 분석', section: '운영 · 관리', parentId: null, status: 'ready', phase: 'P2', summary: '이용 이력·만족도·통계·리포트' },
  { id: 'analytics.history', label: '이용 이력', section: '운영 · 관리', parentId: 'analytics', status: 'ready', phase: 'P2', summary: '언제 누가 어떤 업무로 썼는지' },
  { id: 'analytics.satisfaction', label: '이용만족도', section: '운영 · 관리', parentId: 'analytics', status: 'ready', phase: 'P2', summary: '만족도 조사 결과와 표본' },
  { id: 'analytics.stats', label: '이용 통계', section: '운영 · 관리', parentId: 'analytics', status: 'ready', phase: 'P2', summary: '기간별 질의량과 응답 시간' },
  { id: 'analytics.report', label: '서비스 통계 리포트', section: '운영 · 관리', parentId: 'analytics', status: 'ready', phase: 'P2', summary: '기간·항목을 골라 리포트 생성' },
  { id: 'logs', label: '로그·모니터링', section: '운영 · 관리', parentId: null, status: 'ready', phase: 'P2', summary: '통합 로그와 사용량' },
  { id: 'logs.integrated', label: '통합 로그 관리', section: '운영 · 관리', parentId: 'logs', status: 'ready', phase: 'P2', summary: '추출·접속·작업·질의 기록' },
  { id: 'logs.usage', label: '사용량 모니터링', section: '운영 · 관리', parentId: 'logs', status: 'ready', phase: 'P2', summary: '업무별 토큰 소비와 한도' },
  { id: 'content', label: '콘텐츠 관리', section: '운영 · 관리', parentId: null, status: 'ready', phase: 'P2', summary: '공지·Q&A·설문 — 포털에 그대로 나온다' },
  { id: 'prompts', label: 'API·프롬프트', section: '운영 · 관리', parentId: null, status: 'ready', phase: 'P2', summary: '외부에 열어 준 API와 에이전트 프롬프트' },
  { id: 'sysops', label: '시스템 설정', section: '운영 · 관리', parentId: null, status: 'ready', phase: 'P2', summary: '관리 홈과 외부 연동 상태' },
  { id: 'sysops.home', label: '관리 홈', section: '운영 · 관리', parentId: 'sysops', status: 'ready', phase: 'P2', summary: '자주 여는 화면으로 가는 진입점' },
  { id: 'sysops.integration', label: '연계 SW 모니터링', section: '운영 · 관리', parentId: 'sysops', status: 'ready', phase: 'P2', summary: '외부 시스템 연동 상태' },
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
