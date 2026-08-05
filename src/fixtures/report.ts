/**
 * 보고서 fixture. 유형을 바꾸면 절 구성이 달라져야 한다 —
 * 무엇을 골라도 같은 보고서가 나오면 유형 선택이 장식이 된다.
 *
 * pendingFields를 일부러 남겼다. 전부 자동으로 채워지면
 * '사람이 확인해야 하는 칸'을 보여 주는 화면이 죽은 코드가 된다.
 *
 * ⚠️ `simulateReport`는 **서버가 할 일의 대역**이다. 실제 생성 모델이 붙으면
 * 이 파일은 사라지고 `shared/api/report`가 엔드포인트를 부른다.
 *
 * 문체마다 문장을 따로 갖고 있는 이유: 같은 문장을 기계적으로 변형하면
 * 어색한 한국어가 나온다. 공식체는 사실 항목(facts), 요약체는 한 줄(brief),
 * 상세체는 배경까지(body) — 셋을 각각 쓴다.
 */
import type {
  ReportLength,
  ReportRequest,
  ReportResult,
  ReportSection,
  ReportTone,
  ReportType,
} from '@entities/report/model'

export type BaseSection = {
  heading: string
  /** 단문에도 남는 핵심 절인가 */
  core: boolean
  /** 공식체 — 개조식 항목 */
  facts: string[]
  /** 요약체 — 한 줄 */
  brief: string
  /** 상세체 — 배경·근거를 담은 문장 */
  body: string
  source: string
}

export type BaseReport = {
  docNo: string
  department: string
  period: string
  sections: BaseSection[]
  /** 이 유형에서 자동으로 닿지 못하는 칸 */
  pending: string[]
  elapsedSeconds: number
}

