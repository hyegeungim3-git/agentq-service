/**
 * 행정(한성시청) 복합 업무 릴레이.
 *
 * 옥외광고물 표시 신고 한 건이 접수됐을 때의 흐름이다 — 인식 → 위치 표준화 →
 * 점검 이력 조회 → 처리 공문. 관리자 시나리오 빌더의 `sc-civ-1`과 같은 일이다.
 */
import type { Scenario } from '@entities/orchestration/model'

export const CIVIC_RELAY_SCENARIO: Scenario = {
  id: 'sc-adnotice',
  title: '옥외광고물 신고 접수 처리',
  trigger: '옥외광고물 표시 신고서 스캔본 1건이 접수되었습니다.',
  deliverable: '신고 처리 공문 초안',
  steps: [
    {
      id: 'st-ocr',
      agentId: 'ocr',
      title: '신고서 인식',
      input: '스캔본 PDF',
      apiCall: 'shared/api/ocr · recognizeDocument()',
    },
    {
      id: 'st-address',
      agentId: 'address',
      title: '표시 위치 표준화',
      input: '인식된 본문에서 뽑은 위치 줄',
      apiCall: 'shared/api/mapping · runMapping({ mode: address-ocr })',
    },
    {
      id: 'st-query',
      agentId: 'dbquery',
      title: '같은 위치 점검 이력 조회',
      input: '신고서의 위치·규격 정보',
      apiCall: 'shared/api/dataquery · runQuery()',
    },
    {
      id: 'st-report',
      agentId: 'report',
      title: '처리 공문 초안',
      input: '앞 단계의 인식·조회 결과',
      apiCall: 'shared/api/report · createReport()',
    },
  ],
}
