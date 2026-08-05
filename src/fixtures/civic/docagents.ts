/**
 * 행정(한성시청) 문서 인식·보고서·회의록.
 *
 * 앞의 두 팩에서 뽑아 둔 공장 함수(makeOcrSimulator·makeReportSimulator·
 * makeMeetingSimulator)에 값만 넣는다. 구조를 손댈 일이 없다.
 */
import type { MaskEntry } from '@entities/ocr/model'
import type { ReportType } from '@entities/report/model'
import { makeOcrSimulator, type OcrBaseLine, type OcrCorpus } from '../ocr'
import { makeReportSimulator, type BaseReport } from '../report'
import { makeMeetingSimulator, type MeetingCorpus } from '../meeting'

/* ── 문서 인식 ─────────────────────────────────────────────── */

const OCR_LINES: OcrBaseLine[] = [
  { index: 0, text: '옥외광고물 정비 결과서', confidence: 0.99, script: 'ko', numeric: false },
  {
    index: 1,
    text: '문서번호: HSC-2026-0318',
    confidence: 0.96,
    script: 'mixed',
    numeric: true,
    tableRow: { label: '문서번호', value: 'HSC-2026-0318' },
  },
  {
    index: 2,
    text: '점검자: 배수진  연락처: 010-3382-6604',
    confidence: 0.94,
    script: 'ko',
    numeric: false,
    tableRow: { label: '점검자', value: '배수진 / 010-3382-6604' },
    maskedText: '점검자: 배○○  연락처: 010-****-6604',
    maskedTableValue: '배○○ / 010-****-6604',
  },
  {
    index: 3,
    text: '대상: 중앙동 시청로 88 옥상 간판',
    confidence: 0.92,
    script: 'ko',
    numeric: true,
    tableRow: { label: '대상', value: '중앙동 시청로 88 옥상 간판' },
    maskedText: '대상: 중앙동 시청로 ***',
    maskedTableValue: '중앙동 시청로 ***',
  },
  {
    index: 4,
    text: '점검 결과: 안전 기준 미달 (고정부 부식)',
    confidence: 0.87,
    script: 'ko',
    numeric: false,
    tableRow: { label: '점검 결과', value: '안전 기준 미달' },
    spec: { field: '고정부 상태', value: '부식 진행', limit: '부식 없음', withinSpec: false },
  },
  {
    index: 5,
    text: '풍하중 검토: 0.72 kN/m2 (기준 0.50)',
    confidence: 0.78,
    script: 'mixed',
    numeric: true,
    tableRow: { label: '풍하중', value: '0.72 kN/m²' },
    spec: { field: '풍하중', value: '0.72 kN/m²', limit: '0.50 kN/m² 이하', withinSpec: false },
  },
  {
    index: 6,
    text: '조치: 우선 계고 대상 분류',
    confidence: 0.93,
    script: 'ko',
    numeric: false,
    tableRow: { label: '조치', value: '우선 계고 대상' },
  },
  {
    index: 7,
    text: '점검일: 2026-03-18',
    confidence: 0.97,
    script: 'ko',
    numeric: true,
    tableRow: { label: '점검일', value: '2026-03-18' },
    spec: { field: '계고 기한', value: '2026-04-03', limit: '점검일 +16일', withinSpec: true },
  },
]

const OCR_MASKS: MaskEntry[] = [
  { kind: 'name', original: '배수진', masked: '배○○', lineIndex: 2 },
  { kind: 'phone', original: '010-3382-6604', masked: '010-****-6604', lineIndex: 2 },
  { kind: 'address', original: '중앙동 시청로 88', masked: '중앙동 시청로 ***', lineIndex: 3 },
]

export const CIVIC_OCR_CORPUS: OcrCorpus = {
  title: '옥외광고물 정비 결과서',
  lines: OCR_LINES,
  masks: OCR_MASKS,
}

export const simulateCivicOcr = makeOcrSimulator(CIVIC_OCR_CORPUS)

/* ── 표준 보고서 ───────────────────────────────────────────── */

