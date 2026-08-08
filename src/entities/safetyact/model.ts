/**
 * 중대재해처벌법 대응 (관리자 화면).
 *
 * ⚠️ `entities/safety`와 **다른 것**이다. 저기는 사용자 포털의 안전관리계획 수립
 * 에이전트가 쓰는 위험요인·대책 모델이고, 여기는 관리자의 법 이행 기록이다.
 * 이름이 비슷해 덮어쓸 뻔했다 — 실제로 한 번 덮었다(2026-08-08).
 *
 * ⚠️ **이 화면도 법적 판단을 내리지 않는다.** 의무를 이행했는지는 사업주·경영책임자가
 * 판단하고 필요하면 노동관서에 확인한다. 화면은 그 판단과 **증빙이 어디 있는지**를
 * 기록할 뿐이다. AI 기본법 대응과 같은 규율이다.
 *
 * 이 화면의 핵심은 이행률 숫자가 아니다. **증빙이 살아 있는가**다.
 * 한 번 '이행'으로 적어 두면 그 표시는 영원히 이행으로 남는다 — 반기 평가를
 * 안 해도, 수급업체 평가를 건너뛰어도 표에는 초록색이 그대로다.
 * 그래서 기준 시점을 받아 **증빙이 낡은 것**을 따로 센다.
 *
 * 낡음 판정은 **호마다 다른 주기**로 한다. 경영방침 공표는 연 1회, 책임자 평가는
 * 반기 1회, 위험성평가는 상시다. 한 숫자로 다 재면 연 1회짜리가 7개월 만에
 * 빨간색이 되고, 그러면 아무도 그 경고를 안 본다.
 *
 * 자동 축적과 수기를 나누는 이유도 같다. 위험성평가·의견 청취처럼 플랫폼이 돌면서
 * 쌓이는 것은 안 낡는다. 수기 증빙은 **아무도 안 올리면 조용히 낡는다.**
 */

export type DutyStatus = 'met' | 'attention' | 'unmet'

export const DUTY_STATUS_LABEL: Record<DutyStatus, string> = {
  met: '이행',
  attention: '주의',
  unmet: '미이행',
}

export type SafetyDuty = {
  id: string
  /** 시행령 제4조 각 호 */
  clause: string
  name: string
  status: DutyStatus
  /** 무엇으로 이행을 보이는가 */
  evidence: string
  /** 그 증빙이 마지막으로 갱신된 날 */
  evidenceAt: string
  owner: string
  /**
   * 이 증빙을 며칠마다 갱신하기로 했는가.
   *
   * ⚠️ **법이 정한 주기가 아니라 조직이 정한 주기다.** 화면이 법정 주기를 아는 척하면
   * 그 숫자를 근거로 감사에 답하게 된다. 서버가 붙으면 조직 규정에서 온다.
   */
  cycleDays: number
  /** 플랫폼이 돌면서 자동으로 쌓이는 증빙인가 */
  auto: boolean
}

/** 주기를 안 정한 호에 적용하는 기본값 — 연 1회 */
export const DEFAULT_CYCLE_DAYS = 365

/** 날짜 문자열 두 개의 간격(일). 시계를 읽지 않는다 — 기준 시점은 데이터를 준 쪽이 준다 */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`)
  const b = Date.parse(`${to}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.round((b - a) / 86_400_000)
}

/** 조치가 필요한 것 — 주의·미이행 */
export const actionable = (list: SafetyDuty[]): SafetyDuty[] =>
  list.filter((d) => d.status !== 'met')

/**
 * **'이행'인데 증빙이 낡은 것.**
 *
 * 주의·미이행은 이미 드러나 있다. 위험한 것은 초록색으로 표시된 채 낡은 쪽이다.
 */
export const staleEvidence = (list: SafetyDuty[], asOf: string): SafetyDuty[] =>
  list.filter((d) => d.status === 'met' && daysBetween(d.evidenceAt, asOf) > cycleOf(d))

export const cycleOf = (d: SafetyDuty): number =>
  d.cycleDays > 0 ? d.cycleDays : DEFAULT_CYCLE_DAYS

export const autoCollected = (list: SafetyDuty[]): SafetyDuty[] => list.filter((d) => d.auto)

/** 이행으로 적힌 비율. 낡은 증빙까지 걸러 내지는 않는다 — 그건 화면이 따로 말한다 */
export const metRatio = (list: SafetyDuty[]): number =>
  list.length === 0 ? 0 : Math.round((list.filter((d) => d.status === 'met').length / list.length) * 100)

export type RiskAssessment = {
  id: string
  task: string
  docNo: string
  assessedOn: string
  by: string
  /** 찾은 위험요인 수 */
  risks: number
  /** 그중 조치가 끝난 수 */
  actionsDone: number
}

/** 조치가 남은 평가 — 평가를 했다는 것과 위험이 없어진 것은 다르다 */
export const openActions = (list: RiskAssessment[]): RiskAssessment[] =>
  list.filter((r) => r.actionsDone < r.risks)

export type SafetyTraining = {
  id: string
  name: string
  target: string
  done: number
  total: number
  heldOn: string
}

export const trainingGap = (t: SafetyTraining): number => t.total - t.done

/** 아직 안 받은 사람이 있는 교육 */
export const incompleteTraining = (list: SafetyTraining[]): SafetyTraining[] =>
  list.filter((t) => trainingGap(t) > 0)
