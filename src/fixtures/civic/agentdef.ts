/**
 * 행정(한성시청) 에이전트 정의.
 *
 * 같은 13종이라도 **밟는 단계와 담당이 발주처마다 다르다.**
 * 여기 단계 이름은 민원·옥외광고·재난 상황보고 업무의 말이다.
 *
 * ⚠️ `toolIds`는 **이 팩의 도구**(`civic/tools.ts`)를 가리킨다. 데이터 분석 2단계가
 * 끊긴 강우 관측 연계를 쓴다 — 그 에이전트만 조용히 옛 값으로 답한다.
 */
import type { AgentDefinition, ScenarioDefinition } from '@entities/agentdef/model'

export const CIVIC_AGENT_DEFS: AgentDefinition[] = [
  {
    agentId: 'summary', code: 'AGT-001', version: 'v1.9', owner: '이서연 · 민원여권과',
    purpose: '처리지침·조례를 방식별로 요약하고 압축률을 함께 보여 줍니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '문서 본문 추출', toolIds: ['t-ocr'], humanCheck: false },
      { order: 2, name: '방식별 요약 생성', toolIds: [], humanCheck: false },
      { order: 3, name: '원문 대조 안내 표시', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'review', code: 'AGT-003', version: 'v1.6', owner: '이서연 · 민원여권과',
    purpose: '공문을 처리지침과 대조해 위반 소지를 검토합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '지침 조항 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '위반 소지 판정', toolIds: [], humanCheck: false },
      { order: 3, name: '심각도 높음 확인 후 상신', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'chatbot', code: 'AGT-004', version: 'v2.6', owner: '오현석 · 안전총괄과',
    purpose: '처리지침·조례를 근거로 답하고, 근거를 못 찾으면 답을 만들지 않습니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '지식영역 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '근거 판정 · 신뢰도 산출', toolIds: [], humanCheck: false },
      { order: 3, name: '출처와 함께 답변', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'report', code: 'AGT-005', version: 'v2.1', owner: '오현석 · 안전총괄과',
    purpose: '상황·처리 실적을 표준 보고서로 작성하고 사람이 채울 칸을 비워 둡니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '접수·조치 현황 집계', toolIds: ['t-hsc-civil'], humanCheck: false },
      { order: 2, name: '양식에 채우기', toolIds: [], humanCheck: false },
      { order: 3, name: '사람이 채울 칸 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'meeting', code: 'AGT-006', version: 'v1.4', owner: '배수진 · 도시재생과',
    purpose: '녹음을 발언자 구분 회의록으로 정리하고 미정 항목을 표시합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '음성 인식 · 발언자 구분', toolIds: ['t-stt'], humanCheck: false },
      { order: 2, name: '안건별 정리', toolIds: [], humanCheck: false },
      { order: 3, name: '담당·기한 미정 항목 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'knowledge', code: 'AGT-007', version: 'v1.8', owner: '이서연 · 민원여권과',
    purpose: '축적 처리 사례를 검색하고 필터에 걸려 빠진 건수를 함께 알립니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '유사 사례 검색 · 재정렬', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '권한 필터 적용', toolIds: [], humanCheck: false },
      { order: 3, name: '제외 건수 표시', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'internalreg', code: 'AGT-008', version: 'v1.3', owner: '배수진 · 도시재생과',
    purpose: '조례와 처리지침을 조항 근거와 개정일까지 함께 조회합니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '조항 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '개정 이력 확인', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'ocr', code: 'AGT-009', version: 'v1.7', owner: '이서연 · 민원여권과',
    purpose: '스캔 신청서를 텍스트로 바꾸고 개인정보를 가립니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '이미지 텍스트 추출', toolIds: ['t-ocr'], humanCheck: false },
      { order: 2, name: '개인정보 마스킹', toolIds: [], humanCheck: false },
      { order: 3, name: '신뢰도 낮은 줄 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'dbquery', code: 'AGT-010', version: 'v1.1', owner: '장민호 · 환경과',
    purpose: '자연어를 SQL로 바꿔 조회하고 AI가 가정한 조건을 밝힙니다.',
    capabilities: ['rag', 'a2a'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '질의 해석 · SQL 생성', toolIds: [], humanCheck: false },
      { order: 2, name: '처리 대장 조회', toolIds: ['t-hsc-civil'], humanCheck: false },
      { order: 3, name: '가정한 조건 표시', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'dataanalysis', code: 'AGT-012', version: 'v1.3', owner: '장민호 · 환경과',
    purpose: '접수·처리 자료를 차트·통계로 분석하고 적용률을 밝힙니다.',
    capabilities: ['rag', 'a2a'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '접수 자료 적재', toolIds: ['t-hsc-civil'], humanCheck: false },
      /* 끊긴 도구를 쓴다 — 이 에이전트만 조용히 옛 값으로 답한다 */
      { order: 2, name: '부서·지역별 집계', toolIds: ['t-hsc-rain'], humanCheck: false },
      { order: 3, name: '분석·차트 생성', toolIds: [], humanCheck: false },
    ],
  },
  {
    /* 실행형인데 확인 지점이 없다 — 만든 계획이 그대로 현장에 나간다 */
    agentId: 'safety', code: 'AGT-013', version: 'v0.7', owner: '오현석 · 안전총괄과',
    purpose: '현장 확인 업무의 위험요인을 평가해 관리계획을 만들고 잔여 위험을 남깁니다.',
    capabilities: ['rag', 'a2a', 'actionable'], responseMode: 'direct',
    steps: [
      { order: 1, name: '확인 구역 정보 확인', toolIds: ['t-hsc-civil'], humanCheck: false },
      { order: 2, name: '위험요인 평가', toolIds: ['t-rag'], humanCheck: false },
      { order: 3, name: '관리계획 생성', toolIds: [], humanCheck: false },
    ],
  },
]

/** 1번은 도입하지 않은 에이전트를 부른다 — 포털에 릴레이 카드가 없는 이유다 */
export const CIVIC_SCENARIO_DEFS: ScenarioDefinition[] = [
  {
    id: 'sc-civ-1',
    title: '옥외광고물 신고 접수 처리',
    trigger: '광고물 표시 신고가 접수되면',
    steps: [
      { order: 1, agentId: 'ocr', what: '스캔 신고서에서 위치와 규격을 읽는다' },
      { order: 2, agentId: 'address', what: '소재지를 행정동 체계에 맞춘다' },
      { order: 3, agentId: 'dbquery', what: '같은 위치의 점검 이력을 조회한다' },
      { order: 4, agentId: 'report', what: '검토 근거를 붙여 처리 공문을 만든다' },
    ],
    output: '처리 공문 HSC-민원여권과-2026-072',
    owner: '이서연 · 민원여권과',
    enabled: true,
  },
  {
    id: 'sc-civ-2',
    title: '조례 개정 영향 검토',
    trigger: '조례가 개정되면',
    steps: [
      { order: 1, agentId: 'internalreg', what: '바뀐 조항을 찾는다' },
      { order: 2, agentId: 'knowledge', what: '그 조항을 인용한 문서를 찾는다' },
      { order: 3, agentId: 'review', what: '영향받는 공문을 가려낸다' },
    ],
    output: '영향 문서 목록',
    owner: '배수진 · 도시재생과',
    enabled: false,
  },
]
