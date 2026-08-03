/**
 * 가드레일 이력·AI 기본법 fixture.
 *
 * 세계관은 한빛정밀이다. 걸린 사례는 다른 화면의 사건과 이어진다 —
 * 협력사 계정이 대외비 작업표준을 열려다 막힌 건, 챗봇이 대피 경로를 지어내려다
 * 근거 없음 규칙에 걸린 건(품질 관리의 할루시네이션 판정과 같은 질문).
 *
 * **경고만 하고 통과시킨 건을 넣었다.** 전부 차단되면 '실제로는 나갔다'를
 * 보여 주는 화면이 죽은 코드가 된다.
 *
 * ⚠️ 걸린 내용의 **원문은 넣지 않는다.** 종류만 적는다 — 차단 이력을 보려고
 * 열었는데 가려야 할 개인정보가 그 화면에 그대로 있으면 앞뒤가 안 맞는다.
 */
import type { AiSystem, Assessment, GuardrailHit, LabelRule } from '@entities/compliance/model'

export const HITS: GuardrailHit[] = [
  { id: 'g-1', at: '2026-08-02 06:14', ruleId: 'g-02', ruleName: '보안 등급 차단', agentLabel: '업무 챗봇', actor: '이도경', outcome: 'blocked', what: '대외비 작업표준 본문 요청', disputed: true },
  { id: 'g-2', at: '2026-07-27 16:42', ruleId: 'g-03', ruleName: '근거 없는 답변 차단', agentLabel: '업무 챗봇', actor: '한지민', outcome: 'warned', what: '지식베이스에 없는 대피 경로 질문', disputed: false },
  { id: 'g-3', at: '2026-08-01 11:20', ruleId: 'g-01', ruleName: '개인정보 마스킹', agentLabel: '문서 인식(OCR)', actor: '정하늘', outcome: 'masked', what: '성적서 스캔본의 연락처 2건', disputed: false },
  { id: 'g-4', at: '2026-08-01 09:35', ruleId: 'g-04', ruleName: '수치 인용 검증', agentLabel: '보고서 작성', actor: '박태윤', outcome: 'warned', what: '문서에 없는 경도 수치', disputed: false },
  { id: 'g-5', at: '2026-07-31 15:02', ruleId: 'g-01', ruleName: '개인정보 마스킹', agentLabel: '문서 요약', actor: '오세진', outcome: 'masked', what: '회의록의 개인 연락처 1건', disputed: false },
  { id: 'g-6', at: '2026-07-30 13:44', ruleId: 'g-05', ruleName: '외부 링크 차단', agentLabel: '업무 챗봇', actor: '한지민', outcome: 'blocked', what: '사내 문서가 아닌 출처 인용 시도', disputed: false },
  { id: 'g-7', at: '2026-07-29 10:11', ruleId: 'g-02', ruleName: '보안 등급 차단', agentLabel: '지식 검색', actor: '이도경', outcome: 'blocked', what: '대외비 등급 문서 3건 검색 결과', disputed: true },
]

/**
 * 등록된 AI 시스템.
 *
 * **검토 중인데 이미 돌고 있는 것을 넣었다.** 판정이 끝나야 쓸 수 있는 것이 아니라
 * 대개 쓰면서 판단한다 — 그 상태를 감추면 화면이 안전한 것처럼 보인다.
 */
export const AI_SYSTEMS: AiSystem[] = [
  {
    id: 's-1',
    name: '설비 이상 예지보전 판정 AI',
    dept: '설비보전팀',
    verdict: 'high',
    reason: '판정 결과가 설비 정지·작업 중단으로 이어져 근로자 안전에 직접 영향을 미칩니다.',
    owner: '오세진 팀장',
    duties: ['risk', 'explain', 'oversight', 'record'],
    inService: true,
  },
  {
    id: 's-2',
    name: '수입검사 합부 판정 AI',
    dept: '품질보증팀',
    verdict: 'high',
    reason: '합부 판정이 협력사 납품 대금과 계약에 직접 영향을 미칩니다.',
    owner: '정하늘 책임',
    duties: ['risk', 'explain', 'record'],
    inService: true,
  },
  {
    id: 's-3',
    name: '작업자 안전 위험도 추정 모델',
    dept: '생산기술팀',
    verdict: 'reviewing',
    reason: '근로자 안전에 관여하나 판정이 아닌 참고 지표입니다. 고영향 해당 여부를 확인 중입니다.',
    owner: '박태윤 책임',
    duties: ['risk', 'record'],
    inService: true,
  },
  {
    id: 's-4',
    name: '협력사 평가 점수 산출 모델',
    dept: '구매팀',
    verdict: 'reviewing',
    reason: '거래 조건에 영향을 줄 수 있어 해당 여부를 확인 중입니다.',
    owner: '서민아 과장',
    duties: ['record'],
    inService: false,
  },
  {
    id: 's-5',
    name: '업무 챗봇 (AgentQ)',
    dept: 'AI 활용 TF',
    verdict: 'notHigh',
    reason: '사내 문서 조회를 돕는 보조 도구로, 판단이나 처분에 관여하지 않습니다.',
    owner: '박태윤 책임',
    duties: ['risk', 'explain', 'protect', 'oversight', 'record'],
    inService: true,
  },
  {
    id: 's-6',
    name: '문서 인식·마스킹 에이전트',
    dept: '경영지원팀',
    verdict: 'notHigh',
    reason: '문서 전처리 도구로 의사결정에 관여하지 않습니다.',
    owner: '서민아 과장',
    duties: ['risk', 'explain', 'protect', 'oversight', 'record'],
    inService: true,
  },
]

export const LABEL_RULES: LabelRule[] = [
  { id: 'l-1', target: '문서 요약', enabled: true, how: '요약문 상단에 「AI 생성물」 배지와 원문 대조 안내' },
  { id: 'l-2', target: '문서 번역', enabled: true, how: '번역문 상단 배지 + 역번역 일치도 표시' },
  { id: 'l-3', target: '보고서 작성', enabled: true, how: '문서 첫 장 하단에 생성 고지 문구 삽입' },
  { id: 'l-4', target: '회의록 작성', enabled: true, how: '회의록 머리말에 생성 고지' },
  { id: 'l-5', target: '업무 챗봇 답변', enabled: true, how: '답변마다 근거 문서와 신뢰도 표시' },
  /* 꺼져 있는 규칙 — 껐다는 사실과 그 결과를 함께 보여 준다 */
  { id: 'l-6', target: '데이터 분석 차트', enabled: false, how: '차트 이미지에 워터마크 (미적용)' },
]

export const ASSESSMENTS: Assessment[] = [
  { id: 'a-1', systemName: '설비 이상 예지보전 판정 AI', status: 'done', dueOn: '2026-06-30', completedOn: '2026-06-24', remaining: null },
  { id: 'a-2', systemName: '수입검사 합부 판정 AI', status: 'ongoing', dueOn: '2026-09-30', completedOn: null, remaining: '협력사 이해관계자 의견수렴이 남았습니다.' },
  { id: 'a-3', systemName: '작업자 안전 위험도 추정 모델', status: 'notStarted', dueOn: '2026-12-31', completedOn: null, remaining: '고영향 해당 여부 확인이 끝나야 착수합니다.' },
]
