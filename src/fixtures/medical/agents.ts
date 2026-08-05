/**
 * 의료(새빛대학교병원) 에이전트 데이터 — 요약·사전 검토·데이터 조회·분석·안전.
 *
 * 네 번째 팩이다. 앞선 팩들에서 뽑아 둔 자리에 값만 채운다.
 *
 * ⚠️ 문구는 행정·심사 관점으로만 쓴다. 환자 개인에 대한 판단을 넣지 않는다.
 */
import type { AnalysisKind, AnalysisResult } from '@entities/analysis/model'
import type { DataSourceOption, QueryResult } from '@entities/dataquery/model'
import type { RegulationSetOption, Violation } from '@entities/review/model'
import type { Hazard } from '@entities/safety/model'
import type { SummaryResult, SummaryStyle } from '@entities/summary/model'

/* ── 문서 요약 ─────────────────────────────────────────────── */

export const MEDICAL_SUMMARIES: Record<string, Record<SummaryStyle, SummaryResult>> = {
  'doc-suh-guide': {
    brief: {
      documentId: 'doc-suh-guide',
      style: 'brief',
      sections: [
        {
          heading: '핵심',
          body: '요양급여 청구와 심사 대응 절차를 정한 지침이다. 청구 전 세 항목을 점검하고, 급여 기준을 초과해 산정할 때는 의학적 필요성을 진료기록에 남기도록 한 것이 핵심 통제점이다.',
        },
      ],
      keywords: [
        { word: '진료기록 근거', weight: 0.95 },
        { word: '사전점검 3항목', weight: 0.88 },
        { word: '이의신청 30일', weight: 0.8 },
        { word: '응급증상 판단', weight: 0.67 },
      ],
      stats: { sourceChars: 662, summaryChars: 118, sectionCount: 1, elapsedSeconds: 6.5 },
    },
    detailed: {
      documentId: 'doc-suh-guide',
      style: 'detailed',
      sections: [
        { heading: '적용 범위', body: '국민건강보험 요양급여 청구와 심사 대응. 외래·입원·응급 청구가 대상이다.' },
        { heading: '사전점검', body: '고가 처치·재료대, 급여 기준 초과 투여, 진료기록 근거 미비 세 가지를 본다. 근거가 확인되지 않으면 보류하고 진료과에 확인을 요청한다.' },
        { heading: '진료기록 근거', body: '급여 기준 초과 산정에는 의학적 필요성을 기록해야 한다. 기록 없이 산정하면 조정되고 사후 회복이 어렵다.' },
        { heading: '심사 결과 처리', body: '조정 통보 후 30일 이내에 이의신청 여부를 정한다. 반복 조정 항목은 청구 전 점검 항목에 추가한다.' },
        { heading: '응급 진료 청구', body: '응급증상 해당 여부로 산정 기준이 달라진다. 판단 근거를 진료기록에 남긴다.' },
      ],
      keywords: [
        { word: '진료기록 근거', weight: 0.95 },
        { word: '사전점검 3항목', weight: 0.88 },
        { word: '이의신청 30일', weight: 0.8 },
        { word: '반복 조정 항목', weight: 0.71 },
        { word: '응급증상 판단', weight: 0.67 },
      ],
      stats: { sourceChars: 662, summaryChars: 402, sectionCount: 5, elapsedSeconds: 8.2 },
    },
    bullet: {
      documentId: 'doc-suh-guide',
      style: 'bullet',
      sections: [
        { heading: '대상', body: '외래·입원·응급 요양급여 청구' },
        { heading: '사전점검', body: '고가 처치·재료대 / 급여 기준 초과 투여 / 기록 근거 미비' },
        { heading: '보류', body: '근거 미확인 시 보류 → 진료과 확인 요청' },
        { heading: '조정 대응', body: '통보 후 30일 내 이의신청 여부 결정 · 반복 항목은 점검에 추가' },
        { heading: '응급', body: '응급증상 해당 여부로 기준 분기 · 판단 근거 기록' },
      ],
      keywords: [
        { word: '보류', weight: 0.9 },
        { word: '기록', weight: 0.85 },
        { word: '30일', weight: 0.72 },
      ],
      stats: { sourceChars: 662, summaryChars: 186, sectionCount: 5, elapsedSeconds: 6.9 },
    },
    table: {
      documentId: 'doc-suh-guide',
      style: 'table',
      sections: [
        { heading: '단계 | 하는 일 | 기한·기준', body: '사전점검 | 3개 항목 확인 | 근거 미확인 시 보류' },
        { heading: '단계 | 하는 일 | 기한·기준', body: '산정 | 기준 초과 시 필요성 기록 | 기록 없으면 조정' },
        { heading: '단계 | 하는 일 | 기한·기준', body: '조정 대응 | 이의신청 여부 결정 | 통보일 +30일' },
        { heading: '단계 | 하는 일 | 기한·기준', body: '응급 청구 | 응급증상 해당 여부 판단 | 근거 기록' },
      ],
      keywords: [
        { word: '기한', weight: 0.88 },
        { word: '기록', weight: 0.84 },
        { word: '보류', weight: 0.7 },
      ],
      stats: { sourceChars: 662, summaryChars: 228, sectionCount: 4, elapsedSeconds: 7.4 },
    },
  },

  'doc-suh-quality': {
    brief: {
      documentId: 'doc-suh-quality',
      style: 'brief',
      sections: [
        {
          heading: '핵심',
          body: '1분기 청구 48,210건의 심사 조정률은 0.71%로 전분기보다 0.09%p 낮아졌다. 사전점검 보류 342건 중 18건은 근거 보완이 끝나지 않았고, 응급의료센터 병상 가동률이 92.1%로 가장 높다.',
        },
      ],
      keywords: [
        { word: '조정률 0.71%', weight: 0.93 },
        { word: '보류 342건', weight: 0.86 },
        { word: '응급 92.1%', weight: 0.8 },
        { word: '미회신 18건', weight: 0.7 },
      ],
      stats: { sourceChars: 438, summaryChars: 124, sectionCount: 1, elapsedSeconds: 5.6 },
    },
    detailed: {
      documentId: 'doc-suh-quality',
      style: 'detailed',
      sections: [
        { heading: '개요', body: '9개 진료과의 청구·병상 운영 지표를 분기 단위로 집계했다.' },
        { heading: '주요 지표', body: '청구 48,210건, 심사 조정률 0.71%(전분기 대비 -0.09%p). 사전점검 보류 342건 중 18건은 근거 보완 미완료다.' },
        { heading: '병상 운영', body: '전체 병상 가동률 88.4%. 응급의료센터가 92.1%로 가장 높고 재실 환자 증가로 입원 대기 시간이 길어지고 있다.' },
        { heading: '개선 과제', body: '급여 기준 초과 투여의 진료기록 근거 미비가 반복 조정 항목으로 남아 있다. 점검 항목에 반영했으나 진료과별 편차가 크다.' },
      ],
      keywords: [
        { word: '조정률 0.71%', weight: 0.93 },
        { word: '보류 342건', weight: 0.86 },
        { word: '응급 92.1%', weight: 0.8 },
        { word: '기록 근거 미비', weight: 0.74 },
      ],
      stats: { sourceChars: 438, summaryChars: 318, sectionCount: 4, elapsedSeconds: 7.1 },
    },
    bullet: {
      documentId: 'doc-suh-quality',
      style: 'bullet',
      sections: [
        { heading: '청구', body: '48,210건 · 조정률 0.71% (-0.09%p)' },
        { heading: '사전점검', body: '보류 342건 · 미회신 18건' },
        { heading: '병상', body: '전체 88.4% · 응급의료센터 92.1%' },
        { heading: '개선 과제', body: '기록 근거 미비 — 진료과별 편차 큼' },
      ],
      keywords: [
        { word: '0.71%', weight: 0.9 },
        { word: '342건', weight: 0.83 },
        { word: '92.1%', weight: 0.76 },
      ],
      stats: { sourceChars: 438, summaryChars: 138, sectionCount: 4, elapsedSeconds: 6.0 },
    },
    table: {
      documentId: 'doc-suh-quality',
      style: 'table',
      sections: [
        { heading: '항목 | 값 | 비고', body: '청구 건수 | 48,210건 | 2026년 1분기' },
        { heading: '항목 | 값 | 비고', body: '심사 조정률 | 0.71% | 전분기 대비 -0.09%p' },
        { heading: '항목 | 값 | 비고', body: '사전점검 보류 | 342건 | 미회신 18건' },
        { heading: '항목 | 값 | 비고', body: '병상 가동률 | 전체 88.4% | 응급의료센터 92.1%' },
      ],
      keywords: [
        { word: '집계', weight: 0.87 },
        { word: '조정률', weight: 0.8 },
        { word: '가동률', weight: 0.73 },
      ],
      stats: { sourceChars: 438, summaryChars: 196, sectionCount: 4, elapsedSeconds: 6.4 },
    },
  },
}