export const REPORT_BASE: Record<ReportType, BaseReport> = {
  weekly: {
    docNo: 'HBP-생산기술-2026-041',
    department: '생산기술팀',
    period: '2026.03.16 ~ 03.20',
    elapsedSeconds: 6.4,
    pending: [],
    sections: [
      {
        heading: '생산 실적',
        core: true,
        facts: [
          '브래킷 가공 12,360EA 생산 (계획 12,000EA 대비 103%)',
          '프레스 2라인 금형 교체 2회, 평균 27분 (표준 25분 대비 2분 초과)',
        ],
        brief: '생산 계획 대비 103% 달성, 금형 교체 시간은 표준 초과.',
        body: 'CNC 3라인 브래킷 가공 12,360EA 생산(계획 12,000EA 대비 103%). 프레스 2라인 금형 교체 2회, 평균 27분으로 표준 25분 대비 2분 초과. 교체 시간 초과는 크레인 대기가 주된 요인이다.',
        source: 'MES 생산실적 (03.20 24:00 마감)',
      },
      {
        heading: '품질 현황',
        core: true,
        facts: ['공정 불량률 0.42% (전주 대비 0.13%p 개선)', '개선 요인 — 2월 금형 교체(M-204)'],
        brief: '불량률 0.42%로 전주 대비 개선.',
        body: '공정 불량률 0.42%로 전주 대비 0.13%p 개선. 개선 요인은 2월 금형 교체(M-204)에 따른 치수 불량 감소로 분석된다.',
        source: '품질관리 시스템 주간 집계',
      },
      {
        heading: '설비 이상',
        core: false,
        facts: [
          'PRS-C03 진동 RMS 4.2mm/s — 관리 기준 3.5mm/s 연속 초과',
          '차주 계획정지에 베어링 교체 편성',
        ],
        brief: 'PRS-C03 진동 기준 초과, 차주 베어링 교체 예정.',
        body: 'PRS-C03 진동 RMS 4.2mm/s로 관리 기준 3.5mm/s를 연속 초과했다. 차주 계획정지에 베어링 교체를 편성했으며, 교체 전까지 일 2회 진동을 점검한다.',
        source: 'PdM 센서 (03.18~03.20)',
      },
    ],
  },
  monthly: {
    docNo: 'HBP-생산기술-2026-042',
    department: '생산기술팀',
    period: '2026.03.01 ~ 03.31',
    elapsedSeconds: 8.1,
    pending: ['경영진 보고 요약'],
    sections: [
      {
        heading: '월간 지표 종합',
        core: true,
        facts: ['전사 불량률 0.42% (전분기 대비 0.06%p 개선)', '설비 종합효율 86.6%'],
        brief: '불량률 0.42%, 설비 종합효율 86.6%.',
        body: '7개 사업장 214개 관리 항목 기준 전사 불량률은 0.42%로 전분기 대비 0.06%p 개선되었다. 설비 종합효율은 86.6%로 집계되었다.',
        source: 'MES 월간 집계',
      },
      {
        heading: '수입검사',
        core: false,
        facts: ['9로트 중 1로트 조건부 합격', '협력사 성적서 판정 보류 3건 — 두께 재확인 요청'],
        brief: '수입검사 1로트 조건부 합격, 보류 3건.',
        body: '수입검사 9로트 중 1로트가 조건부 합격 처리되었다. 협력사 검사성적서 판정 보류 3건은 두께 측정값 재확인을 요청한 상태다.',
        source: '수입검사 대장',
      },
      {
        heading: '개선 과제',
        core: true,
        facts: [
          '침탄로 3호기 후단존 편차 관리 한계 초과 지속',
          '열전대 재교정으로 일부 개선 — 근본 조치 필요',
        ],
        brief: '침탄로 3호기 온도 편차 근본 조치 필요.',
        body: '침탄로 3호기 후단존 온도 편차가 관리 한계를 초과한 상태로 지속되고 있다. 열전대 재교정으로 일부 개선됐으나 히터 열화 가능성이 남아 근본 조치가 필요하다.',
        source: 'SCADA 온도 이력',
      },
    ],
  },
  inspection: {
    docNo: 'HBP-보전-2026-088',
    department: '설비보전팀',
    period: '2026년 3월 정기 PM',
    elapsedSeconds: 5.8,
    pending: ['차기 PM 일정 확정'],
    sections: [
      {
        heading: '점검 실적',
        core: true,
        facts: ['대상 설비 24대 중 24대 점검 완료 (100%)', '점검 소요 3일 — 계획 대비 1일 단축'],
        brief: '대상 24대 전수 점검 완료.',
        body: '3월 정기 PM 대상 설비 24대를 전수 점검했다. 계획 4일 대비 3일에 완료했으며, 라인 정지 시간은 계획 범위 안에서 관리되었다.',
        source: 'PM 점검표 (03.09~03.11)',
      },
      {
        heading: '조치 필요 설비',
        core: true,
        facts: [
          'PRS-C03 — 진동 RMS 4.2mm/s, 베어링 교체 필요',
          'FUR-03 — 후단존 히터 저항 편차, 재측정 필요',
        ],
        brief: '조치 필요 2대 (PRS-C03, FUR-03).',
        body: 'PRS-C03은 진동 RMS 4.2mm/s로 베어링 교체가 필요하며 차주 계획정지에 편성했다. FUR-03은 후단존 히터 저항 편차가 확인되어 재측정을 요청했다.',
        source: 'PdM 센서 · PM 점검표',
      },
      {
        heading: '소모품 교체',
        core: false,
        facts: ['절삭유 교체 6대', '필터 교체 11대'],
        brief: '절삭유 6대·필터 11대 교체.',
        body: '점검 중 절삭유 6대, 필터 11대를 교체했다. 절삭유는 농도 관리 기준에 따라 굴절계로 측정한 뒤 교체했다.',
        source: '자재 출고 이력',
      },
    ],
  },
  quality: {
    docNo: 'HBP-품질-2026-031',
    department: '품질관리부',
    period: '2026년 1분기',
    elapsedSeconds: 7.2,
    pending: ['협력사 시정조치 회신 확인'],
    sections: [
      {
        heading: '품질지표 동향',
        core: true,
        facts: ['분기 불량률 0.42% — 전분기 0.48% 대비 개선', '공정능력지수 Cpk 1.12 (전분기 1.31)'],
        brief: '불량률은 개선, 공정능력지수는 하락.',
        body: '분기 불량률은 0.42%로 전분기 0.48% 대비 개선되었으나, 공정능력지수 Cpk는 1.31에서 1.12로 하락했다. 평균은 좋아졌지만 산포가 커졌다는 뜻이다.',
        source: '품질관리 시스템 분기 집계',
      },
      {
        heading: '부적합 현황',
        core: true,
        facts: ['치수 불량 142건 (최다)', '표면 결함 96건', '상위 2개 원인이 전체의 69%'],
        brief: '치수 불량이 최다, 상위 2개가 69%.',
        body: '부적합 344건 중 치수 불량이 142건으로 가장 많고 표면 결함이 96건으로 뒤를 이었다. 상위 2개 원인이 전체의 69%를 차지해 개선 대상이 뚜렷하다.',
        source: '부적합 보고서 집계',
      },
      {
        heading: '협력사 품질',
        core: false,
        facts: ['수입검사 부적합 1로트 — 조건부 합격', '판정 보류 3건 — 두께 재확인 요청'],
        brief: '협력사 부적합 1로트, 보류 3건.',
        body: '수입검사에서 부적합 1로트가 조건부 합격 처리되었고, 판정 보류 3건은 두께 측정값 재확인을 요청했다. 시정조치 회신은 아직 접수되지 않았다.',
        source: '수입검사 대장',
      },
    ],
  },
  incident: {
    docNo: 'HBP-보전-2026-102',
    department: '설비보전팀',
    period: '2026.03.18 07:12 발생',
    elapsedSeconds: 5.2,
    pending: ['재발 방지 대책 — 보전팀 확정 필요'],
    sections: [
      {
        heading: '발생 경위',
        core: true,
        facts: ['03.18 07:12 PRS-C03 진동 알람', '진동 RMS 4.2mm/s — 관리 기준 3.5mm/s 초과'],
        brief: '03.18 07:12 PRS-C03 진동 기준 초과 알람.',
        body: '창원본사공장 3번 프레스(PRS-C03)의 진동 RMS가 07:12에 관리 기준 3.5mm/s를 초과해 4.2mm/s로 알람이 발생했다. 작업 표준에 따라 운전을 정지하고 보전팀 진단을 요청했다.',
        source: 'PdM 알람 로그',
      },
      {
        heading: '원인 분석',
        core: true,
        facts: ['베어링 하우징 온도 +8.2℃ 동반 상승', '모터 전류 리플 증가 — 기계적 이상으로 판단'],
        brief: '베어링 기계적 이상으로 판단.',
        body: '베어링 하우징 온도가 8.2℃ 동반 상승했고 모터 전류 리플도 증가했다. 두 지표가 함께 움직였으므로 기계적 이상으로 판단하며 센서 오탐 가능성은 배제했다.',
        source: 'SCADA 센서 이력',
      },
      {
        heading: '조치 사항',
        core: false,
        facts: ['차주 계획정지에 베어링 교체 편성', '교체 전까지 일 2회 진동 점검'],
        brief: '차주 베어링 교체, 그전까지 일 2회 점검.',
        body: '차주 계획정지에 베어링 교체를 편성했다. 교체 전까지는 일 2회 진동을 점검하며, 기준을 다시 넘으면 즉시 정지한다.',
        source: '정비 지시서 HBP-보전-2026-102',
      },
    ],
  },
}

