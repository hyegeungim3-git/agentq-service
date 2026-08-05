/**
 * 문서 사전 검토 fixture.
 *
 * 대조할 규정을 바꾸면 걸리는 위반이 달라져야 한다 — 무엇을 고르든 같은 결과가
 * 나오면 규정 선택이 장식이 된다. 그래서 위반마다 어느 규정 묶음 소속인지 둔다.
 */
import type { RegulationSetOption, Violation } from '@entities/review/model'

/** 규정 묶음별 위반. 실제로는 서버가 대조해서 준다. */
/** 이 발주처가 대조하는 규정 묶음. 이름은 발주처 것이다 */
export const REVIEW_SETS: RegulationSetOption[] = [
  { code: 'labor', label: '취업규칙·복무규정' },
  { code: 'purchase', label: '구매·계약 규정' },
  { code: 'safety', label: '안전보건관리규정' },
  { code: 'quality', label: '품질경영매뉴얼' },
  { code: 'security', label: '보안정책·개인정보' },
]

export const VIOLATIONS_BY_SET: Record<string, Violation[]> = {
  labor: [
    {
      id: 'v-labor-1',
      clause: '취업규칙 제23조 제2항',
      severity: 'high',
      type: '출장 여비 과다 계상',
      detail:
        '창원-아산 출장 여비가 일 74,000원으로 계상되어 기준액 60,000원 대비 23% 초과했습니다. 초과분에 대한 사전 승인 근거가 첨부되지 않았습니다.',
      action: '정산 내역을 기준액으로 재작성하거나, 초과 사유서와 부서장 사전 승인 문서를 첨부해 재상신하십시오.',
    },
    {
      id: 'v-labor-2',
      clause: '복무규정 제11조',
      severity: 'low',
      type: '기안자 정보 누락',
      detail: '기안 문서에 소속 부서는 있으나 직위가 기재되지 않았습니다.',
      action: '문서 머리말에 기안자 직위를 추가하십시오.',
    },
  ],
  purchase: [
    {
      id: 'v-pur-1',
      clause: '구매·계약 규정 제9조',
      severity: 'high',
      type: '수의계약 근거 미비',
      detail:
        '금형 부품 발주가 단일 업체 수의계약으로 기안되었으나, 규정이 요구하는 견적 3개사 비교표가 없습니다.',
      action: '견적 3개사 비교표를 첨부하거나, 수의계약 사유(긴급·독점 공급)를 규정 제9조 각 호로 명시하십시오.',
    },
    {
      id: 'v-pur-2',
      clause: '구매·계약 규정 제14조',
      severity: 'medium',
      type: '납기 지연 위약 조항 누락',
      detail: '발주서에 납기는 있으나 지연 시 위약 조항이 기재되지 않았습니다.',
      action: '표준 발주 양식의 위약 조항을 포함해 재작성하십시오.',
    },
  ],
  safety: [
    {
      id: 'v-safe-1',
      clause: '안전보건관리규정 제17조',
      severity: 'medium',
      type: '위험성평가 미첨부',
      detail:
        '프레스 금형 교체 작업이 포함되었으나 해당 작업의 위험성평가 결과가 첨부되지 않았습니다.',
      action: '금형 교체(SMED) 작업 위험성평가서를 첨부한 뒤 상신하십시오.',
    },
  ],
  quality: [
    {
      id: 'v-qual-1',
      clause: '품질경영매뉴얼 8.5.1',
      severity: 'medium',
      type: '초품 검사 기록 미기재',
      detail: '금형 교체 후 초품 검사 실시 계획은 있으나 검사 기록 보관 방법이 기재되지 않았습니다.',
      action: '초품 검사 결과를 설비 대장에 기록한다는 문구를 추가하십시오.',
    },
  ],
  security: [
    {
      id: 'v-sec-1',
      clause: '개인정보처리방침 제3조',
      severity: 'low',
      type: '협력사 담당자 연락처 노출',
      detail: '첨부 견적서에 협력사 담당자 개인 휴대전화 번호가 마스킹 없이 포함되어 있습니다.',
      action: '연락처를 대표번호로 대체하거나 마스킹 처리 후 재첨부하십시오.',
    },
  ],
}

/** 규정 묶음별 대조 조항 수 — 얼마나 훑었는지 보여 준다 */
export const CLAUSE_COUNT: Record<string, number> = {
  labor: 42,
  purchase: 28,
  safety: 35,
  quality: 31,
  security: 19,
}
