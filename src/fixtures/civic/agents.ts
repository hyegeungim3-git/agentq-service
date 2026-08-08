/**
 * 행정(한성시청) 에이전트 데이터 — 요약·사전 검토·데이터 조회·분석·안전.
 *
 * 세 번째 팩이다. 앞의 둘에서 뽑아 둔 자리에 값만 채운다 —
 * 구조를 고칠 일이 없다는 것이 이 팩의 확인 사항이다.
 */
import type { StoredAnalysisKind, AnalysisResult } from '@entities/analysis/model'
import type { DataSourceOption, QueryResult } from '@entities/dataquery/model'
import type { RegulationSetOption, Violation } from '@entities/review/model'
import type { Hazard } from '@entities/safety/model'
import type { SummaryResult, SummaryStyle } from '@entities/summary/model'

/* ── 문서 요약 ─────────────────────────────────────────────── */

export const CIVIC_SUMMARIES: Record<string, Record<SummaryStyle, SummaryResult>> = {
  'doc-hsc-guide': {
    brief: {
      documentId: 'doc-hsc-guide',
      style: 'brief',
      sections: [
        {
          heading: '핵심',
          body: '민원 접수부터 통지까지의 절차와 기한을 정한 지침이다. 소관이 아닌 민원은 2일 이내 이송하고, 기한 내 처리가 어려우면 연장 사유와 기간을 미리 통지하도록 한 것이 핵심 통제점이다.',
        },
      ],
      keywords: [
        { word: '연장 통지', weight: 0.94 },
        { word: '2일 이내 이송', weight: 0.88 },
        { word: '현장 확인 기록', weight: 0.79 },
        { word: '반복 민원 종결', weight: 0.66 },
      ],
      stats: { sourceChars: 618, summaryChars: 112, sectionCount: 1, elapsedSeconds: 6.2 },
    },
    detailed: {
      documentId: 'doc-hsc-guide',
      style: 'detailed',
      sections: [
        { heading: '적용 범위', body: '민원 처리에 관한 법률에 따른 일반·고충 민원. 12개 행정동과 본청 소관이 대상이다.' },
        { heading: '접수와 이송', body: '접수 부서 처리가 원칙이며, 소관이 아니면 2일 이내 이송하고 민원인에게 통지한다. 이송 사유를 적지 않으면 반려한다.' },
        { heading: '처리 기한', body: '기한 내 처리가 어려우면 연장 사유와 기간을 미리 통지한다. 통지 없는 도과는 감사 지적 대상이다.' },
        { heading: '반복·다수인 민원', body: '3회 이상 반복되면 종결할 수 있으나 사유를 서면으로 먼저 안내한다. 다수인 민원은 이해관계인 의견을 함께 듣는다.' },
        { heading: '현장 확인', body: '확인 일자와 확인자를 기록한다. 확인 없이 처리하면 사후 점검에서 소명해야 한다.' },
      ],
      keywords: [
        { word: '연장 통지', weight: 0.94 },
        { word: '2일 이내 이송', weight: 0.88 },
        { word: '현장 확인 기록', weight: 0.79 },
        { word: '서면 안내', weight: 0.7 },
        { word: '감사 지적', weight: 0.61 },
      ],
      stats: { sourceChars: 618, summaryChars: 388, sectionCount: 5, elapsedSeconds: 7.9 },
    },
    bullet: {
      documentId: 'doc-hsc-guide',
      style: 'bullet',
      sections: [
        { heading: '대상', body: '일반·고충 민원 · 12개 행정동과 본청' },
        { heading: '이송', body: '소관 아니면 2일 이내 · 사유 미기재 시 반려' },
        { heading: '기한', body: '연장 사유·기간을 미리 통지 · 통지 없는 도과는 감사 지적' },
        { heading: '반복 민원', body: '3회 이상 종결 가능 · 사전 서면 안내 필수' },
        { heading: '현장 확인', body: '확인 일자·확인자 기록 · 미기록 시 사후 소명' },
      ],
      keywords: [
        { word: '이송', weight: 0.9 },
        { word: '연장', weight: 0.85 },
        { word: '기록', weight: 0.72 },
      ],
      stats: { sourceChars: 618, summaryChars: 176, sectionCount: 5, elapsedSeconds: 6.6 },
    },
    table: {
      documentId: 'doc-hsc-guide',
      style: 'table',
      sections: [
        { heading: '단계 | 하는 일 | 기한·기준', body: '접수 | 소관 판단, 아니면 이송 | 접수일 +2일' },
        { heading: '단계 | 하는 일 | 기한·기준', body: '처리 | 법정 기한 내 처리 | 연장 시 사전 통지' },
        { heading: '단계 | 하는 일 | 기한·기준', body: '현장 확인 | 일자·확인자 기록 | 미기록 시 소명' },
        { heading: '단계 | 하는 일 | 기한·기준', body: '종결 | 반복 3회 이상 | 사전 서면 안내' },
      ],
      keywords: [
        { word: '기한', weight: 0.9 },
        { word: '통지', weight: 0.82 },
        { word: '기록', weight: 0.7 },
      ],
      stats: { sourceChars: 618, summaryChars: 214, sectionCount: 4, elapsedSeconds: 7.1 },
    },
  },

  'doc-hsc-stats': {
    brief: {
      documentId: 'doc-hsc-stats',
      style: 'brief',
      sections: [
        {
          heading: '핵심',
          body: '1분기 민원 접수 8,412건 중 8,006건(95.2%)을 처리했다. 법정 기한을 넘긴 민원은 118건으로 전분기보다 27건 늘었고, 강변동의 인구 대비 접수가 가장 많다.',
        },
      ],
      keywords: [
        { word: '기한 도과 118건', weight: 0.93 },
        { word: '처리율 95.2%', weight: 0.86 },
        { word: '강변동 집중', weight: 0.78 },
        { word: '옥외광고물 1,286건', weight: 0.64 },
      ],
      stats: { sourceChars: 412, summaryChars: 108, sectionCount: 1, elapsedSeconds: 5.4 },
    },
    detailed: {
      documentId: 'doc-hsc-stats',
      style: 'detailed',
      sections: [
        { heading: '개요', body: '12개 행정동과 본청 소관 민원의 접수·처리 현황을 집계했다.' },
        { heading: '주요 지표', body: '접수 8,412건, 처리 완료 8,006건(95.2%). 법정 기한 도과 118건으로 전분기 대비 27건 증가.' },
        { heading: '유형별 현황', body: '도로·시설 보수 2,140건이 가장 많고 옥외광고물 관련이 1,286건이다. 광고물은 정비 계고 이후 급증했다.' },
        { heading: '지역별 편차', body: '강변동의 인구 대비 접수가 가장 많다. 하천 정비 공사 구간의 소음·분진 민원 집중이 원인으로 분석된다.' },
      ],
      keywords: [
        { word: '기한 도과 118건', weight: 0.93 },
        { word: '처리율 95.2%', weight: 0.86 },
        { word: '강변동 집중', weight: 0.78 },
        { word: '도로·시설 2,140건', weight: 0.69 },
      ],
      stats: { sourceChars: 412, summaryChars: 296, sectionCount: 4, elapsedSeconds: 6.8 },
    },
    bullet: {
      documentId: 'doc-hsc-stats',
      style: 'bullet',
      sections: [
        { heading: '접수·처리', body: '접수 8,412 · 처리 8,006 (95.2%)' },
        { heading: '기한 도과', body: '118건 · 전분기 대비 +27건' },
        { heading: '유형', body: '도로·시설 2,140 · 옥외광고물 1,286' },
        { heading: '지역', body: '강변동 인구 대비 최다 — 하천 공사 구간' },
      ],
      keywords: [
        { word: '118건', weight: 0.9 },
        { word: '95.2%', weight: 0.84 },
        { word: '강변동', weight: 0.75 },
      ],
      stats: { sourceChars: 412, summaryChars: 132, sectionCount: 4, elapsedSeconds: 5.8 },
    },
    table: {
      documentId: 'doc-hsc-stats',
      style: 'table',
      sections: [
        { heading: '항목 | 값 | 비고', body: '접수 | 8,412건 | 12개 동 + 본청' },
        { heading: '항목 | 값 | 비고', body: '처리 완료 | 8,006건 | 95.2%' },
        { heading: '항목 | 값 | 비고', body: '기한 도과 | 118건 | 전분기 대비 +27건' },
        { heading: '항목 | 값 | 비고', body: '최다 지역 | 강변동 | 인구 1천 명당 18.4건' },
      ],
      keywords: [
        { word: '집계', weight: 0.88 },
        { word: '도과', weight: 0.8 },
        { word: '강변동', weight: 0.72 },
      ],
      stats: { sourceChars: 412, summaryChars: 188, sectionCount: 4, elapsedSeconds: 6.1 },
    },
  },
}

