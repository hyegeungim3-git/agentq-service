/**
 * 보고서 fixture. 유형을 바꾸면 절 구성이 달라져야 한다 —
 * 무엇을 골라도 같은 보고서가 나오면 유형 선택이 장식이 된다.
 *
 * pendingFields를 일부러 남겼다. 전부 자동으로 채워지면
 * '사람이 확인해야 하는 칸'을 보여 주는 화면이 죽은 코드가 된다.
 */
import type { ReportResult, ReportType } from '@entities/report/model'

export const REPORT_RESULTS: Record<ReportType, ReportResult> = {
  weekly: {
    documentId: 'doc-quality-report',
    type: 'weekly',
    docNo: 'HBP-생산기술-2026-041',
    period: '2026.03.16 ~ 03.20',
    elapsedSeconds: 6.4,
    sections: [
      {
        heading: '생산 실적',
        body: 'CNC 3라인 브래킷 가공 12,360EA 생산(계획 12,000EA 대비 103%). 프레스 2라인 금형 교체 2회, 평균 27분으로 표준 25분 대비 2분 초과.',
        source: 'MES 생산실적 (03.20 24:00 마감)',
      },
      {
        heading: '품질 현황',
        body: '공정 불량률 0.42%로 전주 대비 0.13%p 개선. 개선 요인은 2월 금형 교체(M-204)에 따른 치수 불량 감소.',
        source: '품질관리 시스템 주간 집계',
      },
      {
        heading: '설비 이상',
        body: 'PRS-C03 진동 RMS 4.2mm/s로 관리 기준 3.5mm/s 연속 초과. 차주 계획정지에 베어링 교체 편성.',
        source: 'PdM 센서 (03.18~03.20)',
      },
      {
        heading: '차주 계획',
        body: '프레스 400t #3 정기 PM, 수출 로트 선적 검사.',
        source: null,
      },
    ],
    pendingFields: ['특이사항 — 부서장 코멘트', '차주 인력 운용 계획'],
  },
  monthly: {
    documentId: 'doc-quality-report',
    type: 'monthly',
    docNo: 'HBP-생산기술-2026-042',
    period: '2026.03.01 ~ 03.31',
    elapsedSeconds: 8.1,
    sections: [
      {
        heading: '월간 지표 종합',
        body: '7개 사업장 214개 관리 항목 기준 전사 불량률 0.42%(전분기 대비 0.06%p 개선). 설비 종합효율 86.6%.',
        source: 'MES 월간 집계',
      },
      {
        heading: '수입검사',
        body: '9로트 중 1로트 조건부 합격. 협력사 검사성적서 판정 보류 3건은 두께 측정값 재확인 요청 중.',
        source: '수입검사 대장',
      },
      {
        heading: '개선 과제',
        body: '침탄로 3호기 후단존 온도 편차가 관리 한계 초과 상태로 지속. 열전대 재교정으로 일부 개선됐으나 근본 조치 필요.',
        source: 'SCADA 온도 이력',
      },
      {
        heading: '투자·자원',
        body: '',
        source: null,
      },
    ],
    pendingFields: ['투자·자원 — 예산 집행 실적', '경영진 보고 요약'],
  },
  incident: {
    documentId: 'doc-press-sop',
    type: 'incident',
    docNo: 'HBP-보전-2026-102',
    period: '2026.03.18 07:12 발생',
    elapsedSeconds: 5.2,
    sections: [
      {
        heading: '발생 경위',
        body: '창원본사공장 3번 프레스(PRS-C03) 진동 RMS가 07:12 관리 기준 3.5mm/s를 초과해 4.2mm/s로 알람 발생. 작업 표준에 따라 운전을 정지하고 보전팀 진단 요청.',
        source: 'PdM 알람 로그',
      },
      {
        heading: '원인 분석',
        body: '베어링 하우징 온도 +8.2℃ 동반 상승, 모터 전류 리플 증가. 기계적 이상으로 판단하며 센서 오탐 가능성은 배제.',
        source: 'SCADA 센서 이력',
      },
      {
        heading: '조치 사항',
        body: '차주 계획정지에 베어링 교체 편성. 교체 전까지 일 2회 진동 점검.',
        source: '정비 지시서 HBP-보전-2026-102',
      },
    ],
    pendingFields: ['재발 방지 대책 — 보전팀 확정 필요'],
  },
}
