/**
 * 분석 데이터셋 모델.
 *
 * 공정 데이터 분석의 입력은 업무 문서가 아니다. 작업표준서 PDF를 골라
 * 불량률 추이를 낼 수는 없다. 처음에는 문서 목록을 그대로 썼는데,
 * 기존 데모와 대조하다 그 부조리가 드러났다 — 원래 입력은
 * `침탄로3호기_온도프로파일.csv (12,960행)` 같은 데이터 파일이다.
 *
 * ⚠️ 표시 문자열을 넣지 않는다. 행 수는 `12960`이고 `'12,960행'`은 화면이 만든다.
 */

export type DatasetFormat = 'csv' | 'xlsx'

export type Dataset = {
  id: string
  name: string
  format: DatasetFormat
  /** 데이터 행 수 — 헤더 제외 */
  rows: number
  columns: number
  sizeBytes: number
  /** 어느 시스템에서 나왔는지. 같은 지표라도 출처가 다르면 해석이 달라진다 */
  source: string
}

/** 목록에서 고를 때 필요한 정보 — 이름만으로는 무엇이 들어 있는지 모른다 */
export function datasetShape(d: Dataset): string {
  return `${d.rows.toLocaleString('ko-KR')}행 × ${d.columns}열 · ${d.format.toUpperCase()}`
}
