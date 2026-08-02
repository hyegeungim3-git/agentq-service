/**
 * 분석 데이터셋 fixture.
 *
 * 세 개를 둔 이유는 목록을 채우기 위해서가 아니라, **고른 것이 결과를 바꾸는지**를
 * 화면과 테스트가 확인할 수 있어야 하기 때문이다. 예전에는 무엇을 골라도 같은
 * 불량률 추이가 나왔다 — 고르는 행위에 의미가 없는 화면이었다.
 *
 * 수치는 다른 fixture와 같은 세계관을 쓴다.
 * 로트 키 미발행 29%(데이터 조회·기준정보 표준화), 진동 RMS 4.2 / 관리 기준 3.5(작업표준서·회의록),
 * 침탄로 3호기 후단존 편차 -7.8℃(품질동향조사·회의록).
 */
import type { Dataset } from '@entities/dataset/model'

export const DATASETS: Dataset[] = [
  {
    id: 'ds-hardness-lot',
    name: '경도검사_공정조건연계_로트별_2026.xlsx',
    format: 'xlsx',
    rows: 486,
    columns: 24,
    sizeBytes: 2_516_582,
    source: 'MES · 품질검사 연계',
  },
  {
    id: 'ds-furnace-temp',
    name: '침탄로3호기_온도프로파일_2026Q1.csv',
    format: 'csv',
    rows: 12_960,
    columns: 8,
    sizeBytes: 3_250_586,
    source: '설비 데이터 수집 서버',
  },
  {
    id: 'ds-vibration-pdm',
    name: 'PdM_진동트렌드_프레스라인.csv',
    format: 'csv',
    rows: 4_320,
    columns: 6,
    sizeBytes: 1_258_291,
    source: '예지보전 수집기',
  },
]