/* ── 문서 사전 검토 ────────────────────────────────────────── */

export const CIVIC_REVIEW_SETS: RegulationSetOption[] = [
  { code: 'civil', label: '민원사무 처리지침' },
  { code: 'ad', label: '옥외광고물 조례' },
  { code: 'disaster', label: '재난안전 점검 지침' },
  { code: 'labor', label: '복무규정' },
  { code: 'security', label: '개인정보 보호 지침' },
]

export const CIVIC_VIOLATIONS_BY_SET: Record<string, Violation[]> = {
  civil: [
    {
      id: 'v-hsc-civil-1',
      clause: '민원사무 처리지침 제3장',
      severity: 'high',
      type: '연장 통지 없이 기한 도과',
      detail:
        '기한을 넘긴 118건 중 31건에 연장 통지 기록이 없습니다. 통지 없는 기한 도과는 감사 지적 대상입니다.',
      action:
        '31건의 연장 통지 여부를 확인하고, 누락분은 지연 사유를 서면으로 안내한 뒤 처리 대장에 기록하십시오.',
    },
    {
      id: 'v-hsc-civil-2',
      clause: '민원사무 처리지침 제2장',
      severity: 'medium',
      type: '이송 사유 미기재',
      detail: '타 부서로 이송한 42건 중 9건에 이송 사유가 적혀 있지 않습니다.',
      action: '이송 사유를 보완해 재이송하거나, 접수 부서에서 직접 처리하도록 조정하십시오.',
    },
    {
      id: 'v-hsc-civil-3',
      clause: '민원사무 처리지침 제5장',
      severity: 'low',
      type: '현장 확인자 미기재',
      detail: '현장 확인을 실시한 건 중 6건에 확인자가 기재되지 않았습니다.',
      action: '확인자를 처리 대장에 추가 기재하십시오.',
    },
  ],

  ad: [
    {
      id: 'v-hsc-ad-1',
      clause: '한성시 옥외광고물 조례 제9조',
      severity: 'high',
      type: '우선 계고 대상 미분류',
      detail:
        '안전 기준 미달 25건 중 7건이 우선 계고 대상으로 분류되지 않았습니다. 강풍 시 낙하 위험이 있는 광고물입니다.',
      action: '7건을 우선 계고 대상으로 재분류하고 계고장 발송 일정을 잡으십시오.',
    },
    {
      id: 'v-hsc-ad-2',
      clause: '옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 법률 제3조',
      severity: 'medium',
      type: '허가 대조 근거 누락',
      detail: '무허가 판정 138건 중 22건에 허가 대장 대조 기록이 없습니다.',
      action: '허가 대장과 대조한 결과를 점검 대장에 기록한 뒤 판정을 확정하십시오.',
    },
  ],

  disaster: [
    {
      id: 'v-hsc-disaster-1',
      clause: '재난안전 점검 지침 제4장',
      severity: 'high',
      type: '취약 구간 점검 미완료',
      detail:
        '호우 대비 점검 대상 구간 중 강변동 하천 공사 구간이 아직 점검되지 않았습니다. 임시 제방 구간이라 월류 위험이 있습니다.',
      action: '4월 3일 마감 전에 임시 제방 상태를 확인하고 확인 일자·확인자를 점검 대장에 기록하십시오.',
    },
  ],

  labor: [
    {
      id: 'v-hsc-labor-1',
      clause: '복무규정 제28조',
      severity: 'medium',
      type: '현장 출장 사전 등록 누락',
      detail: '현장 확인 출장 11건이 출장 계획에 등록되지 않았습니다.',
      action: '사후 승인 문서를 첨부하거나 출장 계획을 변경 신청하십시오.',
    },
  ],

  security: [
    {
      id: 'v-hsc-security-1',
      clause: '한성시 개인정보 보호 지침 제14조',
      severity: 'high',
      type: '민원인 개인정보 포함 자료 공유',
      detail:
        '첨부된 통계 자료에 민원인 성명과 연락처가 그대로 남아 있습니다. 비식별 조치 기록이 확인되지 않습니다.',
      action: '개인정보를 비식별 처리한 사본으로 교체하고, 외부 공표가 필요하면 심의를 먼저 거치십시오.',
    },
  ],
}

