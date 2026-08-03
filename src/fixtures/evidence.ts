/**
 * 이행 증거 · MCP 서버 · 공유 볼륨 fixture.
 *
 * 증거 목록은 **지금 이 저장소의 실제 상태**를 적은 것이다. 지어낸 것이 아니라
 * 우리가 만든 화면과 저장 방식을 그대로 옮겼다 — 접근 로그는 서버 예정,
 * 피드백은 브라우저에만, XAI 열람 기록은 아예 없다.
 *
 * 그래서 이 화면은 서버가 붙으면 **숫자가 실제로 올라간다.** 지금 '증명 가능
 * 1/5'인 것은 나쁜 상태가 아니라 사실이다.
 *
 * ⚠️ MCP 서버 주소는 넣지 않는다. 인프라 주소를 지어내지 않는다는 결정
 * (재구축 기록 §4)과 같은 이유다 — 주소는 서버가 준다.
 */
import type { EvidenceItem, McpServer, Volume } from '@entities/evidence/model'

export const EVIDENCE: EvidenceItem[] = [
  {
    duty: 'risk',
    what: '위험 판정 기준과 그 근거를 남긴 기록',
    store: 'none',
    where: null,
    note: '고영향 판정 근거는 화면에 적혀 있지만 누가 언제 그렇게 판단했는지는 남지 않습니다. 판정 이력이 필요합니다.',
  },
  {
    duty: 'explain',
    what: '사용자가 판단 근거(XAI)를 실제로 열어 봤는지',
    store: 'none',
    where: null,
    note: '답변마다 판단 근거를 보여 주지만 열람 여부는 기록하지 않습니다. 설명했다는 것과 설명이 닿았다는 것은 다릅니다.',
  },
  {
    duty: 'protect',
    what: '사용자가 남긴 피드백(도움됨·아쉬움)',
    store: 'browser',
    where: 'LLM 운영 > AI 품질 관리',
    note: '지금은 그 사람 브라우저에만 남습니다. 브라우저를 지우면 사라지고, 다른 사람 것은 볼 수 없습니다.',
  },
  {
    duty: 'oversight',
    what: '사람이 확인한 지점을 지났는지',
    store: 'none',
    where: 'AI 서비스 > 태스크플로우 빌더',
    note: '어느 단계에 확인 지점이 있는지는 정의에 있지만, 실제로 사람이 확인하고 넘어갔다는 기록은 남지 않습니다.',
  },
  {
    duty: 'record',
    what: '누가 언제 무엇에 접근했는지',
    store: 'server',
    where: '운영·관리 > 접근 로그 · 통합 로그',
    note: '접근·작업·반출 기록은 남습니다. 다만 질의 본문은 보관 정책이 정해지기 전이라 남기지 않습니다.',
  },
]

export const MCP_SERVERS: McpServer[] = [
  {
    id: 'm-internal',
    name: '사내 도구 서버',
    toolIds: ['t-rag', 't-ocr', 't-stt'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 09:12',
    external: false,
  },
  {
    id: 'm-mes',
    name: 'MES 연동 서버',
    toolIds: ['t-mes'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 08:55',
    external: false,
  },
  /* 끊긴 서버 — 도구·배포의 PdM 도구와 같은 원인이다 */
  {
    id: 'm-pdm',
    name: 'PdM 수집기 서버',
    toolIds: ['t-pdm'],
    connected: false,
    downReason: '게이트웨이가 응답하지 않습니다. 연계 SW 모니터링의 PdM 진동 수집기와 같은 원인입니다.',
    lastSeenAt: '2026-08-01 22:40',
    external: false,
  },
  /* 밖으로 나간다 — 따로 봐야 한다 */
  {
    id: 'm-erp',
    name: 'ERP 연동 서버 (외부 위탁)',
    toolIds: ['t-erp'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 07:30',
    external: true,
  },
]

export const VOLUMES: Volume[] = [
  { id: 'v-train', name: 'train-datasets', usedGb: 1_840, capacityGb: 2_000, users: ['박태윤', '정하늘'], lastWriteAt: '2026-08-02 07:40', idleDays: 0 },
  { id: 'v-model', name: 'model-artifacts', usedGb: 920, capacityGb: 2_000, users: ['박태윤'], lastWriteAt: '2026-08-01 18:10', idleDays: 1 },
  { id: 'v-shared', name: 'shared-scratch', usedGb: 310, capacityGb: 1_000, users: ['박태윤', '정하늘', '오세진', '한지민'], lastWriteAt: '2026-07-25 11:20', idleDays: 8 },
  /* 두 달 넘게 아무도 안 썼다 — 지운 사람이 없다 */
  { id: 'v-old', name: 'exp-2025-embedding', usedGb: 640, capacityGb: 1_000, users: ['한지민'], lastWriteAt: '2026-05-30 09:05', idleDays: 64 },
]
