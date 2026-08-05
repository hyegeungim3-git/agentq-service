/**
 * 의료(새빛대학교병원) 문서 인식·보고서·회의록.
 *
 * 네 번째 팩이다. 공장 함수에 값만 넣는다.
 *
 * ⚠️ 인식 대상 문서에도 환자 식별 정보를 넣지 않는다. 마스킹을 보여 주기 위한
 * 개인정보는 **직원 연락처**로 둔다 — 환자 정보를 예시로 만들면 그 자체가
 * 이 제품이 없애려는 것이 된다.
 */
import type { MaskEntry } from '@entities/ocr/model'
import type { ReportType } from '@entities/report/model'
import { makeOcrSimulator, type OcrBaseLine, type OcrCorpus } from '../ocr'
import { makeReportSimulator, type BaseReport } from '../report'
import { makeMeetingSimulator, type MeetingCorpus } from '../meeting'

/* ── 문서 인식 ─────────────────────────────────────────────── */

const OCR_LINES: OcrBaseLine[] = [
  { index: 0, text: '삭감위험 사전점검 결과서', confidence: 0.99, script: 'ko', numeric: false },
  {
    index: 1,
    text: '문서번호: SUH-2026-0071',
    confidence: 0.96,
    script: 'mixed',
    numeric: true,
    tableRow: { label: '문서번호', value: 'SUH-2026-0071' },
  },
  {
    index: 2,
    text: '점검 담당: 서지은  내선: 02-3389-4417',
    confidence: 0.94,
    script: 'ko',
    numeric: false,
    tableRow: { label: '점검 담당', value: '서지은 / 02-3389-4417' },
    maskedText: '점검 담당: 서○○  내선: 02-****-4417',
    maskedTableValue: '서○○ / 02-****-4417',
  },
  {
    index: 3,
    text: '점검 대상: 2026년 1분기 청구 예정 48,210건',
    confidence: 0.93,
    script: 'mixed',
    numeric: true,
    tableRow: { label: '점검 대상', value: '48,210건' },
  },
  {
    index: 4,
    text: '보류: 342건 (근거 미비 214 / 기준 초과 91 / 재료대 착오 37)',
    confidence: 0.86,
    script: 'mixed',
    numeric: true,
    tableRow: { label: '보류', value: '342건' },
    spec: { field: '보류율', value: '0.71%', limit: '관리 기준 0.80% 이하', withinSpec: true },
  },
  {
    index: 5,
    text: '미회신: 18건 (진료과 근거 보완 대기)',
    confidence: 0.81,
    script: 'ko',
    numeric: true,
    tableRow: { label: '미회신', value: '18건' },
    spec: { field: '회신 대기', value: '18건', limit: '0건', withinSpec: false },
  },
  {
    index: 6,
    text: '판정 기준: 요양급여 기준 규칙 · 심사지침 제2장',
    confidence: 0.9,
    script: 'ko',
    numeric: false,
    tableRow: { label: '판정 기준', value: '요양급여 기준 규칙 · 심사지침 제2장' },
  },
  {
    index: 7,
    text: '점검일: 2026-03-20',
    confidence: 0.97,
    script: 'ko',
    numeric: true,
    tableRow: { label: '점검일', value: '2026-03-20' },
    spec: { field: '청구 기한', value: '2026-04-10', limit: '점검일 +21일', withinSpec: true },
  },
]

const OCR_MASKS: MaskEntry[] = [
  { kind: 'name', original: '서지은', masked: '서○○', lineIndex: 2 },
  { kind: 'phone', original: '02-3389-4417', masked: '02-****-4417', lineIndex: 2 },
]

export const MEDICAL_OCR_CORPUS: OcrCorpus = {
  title: '삭감위험 사전점검 결과서',
  lines: OCR_LINES,
  masks: OCR_MASKS,
}

export const simulateMedicalOcr = makeOcrSimulator(MEDICAL_OCR_CORPUS)

