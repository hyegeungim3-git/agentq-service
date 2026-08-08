/**
 * 보안 아키텍처 — 망 경계를 넘는 흐름과 통제.
 *
 * 보안 검토에서 가장 먼저 요구받는 그림이다. 화면은 세 가지를 말한다.
 *  ① 어떤 데이터가 **망 경계를 넘는가** — 안 넘는 흐름은 이 화면의 관심사가 아니다
 *  ② 등급별로 **어디까지 허용하기로 했는가** (정책)
 *  ③ 외부에서 들어오는 접근이 지금 어떤 상태인가
 *
 * ⚠️ **②는 정책이지 실제 통제가 아니다.** 화면이 '이렇게 막힙니다'라고 말하면,
 * 표에 '차단'이라 적혀 있다는 이유로 막히고 있다고 믿게 된다. 실제로 막고 있는지는
 * 게이트웨이가 답해야 하고, 서버가 붙기 전까지 화면은 **'이렇게 막기로 돼 있다'**
 * 까지만 말한다.
 *
 * 만료 판정은 기준 시점을 받아서 한다 — 접근권한·차단 화면과 같은 이유다.
 * 만료됐는데 '활성'으로 적혀 있으면 막고 있다고 믿는데 실제로는 열려 있다.
 */

export type Zone = 'internal' | 'gateway' | 'external'

export const ZONE_LABEL: Record<Zone, string> = {
  internal: '내부망',
  gateway: '보안 게이트웨이',
  external: '외부망',
}

export type DataFlow = {
  id: string
  name: string
  from: string
  processedAt: string
  to: string
  /** 망 경계를 넘는가 — 이 화면이 실제로 보는 것 */
  crossesBoundary: boolean
  /** 넘어가는 데이터의 등급 */
  grade: GradeCode
  volume: string
  protection: string
}

export const crossing = (list: DataFlow[]): DataFlow[] => list.filter((f) => f.crossesBoundary)

export type GradeCode = 'confidential' | 'restricted' | 'internal' | 'public'

export const GRADE_LABEL: Record<GradeCode, string> = {
  confidential: '기밀',
  restricted: '대외비',
  internal: '내부',
  public: '공개',
}

export type Allowance = 'allow' | 'conditional' | 'block'

export const ALLOWANCE_LABEL: Record<Allowance, string> = {
  allow: '허용',
  conditional: '조건부',
  block: '차단',
}

export type BoundaryRule = {
  grade: GradeCode
  internal: Allowance
  gateway: Allowance
  external: Allowance
  note: string
}

/**
 * 정책과 실제 흐름이 어긋난 것.
 *
 * 표에 '차단'이라 적어 두고 그 등급이 실제로 경계를 넘고 있으면, 둘 중 하나는 거짓이다.
 * 화면이 그것을 찾아 주지 않으면 아무도 두 표를 대조하지 않는다.
 */
export function policyViolations(flows: DataFlow[], rules: BoundaryRule[]): DataFlow[] {
  return crossing(flows).filter((f) => {
    const rule = rules.find((r) => r.grade === f.grade)
    return rule !== undefined && rule.gateway === 'block'
  })
}

export type ExternalAccess = {
  id: string
  org: string
  scope: string
  grade: GradeCode
  /** 언제까지 */
  expiresOn: string
  mfa: boolean
  lastAccessAt: string
}

/** 기준 시점을 넘긴 것 — 시계를 읽지 않는다 */
export const expired = (list: ExternalAccess[], asOf: string): ExternalAccess[] =>
  list.filter((a) => a.expiresOn < asOf)

export const live = (list: ExternalAccess[], asOf: string): ExternalAccess[] =>
  list.filter((a) => a.expiresOn >= asOf)

/** 2단계 인증이 없는 외부 접근 — 계정 하나가 뚫리면 그대로 들어온다 */
export const withoutMfa = (list: ExternalAccess[]): ExternalAccess[] => list.filter((a) => !a.mfa)
