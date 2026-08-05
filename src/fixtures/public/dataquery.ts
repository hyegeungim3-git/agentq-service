/**
 * 공공(한국부동산원) 데이터 조회.
 *
 * 자연어 조회의 위험은 **말없이 가정하는 것**이다. '최근 이의신청'에서 '최근'을
 * 며칠로 봤는지, 취하 건을 뺐는지 말하지 않으면 담당자는 틀린 수치를 맞다고 믿는다.
 *
 * 제조 팩과 같은 규칙 — 소스를 바꾸면 컬럼·SQL·가정이 모두 달라져야 한다.
 * 다른 fixture와 같은 세계관을 쓴다: 미처리 18건, 의심 거래 8건, 세종 5.12%.
 */
import type { DataSourceOption, QueryResult } from '@entities/dataquery/model'

export const PUBLIC_QUERY_SOURCES: DataSourceOption[] = [
  { code: 'appeal', label: '이의신청 대장', sample: '처리 기한 임박한 이의신청 보여줘' },
  { code: 'rtms', label: '실거래 신고', sample: '괴리율 높은 순으로 의심 거래 보여줘' },
  { code: 'parcel', label: '표준지 조사 대장', sample: '조사표 미제출 필지 지역별로 보여줘' },
]

export const PUBLIC_QUERY_RESULTS: Record<string, QueryResult> = {
  appeal: {
    source: 'appeal',
    elapsedSeconds: 2.1,
    sql: `SELECT appeal_no, region, filed_on, days_elapsed, stage, owner
  FROM reb.appeal
 WHERE status <> '처리완료'
   AND days_elapsed >= 21        -- '기한 임박' → 처리 기한 30일의 70%
   AND withdrawn = false
 ORDER BY days_elapsed DESC;`,
    columns: [
      { key: 'no', label: '접수번호', numeric: false },
      { key: 'region', label: '지역', numeric: false },
      { key: 'filed', label: '접수일', numeric: false },
      { key: 'days', label: '경과일', numeric: true },
      { key: 'stage', label: '진행 단계', numeric: false },
    ],
    rows: [
      { no: 'AP-2026-0311', region: '울산 남구', filed: '2026-02-26', days: 27, stage: '재조사' },
      { no: 'AP-2026-0318', region: '울산 중구', filed: '2026-02-26', days: 27, stage: '재조사' },
      { no: 'AP-2026-0324', region: '세종', filed: '2026-02-28', days: 25, stage: '위원회 상정 대기' },
      { no: 'AP-2026-0330', region: '대전 유성구', filed: '2026-03-02', days: 23, stage: '검토 중' },
      { no: 'AP-2026-0341', region: '서울 강남구', filed: '2026-03-03', days: 22, stage: '검토 중' },
    ],
    terms: [
      { phrase: '기한 임박', column: 'days_elapsed', operator: '>=', value: '21' },
      { phrase: '이의신청', column: 'status', operator: '<>', value: "'처리완료'" },
      { phrase: '보여줘', column: 'days_elapsed', operator: 'ORDER BY', value: 'DESC' },
    ],
    assumptions: [
      "'기한 임박'을 처리 기한 30일의 70%(21일 경과)로 해석했습니다.",
      '취하된 신청은 기본 제외했습니다.',
    ],
    unmapped: [
      '"중요한" — 우선순위 기준이 정의되지 않아 조건으로 넣지 못했습니다.',
    ],
    cautions: [
      '경과일은 접수일 기준이며, 보완 요구 기간의 산입 여부는 유권해석 2025-0092를 확인하십시오.',
    ],
  },

  rtms: {
    source: 'rtms',
    elapsedSeconds: 1.8,
    sql: `SELECT deal_no, region, deal_date, price_gap_pct, relation, stage
  FROM reb.rtms_deal
 WHERE quarter = '2026Q1'
   AND price_gap_pct >= 30       -- 검증 매뉴얼 제4장 판정 기준
 ORDER BY price_gap_pct DESC;`,
    columns: [
      { key: 'no', label: '신고번호', numeric: false },
      { key: 'region', label: '소재지', numeric: false },
      { key: 'date', label: '계약일', numeric: false },
      { key: 'gap', label: '괴리율(%)', numeric: true },
      { key: 'stage', label: '조치', numeric: false },
    ],
    rows: [
      { no: 'RT-26-10428', region: '서울 서초구', date: '2026-01-18', gap: 41.2, stage: '지자체 통보' },
      { no: 'RT-26-10871', region: '경기 성남시', date: '2026-02-04', gap: 38.6, stage: '지자체 통보' },
      { no: 'RT-26-11255', region: '세종', date: '2026-02-19', gap: 35.1, stage: '지자체 통보' },
      { no: 'RT-26-11640', region: '부산 해운대구', date: '2026-03-02', gap: 33.4, stage: '자료 보완 요구' },
      { no: 'RT-26-11902', region: '대전 서구', date: '2026-03-09', gap: 31.0, stage: '자료 보완 요구' },
    ],
    terms: [
      { phrase: '괴리율 높은 순', column: 'price_gap_pct', operator: 'ORDER BY', value: 'DESC' },
      { phrase: '의심 거래', column: 'price_gap_pct', operator: '>=', value: '30' },
      { phrase: '1분기', column: 'quarter', operator: '=', value: "'2026Q1'" },
    ],
    assumptions: [
      "'의심 거래'를 검증 매뉴얼 제4장의 괴리율 30% 이상으로 해석했습니다.",
      '기간을 명시하지 않아 이번 분기(2026Q1)로 한정했습니다.',
    ],
    unmapped: [
      '"특수관계인" — 신고 자료만으로는 판정할 수 없어 조건으로 넣지 못했습니다. 조치란의 통보 여부로 갈음하십시오.',
    ],
    cautions: [
      '괴리율은 비교 시세 산정 시점에 따라 달라집니다. 판정 근거는 검증 대장 원본으로 확인하십시오.',
    ],
  },

  parcel: {
    source: 'parcel',
    elapsedSeconds: 2.4,
    sql: `SELECT sido, total_parcels, submitted, pending, pending_rate
  FROM reb.survey_progress
 WHERE year = 2026
   AND pending > 0
 ORDER BY pending_rate DESC;`,
    columns: [
      { key: 'sido', label: '시·도', numeric: false },
      { key: 'total', label: '대상 필지', numeric: true },
      { key: 'done', label: '제출', numeric: true },
      { key: 'left', label: '미제출', numeric: true },
      { key: 'rate', label: '미제출률(%)', numeric: true },
    ],
    rows: [
      { sido: '제주', total: 9_840, done: 6_120, left: 3_720, rate: 37.8 },
      { sido: '울산', total: 12_400, done: 9_860, left: 2_540, rate: 20.5 },
      { sido: '강원', total: 31_200, done: 27_940, left: 3_260, rate: 10.4 },
      { sido: '전남', total: 34_600, done: 32_180, left: 2_420, rate: 7.0 },
      { sido: '경북', total: 41_900, done: 39_720, left: 2_180, rate: 5.2 },
    ],
    terms: [
      { phrase: '조사표 미제출', column: 'pending', operator: '>', value: '0' },
      { phrase: '지역별', column: 'sido', operator: 'GROUP BY', value: 'sido' },
      { phrase: '보여줘', column: 'pending_rate', operator: 'ORDER BY', value: 'DESC' },
    ],
    assumptions: [
      "'지역별'을 시·도 단위로 집계했습니다. 시·군·구 단위가 필요하면 다시 물어보십시오.",
      '올해(2026년) 조사분만 집계했습니다.',
    ],
    unmapped: [
      '"늦어지는 이유" — 사유 코드가 대장에 없어 조회할 수 없습니다.',
    ],
    cautions: [
      '제출 건수는 마감(4월 5일) 전 집계라 매일 바뀝니다. 지도의 울산·제주 값이 비어 있는 것과 같은 이유입니다.',
    ],
  },
}
