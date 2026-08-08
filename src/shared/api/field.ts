import type { ReceivedHandover, Shift, WorkOrder, WorkOrderStatus } from '@entities/field/model'
import { CURRENT_SHIFT_ID, RECEIVED, SHIFTS, WORK_ORDERS } from '@fixtures/field'
import type { ApiResult } from './domains'

/**
 * 현장 업무의 데이터 경계.
 *
 * ⚠️ 작업지시 응답에 **이력(`history`)을 함께** 담기를 요청한다. 현재 상태만 오면
 * 화면은 '언제 누가 바꿨나'를 말할 수 없고, 그러면 추적이 아니라 현황판이 된다.
 *
 * 상태 바꾸기와 인계 확정은 **서버가 해야 남는다.** 화면에서만 바꾸면 다음 조가
 * 열었을 때 그대로다 — 인수인계에서 그건 사고로 이어진다(D-009).
 */

export function fetchShifts(): Promise<ApiResult<{ shifts: Shift[]; currentId: string }>> {
  // TODO(api-미확정): GET /field/shifts 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: { shifts: SHIFTS, currentId: CURRENT_SHIFT_ID } })
}

export function fetchReceivedHandover(): Promise<ApiResult<ReceivedHandover>> {
  // TODO(api-미확정): GET /field/handover/received 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: RECEIVED })
}

export function confirmHandover(itemIds: string[]): Promise<ApiResult<never>> {
  // TODO(api-미확정): POST /field/handover/ack 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({
    ok: false,
    error: `확인 처리(${itemIds.length}건)는 다음 조가 볼 수 있게 서버에 남아야 합니다. 서버가 연결되지 않아 저장하지 못했습니다.`,
  })
}

export function fetchWorkOrders(): Promise<ApiResult<WorkOrder[]>> {
  // TODO(api-미확정): GET /field/work-orders 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: WORK_ORDERS })
}

export function advanceWorkOrder(id: string, to: WorkOrderStatus): Promise<ApiResult<never>> {
  // TODO(api-미확정): POST /field/work-orders/{id}:advance 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({
    ok: false,
    error: `상태 변경(${id} → ${to})은 현장 기록이라 서버에 남아야 합니다. 서버가 연결되지 않아 저장하지 못했습니다.`,
  })
}
