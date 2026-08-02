/**
 * 데이터 조회 fixture.
 *
 * 소스를 바꾸면 컬럼·SQL·가정이 모두 달라져야 한다. 같은 결과가 나오면
 * 소스 선택이 장식이 된다.
 *
 * assumptions와 unmapped를 일부러 채웠다 — 자연어 조회의 위험은
 * '말없이 가정하는 것'이고, 그걸 보여 주는 화면이 이 에이전트의 값어치다.
 */
import type { DataSource, QueryResult } from '@entities/dataquery/model'

export const QUERY_RESULTS: Record<DataSource, QueryResult> = {
  equipment: {
    source: 'equipment',
    elapsedSeconds: 1.9,
    sql: `SELECT eq_code, eq_name, site, install_year, vib_rms, status
  FROM mes.equipment
 WHERE site = 'P1'
   AND install_year >= 2014      -- '최근' → 내용연수 12년 기준
   AND status <> '폐기'
 ORDER BY vib_rms DESC;`,
    columns: [
      { key: 'code', label: '설비코드', numeric: false },
      { key: 'name', label: '설비명', numeric: false },
      { key: 'year', label: '도입연도', numeric: true },
      { key: 'vib', label: '진동 RMS(mm/s)', numeric: true },
      { key: 'status', label: '상태', numeric: false },
    ],
    rows: [
      { code: 'PRS-C03', name: '400t 서보 프레스', year: 2019, vib: 4.2, status: '점검 필요' },
      { code: 'PRS-C01', name: '400t 서보 프레스', year: 2018, vib: 3.1, status: '정상' },
      { code: 'PRS-C05', name: '200t 크랭크 프레스', year: 2021, vib: 2.8, status: '정상' },
      { code: 'FUR-03', name: '침탄로 3호기', year: 2016, vib: 1.4, status: '점검 필요' },
      { code: 'CNC-A12', name: 'CNC 머시닝센터', year: 2022, vib: 0.9, status: '정상' },
    ],
    terms: [
      { phrase: '창원본사', column: 'site', operator: '=', value: "'P1'" },
      { phrase: '최근', column: 'install_year', operator: '>=', value: '2014' },
      { phrase: '진동 높은 순', column: 'vib_rms', operator: 'ORDER BY', value: 'DESC' },
    ],
    assumptions: [
      "'최근'을 내용연수 12년(2014년 이후 도입)으로 해석했습니다.",
      '폐기 상태 설비는 기본 제외했습니다.',
    ],
    unmapped: ['"문제 있는" — 판정 기준이 정의되지 않아 조건으로 넣지 못했습니다.'],
    cautions: ['진동값은 최근 측정치이며 측정 시점이 설비마다 다릅니다.'],
  },
  material: {
    source: 'material',
    elapsedSeconds: 1.6,
    sql: `SELECT item_code, item_name, on_hand, safety_stock, lead_time_days
  FROM mes.material_stock
 WHERE item_code LIKE 'SUS%'      -- 'SUS 자재' → 접두 일치
 ORDER BY (on_hand - safety_stock) ASC;`,
    columns: [
      { key: 'code', label: '자재코드', numeric: false },
      { key: 'name', label: '품명', numeric: false },
      { key: 'onHand', label: '재고(EA)', numeric: true },
      { key: 'safety', label: '안전재고(EA)', numeric: true },
    ],
    rows: [
      { code: 'SUS304-2211', name: 'SUS304 코일 2.0T', onHand: 1_820, safety: 2_500 },
      { code: 'SUS316-1808', name: 'SUS316 코일 1.8T', onHand: 2_140, safety: 2_000 },
      { code: 'SUS430-1605', name: 'SUS430 코일 1.6T', onHand: 3_960, safety: 1_800 },
    ],
    terms: [
      { phrase: 'SUS 자재', column: 'item_code', operator: 'LIKE', value: "'SUS%'" },
      { phrase: '부족한 순', column: 'on_hand - safety_stock', operator: 'ORDER BY', value: 'ASC' },
    ],
    assumptions: ['안전재고는 자재 마스터에 등록된 값을 그대로 사용했습니다.'],
    unmapped: [],
    cautions: [
      'LIKE 접두 조회라 인덱스를 타지 못합니다. 자재가 늘면 조회가 느려집니다.',
      'SUS304-2211은 안전재고 대비 680EA 부족합니다.',
    ],
  },
  production: {
    source: 'production',
    elapsedSeconds: 2.2,
    sql: `SELECT line_code, work_date, output_qty, defect_qty
  FROM mes.production_daily
 WHERE work_date BETWEEN '2026-03-16' AND '2026-03-20'
   AND lot_key IS NOT NULL        -- 로트 키 없는 실적 제외
 ORDER BY work_date;`,
    columns: [
      { key: 'line', label: '라인', numeric: false },
      { key: 'date', label: '일자', numeric: false },
      { key: 'output', label: '생산(EA)', numeric: true },
      { key: 'defect', label: '불량(EA)', numeric: true },
    ],
    rows: [
      { line: 'CNC-3', date: '03-16', output: 2_480, defect: 9 },
      { line: 'CNC-3', date: '03-17', output: 2_510, defect: 12 },
      { line: 'CNC-3', date: '03-18', output: 2_390, defect: 8 },
      { line: 'CNC-3', date: '03-19', output: 2_520, defect: 11 },
      { line: 'CNC-3', date: '03-20', output: 2_460, defect: 12 },
    ],
    terms: [
      { phrase: '지난주', column: 'work_date', operator: 'BETWEEN', value: "'2026-03-16' ~ '2026-03-20'" },
      { phrase: 'CNC 3라인', column: 'line_code', operator: '=', value: "'CNC-3'" },
    ],
    assumptions: [
      "'지난주'를 월~금(03.16~03.20)으로 해석했습니다. 주말 실적은 제외했습니다.",
      '로트 키가 없는 실적은 공정 조건 추적이 불가해 제외했습니다.',
    ],
    unmapped: [],
    cautions: ['로트 키 결측으로 전체 실적의 29%가 조회에서 빠졌습니다.'],
  },
}
