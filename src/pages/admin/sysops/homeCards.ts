/**
 * 관리 홈에 놓는 바로가기.
 *
 * 컴포넌트 파일에서 상수를 함께 내보내면 개발 중 빠른 갱신이 깨진다(`tabs.ts`와 같은 이유).
 *
 * 여기 있는 것은 **화면을 새로 만들지 않는다.** 이미 있는 화면으로 가는 입구일 뿐이다.
 * 아직 안 만든 화면도 목록에 두되 '준비 중'으로 표시한다 — 감추면 없는 기능으로,
 * 그냥 두면 눌러도 아무 일 없는 카드로 읽힌다.
 */
export type HomeCard = { menuId: string; desc: string }

export const ADMIN_HOME_CARDS: HomeCard[] = [
  { menuId: 'users.list', desc: '계정·권한·상태' },
  { menuId: 'users.approval', desc: '가입·권한·한도 신청' },
  { menuId: 'analytics.stats', desc: '질의량·활성 사용자' },
  { menuId: 'users.log', desc: '누가 언제 무엇에 접근했는지' },
  { menuId: 'llmops.quality', desc: '전문가 검토와 사용자 피드백' },
  { menuId: 'content', desc: '공지·Q&A — 포털에 그대로 나갑니다' },
  { menuId: 'system', desc: '클러스터·노드·파드' },
  { menuId: 'sysops.integration', desc: '외부 시스템 연동 상태' },
  { menuId: 'knowledge.areas', desc: '지식영역·색인 상태·RAG 설정' },
  { menuId: 'agents.ops', desc: '에이전트 운영 상태' },
  { menuId: 'registry', desc: '모델 버전·배포 이력' },
  { menuId: 'data.vector', desc: '벡터 컬렉션과 임베딩 차원' },
]
