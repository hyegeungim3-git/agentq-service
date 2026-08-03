/**
 * 에이전트 정의 · 시나리오 정의 fixture.
 *
 * 단계는 사용자 포털의 에이전트가 실제로 밟는 순서를 옮긴 것이다.
 * 도구 id는 도구·배포 화면의 것과 같다(`fixtures/packops`) — 끊긴 도구(t-pdm)를
 * 쓰는 에이전트가 여기서도 같은 에이전트여야 두 화면이 한 이야기가 된다.
 *
 * **사람 확인이 없는 에이전트를 일부러 남겼다.** 전부 확인 지점이 있으면
 * '확인 없이 나간다'를 드러내는 화면이 죽은 코드가 된다. 실제로도 조회형
 * 에이전트에는 확인 지점을 두지 않는 편이다 — 문제는 그게 실행형일 때다.
 */
import type { AgentDefinition, ScenarioDefinition } from '@entities/agentdef/model'

export const AGENT_DEFS: AgentDefinition[] = [
  {
    agentId: 'summary', code: 'AGT-001', version: 'v2.1', owner: '박태윤 · 생산기술팀',
    purpose: '장문 문서를 방식별로 구조화해 요약하고 압축률을 함께 보여 줍니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '문서 본문 추출', toolIds: ['t-ocr'], humanCheck: false },
      { order: 2, name: '방식별 요약 생성', toolIds: [], humanCheck: false },
      { order: 3, name: '원문 대조 안내 표시', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'translate', code: 'AGT-002', version: 'v1.4', owner: '서민아 · 경영지원팀',
    purpose: '용어집을 적용해 번역하고 역번역으로 일치도를 검증합니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '용어집 적용 번역', toolIds: [], humanCheck: false },
      { order: 2, name: '역번역 일치도 계산', toolIds: [], humanCheck: false },
      { order: 3, name: '일치도 낮은 문장 검토', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'review', code: 'AGT-003', version: 'v1.9', owner: '박태윤 · 생산기술팀',
    purpose: '기안문을 사규와 대조해 위반 소지를 검토합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '규정 조항 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '위반 소지 판정', toolIds: [], humanCheck: false },
      { order: 3, name: '심각도 높음 확인 후 상신', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'chatbot', code: 'AGT-004', version: 'v3.0', owner: '박태윤 · 생산기술팀',
    purpose: '사내 문서를 근거로 답하고, 근거를 못 찾으면 답을 만들지 않습니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '지식영역 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '근거 판정 · 신뢰도 산출', toolIds: [], humanCheck: false },
      { order: 3, name: '출처와 함께 답변', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'report', code: 'AGT-005', version: 'v2.0', owner: '정하늘 · 품질보증팀',
    purpose: '실적 데이터를 표준 양식 보고서로 작성하고 사람이 채울 칸을 비워 둡니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '실적 데이터 조회', toolIds: ['t-erp'], humanCheck: false },
      { order: 2, name: '양식에 채우기', toolIds: [], humanCheck: false },
      { order: 3, name: '사람이 채울 칸 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'meeting', code: 'AGT-006', version: 'v1.6', owner: '서민아 · 경영지원팀',
    purpose: '녹음을 발언자 구분 회의록으로 정리하고 미정 항목을 표시합니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '음성 인식 · 발언자 구분', toolIds: ['t-stt'], humanCheck: false },
      { order: 2, name: '안건별 정리', toolIds: [], humanCheck: false },
      { order: 3, name: '담당·기한 미정 항목 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'knowledge', code: 'AGT-007', version: 'v2.2', owner: '오세진 · 설비보전팀',
    purpose: '축적 문서를 검색하고 필터에 걸려 빠진 건수를 함께 알립니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '검색 · 재정렬', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '권한 필터 적용', toolIds: [], humanCheck: false },
      { order: 3, name: '제외 건수 표시', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'internalreg', code: 'AGT-008', version: 'v1.5', owner: '서민아 · 경영지원팀',
    purpose: '사내 규정을 조항 근거와 개정일까지 함께 조회합니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '조항 검색', toolIds: ['t-rag'], humanCheck: false },
      { order: 2, name: '개정 이력 확인', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'ocr', code: 'AGT-009', version: 'v1.8', owner: '정하늘 · 품질보증팀',
    purpose: '스캔 문서를 텍스트로 바꾸고 개인정보를 가립니다.',
    capabilities: ['rag', 'hitl'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '이미지 텍스트 추출', toolIds: ['t-ocr'], humanCheck: false },
      { order: 2, name: '개인정보 마스킹', toolIds: [], humanCheck: false },
      { order: 3, name: '신뢰도 낮은 줄 확인', toolIds: [], humanCheck: true },
    ],
  },
  {
    agentId: 'dbquery', code: 'AGT-010', version: 'v1.3', owner: '오세진 · 설비보전팀',
    purpose: '자연어를 SQL로 바꿔 조회하고 AI가 가정한 조건을 밝힙니다.',
    capabilities: ['rag', 'a2a'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '질의 해석 · SQL 생성', toolIds: [], humanCheck: false },
      { order: 2, name: 'MES 조회', toolIds: ['t-mes'], humanCheck: false },
      { order: 3, name: '가정한 조건 표시', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'address', code: 'AGT-011', version: 'v1.1', owner: '오세진 · 설비보전팀',
    purpose: '설비 태그·기준정보를 표준 체계로 매핑하고 상한을 밝힙니다.',
    capabilities: ['rag'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '기준정보 대조', toolIds: ['t-mes'], humanCheck: false },
      { order: 2, name: '표준화율·잔여 건수 산출', toolIds: [], humanCheck: false },
    ],
  },
  {
    agentId: 'dataanalysis', code: 'AGT-012', version: 'v1.7', owner: '정하늘 · 품질보증팀',
    purpose: '공정 데이터를 차트·통계로 분석하고 적용률을 밝힙니다.',
    capabilities: ['rag', 'a2a'], responseMode: 'grounded',
    steps: [
      { order: 1, name: '데이터 적재', toolIds: ['t-mes'], humanCheck: false },
      { order: 2, name: '센서 이력 결합', toolIds: ['t-pdm'], humanCheck: false },
      { order: 3, name: '분석·차트 생성', toolIds: [], humanCheck: false },
    ],
  },
  {
    /* 실행형인데 확인 지점이 없다 — 결과가 그대로 정비지시로 나간다 */
    agentId: 'safety', code: 'AGT-013', version: 'v0.9', owner: '오세진 · 설비보전팀',
    purpose: '작업 위험요인을 평가해 관리계획을 만들고 잔여 위험을 남깁니다.',
    capabilities: ['rag', 'a2a', 'actionable'], responseMode: 'direct',
    steps: [
      { order: 1, name: '설비 상태 조회', toolIds: ['t-pdm'], humanCheck: false },
      { order: 2, name: '위험요인 평가', toolIds: ['t-rag'], humanCheck: false },
      { order: 3, name: '관리계획 생성', toolIds: [], humanCheck: false },
    ],
  },
]

export const SCENARIO_DEFS: ScenarioDefinition[] = [
  {
    id: 'sc-1',
    title: '수입검사 성적서 접수 처리',
    trigger: '협력사가 성적서를 제출하면',
    steps: [
      { order: 1, agentId: 'ocr', what: '스캔 성적서에서 수치를 읽는다' },
      { order: 2, agentId: 'address', what: '설비·품번을 기준정보에 맞춘다' },
      { order: 3, agentId: 'dbquery', what: '해당 로트의 과거 이력을 조회한다' },
      { order: 4, agentId: 'report', what: '판정 근거를 붙여 접수 보고서를 만든다' },
    ],
    output: '접수 보고서 HBP-품질-2026-088',
    owner: '정하늘 · 품질보증팀',
    enabled: true,
  },
  {
    /* 이 시나리오는 지금 못 돈다 — 2단계 에이전트가 끊긴 도구를 쓴다 */
    id: 'sc-2',
    title: '진동 알람 예지보전 처리',
    trigger: '설비 진동이 관리 기준을 넘으면',
    steps: [
      { order: 1, agentId: 'dbquery', what: '해당 설비의 센서 이력을 조회한다' },
      { order: 2, agentId: 'dataanalysis', what: 'FFT로 이상 주파수를 진단한다' },
      { order: 3, agentId: 'safety', what: '작업 위험요인을 평가한다' },
      { order: 4, agentId: 'report', what: '정비지시서를 만든다' },
    ],
    output: '정비지시서 HBP-보전-2026-102',
    owner: '오세진 · 설비보전팀',
    enabled: true,
  },
  {
    id: 'sc-3',
    title: '사규 개정 영향 검토',
    trigger: '사규가 개정되면',
    steps: [
      { order: 1, agentId: 'internalreg', what: '바뀐 조항을 찾는다' },
      { order: 2, agentId: 'knowledge', what: '그 조항을 인용한 문서를 찾는다' },
      { order: 3, agentId: 'review', what: '영향받는 기안문을 가려낸다' },
    ],
    output: '영향 문서 목록',
    owner: '서민아 · 경영지원팀',
    enabled: false,
  },
]
