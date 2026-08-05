/**
 * 공공(한국부동산원) 복합 업무 릴레이.
 *
 * 이의신청서 한 건이 접수됐을 때의 흐름이다 — 인식 → 소재지 표준화 →
 * 조사 이력 조회 → 처리 보고서. 관리자 시나리오 빌더의 `sc-pub-1`과 같은 일이다.
 *
 * ⚠️ 부르는 값은 **이 팩의 것**이어야 한다. 문서 id는 팩 문서에, 조회 소스는
 * 팩 소스에 있어야 릴레이가 실제로 돈다(팩 검사가 짝을 확인한다).
 */
import type { Scenario } from '@entities/orchestration/model'

export const PUBLIC_RELAY_SCENARIO: Scenario = {
  id: 'sc-appeal',
  title: '이의신청 접수 처리',
  trigger: '표준지공시지가 이의신청서 스캔본 1건이 접수되었습니다.',
  deliverable: '이의신청 검토 보고 초안',
  steps: [
    {
      id: 'st-ocr',
      agentId: 'ocr',
      title: '신청서 인식',
      input: '스캔본 PDF',
      apiCall: 'shared/api/ocr · recognizeDocument()',
    },
    {
      id: 'st-address',
      agentId: 'address',
      title: '소재지 표준화',
      input: '인식된 본문에서 뽑은 소재지 줄',
      apiCall: 'shared/api/mapping · runMapping({ mode: address-ocr })',
    },
    {
      id: 'st-query',
      agentId: 'dbquery',
      title: '해당 필지 조사 이력 조회',
      input: '신청서의 필지 정보',
      apiCall: 'shared/api/dataquery · runQuery()',
    },
    {
      id: 'st-report',
      agentId: 'report',
      title: '검토 보고 초안',
      input: '앞 단계의 인식·조회 결과',
      apiCall: 'shared/api/report · createReport()',
    },
  ],
}
