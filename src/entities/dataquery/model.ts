/**
 * 데이터 조회 모델.
 *
 * 자연어를 SQL로 바꾸는 기능의 위험은 **말없이 가정하는 것**이다.
 * "최근 설비"에서 '최근'을 몇 년으로 봤는지, 폐기 설비를 뺐는지 말하지 않으면
 * 담당자는 틀린 수치를 맞다고 믿는다.
 *
 * 그래서 결과에 세 가지를 함께 담는다:
 *   ① 질의 조각 → 컬럼·연산자 대조   ② AI가 가정한 조건   ③ 변환하지 못한 표현
 */

export type DataSource = 'equipment' | 'material' | 'production'

export type QueryTerm = {
  /** 사용자가 쓴 표현 */
  phrase: string
  column: string
  operator: string
  value: string
}

export type TableColumn = {
  key: string
  label: string
  /** 숫자 컬럼은 오른쪽 정렬하고 차트 축으로 쓸 수 있다 */
  numeric: boolean
}

export type QueryResult = {
  source: DataSource
  sql: string
  columns: TableColumn[]
  rows: Record<string, string | number>[]
  /** 질의 해석 근거 */
  terms: QueryTerm[]
  /** 질의에 없어 AI가 채운 조건 — 감추면 틀린 수치를 맞다고 믿는다 */
  assumptions: string[]
  /** SQL로 바꾸지 못한 표현 — 못 한 것을 못 했다고 말한다 */
  unmapped: string[]
  /** 결과 해석 시 주의 */
  cautions: string[]
  elapsedSeconds: number
}

export type QueryRequest = {
  source: DataSource
  question: string
}

const SOURCE_LABEL: Record<DataSource, string> = {
  equipment: '설비 대장',
  material: '자재 재고',
  production: '생산 실적',
}

export const DATA_SOURCES = Object.keys(SOURCE_LABEL) as DataSource[]
export const sourceLabel = (s: DataSource): string => SOURCE_LABEL[s]

