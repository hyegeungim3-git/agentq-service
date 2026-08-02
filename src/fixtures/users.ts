/**
 * 사용자 관리 fixture.
 *
 * 한 이야기로 묶었다 — 신규 입사자 3명이 가입 승인을 기다리는 중이고,
 * 그중 한 건은 8일째 방치돼 있다. 협력사 계정 하나가 한도를 넘겨 쓰고 있고,
 * 같은 계정이 대외비 문서 접근에서 거부돼 로그에 남았으며, 그 IP가 차단 목록에 있다.
 * 다섯 화면이 같은 사건의 다른 면을 보여 준다.
 *
 * 오늘은 2026-08-02로 둔다 — 대기 일수·만료 판정이 '지금'에 따라 달라지므로
 * fixture가 기준일을 함께 준다. 화면이 `new Date()`를 부르면 테스트가 날마다 달라진다.
 */
import type {
  AccessLogEntry,
  ApprovalRequest,
  BlockRule,
  PlatformUser,
} from '@entities/user/model'

export const TODAY = '2026-08-02'

const q = (limit: number | null, used: number) => ({ limit, used, countedAt: '2026-08-02 09:00' })

export const USERS: PlatformUser[] = [
  { id: 'u-001', name: '박태윤', dept: '생산기술팀', email: 'ty.park@hanbit.example', role: 'manager', state: 'active', lastSeenAt: '2026-08-02 08:41', quota: q(3000, 1820) },
  { id: 'u-002', name: '정하늘', dept: '품질보증팀', email: 'hn.jung@hanbit.example', role: 'member', state: 'active', lastSeenAt: '2026-08-01 17:22', quota: q(1000, 640) },
  { id: 'u-003', name: '오세진', dept: '설비보전팀', email: 'sj.oh@hanbit.example', role: 'member', state: 'active', lastSeenAt: '2026-08-02 07:05', quota: q(1000, 912) },
  { id: 'u-004', name: '한지민', dept: '생산관리팀', email: 'jm.han@hanbit.example', role: 'member', state: 'active', lastSeenAt: '2026-07-28 11:40', quota: q(1000, 210) },
  /* 협력사 계정 — 한도를 넘겼다. 접근 로그·차단 규칙과 같은 계정이다 */
  { id: 'u-005', name: '이도경', dept: '협력사(대성정공)', email: 'dk.lee@daesung.example', role: 'member', state: 'active', lastSeenAt: '2026-08-02 06:12', quota: q(500, 731) },
  { id: 'u-006', name: '서민아', dept: '경영지원팀', email: 'ma.seo@hanbit.example', role: 'member', state: 'suspended', lastSeenAt: '2026-06-30 14:03', quota: q(1000, 0) },
  { id: 'u-007', name: '운영 담당자', dept: 'AgentQ 플랫폼', email: 'ops@agentq.example', role: 'admin', state: 'active', lastSeenAt: '2026-08-02 09:10', quota: q(null, 4210) },
  /* 승인 대기 — 아직 한 번도 접속하지 않았다. 0이 아니라 null이다 */
  { id: 'u-008', name: '강도현', dept: '생산기술팀', email: 'dh.kang@hanbit.example', role: 'member', state: 'pending', lastSeenAt: null, quota: q(1000, 0) },
  { id: 'u-009', name: '윤새롬', dept: '품질보증팀', email: 'sr.yoon@hanbit.example', role: 'member', state: 'pending', lastSeenAt: null, quota: q(1000, 0) },
  { id: 'u-010', name: '최인규', dept: '설비보전팀', email: 'ig.choi@hanbit.example', role: 'member', state: 'pending', lastSeenAt: null, quota: q(1000, 0) },
]

/**
 * ⚠️ **최신 접수순으로 둔다.** 서버가 보통 그렇게 준다.
 *
 * 가장 오래 기다린 건을 fixture 맨 앞에 두면, 화면이 정렬을 안 해도 테스트가
 * 통과한다 — 실제로 그렇게 썼다가 정렬을 지우는 결함 주입이 안 잡혔다.
 * 8일째 방치된 a-101을 목록 가운데 둬서 정렬이 일을 하게 만든다.
 */