/* ── 문서 사전 검토 ────────────────────────────────────────── */

export const MEDICAL_REVIEW_SETS: RegulationSetOption[] = [
  { code: 'claim', label: '청구 심사지침' },
  { code: 'benefit', label: '요양급여 기준' },
  { code: 'emergency', label: '응급의료 관련 법령' },
  { code: 'labor', label: '복무규정' },
  { code: 'privacy', label: '개인정보 보호지침' },
]

export const MEDICAL_VIOLATIONS_BY_SET: Record<string, Violation[]> = {
  claim: [
    {
      id: 'v-suh-claim-1',
      clause: '진료비 청구 심사지침 제3장',
      severity: 'high',
      type: '진료기록 근거 없이 기준 초과 산정',
      detail:
        '급여 기준을 초과해 산정한 214건에 의학적 필요성 기재가 없습니다. 이 상태로 청구하면 조정되고, 조정분은 사후 이의신청으로 회복하기 어렵습니다.',
      action:
        '해당 214건의 진료기록에 필요성 근거를 보완하거나, 보완이 어려우면 기준 내로 산정을 조정해 청구하십시오.',
    },
    {
      id: 'v-suh-claim-2',
      clause: '진료비 청구 심사지침 제2장',
      severity: 'medium',
      type: '보류 건 회신 지연',
      detail: '사전점검에서 보류한 342건 중 18건이 진료과 회신 없이 남아 있습니다.',
      action: '해당 진료과에 회신 기한을 정해 재요청하고, 기한 내 회신이 없으면 기준 내 산정으로 처리하십시오.',
    },
    {
      id: 'v-suh-claim-3',
      clause: '진료비 청구 심사지침 제4장',
      severity: 'low',
      type: '반복 조정 항목 미반영',
      detail: '직전 분기 반복 조정 항목 3개가 청구 전 점검 항목에 아직 추가되지 않았습니다.',
      action: '점검 항목에 3개를 추가하고 진료과에 안내하십시오.',
    },
  ],

  benefit: [
    {
      id: 'v-suh-benefit-1',
      clause: '국민건강보험 요양급여의 기준에 관한 규칙 제5조',
      severity: 'high',
      type: '재료대 산정 착오',
      detail:
        '재료대 산정 착오 37건이 확인됐습니다. 별도 산정이 안 되는 항목을 별도로 올린 건이 포함돼 있습니다.',
      action: '별도 산정 가능 여부를 고시로 대조한 뒤 착오분을 정정해 청구하십시오.',
    },
    {
      id: 'v-suh-benefit-2',
      clause: '진료비 청구 심사지침 제3장',
      severity: 'medium',
      type: '기준 초과 투여 사유 미기재',
      detail: '급여 기준 초과 투여 91건 중 24건에 초과 사유가 적혀 있지 않습니다.',
      action: '초과 사유를 진료기록에 보완하거나 기준 내 용량으로 정정하십시오.',
    },
  ],

  emergency: [
    {
      id: 'v-suh-emergency-1',
      clause: '진료비 청구 심사지침 제5장',
      severity: 'high',
      type: '응급증상 판단 근거 미기재',
      detail:
        '응급 산정 건 중 12건에 응급증상 해당 여부의 판단 근거가 기록되지 않았습니다. 근거가 없으면 일반 산정으로 조정됩니다.',
      action: '진료기록에 판단 근거를 보완하거나, 해당하지 않으면 일반 산정으로 정정해 청구하십시오.',
    },
  ],

  labor: [
    {
      id: 'v-suh-labor-1',
      clause: '복무규정 제24조',
      severity: 'medium',
      type: '당직 교대 기록 누락',
      detail: '응급의료센터 당직 교대 기록 8건이 누락됐습니다.',
      action: '교대 기록을 보완하고, 누락이 반복되면 기록 방식을 재점검하십시오.',
    },
  ],

  privacy: [
    {
      id: 'v-suh-privacy-1',
      clause: '원내 개인정보 보호지침 제19조',
      severity: 'high',
      type: '가명처리 없이 진료 정보 공유',
      detail:
        '첨부된 분석 자료에 환자 식별이 가능한 진료 정보가 그대로 들어 있습니다. 가명처리와 심의 기록이 확인되지 않습니다.',
      action: '가명처리한 자료로 교체하고, 연구·통계 목적이면 심의를 먼저 거치십시오.',
    },
  ],
}