export const CIVIC_CLAUSE_COUNT: Record<string, number> = {
  civil: 36,
  ad: 22,
  disaster: 19,
  labor: 28,
  security: 24,
}

/* ── 데이터 조회 ───────────────────────────────────────────── */

export const CIVIC_QUERY_SOURCES: DataSourceOption[] = [
  { code: 'civil', label: '민원 처리 대장', sample: '기한 넘긴 민원 부서별로 보여줘' },
  { code: 'ad', label: '옥외광고물 점검', sample: '안전 기준 미달 광고물 보여줘' },
  { code: 'dong', label: '행정동 접수 현황', sample: '인구 대비 접수 많은 동 순으로 보여줘' },
]

export const CIVIC_QUERY_RESULTS: Record<string, QueryResult> = {
  civil: {
    source: 'civil',
    elapsedSeconds: 2.0,
    sql: `SELECT dept, civil_type, filed_on, days_over, notified
  FROM hsc.civil_complaint
 WHERE quarter = '2026Q1'
   AND days_over > 0             -- '기한 넘김' → 법정 기한 초과
   AND status <> '취하'
 ORDER BY days_over DESC;`,
    columns: [
      { key: 'dept', label: '부서', numeric: false },
      { key: 'type', label: '민원 유형', numeric: false },
      { key: 'filed', label: '접수일', numeric: false },
      { key: 'over', label: '초과일', numeric: true },
      { key: 'notified', label: '연장 통지', numeric: false },
    ],
    rows: [
      { dept: '도시재생과', type: '도로·시설 보수', filed: '2026-01-19', over: 21, notified: '없음' },
      { dept: '건축과', type: '옥외광고물', filed: '2026-02-02', over: 17, notified: '있음' },
      { dept: '환경과', type: '소음·분진', filed: '2026-02-11', over: 12, notified: '없음' },
      { dept: '교통행정과', type: '주정차', filed: '2026-02-24', over: 8, notified: '있음' },
      { dept: '민원여권과', type: '증명 발급', filed: '2026-03-04', over: 3, notified: '있음' },
    ],
    terms: [
      { phrase: '기한 넘긴', column: 'days_over', operator: '>', value: '0' },
      { phrase: '부서별', column: 'dept', operator: 'GROUP BY', value: 'dept' },
      { phrase: '보여줘', column: 'days_over', operator: 'ORDER BY', value: 'DESC' },
    ],
    assumptions: [
      "'기한'을 법정 처리 기한으로 해석했습니다. 내부 목표 기한은 따로 있습니다.",
      '취하된 민원은 기본 제외했습니다.',
    ],
    unmapped: ['"악성" — 판정 기준이 정의되지 않아 조건으로 넣지 못했습니다.'],
    cautions: [
      '연장 통지 "없음"이 곧 위반은 아닙니다. 통지 기록이 종이로만 남은 건이 있어 대장 확인이 필요합니다.',
    ],
  },

  ad: {
    source: 'ad',
    elapsedSeconds: 1.7,
    sql: `SELECT ad_no, dong, kind, defect, risk_level
  FROM hsc.outdoor_ad
 WHERE inspected_quarter = '2026Q1'
   AND defect = '안전 기준 미달'
 ORDER BY risk_level DESC;`,
    columns: [
      { key: 'no', label: '관리번호', numeric: false },
      { key: 'dong', label: '소재 동', numeric: false },
      { key: 'kind', label: '광고물 종류', numeric: false },
      { key: 'risk', label: '위험도', numeric: false },
      { key: 'stage', label: '조치', numeric: false },
    ],
    rows: [
      { no: 'AD-26-0142', dong: '중앙동', kind: '옥상 간판', risk: '높음', stage: '우선 계고' },
      { no: 'AD-26-0177', dong: '강변동', kind: '돌출 간판', risk: '높음', stage: '우선 계고' },
      { no: 'AD-26-0203', dong: '신흥동', kind: '현수막 게시대', risk: '보통', stage: '계고 예정' },
      { no: 'AD-26-0244', dong: '대학동', kind: '벽면 간판', risk: '보통', stage: '계고 예정' },
      { no: 'AD-26-0281', dong: '상도동', kind: '돌출 간판', risk: '보통', stage: '미분류' },
    ],
    terms: [
      { phrase: '안전 기준 미달', column: 'defect', operator: '=', value: "'안전 기준 미달'" },
      { phrase: '광고물', column: 'inspected_quarter', operator: '=', value: "'2026Q1'" },
      { phrase: '보여줘', column: 'risk_level', operator: 'ORDER BY', value: 'DESC' },
    ],
    assumptions: [
      '기간을 명시하지 않아 이번 분기 점검분(2026Q1)으로 한정했습니다.',
      '철거 완료분은 제외했습니다.',
    ],
    unmapped: ['"위험한" — 위험도 등급과 어느 정도로 대응되는지 정의가 없어 조건으로 넣지 못했습니다.'],
    cautions: ['위험도는 점검자 판정이며 풍속 조건에 따라 달라집니다.'],
  },

  dong: {
    source: 'dong',
    elapsedSeconds: 2.2,
    sql: `SELECT dong, population, filed, filed_per_1k
  FROM hsc.complaint_by_dong
 WHERE quarter = '2026Q1'
   AND filed_per_1k IS NOT NULL
 ORDER BY filed_per_1k DESC;`,
    columns: [
      { key: 'dong', label: '행정동', numeric: false },
      { key: 'pop', label: '인구', numeric: true },
      { key: 'filed', label: '접수', numeric: true },
      { key: 'rate', label: '1천 명당', numeric: true },
    ],
    rows: [
      { dong: '강변동', pop: 24_100, filed: 443, rate: 18.4 },
      { dong: '중앙동', pop: 31_800, filed: 417, rate: 13.1 },
      { dong: '신흥동', pop: 19_600, filed: 243, rate: 12.4 },
      { dong: '대학동', pop: 27_400, filed: 323, rate: 11.8 },
      { dong: '상도동', pop: 22_900, filed: 234, rate: 10.2 },
    ],
    terms: [
      { phrase: '인구 대비', column: 'filed_per_1k', operator: 'ORDER BY', value: 'DESC' },
      { phrase: '접수 많은', column: 'filed_per_1k', operator: 'IS NOT', value: 'NULL' },
      { phrase: '동', column: 'dong', operator: 'GROUP BY', value: 'dong' },
    ],
    assumptions: [
      "'인구 대비'를 인구 1천 명당 접수 건수로 계산했습니다.",
      '집계값이 없는 새들동·청산동은 제외했습니다.',
    ],
    unmapped: ['"민원이 심한" — 심각도 기준이 없어 접수 건수로만 정렬했습니다.'],
    cautions: [
      '새들동은 3월 행정동 통합, 청산동은 접수 창구 본청 통합으로 값이 없습니다. 0건이 아닙니다.',
    ],
  },
}

