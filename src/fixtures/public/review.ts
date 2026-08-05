/**
 * 공공(한국부동산원) 문서 사전 검토.
 *
 * 제조가 '기안문 vs 사규'라면 여기는 **조사표·검증서 vs 공시업무 지침·법령**이다.
 * 이 조직에서 실제로 반려가 나는 자리를 옮겼다 — 이용상황 변동 사유 누락,
 * 이의신청 처리 기한 도과, 실거래 판정 근거 미기재.
 *
 * 제조 팩과 같은 규칙:
 *  ① 고른 묶음이 결과를 실제로 바꿔야 체크박스가 장식이 아니다
 *  ② 심각도 '높음'이 남아 있으면 화면이 상신을 권하지 않는다 — 그 경로가 살아야 하므로
 *     높음을 반드시 하나 이상 둔다
 *  ③ 조치 없는 지적은 검토 결과가 아니라 잔소리다
 */
import type { RegulationSetOption, Violation } from '@entities/review/model'

/** 이 발주처가 대조하는 규정 묶음 */
export const PUBLIC_REVIEW_SETS: RegulationSetOption[] = [
  { code: 'survey', label: '표준지 조사지침' },
  { code: 'appeal', label: '이의신청 처리 규정' },
  { code: 'rtms', label: '실거래 검증 매뉴얼' },
  { code: 'labor', label: '복무규정' },
  { code: 'security', label: '정보보안 관리규정' },
]

export const PUBLIC_VIOLATIONS_BY_SET: Record<string, Violation[]> = {
  survey: [
    {
      id: 'v-reb-survey-1',
      clause: '표준지공시지가 조사·평가 지침 제2장',
      severity: 'high',
      type: '이용상황 변동 사유 미기재',
      detail:
        '표준지 12필지의 이용상황이 직전 연도와 다르게 기재되었으나 변동 사유가 비어 있습니다. 사유 없는 이용상황 변경은 검증 단계에서 반려됩니다.',
      action:
        '해당 12필지의 변동 사유를 조사표에 기재하십시오. 현장 확인이 필요하면 조사 계획서에 일정을 추가한 뒤 재제출하십시오.',
    },
    {
      id: 'v-reb-survey-2',
      clause: '표준지공시지가 조사·평가 지침 제3장',
      severity: 'medium',
      type: '가격 균형 협의 조서 누락',
      detail:
        '인접 시·군 경계 표준지 3필지의 변동률 차이가 3.4%포인트로 기준(3%포인트)을 넘었으나 협의 조서가 첨부되지 않았습니다.',
      action: '해당 3필지에 대해 협의 조서를 작성해 첨부하거나, 협의 예정일을 비고에 적으십시오.',
    },
    {
      id: 'v-reb-survey-3',
      clause: '표준지공시지가 조사·평가 지침 제4장',
      severity: 'low',
      type: '검증자 회신 일자 미기재',
      detail: '심의 결과를 조사자에게 회신한 일자가 기재되지 않았습니다.',
      action: '회신 일자를 조사표 하단 처리란에 추가하십시오.',
    },
  ],

  appeal: [
    {
      id: 'v-reb-appeal-1',
      clause: '부동산 가격공시에 관한 법률 제7조 제1항',
      severity: 'high',
      type: '처리 기한 도과 우려',
      detail:
        '미처리 이의신청 18건 중 5건이 접수일부터 27일이 지났습니다. 처리 기한(30일)까지 3일 남았으며, 재조사가 진행 중인 2건은 위원회 재심의 일정이 잡히지 않았습니다.',
      action:
        '재심의 일정을 먼저 확정하고, 기한 내 처리가 어려운 건은 신청인에게 처리 지연 사유를 서면으로 안내하십시오.',
    },
    {
      id: 'v-reb-appeal-2',
      clause: '표준지공시지가 조사·평가 지침 제5장',
      severity: 'medium',
      type: '처리 결과 통지 방식 미기재',
      detail: '처리 완료 건 중 7건에 통지 방식(서면)과 발송 일자가 기록되지 않았습니다.',
      action: '통지 방식과 발송 일자를 처리 대장에 기록하십시오.',
    },
  ],

  rtms: [
    {
      id: 'v-reb-rtms-1',
      clause: '실거래 검증 매뉴얼 제4장',
      severity: 'high',
      type: '판정 근거 미기재',
      detail:
        '의심 거래 8건 중 3건에 괴리율 산정 근거(비교 시세와 산정 시점)가 기록되지 않았습니다. 근거 없는 판정은 이의 제기 시 방어할 수 없습니다.',
      action: '비교 시세, 산정 시점, 적용한 괴리율을 검증 대장에 기록한 뒤 판정을 확정하십시오.',
    },
    {
      id: 'v-reb-rtms-2',
      clause: '부동산 거래신고 등에 관한 법률 제6조 제1항',
      severity: 'medium',
      type: '자료 제출 요구 기한 미고지',
      detail: '자금조달계획서 보완을 요청한 5건에 회신 기한이 문서에 적혀 있지 않습니다.',
      action: '회신 기한(4월 20일)을 요구서에 명시해 다시 발송하십시오.',
    },
  ],

  labor: [
    {
      id: 'v-reb-labor-1',
      clause: '복무규정 제31조 제3항',
      severity: 'medium',
      type: '현장조사 일정 사전 미기재',
      detail:
        '현장조사 출장 4건이 조사 계획서에 없던 일정입니다. 계획에 없는 일정은 사후 승인을 받아야 정산됩니다.',
      action: '해당 4건의 사후 승인 문서를 첨부하거나, 조사 계획서를 변경 신청하십시오.',
    },
  ],

  security: [
    {
      id: 'v-reb-security-1',
      clause: '정보보안 관리규정 제22조',
      severity: 'high',
      type: '실거래 원자료 외부 반출',
      detail:
        '첨부된 검토 자료에 개인식별정보가 포함된 실거래 원자료가 그대로 들어 있습니다. 비식별 조치와 정보공개 심의 기록이 확인되지 않습니다.',
      action:
        '원자료를 비식별 처리본으로 교체하고, 외부 제공이 필요하면 정보공개 심의를 먼저 거치십시오.',
    },
  ],
}

/** 묶음별 조항 수 — 얼마나 훑었는지 */
export const PUBLIC_CLAUSE_COUNT: Record<string, number> = {
  survey: 42,
  appeal: 18,
  rtms: 26,
  labor: 31,
  security: 24,
}
