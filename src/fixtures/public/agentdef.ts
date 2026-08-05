/**
 * 공공(한국부동산원) 에이전트 정의.
 *
 * 단계 이름은 **그 발주처의 업무 용어**이고 담당도 그 발주처 부서다.
 * 코어에 하나만 두었더니 다른 발주처 허브에 제조의 단계가 그대로 떴다.
 *
 * ⚠️ `toolIds`는 **이 팩의 도구**(`public/tools.ts`)를 가리킨다. 도구도 발주처마다
 * 다르다 — 여기는 실거래 신고와 표준지 조사 대장을 부른다.
 *
 * 13종을 모두 도입했다. 도입 전인 에이전트가 생기면 그 정의도 함께 빼야 한다 —
 * 짝이 안 맞으면 못 쓰는 카드에 단계가 그려진다(팩 검사가 잡는다).
 */
import type { AgentDefinition, ScenarioDefinition } from '@entities/agentdef/model'

export const PUBLIC_AGENT_DEFS: AgentDefinition[] = [
  {
    agentId: 'address', code: 'AGT-011', version: 'v1.0', owner: '윤서경 · 토지공시부',
    purpose: '이의신청서의 소재지 표기를 지번·법정동코드 체계로 맞추고 상한을 밝힙니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '소재지 표기 정규화', toolIds: [], humanCheck: false },
      { order: 2, name: '조사 대장 대조', toolIds: ['t-reb-parcel'], humanCheck: false },
      { order: 3, name: '표준화율·잔여 건수 산출', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'translate', code: 'AGT-002', version: 'v1.2', owner: '서지호 · 정보화지원부',
    purpose: '외국인 안내문을 용어집을 적용해 번역하고 역번역으로 검증합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '제도 용어집 적용 번역', toolIds: [], humanCheck: false },
      { order: 2, name: '역번역 일치도 계산', toolIds: [], humanCheck: false },
      { order: 3, name: '일치도 낮은 문장 검토', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'summary', code: 'AGT-001', version: 'v2.0', owner: '윤서경 · 토지공시부',
    purpose: '조사지침·과업지시서를 방식별로 요약하고 압축률을 함께 보여 줍니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '문서 본문 추출', toolIds: ['t-ocr'], humanCheck: false },
      { order: 2, name: '방식별 요약 생성', toolIds: [], humanCheck: false },
      { order: 3, name: '원문 대조 안내 표시', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'review', code: 'AGT-003', version: 'v1.7', owner: '김민준 · 부동산공시처',
    purpose: '기안문을 업무규정과 대조해 위반 소지를 검토합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '규정 조항 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '위반 소지 판정', toolIds: [], humanCheck: false },
      { order: 3, name: '심각도 높음 확인 후 상신', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'chatbot', code: 'AGT-004', version: 'v2.8', owner: '서지호 · 정보화지원부',
    purpose: '조사지침·법령을 근거로 답하고, 근거를 못 찾으면 답을 만들지 않습니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '지식영역 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '근거 판정 · 신뢰도 산출', toolIds: [], humanCheck: false },
      { order: 3, name: '출처와 함께 답변', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'report', code: 'AGT-005', version: 'v1.9', owner: '정하윤 · 주택공시부',
    purpose: '조사 실적을 표준 보고서로 작성하고 사람이 채울 칸을 비워 둡니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '조사 실적 집계', toolIds: ['t-reb-parcel'], humanCheck: false },
      { order: 2, name: '양식에 채우기', toolIds: [], humanCheck: false },
      { order: 3, name: '사람이 채울 칸 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'meeting', code: 'AGT-006', version: 'v1.5', owner: '서지호 · 정보화지원부',
    purpose: '녹음을 발언자 구분 회의록으로 정리하고 미정 항목을 표시합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '음성 인식 · 발언자 구분', toolIds: ['t-stt'], humanCheck: false },
      { order: 2, name: '안건별 정리', toolIds: [], humanCheck: false },
      { order: 3, name: '담당·기한 미정 항목 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'knowledge', code: 'AGT-007', version: 'v2.0', owner: '윤서경 · 토지공시부',
    purpose: '축적 조사 사례를 검색하고 필터에 걸려 빠진 건수를 함께 알립니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '유사 사례 검색 · 재정렬', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '권한 필터 적용', toolIds: [], humanCheck: false },
      { order: 3, name: '제외 건수 표시', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'internalreg', code: 'AGT-008', version: 'v1.4', owner: '김민준 · 부동산공시처',
    purpose: '업무규정과 법령을 조항 근거와 개정일까지 함께 조회합니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '조항 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '개정 이력 확인', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'ocr', code: 'AGT-009', version: 'v1.6', owner: '정하윤 · 주택공시부',
    purpose: '스캔 조사표를 텍스트로 바꾸고 개인정보를 가립니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '이미지 텍스트 추출', toolIds: ['t-ocr'], humanCheck: false },
      { order: 2, name: '개인정보 마스킹', toolIds: [], humanCheck: false },
      { order: 3, name: '신뢰도 낮은 줄 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'dbquery', code: 'AGT-010', version: 'v1.2', owner: '서지호 · 정보화지원부',
    purpose: '자연어를 SQL로 바꿔 조회하고 AI가 가정한 조건을 밝힙니다.',
    capabilities: ['rag', 'a2a'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '질의 해석 · SQL 생성', toolIds: [], humanCheck: false },
      { order: 2, name: '신고·대장 자료 조회', toolIds: ['t-reb-rtms', 't-reb-parcel'], humanCheck: false },
      { order: 3, name: '가정한 조건 표시', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'dataanalysis', code: 'AGT-012', version: 'v1.4', owner: '윤서경 · 토지공시부',
    purpose: '조사 자료를 차트·통계로 분석하고 적용률을 밝힙니다.',
    capabilities: ['rag', 'a2a'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '조사 자료 적재', toolIds: ['t-reb-parcel'], humanCheck: false },
      { order: 2, name: '지역·용도별 집계', toolIds: [], humanCheck: false },
      { order: 3, name: '분석·차트 생성', toolIds: [], humanCheck: false },
    ],
  },
  {
    /* 실행형인데 확인 지점이 없다 — 만든 계획이 그대로 조사반에 나간다 */
    agentId: 'safety', code: 'AGT-013', version: 'v0.8', owner: '정하윤 · 주택공시부',
    purpose: '현장조사 위험요인을 평가해 관리계획을 만들고 잔여 위험을 남깁니다.',
    capabilities: ['rag', 'a2a', 'actionable'], responseMode: 'direct',
    steps: [
      { order: 1, name: '조사 구역 정보 확인', toolIds: ['t-reb-parcel'], humanCheck: false },
      { order: 2, name: '위험요인 평가', toolIds: ['t-rag'], humanCheck: false },
      { order: 3, name: '관리계획 생성', toolIds: [], humanCheck: false },
    ],
  },
]

/**
 * 1번은 포털의 릴레이 카드와 같은 일이다 — 관리자와 포털이 같은 이야기를 해야 한다.
 * 2번은 꺼 두었다. 만든 적 없는 것으로 읽히지 않게 목록에는 남긴다.
 */
export const PUBLIC_SCENARIO_DEFS: ScenarioDefinition[] = [
  {
    id: 'sc-pub-1',
    title: '이의신청 접수 처리',
    trigger: '이의신청서가 접수되면',
    steps: [
      { order: 1, agentId: 'ocr', what: '스캔 신청서에서 필지와 사유를 읽는다' },
      { order: 2, agentId: 'address', what: '소재지를 지번 체계에 맞춘다' },
      { order: 3, agentId: 'dbquery', what: '해당 필지의 조사 이력을 조회한다' },
      { order: 4, agentId: 'report', what: '검토 근거를 붙여 처리 보고서를 만든다' },
    ],
    output: '처리 보고서 KREA-토지공시부-2026-041',
    owner: '윤서경 · 토지공시부',
    enabled: true,
  },
  {
    id: 'sc-pub-2',
    title: '조사지침 개정 영향 검토',
    trigger: '조사지침이 개정되면',
    steps: [
      { order: 1, agentId: 'internalreg', what: '바뀐 조항을 찾는다' },
      { order: 2, agentId: 'knowledge', what: '그 조항을 인용한 문서를 찾는다' },
      { order: 3, agentId: 'review', what: '영향받는 기안문을 가려낸다' },
    ],
    output: '영향 문서 목록',
    owner: '김민준 · 부동산공시처',
    enabled: false,
  },
]
