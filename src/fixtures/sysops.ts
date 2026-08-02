/**
 * HR 연계 · API · 외부 연동 fixture.
 *
 * 세계관은 이어진다 — 사용자 관리에서 정지 상태인 서민아가 여기서는 휴직 부재
 * 처리로 나오고, 승인 대기 중인 신규 입사자 3명이 HR 동기화로 들어온 사람들이다.
 *
 * **처리에 실패한 동기화를 하나 넣었다.** 전부 성공하면 '못 처리한 것을 드러낸다'는
 * 화면이 죽은 코드가 된다. 하필 퇴직 건이라 그 계정은 지금 접속이 열려 있다.
 *
 * ⚠️ API 키 원문은 넣지 않는다. fixture에라도 두면 화면에 뿌리고 싶어진다.
 */
import type { ApiEntry, HrSyncState, Integration, PromptEntry } from '@entities/sysops/model'

export const HR_SYNC: HrSyncState = {
  connected: true,
  lastSyncAt: '2026-08-02 01:00:12',
  nextSyncAt: '2026-08-03 01:00:00',
  totalUsers: 842,
  changes: [
    { id: 'h-1', name: '강도현', kind: 'join', dept: '생산기술팀', syncedOn: '2026-07-25', effect: '계정 생성 — 승인 대기로 들어갔습니다', failedReason: null },
    { id: 'h-2', name: '윤새롬', kind: 'join', dept: '품질보증팀', syncedOn: '2026-07-31', effect: '계정 생성 — 승인 대기로 들어갔습니다', failedReason: null },
    { id: 'h-3', name: '최인규', kind: 'join', dept: '설비보전팀', syncedOn: '2026-08-01', effect: '계정 생성 — 승인 대기로 들어갔습니다', failedReason: null },
    { id: 'h-4', name: '서민아', kind: 'absence', dept: '경영지원팀', syncedOn: '2026-06-30', effect: '임시 계정 잠금 (육아휴직)', failedReason: null },
    { id: 'h-5', name: '한지민', kind: 'move', dept: '생산기술팀 → 생산관리팀', syncedOn: '2026-07-28', effect: '소속 그룹 변경', failedReason: null },
    /* 처리에 실패한 퇴직 — 그 계정은 지금 접속이 열려 있다 */
    { id: 'h-6', name: '장태훈', kind: 'leave', dept: '정보기술팀', syncedOn: '2026-07-30', effect: '계정 비활성화', failedReason: '사번이 두 계정에 걸려 있어 어느 쪽을 끌지 정하지 못했습니다. 계정이 아직 살아 있습니다.' },
  ],
}

export const APIS: ApiEntry[] = [
  { id: 'a-chat', name: '업무 챗봇 API', path: '/api/v1/chat', version: 'v1.2', auth: 'Bearer Token', state: 'active', callsToday: 28_420, approvedOn: '2026-01-05', note: null },
  { id: 'a-rag', name: 'RAG 검색 API', path: '/api/v1/rag/search', version: 'v1.0', auth: 'Bearer Token', state: 'active', callsToday: 12_880, approvedOn: '2026-01-05', note: null },
  { id: 'a-embed', name: '임베딩 API', path: '/api/v1/embed', version: 'v1.1', auth: 'API Key', state: 'active', callsToday: 4_820, approvedOn: '2026-01-12', note: null },
  { id: 'a-agent', name: '에이전트 실행 API', path: '/api/v1/agent/run', version: 'v0.9', auth: 'Bearer Token', state: 'beta', callsToday: 1_940, approvedOn: '2026-02-01', note: '응답 형식이 아직 바뀔 수 있습니다. 외부 시스템에 붙이지 마십시오.' },
  { id: 'a-stats', name: '통계 조회 API', path: '/api/v1/stats', version: 'v1.0', auth: 'API Key', state: 'stopped', callsToday: 0, approvedOn: '2026-01-20', note: '집계 기준이 바뀌어 중지했습니다. 재개 일정은 정해지지 않았습니다.' },
]

export const PROMPTS: PromptEntry[] = [
  { id: 'p-chat', target: '업무 챗봇', version: 'v3', updatedOn: '2026-07-18', purpose: '근거를 못 찾으면 답을 만들지 않도록 정한다', affects: '바꾸면 근거 없는 질문에 답을 지어내기 시작할 수 있습니다.' },
  { id: 'p-review', target: '문서 사전 검토', version: 'v2', updatedOn: '2026-06-30', purpose: '심각도 판정 기준과 조항 인용 방식을 정한다', affects: '바꾸면 같은 문서에 다른 심각도가 나옵니다.' },
  { id: 'p-report', target: '보고서 작성', version: 'v2', updatedOn: '2026-07-02', purpose: '사람이 채워야 하는 칸을 비워 두도록 정한다', affects: '바꾸면 빈칸을 임의로 채운 보고서가 나올 수 있습니다.' },
]

/** 외부 연동 — 끊기면 무엇이 멈추는지 함께 */
export const INTEGRATIONS: Integration[] = [
  { id: 'i-sso', name: '사내 SSO', kind: '인증', connected: true, lastOkAt: '2026-08-02 09:10', impactIfDown: '아무도 로그인할 수 없습니다.', downReason: null },
  { id: 'i-hr', name: 'HR DB', kind: '인사', connected: true, lastOkAt: '2026-08-02 01:00', impactIfDown: '입·퇴사자 계정이 자동으로 처리되지 않습니다.', downReason: null },
  { id: 'i-mes', name: 'MES', kind: '생산', connected: true, lastOkAt: '2026-08-02 08:55', impactIfDown: '설비·가동률 조회가 빈 값이 됩니다.', downReason: null },
  /* 끊긴 연동 — 무엇이 멈추는지 화면이 말한다 */
  { id: 'i-pdm', name: 'PdM 진동 수집기', kind: '설비', connected: false, lastOkAt: '2026-08-01 22:40', impactIfDown: '진동 알람이 오지 않습니다. 지금 화면의 지표는 마지막 수집값입니다.', downReason: '수집기 게이트웨이가 응답하지 않습니다(10시간 30분째).' },
  { id: 'i-erp', name: 'ERP', kind: '경영', connected: true, lastOkAt: '2026-08-02 07:30', impactIfDown: '비용·구매 정보를 가져오지 못합니다.', downReason: null },
  { id: 'i-mail', name: '메일 게이트웨이', kind: '알림', connected: false, lastOkAt: '2026-08-02 03:15', impactIfDown: '승인 요청·오류 알림 메일이 나가지 않습니다.', downReason: '중계 파드가 재시작을 반복하고 있습니다(서비스 현황의 알림 서비스와 같은 원인).' },
]