export const MEDICAL_CLAUSE_COUNT: Record<string, number> = {
  claim: 38,
  benefit: 44,
  emergency: 17,
  labor: 26,
  privacy: 21,
}

/* ── 데이터 조회 ───────────────────────────────────────────── */

export const MEDICAL_QUERY_SOURCES: DataSourceOption[] = [
  { code: 'claim', label: '청구 사전점검', sample: '회신 안 온 보류 건 진료과별로 보여줘' },
  { code: 'bed', label: '병상 운영', sample: '가동률 높은 진료과 순으로 보여줘' },
  { code: 'adjust', label: '심사 조정 이력', sample: '반복 조정 항목 많은 순으로 보여줘' },
]

export const MEDICAL_QUERY_RESULTS: Record<string, QueryResult> = {
  claim: {
    source: 'claim',
    elapsedSeconds: 2.3,
    sql: `SELECT dept, hold_reason, held_on, days_waiting, replied
  FROM suh.claim_precheck
 WHERE quarter = '2026Q1'
   AND status = '보류'
   AND replied = false          -- '회신 안 온'
 ORDER BY days_waiting DESC;`,
    columns: [
      { key: 'dept', label: '진료과', numeric: false },
      { key: 'reason', label: '보류 사유', numeric: false },
      { key: 'held', label: '보류일', numeric: false },
      { key: 'days', label: '대기일', numeric: true },
    ],
    rows: [
      { dept: '내과', reason: '진료기록 근거 미비', held: '2026-03-04', days: 22 },
      { dept: '정형외과', reason: '급여 기준 초과 투여', held: '2026-03-06', days: 20 },
      { dept: '외과', reason: '재료대 산정 착오', held: '2026-03-09', days: 17 },
      { dept: '신경과', reason: '진료기록 근거 미비', held: '2026-03-12', days: 14 },
      { dept: '응급의료센터', reason: '응급증상 판단 근거 미기재', held: '2026-03-15', days: 11 },
    ],
    terms: [
      { phrase: '회신 안 온', column: 'replied', operator: '=', value: 'false' },
      { phrase: '보류', column: 'status', operator: '=', value: "'보류'" },
      { phrase: '진료과별', column: 'dept', operator: 'GROUP BY', value: 'dept' },
    ],
    assumptions: [
      '기간을 명시하지 않아 이번 분기 청구분(2026Q1)으로 한정했습니다.',
      '취하된 청구는 기본 제외했습니다.',
    ],
    unmapped: [
      '"급한" — 우선순위 기준이 정의되지 않아 조건으로 넣지 못했습니다. 대기일로 정렬했습니다.',
    ],
    cautions: [
      '대기일은 보류일 기준입니다. 진료과 회신이 구두로 온 건은 시스템에 안 남아 있을 수 있습니다.',
    ],
  },

  bed: {
    source: 'bed',
    elapsedSeconds: 1.8,
    sql: `SELECT dept, beds, occupied, usage_rate
  FROM suh.bed_operation
 WHERE quarter = '2026Q1'
   AND usage_rate IS NOT NULL
 ORDER BY usage_rate DESC;`,
    columns: [
      { key: 'dept', label: '진료과', numeric: false },
      { key: 'beds', label: '운영 병상', numeric: true },
      { key: 'occ', label: '평균 재원', numeric: true },
      { key: 'rate', label: '가동률(%)', numeric: true },
    ],
    rows: [
      { dept: '응급의료센터', beds: 38, occ: 35.0, rate: 92.1 },
      { dept: '정형외과', beds: 64, occ: 58.4, rate: 91.2 },
      { dept: '내과', beds: 120, occ: 108.7, rate: 90.6 },
      { dept: '외과', beds: 72, occ: 62.9, rate: 87.4 },
      { dept: '신경과', beds: 48, occ: 40.7, rate: 84.8 },
    ],
    terms: [
      { phrase: '가동률 높은', column: 'usage_rate', operator: 'ORDER BY', value: 'DESC' },
      { phrase: '진료과', column: 'dept', operator: 'GROUP BY', value: 'dept' },
      { phrase: '보여줘', column: 'quarter', operator: '=', value: "'2026Q1'" },
    ],
    assumptions: [
      '기간을 명시하지 않아 이번 분기로 한정했습니다.',
      '가동률을 낼 수 없는 진료과는 제외했습니다.',
    ],
    unmapped: ['"과밀한" — 과밀 판정 기준이 정의되지 않아 조건으로 넣지 못했습니다.'],
    cautions: [
      '재활의학과는 리모델링, 주간진료센터는 재원 기준이 달라 값이 없습니다. 0%가 아닙니다.',
    ],
  },

  adjust: {
    source: 'adjust',
    elapsedSeconds: 2.0,
    sql: `SELECT item, adjust_count, quarters_repeated, in_precheck
  FROM suh.adjust_history
 WHERE period >= '2025Q2'
 ORDER BY adjust_count DESC;`,
    columns: [
      { key: 'item', label: '조정 항목', numeric: false },
      { key: 'cnt', label: '조정 건수', numeric: true },
      { key: 'rep', label: '반복 분기', numeric: true },
      { key: 'pre', label: '점검 반영', numeric: false },
    ],
    rows: [
      { item: '기준 초과 투여 사유 미기재', cnt: 312, rep: 4, pre: '반영' },
      { item: '진료기록 근거 미비', cnt: 268, rep: 4, pre: '반영' },
      { item: '재료대 별도 산정 착오', cnt: 141, rep: 3, pre: '미반영' },
      { item: '응급증상 판단 근거 미기재', cnt: 96, rep: 2, pre: '미반영' },
      { item: '중복 산정', cnt: 74, rep: 2, pre: '미반영' },
    ],
    terms: [
      { phrase: '반복 조정', column: 'quarters_repeated', operator: '>=', value: '2' },
      { phrase: '많은 순', column: 'adjust_count', operator: 'ORDER BY', value: 'DESC' },
      { phrase: '항목', column: 'item', operator: 'GROUP BY', value: 'item' },
    ],
    assumptions: [
      "'반복'을 2개 분기 이상 조정된 항목으로 해석했습니다.",
      '집계 기간은 2025년 2분기 이후입니다.',
    ],
    unmapped: ['"금액이 큰" — 조정 금액이 이 자료에 없어 건수로만 정렬했습니다.'],
    cautions: ['조정 건수는 통보 기준이며, 이의신청으로 회복된 건이 포함돼 있습니다.'],
  },
}