/* ── 표준 보고서 ───────────────────────────────────────────── */

export const MEDICAL_REPORT_BASE: Record<ReportType, BaseReport> = {
  weekly: {
    docNo: 'SUH-적정진료관리실-2026-088',
    department: '적정진료관리실',
    period: '2026.03.23 ~ 03.27',
    elapsedSeconds: 5.9,
    pending: [],
    sections: [
      {
        heading: '청구 사전점검',
        core: true,
        facts: ['점검 3,940건, 보류 27건', '미회신 18건 — 최장 대기 22일'],
        brief: '보류 27건, 미회신 18건.',
        body: '이번 주 청구 사전점검은 3,940건으로 27건을 보류했다. 앞선 보류분을 포함해 18건이 진료과 회신 없이 남아 있으며, 최장 대기는 22일이다.',
        source: '삭감위험 사전점검 대장',
      },
      {
        heading: '병상 운영',
        core: true,
        facts: ['응급의료센터 가동률 92.1%', '입원 대기 시간 증가'],
        brief: '응급의료센터 가동률 92.1%.',
        body: '응급의료센터 병상 가동률이 92.1%로 주의 기준(90%)을 넘었다. 재실 환자가 늘어 입원 대기 시간이 길어지고 있어 병상 조정이 필요하다.',
        source: '병상 운영 현황',
      },
      {
        heading: '심사 조정',
        core: false,
        facts: ['이번 주 조정 통보 22건', '반복 항목 3개 점검 미반영'],
        brief: '조정 통보 22건, 점검 미반영 3개.',
        body: '이번 주 조정 통보는 22건이다. 반복 조정 항목 3개(재료대 착오·응급증상 근거·중복 산정)가 아직 청구 전 점검 항목에 반영되지 않았다.',
        source: '심사 결과 회신 자료',
      },
    ],
  },

  monthly: {
    docNo: 'SUH-적정진료관리실-2026-091',
    department: '적정진료관리실',
    period: '2026.03.01 ~ 03.31',
    elapsedSeconds: 7.8,
    pending: ['실장 보고 요약'],
    sections: [
      {
        heading: '월간 지표 종합',
        core: true,
        facts: ['1분기 청구 48,210건, 조정률 0.71%', '전분기 대비 0.09%p 개선'],
        brief: '조정률 0.71%로 개선.',
        body: '1분기 청구는 48,210건이며 심사 조정률은 0.71%로 전분기 대비 0.09%p 낮아졌다. 2026년 1월부터 관리 기준(0.80%) 아래를 유지하고 있다.',
        source: '적정성 평가 결과',
      },
      {
        heading: '사전점검 현황',
        core: true,
        facts: ['보류 342건 — 기록 근거 미비 214건(63%)', '미회신 18건'],
        brief: '보류 342건, 최다 사유는 기록 근거 미비.',
        body: '사전점검에서 342건을 보류했고 그중 진료기록 근거 미비가 214건(63%)으로 가장 많다. 근거 보완이 끝나지 않은 18건은 청구가 미뤄지고 있다.',
        source: '삭감위험 사전점검 결과서',
      },
      {
        heading: '개선 과제',
        core: true,
        facts: ['기록 근거 미비 진료과별 편차 큼', '반복 항목 3개 점검 미반영'],
        brief: '진료과별 편차와 점검 미반영이 과제다.',
        body: '급여 기준 초과 투여의 기록 근거 미비가 반복 조정 1위이며 진료과별 편차가 크다. 반복 항목 3개를 청구 전 점검에 추가하고 진료과 안내가 필요하다.',
        source: '심사 조정 이력 분석',
      },
    ],
  },

  inspection: {
    docNo: 'SUH-적정진료관리실-2026-094',
    department: '적정진료관리실',
    period: '2026.03.20',
    elapsedSeconds: 5.4,
    pending: ['진료과 회신 첨부'],
    sections: [
      {
        heading: '점검 개요',
        core: true,
        facts: ['대상: 2026년 1분기 청구 예정 48,210건', '2인 교차 확인'],
        brief: '1분기 청구분 사전점검.',
        body: '2026년 1분기 청구 예정 48,210건을 대상으로 사전점검을 실시했다. 점검은 2인 교차 확인으로 진행했고 판정 근거를 점검 대장에 기록했다.',
        source: '삭감위험 사전점검 대장',
      },
      {
        heading: '확인 사항',
        core: true,
        facts: ['보류 342건 (근거 미비 214 / 기준 초과 91 / 재료대 37)', '미회신 18건'],
        brief: '보류 342건 중 18건 회신 대기.',
        body: '위험 의심 342건을 보류했다. 근거 미비 214건, 급여 기준 초과 투여 91건, 재료대 산정 착오 37건이다. 이 중 18건은 진료과 근거 보완 회신을 기다리고 있어 청구 기한 관리가 필요하다.',
        source: '삭감위험 사전점검 결과서',
      },
    ],
  },

  quality: {
    docNo: 'SUH-적정진료관리실-2026-097',
    department: '적정진료관리실',
    period: '2026.03.01 ~ 03.31',
    elapsedSeconds: 6.6,
    pending: ['심사 담당 의견'],
    sections: [
      {
        heading: '점검 결과',
        core: true,
        facts: ['청구 완료 건 표본 점검', '지적 61건 — 최다 사유 기록 근거 미비'],
        brief: '표본 점검 지적 61건.',
        body: '청구 완료 건을 표본 점검해 61건을 지적했다. 지적 사유 중 진료기록 근거 미비가 가장 많다.',
        source: '적정성 점검 결과',
      },
      {
        heading: '반복 지적 사항',
        core: false,
        facts: ['재료대 별도 산정 착오', '응급증상 판단 근거 미기재'],
        brief: '재료대와 응급증상 근거가 반복된다.',
        body: '재료대 별도 산정 착오와 응급증상 판단 근거 미기재가 반복 지적되고 있다. 청구 전 점검 항목에 추가하는 것을 검토한다.',
        source: '지적 사항 집계',
      },
    ],
  },

  incident: {
    docNo: 'SUH-환자안전위원회-2026-101',
    department: '환자안전위원회',
    period: '2026.03.22',
    elapsedSeconds: 5.1,
    pending: ['재발 방지 대책', '조치 결과'],
    sections: [
      {
        heading: '발생 개요',
        core: true,
        facts: ['응급의료센터 과밀 시간대 동선 혼잡 사례', '인명 피해 없음'],
        brief: '과밀 시간대 동선 혼잡 사례.',
        body: '3월 22일 응급의료센터 과밀 시간대에 이송 장비와 보행 동선이 교차해 혼잡이 발생했다. 인명 피해는 없었으며, 동선 유도 인력이 배치되지 않은 시간대였다.',
        source: '현장 보고',
      },
      {
        heading: '원인 분석',
        core: true,
        facts: ['재실 환자 증가로 대기 구역 포화', '동선 유도 1인 근무 시간대'],
        brief: '재실 증가와 유도 인력 부족이 겹쳤다.',
        body: '재실 환자가 늘어 대기 구역이 포화된 상태였고, 해당 시간대는 동선 유도 인력이 1인이라 유도 대책이 성립하지 않았다. 위험성평가의 1인 근무 항목과 같은 원인이다.',
        source: '위험성평가 결과',
      },
    ],
  },
}

