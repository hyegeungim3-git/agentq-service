/**
 * 의료(새빛대학교병원) 도구 · MCP 서버.
 *
 * ⚠️ 사용처(`usedBy`)는 여기 없다 — 에이전트 정의에서 유도한다.
 *
 * 끊긴 도구는 없다. 대신 **사외로 나가는 서버가 없다** — 진료 정보를 다루므로
 * 원내에서만 돈다. 이것도 발주처마다 다른 사실이라 화면이 그대로 보여 준다.
 */
import type { McpServer } from '@entities/evidence/model'
import type { ToolSpec } from '@entities/packops/model'

export const MEDICAL_TOOLS: ToolSpec[] = [
  { id: 't-rag', name: '지식 검색', kind: 'search', connected: true, downReason: null, calls7d: 2_014 },
  { id: 't-ocr', name: '문서 텍스트 추출', kind: 'file', connected: true, downReason: null, calls7d: 664 },
  { id: 't-stt', name: '음성 인식', kind: 'file', connected: true, downReason: null, calls7d: 71 },
  { id: 't-suh-claim', name: '청구 자료 조회', kind: 'db', connected: true, downReason: null, calls7d: 1_128 },
  { id: 't-suh-bed', name: '병상 운영 현황 조회', kind: 'db', connected: true, downReason: null, calls7d: 540 },
]

export const MEDICAL_MCP_SERVERS: McpServer[] = [
  {
    id: 'm-suh-internal',
    name: '원내 도구 서버',
    toolIds: ['t-rag', 't-ocr', 't-stt'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 09:14',
    external: false,
  },
  {
    id: 'm-suh-claim',
    name: '청구·심사 연동 서버',
    toolIds: ['t-suh-claim'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 09:08',
    external: false,
  },
  {
    id: 'm-suh-bed',
    name: '병상 운영 연동 서버',
    toolIds: ['t-suh-bed'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 09:11',
    external: false,
  },
]
