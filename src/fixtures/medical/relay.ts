/**
 * 의료(새빛대학교병원) 복합 업무 릴레이.
 *
 * 진료과 회신 서식 한 건이 도착했을 때의 흐름이다 — 인식 → 항목 코드 표준화 →
 * 조정 이력 조회 → 점검 보고서. 관리자 시나리오 빌더의 `sc-med-1`과 같은 일이다.
 *
 * ⚠️ **2단계가 다르다.** 병원은 주소가 아니라 청구 항목 코드를 푼다 —
 * 릴레이 구조는 같아도 부르는 처리 유형이 발주처마다 다르다.
 */
import type { Scenario } from '@entities/orchestration/model'

export const MEDICAL_RELAY_SCENARIO: Scenario = {
  id: 'sc-claimreply',
  title: '청구 보류 건 회신 처리',
  trigger: '진료과 회신 서식 1건이 도착했습니다.',
  deliverable: '사전점검 보고 초안',
  steps: [
    {
      id: 'st-ocr',
      agentId: 'ocr',
      title: '회신 서식 인식',
      input: '스캔본 PDF',
      apiCall: 'shared/api/ocr · recognizeDocument()',
    },
    {
      id: 'st-address',
      agentId: 'address',
      title: '항목 코드 표준화',
      input: '인식된 본문의 항목 명칭',
      apiCall: 'shared/api/mapping · runMapping({ mode: tags })',
    },
    {
      id: 'st-query',
      agentId: 'dbquery',
      title: '같은 항목 조정 이력 조회',
      input: '표준화된 항목 코드',
      apiCall: 'shared/api/dataquery · runQuery()',
    },
    {
      id: 'st-report',
      agentId: 'report',
      title: '사전점검 보고 초안',
      input: '앞 단계의 인식·조회 결과',
      apiCall: 'shared/api/report · createReport()',
    },
  ],
}
