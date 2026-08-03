/**
 * 가드레일 차단 이력과 AI 기본법 대응.
 *
 * ⚠️ **이 화면들은 법적 판단을 내리지 않는다.** 고영향 AI 해당 여부는 사업자가
 * 판단하고 필요하면 소관 부처에 확인한다. 화면은 그 판단과 근거를 **기록**할 뿐이다.
 * 화면이 판정을 내리는 것처럼 보이면, 화면에 '비해당'이라고 떴다는 이유로
 * 의무를 넘기게 된다.
 *
 * 가드레일 규칙 자체(켜기·끄기)는 신뢰성 관리에서 다룬다. 여기는 **실제로 무엇이
 * 걸렸는지**다. 같은 목록을 두 화면에 두면 어느 쪽이 진짜인지 알 수 없다.
 */

export type BlockOutcome = 'blocked' | 'masked' | 'warned'

export const OUTCOME_LABEL: Record<BlockOutcome, string> = {
  blocked: '차단',
  masked: '가림',
  warned: '경고만',
}

export type GuardrailHit = {
  id: string
  at: string
  ruleId: string
  ruleName: string
  agentLabel: string
  actor: string
  outcome: BlockOutcome
  /** 무엇이 걸렸는지 — 원문이 아니라 종류만 */
  what: string
  /** 사용자가 이의를 제기했는가 */
  disputed: boolean
}

/** 경고만 하고 통과시킨 것 — 실제로는 나갔다 */
export const passedThrough = (hits: GuardrailHit[]): GuardrailHit[] =>
  hits.filter((h) => h.outcome === 'warned')

export const disputed = (hits: GuardrailHit[]): GuardrailHit[] => hits.filter((h) => h.disputed)

/** 고영향 AI 판정 */
export type ImpactVerdict = 'high' | 'reviewing' | 'notHigh'

export const VERDICT_LABEL: Record<ImpactVerdict, string> = {
  high: '고영향 확인',
  reviewing: '검토 중',
  notHigh: '비해당',
}

export const IMPACT_VERDICTS: ImpactVerdict[] = ['high', 'reviewing', 'notHigh']

/** 제34조 5개 책무 */
export type DutyKey = 'risk' | 'explain' | 'protect' | 'oversight' | 'record'

export const DUTY_LABEL: Record<DutyKey, string> = {
  risk: '위험관리',
  explain: '설명 가능성',
  protect: '이용자 보호',
  oversight: '사람의 관리·감독',
  record: '문서 보관',
}

export const DUTIES: DutyKey[] = ['risk', 'explain', 'protect', 'oversight', 'record']

export type AiSystem = {
  id: string
  name: string
  dept: string
  verdict: ImpactVerdict
  /** 왜 그렇게 판정했는지 — 판정만 있고 근거가 없으면 다시 판단할 수 없다 */
  reason: string
  owner: string
  /** 이행한 책무 */
  duties: DutyKey[]
  /** 운영 중인가 — 검토 중인데 돌고 있으면 그 사실을 드러내야 한다 */
  inService: boolean
}

export const metDuties = (s: AiSystem): DutyKey[] => s.duties
export const unmetDuties = (s: AiSystem): DutyKey[] =>
  DUTIES.filter((d) => !s.duties.includes(d))

/** 고영향인데 책무를 다 못 채운 시스템 */
export const highRisk = (list: AiSystem[]): AiSystem[] =>
  list.filter((s) => s.verdict === 'high' && unmetDuties(s).length > 0)

/** 판정이 안 끝났는데 이미 돌고 있는 것 */
export const reviewingInService = (list: AiSystem[]): AiSystem[] =>
  list.filter((s) => s.verdict === 'reviewing' && s.inService)

export type LabelRule = {
  id: string
  target: string
  enabled: boolean
  /** 어디에 어떻게 표시하는가 */
  how: string
}

export type Assessment = {
  id: string
  systemName: string
  status: 'done' | 'ongoing' | 'notStarted'
  dueOn: string
  completedOn: string | null
  /** 안 끝났으면 무엇이 남았는지 */
  remaining: string | null
}

export const ASSESSMENT_LABEL: Record<Assessment['status'], string> = {
  done: '완료',
  ongoing: '진행 중',
  notStarted: '미착수',
}