/* ── 데이터 분석 ───────────────────────────────────────────── */

export const CIVIC_ANALYSES: Record<string, Record<StoredAnalysisKind, AnalysisResult>> = {
  'ds-hsc-civil': {
    trend: {
      datasetId: 'ds-hsc-civil',
      kind: 'trend',
      unit: '건',
      elapsedSeconds: 5.0,
      coverage: 0.88,
      trend: [
        { period: '2025.10', value: 71, limit: 100 },
        { period: '2025.11', value: 78, limit: 100 },
        { period: '2025.12', value: 84, limit: 100 },
        { period: '2026.01', value: 96, limit: 100 },
        { period: '2026.02', value: 108, limit: 100 },
        { period: '2026.03', value: 118, limit: 100 },
      ],
      distribution: [],
      stats: [
        { metric: '기한 도과(분기)', value: '118건', change: '+27건', status: 'bad' },
        { metric: '관리 기준', value: '100건', change: null, status: 'watch' },
        { metric: '기준 초과 개월', value: '2개월', change: '2026.02부터', status: 'bad' },
      ],
      excludedReasons: [
        '종이 접수 1,012건은 처리 일자가 전산에 없어 도과 판정에서 제외했습니다.',
      ],
    },
    distribution: {
      datasetId: 'ds-hsc-civil',
      kind: 'distribution',
      unit: '건',
      elapsedSeconds: 4.4,
      coverage: 0.88,
      trend: [],
      distribution: [
        { label: '도로·시설 보수', count: 41 },
        { label: '옥외광고물', count: 29 },
        { label: '소음·분진', count: 24 },
        { label: '주정차', count: 15 },
        { label: '기타', count: 9 },
      ],
      stats: [
        { metric: '최다 유형', value: '도로·시설 41건', change: '전체의 35%', status: 'watch' },
        { metric: '상위 2개 합계', value: '70건', change: '전체의 59%', status: 'watch' },
        { metric: '연장 통지 없음', value: '31건', change: '감사 지적 대상', status: 'bad' },
      ],
      excludedReasons: [
        '종이 접수 1,012건은 유형 코드가 없어 분류에 넣지 못했습니다.',
      ],
    },
  },

  'ds-hsc-ad': {
    trend: {
      datasetId: 'ds-hsc-ad',
      kind: 'trend',
      unit: '%',
      elapsedSeconds: 4.1,
      coverage: 0.97,
      trend: [
        { period: '2025.10', value: 4.2, limit: 8 },
        { period: '2025.11', value: 4.8, limit: 8 },
        { period: '2025.12', value: 5.1, limit: 8 },
        { period: '2026.01', value: 5.9, limit: 8 },
        { period: '2026.02', value: 6.4, limit: 8 },
        { period: '2026.03', value: 6.7, limit: 8 },
      ],
      distribution: [],
      stats: [
        { metric: '위반 의심 비율', value: '6.7%', change: '+0.3%p', status: 'watch' },
        { metric: '점검 대상', value: '3,180건', change: null, status: 'good' },
        { metric: '안전 기준 미달', value: '25건', change: '우선 계고', status: 'bad' },
      ],
      excludedReasons: ['철거 완료 96건은 점검 대상에서 제외했습니다.'],
    },
    distribution: {
      datasetId: 'ds-hsc-ad',
      kind: 'distribution',
      unit: '건',
      elapsedSeconds: 3.8,
      coverage: 0.97,
      trend: [],
      distribution: [
        { label: '무허가 표시', count: 138 },
        { label: '허가 내용과 다름', count: 51 },
        { label: '안전 기준 미달', count: 25 },
      ],
      stats: [
        { metric: '위반 의심', value: '214건', change: null, status: 'watch' },
        { metric: '최다 유형', value: '무허가 138건', change: '전체의 64%', status: 'watch' },
        { metric: '우선 계고', value: '25건', change: '낙하 위험', status: 'bad' },
      ],
      excludedReasons: ['철거 완료 96건은 점검 대상에서 제외했습니다.'],
    },
  },

  'ds-hsc-dong': {
    trend: {
      datasetId: 'ds-hsc-dong',
      kind: 'trend',
      unit: '건',
      elapsedSeconds: 3.2,
      coverage: 1,
      trend: [
        { period: '2025.10', value: 9.2, limit: 12 },
        { period: '2025.11', value: 10.1, limit: 12 },
        { period: '2025.12', value: 12.6, limit: 12 },
        { period: '2026.01', value: 14.8, limit: 12 },
        { period: '2026.02', value: 16.9, limit: 12 },
        { period: '2026.03', value: 18.4, limit: 12 },
      ],
      distribution: [],
      stats: [
        { metric: '강변동 1천 명당', value: '18.4건', change: '+1.5건', status: 'bad' },
        { metric: '주의 기준', value: '12건', change: null, status: 'watch' },
        { metric: '집계 동', value: '10개 / 12개', change: '새들·청산 제외', status: 'watch' },
      ],
      excludedReasons: [
        '새들동은 3월 행정동 통합, 청산동은 접수 창구 본청 통합으로 집계값이 없습니다.',
      ],
    },
    distribution: {
      datasetId: 'ds-hsc-dong',
      kind: 'distribution',
      unit: '곳',
      elapsedSeconds: 3.0,
      coverage: 1,
      trend: [],
      distribution: [
        { label: '12건 이상', count: 3 },
        { label: '9~12건', count: 3 },
        { label: '6~9건', count: 4 },
      ],
      stats: [
        { metric: '주의 기준 초과', value: '3곳', change: '강변·중앙·신흥', status: 'bad' },
        { metric: '평균(집계 10곳)', value: '10.6건', change: null, status: 'watch' },
        { metric: '집계 동', value: '10개 / 12개', change: null, status: 'watch' },
      ],
      excludedReasons: [
        '새들동·청산동은 집계값이 없어 평균에서 뺐습니다. 0건이 아닙니다.',
      ],
    },
  },
}

