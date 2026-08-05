/**
 * 의료(새빛대학교병원) 에이전트 정의.
 *
 * 단계 이름은 청구·심사와 병상 운영의 말이다.
 *
 * ⚠️ **이 발주처만 실행형에 확인 지점을 걸어 두었다.** 다른 세 곳은 안전관리계획이
 * 확인 없이 그대로 나가는데, 여기는 환자안전 담당 확인을 한 단계 넣었다.
 * 관리자 화면의 '확인 없이 나가는 실행형' 수가 발주처마다 다른 이유이며,
 * 그 수가 실제 데이터에서 나온다는 증거이기도 하다.
 *
 * ⚠️ `toolIds`는 **이 팩의 도구**(`medical/tools.ts`)를 가리킨다. 원내 청구·병상
 * 시스템이며 사외로 나가는 것은 없다.
 */
import type { AgentDefinition, ScenarioDefinition } from '@entities/agentdef/model'

export const MEDICAL_AGENT_DEFS: AgentDefinition[] = [
  {
    agentId: 'address', code: 'AGT-011', version: 'v1.1', owner: '서지은 · 적정진료관리실',
    purpose: '진료과 항목 명칭을 급여 기준 코드 체계로 맞추고 상한을 밝힙니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '항목 명칭 정규화', toolIds: [], humanCheck: false },
      { order: 2, name: '급여 기준 코드 대조', toolIds: ['t-suh-claim'], humanCheck: false },
      { order: 3, name: '표준화율·잔여 건수 산출', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'translate', code: 'AGT-002', version: 'v1.3', owner: '고윤성 · 원무팀',
    purpose: '외국인 환자 안내문을 용어집을 적용해 번역하고 역번역으로 검증합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '보험 용어집 적용 번역', toolIds: [], humanCheck: false },
      { order: 2, name: '역번역 일치도 계산', toolIds: [], humanCheck: false },
      { order: 3, name: '비용 안내 문장 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'summary', code: 'AGT-001', version: 'v2.2', owner: '서지은 · 적정진료관리실',
    purpose: '심사지침·평가 결과를 방식별로 요약하고 압축률을 함께 보여 줍니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '문서 본문 추출', toolIds: ['t-ocr'], humanCheck: false },
      { order: 2, name: '방식별 요약 생성', toolIds: [], humanCheck: false },
      { order: 3, name: '원문 대조 안내 표시', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'review', code: 'AGT-003', version: 'v1.8', owner: '고윤성 · 원무팀',
    purpose: '기안문을 원내 규정과 대조해 위반 소지를 검토합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '규정 조항 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '위반 소지 판정', toolIds: [], humanCheck: false },
      { order: 3, name: '심각도 높음 확인 후 상신', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'chatbot', code: 'AGT-004', version: 'v3.1', owner: '서지은 · 적정진료관리실',
    purpose: '심사지침·법령을 근거로 답하고, 근거를 못 찾으면 답을 만들지 않습니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '지식영역 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '근거 판정 · 신뢰도 산출', toolIds: [], humanCheck: false },
      { order: 3, name: '출처와 함께 답변', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'report', code: 'AGT-005', version: 'v2.0', owner: '고윤성 · 원무팀',
    purpose: '점검·운영 실적을 표준 보고서로 작성하고 사람이 채울 칸을 비워 둡니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '점검 실적 집계', toolIds: ['t-suh-claim'], humanCheck: false },
      { order: 2, name: '양식에 채우기', toolIds: [], humanCheck: false },
      { order: 3, name: '사람이 채울 칸 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'meeting', code: 'AGT-006', version: 'v1.7', owner: '문정아 · 간호부',
    purpose: '녹음을 발언자 구분 회의록으로 정리하고 미정 항목을 표시합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '음성 인식 · 발언자 구분', toolIds: ['t-stt'], humanCheck: false },
      { order: 2, name: '안건별 정리', toolIds: [], humanCheck: false },
      { order: 3, name: '담당·기한 미정 항목 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'knowledge', code: 'AGT-007', version: 'v2.1', owner: '서지은 · 적정진료관리실',
    purpose: '축적 조정 사례를 검색하고 필터에 걸려 빠진 건수를 함께 알립니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '유사 사례 검색 · 재정렬', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '권한 필터 적용', toolIds: [], humanCheck: false },
      { order: 3, name: '제외 건수 표시', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'internalreg', code: 'AGT-008', version: 'v1.6', owner: '고윤성 · 원무팀',
    purpose: '원내 지침과 법령을 조항 근거와 개정일까지 함께 조회합니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '조항 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '개정 이력 확인', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'ocr', code: 'AGT-009', version: 'v1.9', owner: '고윤성 · 원무팀',
    purpose: '스캔 서식을 텍스트로 바꾸고 개인정보를 가립니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '이미지 텍스트 추출', toolIds: ['t-ocr'], humanCheck: false },
      { order: 2, name: '개인정보 마스킹', toolIds: [], humanCheck: false },
      { order: 3, name: '신뢰도 낮은 줄 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'dbquery', code: 'AGT-010', version: 'v1.4', owner: '하태경 · 응급의료센터',
    purpose: '자연어를 SQL로 바꿔 조회하고 AI가 가정한 조건을 밝힙니다.',
    capabilities: ['rag', 'a2a'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '질의 해석 · SQL 생성', toolIds: [], humanCheck: false },
      { order: 2, name: '점검·운영 자료 조회', toolIds: ['t-suh-claim', 't-suh-bed'], humanCheck: false },
      { order: 3, name: '가정한 조건 표시', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'dataanalysis', code: 'AGT-012', version: 'v1.5', owner: '문정아 · 간호부',
    purpose: '운영 자료를 차트·통계로 분석하고 적용률을 밝힙니다.',
    capabilities: ['rag', 'a2a'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '운영 자료 적재', toolIds: ['t-suh-bed'], humanCheck: false },
      { order: 2, name: '부서별 집계', toolIds: [], humanCheck: false },
      { order: 3, name: '분석·차트 생성', toolIds: [], humanCheck: false },
    ],
  },
  {
    /* 여기만 실행형에 확인 지점이 있다 — 계획이 나가기 전에 사람이 본다 */
    agentId: 'safety', code: 'AGT-013', version: 'v1.0', owner: '문정아 · 간호부',
    purpose: '운영 위험요인을 평가해 관리계획을 만들고 잔여 위험을 남깁니다.',
    capabilities: ['rag', 'a2a', 'actionable', 'hitl'], responseMode: 'direct',
    steps: [
      { order: 1, name: '운영 현황 확인', toolIds: ['t-suh-bed'], humanCheck: false },
      { order: 2, name: '위험요인 평가', toolIds: ['t-rag'], humanCheck: false },
      { order: 3, name: '관리계획 생성', toolIds: [], humanCheck: false },
      { order: 4, name: '환자안전 담당 확인', toolIds: [], humanCheck: true },
    ],
  },
]

/** 1번은 포털의 릴레이 카드와 같은 일이다 — 관리자와 포털이 같은 이야기를 해야 한다 */
export const MEDICAL_SCENARIO_DEFS: ScenarioDefinition[] = [
  {
    id: 'sc-med-1',
    title: '청구 보류 건 회신 처리',
    trigger: '진료과 회신이 도착하면',
    steps: [
      { order: 1, agentId: 'ocr', what: '스캔 회신 서식에서 항목을 읽는다' },
      { order: 2, agentId: 'address', what: '항목 코드를 급여 기준 체계에 맞춘다' },
      { order: 3, agentId: 'dbquery', what: '같은 항목의 조정 이력을 조회한다' },
      { order: 4, agentId: 'report', what: '판단 근거를 붙여 점검 보고서를 만든다' },
    ],
    output: '점검 보고서 SUH-보험심사팀-2026-084',
    owner: '서지은 · 적정진료관리실',
    enabled: true,
  },
  {
    id: 'sc-med-2',
    title: '지침 개정 영향 검토',
    trigger: '심사지침이 개정되면',
    steps: [
      { order: 1, agentId: 'internalreg', what: '바뀐 조항을 찾는다' },
      { order: 2, agentId: 'knowledge', what: '그 조항을 인용한 문서를 찾는다' },
      { order: 3, agentId: 'review', what: '영향받는 기안문을 가려낸다' },
    ],
    output: '영향 문서 목록',
    owner: '고윤성 · 원무팀',
    enabled: false,
  },
]