/** 문체에 따라 같은 사실을 다른 모양으로 쓴다 */
function render(section: BaseSection, tone: ReportTone): string {
  if (tone === 'formal') return section.facts.map((f) => `- ${f}`).join('\n')
  if (tone === 'brief') return section.brief
  return section.body
}

function keep(sections: BaseSection[], length: ReportLength): BaseSection[] {
  return length === 'short' ? sections.filter((s) => s.core) : sections
}

/** 사람이 채우는 칸 — 비었으면 지어내지 않고 확인 필요로 남긴다 */
const USER_FIELDS = [
  { key: 'achievements', heading: '주요 실적' },
  { key: 'nextPlan', heading: '다음 계획' },
  { key: 'remarks', heading: '특이 사항' },
] as const

/**
 * 설정을 반영한 보고서를 만드는 함수를 찍어 낸다 — 서버가 붙으면 함께 사라진다.
 *
 * 바탕(문서번호·부서·절)을 밖에서 받는다. 안에 못박아 두면 발주처를 바꿔도
 * 제조 부서·제조 실적이 그대로 나온다.
 */
export function makeReportSimulator(
  base0: Record<ReportType, BaseReport>,
): (req: ReportRequest) => ReportResult {
  return (req) => simulateWith(base0, req)
}

function simulateWith(base0: Record<ReportType, BaseReport>, req: ReportRequest): ReportResult {
  const base = base0[req.type]
  const picked = keep(base.sections, req.length)

  const auto: ReportSection[] = picked.map((s) => ({
    heading: s.heading,
    body: render(s, req.tone),
    source: s.source,
  }))

  const typed: ReportSection[] = []
  const pending: string[] = [...base.pending]
  for (const f of USER_FIELDS) {
    const value = req.inputs[f.key].trim()
    if (value) {
      typed.push({ heading: f.heading, body: value, source: '직접 입력' })
    } else if (f.key !== 'remarks') {
      // 특이 사항은 원래 선택 항목이라 비어도 문제 삼지 않는다
      pending.push(`${f.heading} — 직접 입력 필요`)
    }
  }

  const sections = [...auto, ...typed]

  // 장문은 어떤 데이터를 근거로 썼는지까지 붙인다. 목록은 위 절에서 그대로 뽑는다
  if (req.length === 'long') {
    const sources = [...new Set(auto.map((s) => s.source))]
    sections.push({
      heading: '근거 데이터',
      body: sources.map((s) => `- ${s}`).join('\n'),
      source: '본문 인용 출처 정리',
    })
  }

  const extra = req.length === 'long' ? 1.8 : req.length === 'short' ? -1.1 : 0
  return {
    documentId: req.documentId,
    type: req.type,
    tone: req.tone,
    length: req.length,
    docNo: base.docNo,
    department: req.inputs.department.trim() || base.department,
    period: req.inputs.period.trim() || base.period,
    sections,
    pendingFields: pending,
    elapsedSeconds: Math.round((base.elapsedSeconds + extra) * 10) / 10,
  }
}

export const simulateReport = makeReportSimulator(REPORT_BASE)