export const CIVIC_REPORT_BASE: Record<ReportType, BaseReport> = {
  weekly: {
    docNo: 'HSC-민원여권과-2026-207',
    department: '민원여권과',
    period: '2026.03.23 ~ 03.27',
    elapsedSeconds: 5.8,
    pending: [],
    sections: [
      {
        heading: '민원 처리 현황',
        core: true,
        facts: ['접수 612건, 처리 588건 (96.1%)', '법정 기한 도과 9건 — 연장 통지 2건 누락'],
        brief: '접수 612건, 처리 588건, 도과 9건.',
        body: '이번 주 민원 접수는 612건, 처리 완료는 588건으로 96.1%다. 법정 기한을 넘긴 9건 중 2건은 연장 통지 기록이 없어 보완이 필요하다.',
        source: '민원 처리 대장',
      },
      {
        heading: '옥외광고물 정비',
        core: true,
        facts: ['안전 기준 미달 25건 계고 준비', '4월 첫째 주 계고장 발송 예정'],
        brief: '안전 미달 25건 계고 준비 중.',
        body: '실태 점검에서 확인한 안전 기준 미달 25건의 계고장을 준비하고 있다. 강풍 시 낙하 위험이 있어 4월 첫째 주까지 발송한다.',
        source: '옥외광고물 점검 대장',
      },
      {
        heading: '호우 대비 점검',
        core: false,
        facts: ['취약 구간 점검 4월 3일 마감', '강변동 하천 공사 구간 미점검'],
        brief: '취약 구간 점검 진행 중, 강변동 미완료.',
        body: '호우 대비 취약 구간 점검을 진행 중이며 마감은 4월 3일이다. 강변동 하천 공사 구간은 임시 제방 구간이라 우선 확인이 필요하나 아직 점검되지 않았다.',
        source: '재난안전 점검 계획',
      },
    ],
  },

  monthly: {
    docNo: 'HSC-민원여권과-2026-211',
    department: '민원여권과',
    period: '2026.03.01 ~ 03.31',
    elapsedSeconds: 7.6,
    pending: ['국장 보고 요약'],
    sections: [
      {
        heading: '월간 지표 종합',
        core: true,
        facts: ['1분기 접수 8,412건, 처리율 95.2%', '기한 도과 118건 (전분기 대비 +27건)'],
        brief: '처리율 95.2%, 도과 118건.',
        body: '1분기 민원 접수는 8,412건이며 처리율은 95.2%다. 법정 기한 도과는 118건으로 전분기 대비 27건 늘었고, 2월부터 관리 기준(월 100건)을 넘고 있다.',
        source: '민원 처리 통계',
      },
      {
        heading: '지역별 편차',
        core: false,
        facts: ['강변동 인구 1천 명당 18.4건 — 최다', '새들동·청산동은 집계값 없음'],
        brief: '강변동 집중, 2개 동 미집계.',
        body: '인구 대비 접수는 강변동이 1천 명당 18.4건으로 가장 많다. 하천 정비 공사 구간의 소음·분진 민원이 몰린 결과다. 새들동은 행정동 통합, 청산동은 접수 창구 통합으로 집계값이 없다.',
        source: '행정동별 접수 집계',
      },
      {
        heading: '개선 과제',
        core: true,
        facts: ['연장 통지 누락 31건 — 감사 지적 위험', '이송 사유 미기재 9건'],
        brief: '연장 통지 누락이 가장 큰 위험.',
        body: '기한 도과 118건 중 31건에 연장 통지 기록이 없어 감사 지적 위험이 있다. 이송 사유 미기재도 9건 확인돼 서식 개정과 함께 점검이 필요하다.',
        source: '사전 검토 결과',
      },
    ],
  },

  inspection: {
    docNo: 'HSC-건축과-2026-214',
    department: '건축과',
    period: '2026.03.18',
    elapsedSeconds: 5.3,
    pending: ['현장 사진 첨부'],
    sections: [
      {
        heading: '점검 개요',
        core: true,
        facts: ['대상: 중앙동 시청로 88 옥상 간판', '점검자 2인 1조, 현장 확인'],
        brief: '중앙동 옥상 간판 현장 점검.',
        body: '옥외광고물 실태 점검에 따라 중앙동 시청로 88 옥상 간판을 현장 확인했다. 점검은 2인 1조로 실시했다.',
        source: '옥외광고물 점검 대장',
      },
      {
        heading: '확인 사항',
        core: true,
        facts: ['고정부 부식 진행 — 안전 기준 미달', '풍하중 0.72 kN/m² (기준 0.50)'],
        brief: '고정부 부식과 풍하중 초과 확인.',
        body: '고정부 부식이 진행돼 안전 기준에 미달한다. 풍하중은 0.72 kN/m²로 기준 0.50을 넘어 강풍 시 낙하 위험이 있다. 우선 계고 대상으로 분류했다.',
        source: '옥외광고물 정비 결과서',
      },
    ],
  },

  quality: {
    docNo: 'HSC-민원여권과-2026-218',
    department: '민원여권과',
    period: '2026.03.01 ~ 03.31',
    elapsedSeconds: 6.4,
    pending: ['감사 담당 의견'],
    sections: [
      {
        heading: '점검 결과',
        core: true,
        facts: ['처리 완료 8,006건 표본 점검', '지적 46건 (0.6%) — 최다 사유 연장 통지 누락'],
        brief: '표본 점검 지적 46건.',
        body: '처리 완료 민원을 표본 점검해 46건을 지적했다. 지적 사유 중 연장 통지 누락이 가장 많다.',
        source: '민원 처리 점검 결과',
      },
      {
        heading: '반복 지적 사항',
        core: false,
        facts: ['이송 사유 미기재', '현장 확인자 미기재'],
        brief: '이송 사유와 확인자 미기재가 반복된다.',
        body: '이송 사유 미기재와 현장 확인자 미기재가 반복 지적되고 있다. 처리 시스템 입력 항목을 필수로 바꾸는 것을 검토한다.',
        source: '지적 사항 집계',
      },
    ],
  },

  incident: {
    docNo: 'HSC-안전총괄과-2026-221',
    department: '안전총괄과',
    period: '2026.03.20',
    elapsedSeconds: 5.0,
    pending: ['재발 방지 대책', '조치 결과'],
    sections: [
      {
        heading: '발생 개요',
        core: true,
        facts: ['하천 공사 구간 점검 중 미끄러짐 사례', '인명 피해 없음'],
        brief: '하천 공사 구간 점검 중 미끄러짐.',
        body: '3월 20일 강변동 하천 공사 구간 점검 중 임시 제방 상부에서 미끄러짐 사례가 보고됐다. 인명 피해는 없었으며, 1인이 단독 진입한 상황이었다.',
        source: '현장 보고',
      },
      {
        heading: '원인 분석',
        core: true,
        facts: ['1인 점검으로 동행 대책 미성립', '전날 강우로 노면이 젖어 있었음'],
        brief: '1인 점검과 강우 후 진입이 겹쳤다.',
        body: '점검 인원이 1인이라 동행 대책이 성립하지 않았다. 전날 강우로 노면이 젖어 있었으나 진입 제한 기준이 적용되지 않았다. 위험성평가의 1인 작업 항목과 같은 원인이다.',
        source: '위험성평가 결과',
      },
    ],
  },
}