/* ── 안전관리계획 (현장 확인) ──────────────────────────────── */

export const CIVIC_HAZARDS_CREW_2: Hazard[] = [
  {
    id: 'ch-1',
    step: '하천 공사 구간 점검',
    cause: '제방 붕괴·추락 — 임시 제방 상부 보행',
    frequency: 3,
    severity: 5,
    control: '2인 1조 동행, 구명조끼 착용, 공사 관계자 입회 후 진입, 강우 시 진입 금지',
    residual: '강우 예보가 빗나가면 진입 중 수위가 오를 수 있다. 실시간 수위를 확인하며 진행한다.',
  },
  {
    id: 'ch-2',
    step: '옥외광고물 현장 확인',
    cause: '낙하물 충격 — 안전 기준 미달 간판 하부 접근',
    frequency: 3,
    severity: 4,
    control: '2인 1조로 1명이 상부 경계, 안전모 착용, 강풍주의보 시 확인 연기',
    residual: '보행자 통행을 통제할 권한이 없다. 관리 주체에 통제를 요청한다.',
  },
  {
    id: 'ch-3',
    step: '민원 현장 대면',
    cause: '항의 과열에 따른 대인 마찰',
    frequency: 4,
    severity: 2,
    control: '방문 목적·근거를 먼저 고지, 신분증 제시, 과열 시 중단하고 부서장에 보고',
    residual: '반복 방문 민원인은 고지해도 마찰이 남는다. 서면 안내로 전환한다.',
  },
  {
    id: 'ch-4',
    step: '하절기 외업',
    cause: '온열질환 — 폭염 경보 중 장시간 현장 확인',
    frequency: 2,
    severity: 3,
    control: '체감온도 33℃ 이상이면 시간당 15분 휴식, 이동 차량 내 냉방 확보',
    residual: '그늘이 없는 구간이 있다. 그런 구간은 오전에 배치한다.',
  },
]

export const CIVIC_HAZARDS_CREW_1: Hazard[] = CIVIC_HAZARDS_CREW_2.map((h) => {
  if (h.id === 'ch-1' || h.id === 'ch-2') {
    return {
      ...h,
      frequency: h.frequency + 1,
      control: h.control.replace(/2인 1조 동행, /, '').replace(/2인 1조로 1명이 상부 경계, /, ''),
      residual: `${h.residual} 1인 확인이라 사고 시 즉시 대응할 사람이 없다 — 2인 배치를 권고한다.`,
    }
  }
  return h
})

export const CIVIC_SAFETY_REFERENCES: string[] = [
  '산업안전보건법 제36조 (위험성평가의 실시)',
  '자연재해대책법 제33조 (재해예방을 위한 점검)',
  '민원사무 처리지침 제5장 (현장 확인)',
  '한성시 옥외광고물 조례 제9조 (안전 기준 미달 광고물)',
]
