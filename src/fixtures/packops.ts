/**
 * 도메인 팩 · 도구/배포 fixture.
 *
 * 팩 상태는 애플리케이션 화면의 '발주처별 노출'과 같은 사실이다 —
 * 한빛정밀만 열려 있고 나머지 셋은 0종이다. 여기서는 **왜 0종인지**를 본다.
 *
 * 셋을 똑같이 비워 두지 않았다. 하나는 거의 다 됐고(문서만 없음), 하나는 시작만
 * 했고, 하나는 아무것도 없다. 전부 0%면 '준비 중'이 한 덩어리로 보여
 * 무엇을 먼저 해야 하는지 알 수 없다.
 *
 * 끊긴 도구를 하나 넣었다 — 도구는 끊겨도 서비스가 죽지 않아서
 * '어떤 에이전트가 조용히 못 도는지'를 보여 주는 화면이 필요하다.
 */
import type { Deployment, DomainPack, ToolEntry } from '@entities/packops/model'

export const PACKS: DomainPack[] = [
  {
    domainId: 'manufacturing',
    orgName: '한빛정밀',
    sector: '제조',
    filled: ['documents', 'agentContent', 'scenarios', 'mapIntel', 'signals', 'branding'],
    usable: true,
  },
  {
    domainId: 'public',
    orgName: '공공기관',
    sector: '공공',
    /* 문서만 없다 — 가장 가까운 곳 */
    filled: ['agentContent', 'scenarios', 'signals', 'branding'],
    usable: false,
  },
  {
    domainId: 'finance',
    orgName: '금융',
    sector: '금융',
    filled: ['branding'],
    usable: false,
  },
  {
    domainId: 'healthcare',
    orgName: '의료',
    sector: '의료',
    filled: [],
    usable: false,
  },
]

export const TOOLS: ToolEntry[] = [
  { id: 't-rag', name: '지식 검색', kind: 'search', connected: true, usedBy: ['업무 챗봇', '지식 검색', '문서 사전 검토'], downReason: null, calls7d: 1_284 },
  { id: 't-mes', name: 'MES 조회', kind: 'db', connected: true, usedBy: ['데이터 조회', '데이터 분석'], downReason: null, calls7d: 312 },
  { id: 't-ocr', name: '문서 텍스트 추출', kind: 'file', connected: true, usedBy: ['문서 인식(OCR)', '문서 요약'], downReason: null, calls7d: 208 },
  { id: 't-stt', name: '음성 인식', kind: 'file', connected: true, usedBy: ['회의록 작성'], downReason: null, calls7d: 64 },
  /* 끊긴 도구 — 이걸 쓰는 에이전트만 조용히 못 돈다 */
  {
    id: 't-pdm',
    name: 'PdM 센서 조회',
    kind: 'external',
    connected: false,
    usedBy: ['안전관리계획 수립', '데이터 분석'],
    downReason: '수집기 게이트웨이가 응답하지 않습니다 — 연계 SW 모니터링의 PdM 진동 수집기와 같은 원인입니다.',
    calls7d: 12,
  },
  { id: 't-erp', name: 'ERP 조회', kind: 'external', connected: true, usedBy: ['표준 보고서 작성'], downReason: null, calls7d: 41 },
]

/**
 * 배포.
 *
 * 검증에만 올라간 버전을 넣었다. 검증과 운영이 같은 버전이면 '무엇이 아직
 * 안 나갔는지' 보여 주는 화면이 죽은 코드가 된다.
 */
export const DEPLOYMENTS: Deployment[] = [
  { id: 'd-1', target: '사용자 포털', stage: 'production', version: 'v1.8.2', deployedAt: '2026-07-28 10:20', note: null },
  { id: 'd-2', target: '사용자 포털', stage: 'staging', version: 'v1.9.0', deployedAt: '2026-08-01 16:05', note: '지도 인텔리전스와 환경설정이 들어간 버전입니다.' },
  { id: 'd-3', target: '관리자 시스템', stage: 'production', version: 'v1.4.0', deployedAt: '2026-07-30 09:00', note: null },
  { id: 'd-4', target: '관리자 시스템', stage: 'staging', version: 'v1.4.0', deployedAt: '2026-07-30 08:30', note: null },
  { id: 'd-5', target: '에이전트 실행기', stage: 'production', version: 'v0.9.3', deployedAt: '2026-07-22 14:40', note: '베타입니다. 외부 시스템에 붙이지 마십시오.' },
  { id: 'd-6', target: '에이전트 실행기', stage: 'staging', version: 'v0.9.5', deployedAt: '2026-08-02 07:10', note: null },
  /* 에이전트 정의도 배포 대상이다 — 이전 데모의 '태스크플로우 배포'가 이것이다.
     정의가 바뀌면 답이 달라지므로 검증에서 확인한 뒤 운영에 올린다 */
  { id: 'd-7', target: '에이전트 정의 (13종)', stage: 'production', version: 'def-2026-07-18', deployedAt: '2026-07-18 15:00', note: '태스크플로우 빌더에서 보는 정의의 운영 버전입니다.' },
  { id: 'd-8', target: '에이전트 정의 (13종)', stage: 'staging', version: 'def-2026-08-02', deployedAt: '2026-08-02 09:20', note: '안전관리계획에 사람 확인 지점을 넣은 버전입니다. 아직 운영에 안 나갔습니다.' },
]
