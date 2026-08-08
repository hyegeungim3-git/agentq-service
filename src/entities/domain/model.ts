/**
 * 도메인(발주처) 모델.
 *
 * 이 파일이 이 프로젝트의 계약이다. fixture도 API 응답도 이 타입을 만족해야 한다.
 *
 * ⚠️ 표시 속성을 넣지 말 것.
 * 이전 데모의 mock은 이런 형태였다:
 *   { label: '수집 항목', value: '4,380건', sub: '...', tone: 'base' }
 * `'4,380건'`은 이미 포맷된 문자열이고 `tone`은 색이다. 서버는 둘 다 주지 않는다.
 * 서버는 `4380`을 주고, 천 단위 구분과 색은 화면이 정한다.
 * 그 형태를 그대로 두면 API를 붙일 때 전부 다시 써야 한다 —
 * 그래서 여기서는 원시 값·코드·ID만 다룬다.
 */

/** 발주처를 대표하는 분야. 화면에 표시할 라벨은 이 코드로 조회한다. */
export type SectorCode = 'public' | 'manufacturing' | 'civic' | 'medical'

/** 브랜드 색 — 화면이 CSS 변수로 푼다. 여기서는 값만 보관한다. */
export type HexColor = `#${string}`

/**
 * 이 발주처 전용 업무 데이터(문서 목록·용어·수치)가 준비됐는지.
 *
 * 왜 타입에 있나: 준비되지 않은 발주처를 선택하게 두면 다른 발주처의 데이터가
 * 그대로 보인다. 실제로 그랬다 — 공공(한국부동산원)을 골라도 요약할 문서 목록에
 * `프레스_작업표준서_SOP-PR-011.pdf`가 떴다. 고르는 행위에 의미가 없는데
 * 의미가 있는 것처럼 보이는 화면이었다.
 *
 * 목록에서 감추지 않고 상태를 표시한다 — 안 만든 것을 없는 것처럼 보이게 하지 않는다.
 * 에이전트 카탈로그(`AgentDefinition.status`)와 같은 어법이다.
 */
export type DomainStatus = 'ready' | 'planned'

export type DomainSummary = {
  id: string
  /** 조직 정식 명칭 */
  orgName: string
  /** 약칭 — 로고·문서번호 접두 등에 쓴다 */
  orgShort: string
  sector: SectorCode
  brandColor: HexColor
  /** 포털 화면의 한 줄 소개 */
  tagline: string
  status: DomainStatus
  /**
   * 첫 화면 상태 칩 — 이 조직에서 이 플랫폼이 어떤 조건으로 도는가.
   *
   * ⚠️ **이 값은 서버가 확인한 상태가 아니다.** 원본 데모의 문구를 그대로 쓴다(D-014).
   * 서버가 붙으면 실제 가동 상태로 바뀐다.
   */
  statusNote: string
  /** 사용자 포털 카드에 적는 이 조직의 대표 업무 4가지 */
  features: string[]
  /** 첫 화면 맨 아래 두 줄 — 사업 맥락과 데이터 취급 */
  footer: [string, string]
}

export type DomainUser = {
  name: string
  dept: string
  title: string
}

export type Domain = DomainSummary & {
  user: DomainUser
  /** 문서번호 접두 (예: 'HBP') — 문서 생성 시 조합한다 */
  docPrefix: string
}

/* ── 표시 규칙은 화면이 아니라 여기서 한 번만 정한다(가이드 §6 "한 곳에서 일관되게") ── */

const SECTOR_LABEL: Record<SectorCode, string> = {
  public: '공공',
  manufacturing: '제조',
  civic: '행정',
  medical: '의료',
}

export function sectorLabel(sector: SectorCode): string {
  return SECTOR_LABEL[sector]
}

/**
 * 관리자 카드에 적는 것.
 *
 * 발주처별로 두지 않는다 — 관리자는 **플랫폼 전체**를 다루므로 어느 발주처를
 * 골라도 같은 일을 한다. 발주처마다 다르게 적으면 그 자체가 거짓말이 된다.
 */
export const ADMIN_FEATURES: string[] = [
  '대시보드 (시스템·GPU·서비스 현황)',
  '모델 학습·배포·서빙 파이프라인 관리',
  '에이전트 태스크플로우 빌더 & 워크플로우',
  '사용자 관리 · 승인 · 이용 통계 · 접근 로그',
]