/* ── 데이터 분석 ───────────────────────────────────────────── */

export const MEDICAL_ANALYSES: Record<string, Record<AnalysisKind, AnalysisResult>> = {
  'ds-suh-claim': {
    trend: {
      datasetId: 'ds-suh-claim',
      kind: 'trend',
      unit: '%',
      elapsedSeconds: 5.3,
      coverage: 0.91,
      trend: [
        { period: '2025.10', value: 0.94, limit: 0.8 },
        { period: '2025.11', value: 0.89, limit: 0.8 },
        { period: '2025.12', value: 0.85, limit: 0.8 },
        { period: '2026.01', value: 0.8, limit: 0.8 },
        { period: '2026.02', value: 0.74, limit: 0.8 },
        { period: '2026.03', value: 0.71, limit: 0.8 },
      ],
      distribution: [],
      stats: [
        { metric: '심사 조정률', value: '0.71%', change: '-0.09%p', status: 'good' },
        { metric: '관리 기준', value: '0.80%', change: null, status: 'good' },
        { metric: '기준 이하 개월', value: '3개월', change: '2026.01부터', status: 'good' },
      ],
      excludedReasons: [
        '심사 결과가 아직 안 온 4,320건은 조정률 계산에서 제외했습니다.',
      ],
    },
    distribution: {
      datasetId: 'ds-suh-claim',
      kind: 'distribution',
      unit: '건',
      elapsedSeconds: 4.7,
      coverage: 0.91,
      trend: [],
      distribution: [
        { label: '진료기록 근거 미비', count: 214 },
        { label: '급여 기준 초과 투여', count: 91 },
        { label: '재료대 산정 착오', count: 37 },
      ],
      stats: [
        { metric: '사전점검 보류', value: '342건', change: null, status: 'watch' },
        { metric: '최다 사유', value: '기록 근거 미비 214건', change: '전체의 63%', status: 'bad' },
        { metric: '회신 대기', value: '18건', change: '청구 지연', status: 'bad' },
      ],
      excludedReasons: [
        '심사 결과 미회신 4,320건은 사유 분류에 넣지 못했습니다.',
      ],
    },
  },

  'ds-suh-bed': {
    trend: {
      datasetId: 'ds-suh-bed',
      kind: 'trend',
      unit: '%',
      elapsedSeconds: 4.0,
      coverage: 0.78,
      trend: [
        { period: '2025.10', value: 84.2, limit: 90 },
        { period: '2025.11', value: 86.0, limit: 90 },
        { period: '2025.12', value: 87.8, limit: 90 },
        { period: '2026.01', value: 89.4, limit: 90 },
        { period: '2026.02', value: 91.0, limit: 90 },
        { period: '2026.03', value: 92.1, limit: 90 },
      ],
      distribution: [],
      stats: [
        { metric: '응급의료센터 가동률', value: '92.1%', change: '+1.1%p', status: 'bad' },
        { metric: '주의 기준', value: '90%', change: null, status: 'watch' },
        { metric: '기준 초과 개월', value: '2개월', change: '2026.02부터', status: 'bad' },
      ],
      excludedReasons: [
        '재활의학과(리모델링)와 주간진료센터(재원 기준 상이) 2곳은 분모를 낼 수 없어 제외했습니다.',
      ],
    },
    distribution: {
      datasetId: 'ds-suh-bed',
      kind: 'distribution',
      unit: '곳',
      elapsedSeconds: 3.6,
      coverage: 0.78,
      trend: [],
      distribution: [
        { label: '90% 이상', count: 3 },
        { label: '85~90%', count: 2 },
        { label: '85% 미만', count: 2 },
      ],
      stats: [
        { metric: '주의 기준 초과', value: '3곳', change: '응급·정형·내과', status: 'bad' },
        { metric: '평균(집계 7곳)', value: '86.6%', change: null, status: 'watch' },
        { metric: '집계 진료과', value: '7개 / 9개', change: null, status: 'watch' },
      ],
      excludedReasons: [
        '재활의학과·주간진료센터는 값이 없어 평균에서 뺐습니다. 0%가 아닙니다.',
      ],
    },
  },

  'ds-suh-adjust': {
    trend: {
      datasetId: 'ds-suh-adjust',
      kind: 'trend',
      unit: '건',
      elapsedSeconds: 4.4,
      coverage: 1,
      trend: [
        { period: '2025.Q2', value: 402, limit: 300 },
        { period: '2025.Q3', value: 378, limit: 300 },
        { period: '2025.Q4', value: 341, limit: 300 },
        { period: '2026.Q1', value: 298, limit: 300 },
        { period: '2026.Q2', value: 0, limit: 300 },
        { period: '2026.Q3', value: 0, limit: 300 },
      ],
      distribution: [],
      stats: [
        { metric: '이번 분기 조정', value: '298건', change: '-43건', status: 'good' },
        { metric: '관리 기준', value: '300건', change: null, status: 'good' },
        { metric: '점검 미반영 항목', value: '3개', change: '재료대·응급·중복', status: 'bad' },
      ],
      excludedReasons: [],
    },
    distribution: {
      datasetId: 'ds-suh-adjust',
      kind: 'distribution',
      unit: '건',
      elapsedSeconds: 3.9,
      coverage: 1,
      trend: [],
      distribution: [
        { label: '기준 초과 투여 사유 미기재', count: 312 },
        { label: '진료기록 근거 미비', count: 268 },
        { label: '재료대 별도 산정 착오', count: 141 },
        { label: '응급증상 판단 근거 미기재', count: 96 },
        { label: '중복 산정', count: 74 },
      ],
      stats: [
        { metric: '상위 2개 합계', value: '580건', change: '전체의 63%', status: 'watch' },
        { metric: '점검 반영', value: '2개 / 5개', change: '3개 미반영', status: 'bad' },
        { metric: '집계 기간', value: '4개 분기', change: '2025Q2~2026Q1', status: 'good' },
      ],
      excludedReasons: [],
    },
  },
}