export const simulateMedicalReport = makeReportSimulator(MEDICAL_REPORT_BASE)

/* ── 회의록 ────────────────────────────────────────────────── */

const MEETING_BASE = {
  title: '3월 4주 환자안전위원회',
  heldOn: '2026-03-26',
  place: '본관 4층 회의실',
  elapsedSeconds: 12.1,
  speakers: [
    { id: 'ms-1', name: '서지은', dept: '적정진료관리실' },
    { id: 'ms-2', name: '하태경', dept: '응급의료센터' },
    { id: 'ms-3', name: '문정아', dept: '간호부' },
  ],
  utterances: [
    {
      speakerId: 'ms-2',
      atSeconds: 52,
      text: '응급의료센터 가동률이 92.1%까지 올라왔습니다. 입원 대기가 길어지고 있습니다.',
    },
    {
      speakerId: 'ms-3',
      atSeconds: 134,
      text: '대기 병상을 우선 조정하면 완화됩니다. 조정 기준을 문서로 정해 주시면 현장에서 적용하겠습니다.',
    },
    {
      speakerId: 'ms-1',
      atSeconds: 226,
      text: '사전점검 보류 342건 중 18건이 진료과 회신 없이 남아 있습니다. 청구 기한이 걱정입니다.',
    },
    {
      speakerId: 'ms-1',
      atSeconds: 288,
      text: '회신 기한을 정해 재요청하겠습니다. 담당은 다음 주에 정하죠.',
    },
    {
      speakerId: 'ms-2',
      atSeconds: 366,
      text: '과밀 시간대 동선 유도 인력도 검토가 필요합니다. 1인 근무 시간대가 있습니다.',
    },
  ],
  decisions: [
    {
      id: 'md-1',
      text: '응급의료센터 재실 환자가 기준을 넘으면 입원 대기 병상을 우선 조정하고, 조정 기준을 문서로 정한다.',
      basis: null,
    },
    {
      id: 'md-2',
      text: '사전점검 보류 중 미회신 18건에 회신 기한을 정해 재요청한다.',
      basis: null,
    },
    {
      id: 'md-3',
      text: '과밀 시간대 동선 유도 인력 배치를 재검토한다.',
      basis: null,
    },
  ],
  actionItems: [
    {
      id: 'ma-1',
      task: '입원 대기 병상 조정 기준 문서화',
      ownerId: 'ms-3',
      due: '2026-04-03',
    },
    {
      id: 'ma-2',
      // 회의에서 "다음 주에 정하죠"로 끝난 항목 — 담당자를 임의로 채우지 않는다
      task: '미회신 18건 회신 기한 재요청',
      ownerId: null,
      due: '2026-03-31',
    },
    {
      id: 'ma-3',
      task: '과밀 시간대 동선 유도 인력 배치안',
      ownerId: 'ms-2',
      due: null,
    },
  ],
}

