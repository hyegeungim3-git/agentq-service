/**
 * 공공(한국부동산원) 도구 · MCP 서버.
 *
 * 도구도 발주처 데이터다 — 공장은 MES를 부르고 여기는 신고·대장 자료를 부른다.
 * 하나만 두었더니 관리자 도구 화면이 어느 발주처를 보든 제조 시스템을 보여 줬다.
 *
 * ⚠️ **사용처(`usedBy`)는 여기 없다.** 에이전트 정의에서 유도한다. 손으로 적었더니
 * 실제와 어긋나서 화면이 '끊기면 멈추는 에이전트'를 실제보다 적게 말했다.
 *
 * 이 발주처는 **끊긴 도구가 없다.** 그것도 사실이라 화면이 말하게 뒀다 —
 * 끊긴 게 없는 것과 안 본 것은 다르다.
 */
import type { McpServer } from '@entities/evidence/model'
import type { ToolSpec } from '@entities/packops/model'

export const PUBLIC_TOOLS: ToolSpec[] = [
  { id: 't-rag', name: '지식 검색', kind: 'search', connected: true, downReason: null, calls7d: 1_640 },
  { id: 't-ocr', name: '문서 텍스트 추출', kind: 'file', connected: true, downReason: null, calls7d: 412 },
  { id: 't-stt', name: '음성 인식', kind: 'file', connected: true, downReason: null, calls7d: 58 },
  { id: 't-reb-rtms', name: '실거래 신고 조회', kind: 'db', connected: true, downReason: null, calls7d: 486 },
  { id: 't-reb-parcel', name: '표준지 조사 대장 조회', kind: 'db', connected: true, downReason: null, calls7d: 733 },
]

export const PUBLIC_MCP_SERVERS: McpServer[] = [
  {
    id: 'm-reb-internal',
    name: '원내 도구 서버',
    toolIds: ['t-rag', 't-ocr', 't-stt'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 09:05',
    external: false,
  },
  {
    id: 'm-reb-survey',
    name: '조사 자료 연동 서버',
    toolIds: ['t-reb-parcel'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 08:48',
    external: false,
  },
  /* 밖으로 나간다 — 따로 봐야 한다 */
  {
    id: 'm-reb-rtms',
    name: '실거래 신고 연계 서버 (기관 간)',
    toolIds: ['t-reb-rtms'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 07:55',
    external: true,
  },
]
