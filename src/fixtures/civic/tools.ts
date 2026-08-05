/**
 * 행정(한성시청) 도구 · MCP 서버.
 *
 * ⚠️ 사용처(`usedBy`)는 여기 없다 — 에이전트 정의에서 유도한다.
 *
 * **끊긴 도구를 하나 뒀다.** 강우 관측 연계가 끊겨 데이터 분석이 옛 값으로 답한다.
 * 호우 대비 점검이 이 팩의 세계관이라, 하필 그 판단에 쓰는 자료가 멈춰 있는 것이다.
 * 도구는 끊겨도 서비스가 죽지 않아서 더 늦게 발견된다.
 */
import type { McpServer } from '@entities/evidence/model'
import type { ToolSpec } from '@entities/packops/model'

export const CIVIC_TOOLS: ToolSpec[] = [
  { id: 't-rag', name: '지식 검색', kind: 'search', connected: true, downReason: null, calls7d: 1_205 },
  { id: 't-ocr', name: '문서 텍스트 추출', kind: 'file', connected: true, downReason: null, calls7d: 528 },
  { id: 't-stt', name: '음성 인식', kind: 'file', connected: true, downReason: null, calls7d: 47 },
  { id: 't-hsc-civil', name: '민원 처리 대장 조회', kind: 'db', connected: true, downReason: null, calls7d: 892 },
  {
    id: 't-hsc-rain',
    name: '강우 관측 연계',
    kind: 'external',
    connected: false,
    downReason:
      '관측소 연계가 응답하지 않습니다 — 8월 1일 22시 이후 값이 안 들어옵니다. 데이터 분석은 그 이전 값으로 답합니다.',
    calls7d: 9,
  },
]

export const CIVIC_MCP_SERVERS: McpServer[] = [
  {
    id: 'm-hsc-internal',
    name: '시청 도구 서버',
    toolIds: ['t-rag', 't-ocr', 't-stt'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 09:10',
    external: false,
  },
  {
    id: 'm-hsc-civil',
    name: '민원 대장 연동 서버',
    toolIds: ['t-hsc-civil'],
    connected: true,
    downReason: null,
    lastSeenAt: '2026-08-02 09:02',
    external: false,
  },
  /* 끊긴 서버 — 도구 쪽 강우 관측과 같은 원인이다 */
  {
    id: 'm-hsc-rain',
    name: '관측소 연계 서버 (기관 간)',
    toolIds: ['t-hsc-rain'],
    connected: false,
    downReason: '관측소 게이트웨이가 응답하지 않습니다. 도구 목록의 강우 관측 연계와 같은 원인입니다.',
    lastSeenAt: '2026-08-01 22:05',
    external: true,
  },
]
