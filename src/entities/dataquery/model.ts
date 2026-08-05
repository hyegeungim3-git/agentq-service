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

/**
 * 조회할 데이터 소스.
 *
 * 코드도 이름도 **발주처가 정한다.** 예전에는 '설비 대장·자재 재고·생산 실적'을
 * 여기 못박아 뒀는데, 그건 제조 전용이었다 — 두 번째 발주처를 열자 드러났다.
 */
export type DataSource = string

/** 화면이 고를 수 있는 데이터 소스 */
export type DataSourceOption = {
  code: DataSource
  label: string
  /** 예시 질의 — 빈 입력창만 두면 무엇을 물어야 할지 모른다. 이것도 발주처마다 다르다 */
  sample: string
}

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