/* ── 안전관리계획 (현장 확인) ──────────────────────────────── */

export const MEDICAL_HAZARDS_CREW_2: Hazard[] = [
  {
    id: 'mh-1',
    step: '응급의료센터 과밀 시간대 운영',
    cause: '이동 동선 혼잡 — 이송 장비와 보행 동선 교차',
    frequency: 3,
    severity: 4,
    control: '2인 1조로 1명이 동선 유도, 이송 경로 표시선 운영, 대기 구역 분리',
    residual: '보호자 동반이 많은 시간대에는 동선이 좁아진다. 안내 인력을 추가 배치한다.',
  },
  {
    id: 'mh-2',
    step: '검체·약품 이송',
    cause: '낙상·충돌 — 젖은 바닥 구간 통과',
    frequency: 3,
    severity: 3,
    control: '2인 확인 후 이송, 청소 직후 구간 표시, 미끄럼 방지 신발 착용',
    residual: '청소 표시가 제거된 직후 구간은 확인이 어렵다. 표시 제거 시각을 기록한다.',
  },
  {
    id: 'mh-3',
    step: '병상 조정 안내',
    cause: '대기 지연 설명 중 대인 마찰',
    frequency: 4,
    severity: 2,
    control: '조정 기준과 예상 대기를 먼저 안내, 응대 중 어려움이 생기면 담당 책임자에 인계',
    residual: '대기 시간이 예측과 달라지면 재설명이 필요하다. 변동 시 즉시 알린다.',
  },
  {
    id: 'mh-4',
    step: '야간 당직 근무',
    cause: '피로 누적에 따른 확인 누락',
    frequency: 2,
    severity: 3,
    control: '교대 기록 작성, 연속 당직 제한, 인수인계 시 이중 확인',
    residual: '교대 기록 누락이 반복 지적되고 있다. 기록 방식을 재점검한다.',
  },
]

export const MEDICAL_HAZARDS_CREW_1: Hazard[] = MEDICAL_HAZARDS_CREW_2.map((h) => {
  if (h.id === 'mh-1' || h.id === 'mh-2') {
    return {
      ...h,
      frequency: h.frequency + 1,
      control: h.control
        .replace(/2인 1조로 1명이 동선 유도, /, '')
        .replace(/2인 확인 후 이송, /, ''),
      residual: `${h.residual} 1인 근무라 상호 확인이 불가능하다 — 2인 배치를 권고한다.`,
    }
  }
  return h
})

export const MEDICAL_SAFETY_REFERENCES: string[] = [
  '산업안전보건법 제36조 (위험성평가의 실시)',
  '의료법 제36조 (준수사항)',
  '응급의료에 관한 법률 제31조의2 (응급의료기관의 운영)',
  '진료비 청구 심사지침 제5장 (응급 진료 청구)',
]