export const simulateCivicReport = makeReportSimulator(CIVIC_REPORT_BASE)

/* ── 회의록 ────────────────────────────────────────────────── */

const MEETING_BASE = {
  title: '3월 4주 재난안전대책회의',
  heldOn: '2026-03-25',
  place: '한성시청 2층 상황실',
  elapsedSeconds: 11.9,
  speakers: [
    { id: 'cs-1', name: '이서연', dept: '민원여권과' },
    { id: 'cs-2', name: '오현석', dept: '안전총괄과' },
    { id: 'cs-3', name: '배수진', dept: '도시재생과' },
  ],
  utterances: [
    {
      speakerId: 'cs-2',
      atSeconds: 48,
      text: '호우 대비 취약 구간 점검이 4월 3일 마감인데, 강변동 하천 공사 구간이 아직 남았습니다.',
    },
    {
      speakerId: 'cs-3',
      atSeconds: 126,
      text: '그 구간은 임시 제방이라 월류 위험이 있습니다. 공사 관계자 입회로 이번 주에 확인하겠습니다.',
    },
    {
      speakerId: 'cs-1',
      atSeconds: 238,
      text: '옥외광고물 안전 기준 미달이 25건입니다. 강풍 예보가 있어 계고를 앞당기는 게 좋겠습니다.',
    },
    {
      speakerId: 'cs-2',
      atSeconds: 292,
      text: '4월 첫째 주까지 계고장을 발송하죠. 발송 담당은 다음 주에 정하겠습니다.',
    },
    {
      speakerId: 'cs-1',
      atSeconds: 371,
      text: '기한 도과가 118건인데 연장 통지가 빠진 게 31건입니다. 감사 지적 위험이 있습니다.',
    },
  ],
  decisions: [
    {
      id: 'cd-1',
      text: '강변동 하천 공사 구간 임시 제방을 이번 주 안에 공사 관계자 입회로 점검한다.',
      basis: null,
    },
    {
      id: 'cd-2',
      text: '옥외광고물 안전 기준 미달 25건의 계고장을 4월 첫째 주까지 발송한다.',
      basis: null,
    },
    {
      id: 'cd-3',
      text: '연장 통지가 누락된 31건에 지연 사유를 서면으로 안내하고 처리 대장에 기록한다.',
      basis: null,
    },
  ],
  actionItems: [
    {
      id: 'ca-1',
      task: '강변동 임시 제방 점검 (공사 관계자 입회)',
      ownerId: 'cs-3',
      due: '2026-03-31',
    },
    {
      id: 'ca-2',
      // 회의에서 "다음 주에 정하겠습니다"로 끝난 항목 — 담당자를 임의로 채우지 않는다
      task: '옥외광고물 계고장 발송',
      ownerId: null,
      due: '2026-04-03',
    },
    {
      id: 'ca-3',
      task: '연장 통지 누락 31건 서면 안내',
      ownerId: 'cs-1',
      due: null,
    },
  ],
}

