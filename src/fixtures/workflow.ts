/**
 * 워크플로우 fixture.
 *
 * 다른 화면과 이어진다 — 노드가 부르는 에이전트는 카탈로그의 13종이고,
 * 도구 노드는 도구·배포의 도구다.
 *
 * **일부러 넣은 나쁜 상태 셋.** 없으면 그걸 드러내는 화면이 죽은 코드가 된다.
 *  ① 한 번도 안 탄 분기 — 죽은 길이거나 조건이 틀렸다
 *  ② 실행 노드가 있는데 사람 검토가 없는 워크플로우
 *  ③ 실패가 한 노드에 몰려 있는 것 — 성공률만 보면 안 보인다
 */
import type { Workflow } from '@entities/workflow/model'

export const WORKFLOWS: Workflow[] = [
  {
    id: 'wf-1',
    name: '진동 이상 종합 대응',
    purpose: '진동 알람이 뜨면 진단하고, 심각도에 따라 정비지시서까지 만든다',
    enabled: true,
    owner: '오세진 · 설비보전팀',
    runs24h: 8,
    failed24h: 2,
    nodes: [
      { id: 'n1', kind: 'trigger', label: '진동 관리 기준 초과', branches: [] },
      { id: 'n2', kind: 'agent', label: '데이터 조회 — 센서 이력', branches: [] },
      { id: 'n3', kind: 'agent', label: '데이터 분석 — FFT 진단', branches: [] },
      { id: 'n4', kind: 'branch', label: '심각도 판정', branches: ['높음', '보통', '낮음'] },
      { id: 'n5', kind: 'review', label: '보전 담당 확인', branches: [] },
      { id: 'n6', kind: 'agent', label: '표준 보고서 — 정비지시서', branches: [] },
      { id: 'n7', kind: 'action', label: '정비 요청 등록', branches: [] },
    ],
    /* 실패가 한 노드에 몰려 있다 — 성공률 75%만 보면 어디인지 모른다 */
    failedAt: [
      { nodeId: 'n3', count: 2, reason: 'PdM 센서 조회 도구가 끊겨 진단을 못 했습니다.' },
    ],
    /* '낮음' 분기는 한 번도 안 탔다 */
    taken: [
      { nodeId: 'n4', branch: '높음', count: 5 },
      { nodeId: 'n4', branch: '보통', count: 1 },
      { nodeId: 'n4', branch: '낮음', count: 0 },
    ],
  },
  {
    /* 실행 노드가 있는데 사람 검토가 없다 */
    id: 'wf-2',
    name: '신규 입사자 계정 준비',
    purpose: 'HR에 신규 입사자가 들어오면 계정을 만들고 교육 자료를 보낸다',
    enabled: true,
    owner: '서민아 · 경영지원팀',
    runs24h: 3,
    failed24h: 0,
    nodes: [
      { id: 'm1', kind: 'trigger', label: 'HR 신규 입사 동기화', branches: [] },
      { id: 'm2', kind: 'agent', label: '내규·규정 조회 — 필수 교육 확인', branches: [] },
      { id: 'm3', kind: 'branch', label: '직군 구분', branches: ['생산직', '사무직'] },
      { id: 'm4', kind: 'tool', label: '메일 게이트웨이 — 안내 발송', branches: [] },
      { id: 'm5', kind: 'action', label: '계정 승인 대기 등록', branches: [] },
    ],
    failedAt: [],
    taken: [
      { nodeId: 'm3', branch: '생산직', count: 2 },
      { nodeId: 'm3', branch: '사무직', count: 1 },
    ],
  },
  {
    id: 'wf-3',
    name: '사규 개정 영향 검토',
    purpose: '사규가 개정되면 영향받는 기안문을 찾아 담당자에게 알린다',
    enabled: false,
    owner: '서민아 · 경영지원팀',
    runs24h: 0,
    failed24h: 0,
    nodes: [
      { id: 'k1', kind: 'trigger', label: '규정 개정 감지', branches: [] },
      { id: 'k2', kind: 'agent', label: '지식 검색 — 인용 문서', branches: [] },
      { id: 'k3', kind: 'agent', label: '문서 사전 검토 — 영향 판정', branches: [] },
      { id: 'k4', kind: 'review', label: '법무 담당 확인', branches: [] },
    ],
    failedAt: [],
    taken: [],
  },
]
