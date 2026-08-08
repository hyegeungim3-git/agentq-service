/**
 * 현장 업무 — 교대 인수인계와 작업지시.
 *
 * 두 가지 모두 "그래서 처리됐나"에 답하는 자리다. 문서를 만들어 놓고 끝나면
 * 이 제품은 문서 생성기가 된다.
 *
 * **교대 인수인계** — 3교대 현장에서 사고·품질 문제가 가장 많이 새는 지점이다.
 * 받은 인계를 확인했는지, 이번 조가 무엇을 넘기는지를 같은 화면에서 본다.
 *
 * **작업지시** — 발행 → 착수 → 완료 → 검증까지 간다. 상태는 **되돌리지 않는다.**
 * 현장 기록은 정정이 아니라 추가로 남겨야 추적이 된다 — 되돌릴 수 있으면
 * '언제 무엇이 있었나'가 사라진다.
 */

/* ── 교대 인수인계 ─────────────────────────────────────────────── */

export type HandoverKind = 'alarm' | 'action' | 'pending' | 'note'

/**
 * 분류는 구조라 고정이지만 **이름은 업무에 따라 다르다.**
 * 제조의 '이상·경보'가 병원에서는 '환자 상태 변화'다. 팩이 덮어쓸 수 있게 둔다.
 */
export const HANDOVER_KIND_LABEL: Record<HandoverKind, string> = {
  alarm: '이상·경보',
  action: '조치 완료',
  pending: '미결 인계',
  note: '특이사항',
}

export const HANDOVER_KINDS: HandoverKind[] = ['alarm', 'action', 'pending', 'note']

export type HandoverItem = {
  id: string
  kind: HandoverKind
  text: string
}

export type Shift = {
  id: string
  label: string
  time: string
}

export type ReceivedHandover = {
  shiftId: string
  author: string
  at: string
  items: HandoverItem[]
  /** 받는 쪽이 확인했다고 표시한 항목 id */
  acknowledged: string[]
}

/** 아직 확인 안 한 것 — 미결이 확인 없이 넘어가면 그 조에서 끊긴다 */
export const unacknowledged = (h: ReceivedHandover): HandoverItem[] =>
  h.items.filter((i) => !h.acknowledged.includes(i.id))

/** 확인 안 한 것 중 미결 — 가장 급한 것 */
export const unresolvedPending = (h: ReceivedHandover): HandoverItem[] =>
  unacknowledged(h).filter((i) => i.kind === 'pending')

/* ── 작업지시 ─────────────────────────────────────────────────── */

export type WorkOrderStatus = 'issued' | 'working' | 'done' | 'verified'

export const WO_FLOW: WorkOrderStatus[] = ['issued', 'working', 'done', 'verified']

export const WO_LABEL: Record<WorkOrderStatus, string> = {
  issued: '발행',
  working: '작업 중',
  done: '작업 완료',
  verified: '검증 완료',
}

/** 다음 단계에서 할 일. 끝이면 null */
export const WO_NEXT_ACTION: Record<WorkOrderStatus, string | null> = {
  issued: '작업 착수',
  working: '작업 완료 처리',
  done: '검증 확인',
  verified: null,
}

export type WorkOrderStep = {
  status: WorkOrderStatus
  at: string
  by: string
}

export type WorkOrder = {
  id: string
  docNo: string
  title: string
  /** 어디서 나온 지시인가 — 시나리오·회의·점검 */
  source: string
  owner: string
  /** 기한. 안 정했으면 null */
  due: string | null
  status: WorkOrderStatus
  history: WorkOrderStep[]
}

/** 다음 상태. 끝이면 null */
export function nextStatus(s: WorkOrderStatus): WorkOrderStatus | null {
  const i = WO_FLOW.indexOf(s)
  return i < 0 || i === WO_FLOW.length - 1 ? null : (WO_FLOW[i + 1] ?? null)
}

export const openOrders = (list: WorkOrder[]): WorkOrder[] =>
  list.filter((o) => o.status !== 'verified')

/**
 * 기한이 지났는데 안 끝난 것.
 *
 * 기준 날짜는 **데이터를 준 쪽**이 말한다 — 브라우저 시계를 쓰면 사용자 시계가
 * 어긋난 만큼 서버와 다른 수를 말한다(접근권한·중대재해 화면과 같은 규율).
 */
export const overdue = (list: WorkOrder[], asOf: string): WorkOrder[] =>
  list.filter((o) => o.status !== 'verified' && o.due !== null && o.due < asOf)

/** 기한이 아예 없는 것 — 언제까지 해야 하는지 없으면 아무도 안 한다 */
export const withoutDue = (list: WorkOrder[]): WorkOrder[] =>
  list.filter((o) => o.status !== 'verified' && o.due === null)