const MEETING_BASIS: Record<string, { decisionId: string; cite: string }[]> = {
  'doc-hsc-guide': [{ decisionId: 'cd-3', cite: '민원사무_처리지침_2026.pdf 제3장 처리 기한' }],
  'doc-hsc-adcheck': [
    { decisionId: 'cd-2', cite: '옥외광고물_정비결과서_HSC-2026-0318.pdf' },
  ],
}

const MEETING_REFERENCE_NAME: Record<string, string> = {
  'doc-hsc-guide': '민원사무_처리지침_2026.pdf',
  'doc-hsc-stats': '2026년_1분기_민원처리통계.pdf',
  'doc-hsc-adcheck': '옥외광고물_정비결과서_HSC-2026-0318.pdf',
}

export const CIVIC_MEETING_CORPUS: MeetingCorpus = {
  base: MEETING_BASE,
  basisByReference: MEETING_BASIS,
  referenceName: MEETING_REFERENCE_NAME,
}

export const simulateCivicMinutes = makeMeetingSimulator(CIVIC_MEETING_CORPUS)

/** 명단에는 있지만 발언이 없는 사람과, 논의되지 않은 안건을 일부러 넣었다 */
export const CIVIC_ATTENDEE_SAMPLE = [
  '이서연,민원여권과',
  '오현석,안전총괄과',
  '배수진,도시재생과',
  '장민호,환경과',
].join('\n')

export const CIVIC_AGENDA_SAMPLE = [
  '호우 대비 취약 구간 점검',
  '옥외광고물 계고 일정',
  '청사 주차장 개선',
].join('\n')
