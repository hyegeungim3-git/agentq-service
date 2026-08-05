/**
 * 제조(한빛정밀) 복합 업무 릴레이.
 *
 * 검사성적서 한 건이 들어왔을 때의 흐름이다 — 인식 → 공급업체 주소 표준화 →
 * 설비 이력 조회 → 이상 발생 보고. 제조가 기본 팩이라 fixtures 루트에 있다.
 */
import type { Scenario } from '@entities/orchestration/model'

export const INSPECTION_SCENARIO: Scenario = {
  id: 'sc-inspection',
  title: '수입검사 성적서 접수 처리',
  trigger: '협력사가 보낸 검사성적서 스캔본 1건이 접수되었습니다.',
  deliverable: '이상 발생 보고 초안',
  steps: [
    {
      id: 'st-ocr',
      agentId: 'ocr',
      title: '성적서 인식',
      input: '스캔본 PDF',
      apiCall: 'shared/api/ocr · recognizeDocument()',
    },
    {
      id: 'st-address',
      agentId: 'address',
      title: '공급업체 주소 표준화',
      input: '인식된 본문에서 뽑은 주소 줄',
      apiCall: 'shared/api/mapping · runMapping({ mode: address-ocr })',
    },
    {
      id: 'st-query',
      agentId: 'dbquery',
      title: '해당 설비 이력 조회',
      input: '성적서의 로트·설비 정보',
      apiCall: 'shared/api/dataquery · runQuery()',
    },
    {
      id: 'st-report',
      agentId: 'report',
      title: '이상 발생 보고 초안',
      input: '앞 단계의 인식·조회 결과',
      apiCall: 'shared/api/report · createReport({ type: incident })',
    },
  ],
}
