/**
 * 통합 로그·사용량 fixture.
 *
 * ⚠️ **접속 로그는 새로 쓰지 않는다.** 사용자 관리의 `ACCESS_LOGS`를 그대로
 * 옮겨 담는다. 두 곳에 따로 쓰면 같은 시각의 같은 행위가 서로 다르게 적히고,
 * 어느 쪽이 진짜인지 알 수 없게 된다.
 *
 * 세계관은 이어진다 — 협력사 계정이 대외비 문서 접근에서 거부된 그 사건이
 * 접속 로그에 있고, 같은 계정이 성적서를 내려받은 기록이 추출 로그에 있다.
 */
import type { OpLogEntry, UsageBucket } from '@entities/oplog/model'
import { ACCESS_LOGS } from '@fixtures/users'

/** 사용자 관리의 접근 기록을 통합 로그 형태로 옮긴다 — 복제가 아니라 변환이다 */
export const ACCESS_AS_OPLOG: OpLogEntry[] = ACCESS_LOGS.map((l) => ({
  id: `op-${l.id}`,
  at: l.at,
  actor: l.actor,
  dept: '—',
  ip: l.ip,
  action: l.result === 'denied' ? `${l.action} (거부)` : l.action,
  detail: l.deniedReason ?? l.target,
  sensitive: false,
}))

export const OPERATION_LOGS: OpLogEntry[] = [
  { id: 'op-1', at: '2026-08-02 09:12', actor: '운영 담당자', dept: 'AgentQ 플랫폼', ip: '10.20.3.5', action: '모델 설정 변경 시도', detail: 'GPT-OSS-120B 온도 0.3 → 0.2 (서버 미연결로 저장되지 않음)', sensitive: false },
  { id: 'op-2', at: '2026-08-02 08:44', actor: '박태윤', dept: '생산기술팀', ip: '10.20.3.51', action: '에이전트 실행', detail: '문서 사전 검토', sensitive: false },
  { id: 'op-3', at: '2026-08-01 17:25', actor: '정하늘', dept: '품질보증팀', ip: '10.20.3.62', action: '보고서 생성', detail: '품질 주간보고', sensitive: false },
  { id: 'op-4', at: '2026-07-30 10:02', actor: '운영 담당자', dept: 'AgentQ 플랫폼', ip: '10.20.3.5', action: '차단 규칙 추가', detail: '45.14.200.0/24 (관리자 로그인 무차별 시도)', sensitive: false },
  { id: 'op-5', at: '2026-07-27 16:50', actor: '오세진', dept: '설비보전팀', ip: '10.20.3.77', action: '답변 오류 신고', detail: '비상 대피 경로 답변', sensitive: false },
]

export const QUERY_LOGS: OpLogEntry[] = [
  { id: 'q-1', at: '2026-08-02 08:41', actor: '박태윤', dept: '생산기술팀', ip: '10.20.3.51', action: '문서검토 질의', detail: null, sensitive: false },
  { id: 'q-2', at: '2026-08-02 07:05', actor: '오세진', dept: '설비보전팀', ip: '10.20.3.77', action: '일반질의', detail: null, sensitive: false },
  { id: 'q-3', at: '2026-08-01 17:22', actor: '정하늘', dept: '품질보증팀', ip: '10.20.3.62', action: '보고서 질의', detail: null, sensitive: false },
  { id: 'q-4', at: '2026-07-31 14:15', actor: '정하늘', dept: '품질보증팀', ip: '10.20.3.62', action: '보안채팅 질의', detail: null, sensitive: false },
]

/* 문서가 밖으로 나간 기록 — 감사에서 가장 먼저 보는 것 */
export const EXPORT_LOGS: OpLogEntry[] = [
  { id: 'x-1', at: '2026-08-02 06:20', actor: '이도경', dept: '협력사(대성정공)', ip: '203.241.18.77', action: '문서 내려받기', detail: '수입검사성적서 SPCC-2211 (PDF, 1.2MB)', sensitive: true },
  { id: 'x-2', at: '2026-08-01 17:31', actor: '정하늘', dept: '품질보증팀', ip: '10.20.3.62', action: '보고서 인쇄', detail: '품질 주간보고 (A4 3면)', sensitive: true },
  { id: 'x-3', at: '2026-07-31 09:58', actor: '오세진', dept: '설비보전팀', ip: '10.20.3.77', action: '정비지시서 내려받기', detail: 'HBP-보전-2026-102 (PDF, 0.4MB)', sensitive: true },
]

/**
 * 사용량.
 *
 * 금액은 넣지 않는다 — 과금 단가가 정해지지 않았다(리포트 화면과 같은 이유).
 * 토큰 수만 세고, 금액이 없다는 사실을 화면이 말한다.
 */
export const USAGE_BUCKETS: UsageBucket[] = [
  { id: 'b-general', label: '업무 챗봇', used: 1_420_000, limit: 2_000_000 },
  { id: 'b-agent', label: '에이전트', used: 980_000, limit: 1_200_000 },
  /* 한도를 넘겼다 */
  { id: 'b-translate', label: '문서 번역', used: 540_000, limit: 500_000 },
  { id: 'b-report', label: '보고서 작성', used: 210_000, limit: 600_000 },
  { id: 'b-secure', label: '보안채팅', used: 64_000, limit: null },
]

/** 이번 달 며칠이 지났는지 — 화면이 `new Date()`를 부르면 테스트가 날마다 달라진다 */
export const MONTH_ELAPSED_DAYS = 2
export const MONTH_TOTAL_DAYS = 31