export const APPROVALS: ApprovalRequest[] = [
  { id: 'a-105', kind: 'quota', applicant: '이도경', dept: '협력사(대성정공)', requestedAt: '2026-08-02', detail: '월 500건 → 2,000건', reason: '수입검사 성적서 일괄 처리' },
  { id: 'a-103', kind: 'signup', applicant: '최인규', dept: '설비보전팀', requestedAt: '2026-08-01', detail: '일반 사용자 계정 생성', reason: '예지보전 알람 확인 업무' },
  { id: 'a-102', kind: 'signup', applicant: '윤새롬', dept: '품질보증팀', requestedAt: '2026-07-31', detail: '일반 사용자 계정 생성', reason: null },
  /* 8일째 방치 — 대기 일수를 안 보여 주면 아무도 눈치채지 못한다 */
  { id: 'a-101', kind: 'signup', applicant: '강도현', dept: '생산기술팀', requestedAt: '2026-07-25', detail: '일반 사용자 계정 생성', reason: '7월 신규 입사, 작업표준 조회 필요' },
  { id: 'a-104', kind: 'role', applicant: '정하늘', dept: '품질보증팀', requestedAt: '2026-07-30', detail: '일반 → 부서 관리자', reason: '품질 문서 승인 권한 필요' },
]

export const ACCESS_LOGS: AccessLogEntry[] = [
  /* 거부된 접근 — 협력사 계정이 대외비 문서를 열려 했다 */
  { id: 'l-9001', at: '2026-08-02 06:14', actor: '이도경', action: '문서 열람', target: '프레스 작업표준 SOP-PR-011', ip: '203.241.18.77', result: 'denied', deniedReason: '문서 보안 등급이 대외비이고 계정이 협력사입니다.' },
  { id: 'l-9002', at: '2026-08-02 06:12', actor: '이도경', action: '로그인', target: '사용자 포털', ip: '203.241.18.77', result: 'ok', deniedReason: null },
  { id: 'l-9003', at: '2026-08-02 05:58', actor: '(미인증)', action: '로그인', target: '관리자 시스템', ip: '45.14.200.9', result: 'denied', deniedReason: '차단 목록에 있는 주소입니다.' },
  { id: 'l-9004', at: '2026-08-02 08:41', actor: '박태윤', action: '에이전트 실행', target: '문서 사전 검토', ip: '10.20.3.51', result: 'ok', deniedReason: null },
  { id: 'l-9005', at: '2026-08-02 07:05', actor: '오세진', action: '문서 열람', target: '설비 대장 PRS-C03', ip: '10.20.3.77', result: 'ok', deniedReason: null },
  { id: 'l-9006', at: '2026-08-01 17:22', actor: '정하늘', action: '보고서 생성', target: 'KREA 품질 주간보고', ip: '10.20.3.62', result: 'ok', deniedReason: null },
  { id: 'l-9007', at: '2026-08-01 09:30', actor: '서민아', action: '로그인', target: '사용자 포털', ip: '10.20.3.90', result: 'denied', deniedReason: '정지된 계정입니다.' },
]

/**
 * 로그에 남지 않는 것.
 *
 * 목록만 보여 주면 '여기 있는 게 전부'로 읽힌다. 무엇이 안 남는지 밝혀야
 * 감사 목적으로 이 화면을 믿을지 판단할 수 있다.
 */
export const LOG_GAPS: string[] = [
  /* ⚠️ 이 문장은 서비스 분석의 이용 이력 화면과 같은 사실을 말한다.
     한쪽만 고치면 두 화면이 다른 말을 하게 된다 */
  '챗봇 질문 본문은 남기지 않습니다. 누가 언제 물었는지만 남습니다.',
  '보관 기간이 정해지지 않아 지금은 지우지 않습니다 — 정책이 정해지면 그때부터 적용됩니다.',
  '브라우저에만 저장되는 것(대화 기록·피드백·환경설정)은 서버 로그에 남지 않습니다.',
]

export const BLOCK_RULES: BlockRule[] = [
  { id: 'b-01', kind: 'ip', value: '45.14.200.0/24', reason: '관리자 로그인 무차별 시도 (2026-07-30, 412회)', until: null, createdBy: '운영 담당자', createdAt: '2026-07-30' },
  /* 이미 만료됐다 — '차단 중'으로 그리면 막고 있다고 믿게 된다 */
  { id: 'b-02', kind: 'ip', value: '203.241.18.77', reason: '협력사 계정 대외비 문서 반복 접근', until: '2026-07-31', createdBy: '운영 담당자', createdAt: '2026-07-24' },
  { id: 'b-03', kind: 'account', value: 'ma.seo@hanbit.example', reason: '휴직 기간 접근 정지', until: '2026-09-30', createdBy: '경영지원팀', createdAt: '2026-06-30' },
]
