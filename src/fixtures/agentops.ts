/**
 * 에이전트 운영 · 애플리케이션 fixture.
 *
 * 다른 화면과 이어진다 — 모델은 LLM 설정의 모델, 지식영역은 지식 관리의 영역이다.
 * 안전관리계획 에이전트가 기대는 안전 문서 영역에 못 찾는 문서 6건이 있고,
 * 그래서 이 에이전트의 실패율이 가장 높다. 원인은 에이전트가 아니라 그 아래 데이터다.
 *
 * **한 번도 안 쓴 에이전트를 넣었다.** 0건을 '문제 없음'으로 읽으면 안 된다 —
 * 아무도 안 쓰는 화면을 계속 운영하고 있다는 뜻이다.
 */
import type { AgentOps, AppSurface } from '@entities/agentops/model'

const GPT = { modelId: 'm-gpt-oss', modelName: 'GPT-OSS-120B' }
const LLAMA = { modelId: 'm-llama-kor', modelName: 'Llama-3-Kor-Instruct' }
const EXA = { modelId: 'm-exaone', modelName: 'EXAONE-3.0-7.8B' }

export const AGENT_OPS: AgentOps[] = [
  { agentId: 'summary', ...GPT, areaIds: ['k-sop', 'k-quality'], runs7d: 182, failed7d: 3, owner: '박태윤 책임', exposed: true },
  { agentId: 'translate', ...EXA, areaIds: [], runs7d: 96, failed7d: 1, owner: '서민아 과장', exposed: true },
  { agentId: 'review', ...GPT, areaIds: ['k-reg', 'k-sop'], runs7d: 143, failed7d: 5, owner: '박태윤 책임', exposed: true },
  { agentId: 'chatbot', ...GPT, areaIds: ['k-sop', 'k-reg', 'k-quality', 'k-safety'], runs7d: 742, failed7d: 21, owner: '박태윤 책임', exposed: true },
  { agentId: 'report', ...GPT, areaIds: ['k-equip'], runs7d: 121, failed7d: 2, owner: '정하늘 책임', exposed: true },
  { agentId: 'meeting', ...GPT, areaIds: [], runs7d: 64, failed7d: 4, owner: '서민아 과장', exposed: true },
  { agentId: 'knowledge', ...GPT, areaIds: ['k-sop', 'k-quality', 'k-equip'], runs7d: 205, failed7d: 6, owner: '오세진 팀장', exposed: true },
  { agentId: 'internalreg', ...LLAMA, areaIds: ['k-reg'], runs7d: 88, failed7d: 1, owner: '서민아 과장', exposed: true },
  { agentId: 'ocr', ...GPT, areaIds: [], runs7d: 77, failed7d: 6, owner: '정하늘 책임', exposed: true },
  { agentId: 'dbquery', ...GPT, areaIds: ['k-equip'], runs7d: 54, failed7d: 2, owner: '오세진 팀장', exposed: true },
  { agentId: 'address', ...LLAMA, areaIds: ['k-equip'], runs7d: 31, failed7d: 1, owner: '오세진 팀장', exposed: true },
  { agentId: 'dataanalysis', ...GPT, areaIds: ['k-equip', 'k-quality'], runs7d: 48, failed7d: 2, owner: '정하늘 책임', exposed: true },
  /* 안전 문서 영역에 못 찾는 문서 6건 — 실패율이 가장 높은 이유 */
  { agentId: 'safety', ...GPT, areaIds: ['k-safety'], runs7d: 22, failed7d: 5, owner: '오세진 팀장', exposed: true },
]

/**
 * 애플리케이션.
 *
 * '준비 중'인 것을 목록에서 빼지 않는다. 왜 못 여는지 적으면 무엇이 갖춰지면
 * 되는지가 그 자리에 남는다.
 */
export const APP_SURFACES: AppSurface[] = [
  {
    id: 'app-portal',
    name: '사용자 포털',
    audience: '전 직원',
    live: true,
    blockedReason: null,
    includes: ['업무 챗봇', '에이전트 13종', '복합 업무 릴레이', '보안 처리 현황', '공지·가이드'],
  },
  {
    id: 'app-admin',
    name: '관리자 시스템',
    audience: '운영 담당자',
    live: true,
    blockedReason: null,
    includes: ['대시보드 4종', '운영·관리 19종', 'AI 서비스·지식 관리'],
  },
  {
    id: 'app-mobile',
    name: '모바일 앱',
    audience: '현장 작업자',
    live: false,
    blockedReason:
      '웹 화면은 좁은 폭까지 대응돼 있지만, 앱으로 감싸려면 푸시·오프라인·설치 정책이 정해져야 합니다.',
    includes: ['업무 챗봇', '설비 조회'],
  },
  {
    id: 'app-api',
    name: '외부 연동 API',
    audience: '사내 시스템',
    live: false,
    blockedReason:
      '인증 방식이 정해지지 않아 열 수 없습니다(API 제안서 §3). 지금은 API 목록만 관리합니다.',
    includes: ['챗봇 API', 'RAG 검색 API'],
  },
]

/*
 * 발주처별 노출은 여기 없다. 손으로 적어 뒀더니 포털이 네 발주처를 여는데
 * 관리자만 "데이터 없음 3곳"이라고 말했다 — 같은 사실을 두 곳에 적으면 갈라진다.
 * 이제 `shared/api/agentops.ts`가 팩 레지스트리에서 유도한다.
 */