const MEETING_BASIS: Record<string, { decisionId: string; cite: string }[]> = {
  'doc-suh-guide': [{ decisionId: 'md-2', cite: '진료비청구_심사지침_2026.pdf 제2장 사전점검' }],
  'doc-suh-quality': [
    { decisionId: 'md-1', cite: '2026년_1분기_적정성평가결과.pdf 3. 병상 운영' },
  ],
}

const MEETING_REFERENCE_NAME: Record<string, string> = {
  'doc-suh-guide': '진료비청구_심사지침_2026.pdf',
  'doc-suh-quality': '2026년_1분기_적정성평가결과.pdf',
  'doc-suh-precheck': '삭감위험_사전점검결과서_SUH-2026-0071.pdf',
}

export const MEDICAL_MEETING_CORPUS: MeetingCorpus = {
  base: MEETING_BASE,
  basisByReference: MEETING_BASIS,
  referenceName: MEETING_REFERENCE_NAME,
}

export const simulateMedicalMinutes = makeMeetingSimulator(MEDICAL_MEETING_CORPUS)

/** 명단에는 있지만 발언이 없는 사람과, 논의되지 않은 안건을 일부러 넣었다 */
export const MEDICAL_ATTENDEE_SAMPLE = [
  '서지은,적정진료관리실',
  '하태경,응급의료센터',
  '문정아,간호부',
  '고윤성,원무팀',
].join('\n')

export const MEDICAL_AGENDA_SAMPLE = [
  '응급의료센터 과밀 완화',
  '사전점검 미회신 처리',
  '외래 예약 시스템 개선',
].join('\n')
