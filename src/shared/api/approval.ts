import type { ApprovalStep } from '@entities/approval/model'
import { APPROVAL_LINE } from '@fixtures/approval'
import type { ApiResult } from './domains'

/**
 * 전자결재의 데이터 경계.
 *
 * ⚠️ 결재선은 **조직도가 정본**이다. 응답에 부서·직위까지 담기를 요청한다 —
 * 이름만 오면 동명이인을 구분할 수 없고, 화면이 부서를 채워 넣게 된다.
 *
 * 상신은 **성공한 척하지 않는다.** 그룹웨어에 실제로 문서를 만드는 일이라
 * 서버가 해야 한다. 화면에서만 성공시키면 올라간 줄 알고 닫는데 그룹웨어는 비어 있다.
 */

export function fetchApprovalLine(): Promise<ApiResult<ApprovalStep[]>> {
  // TODO(api-미확정): GET /approvals/line 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: APPROVAL_LINE })
}

export function submitApproval(docNo: string): Promise<ApiResult<never>> {
  // TODO(api-미확정): POST /approvals 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({
    ok: false,
    error: `상신(${docNo})은 그룹웨어에 문서를 만드는 일이라 서버가 처리해야 합니다. 서버가 연결되지 않아 올리지 못했습니다.`,
  })
}
