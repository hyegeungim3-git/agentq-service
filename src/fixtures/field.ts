/**
 * 현장 업무 fixture — 교대 인수인계·작업지시.
 *
 * 세계관은 한빛정밀이다. 다른 화면의 사건이 그대로 이어진다 —
 * PRS-C03 진동 알람(예지보전), 침탄로 온도 편차(열처리 진단), 정비지시서 HBP-보전-2026-102.
 *
 * **확인 안 한 미결을 넣었다.** 전부 확인된 상태면 '이 조에서 끊긴다'를 말하는
 * 자리가 죽은 코드가 된다.
 *
 * **기한이 지난 지시와 기한이 아예 없는 지시를 넣었다.** 둘은 다른 문제다 —
 * 하나는 늦은 것이고 하나는 아무도 언제 할지 모르는 것이다.
 */
import type { ReceivedHandover, Shift, WorkOrder } from '@entities/field/model'

export const SHIFTS: Shift[] = [
  { id: 'a', label: 'A조', time: '06:00 ~ 14:00' },
  { id: 'b', label: 'B조', time: '14:00 ~ 22:00' },
  { id: 'c', label: 'C조', time: '22:00 ~ 06:00' },
]

export const CURRENT_SHIFT_ID = 'b'

export const RECEIVED: ReceivedHandover = {
  shiftId: 'a',
  author: '김도현',
  at: '2026-08-02 13:50',
  items: [
    { id: 'h-1', kind: 'alarm', text: 'PRS-C03 진동 RMS 4.2mm/s — 새 관리 기준 3.5 초과, 정비 요청함' },
    { id: 'h-2', kind: 'action', text: '침탄로 2호기 존2 온도 편차 조정 완료 (±8℃ → ±3℃)' },
    { id: 'h-3', kind: 'pending', text: '프레스 3호기 금형 교체 — 자재 입고 지연으로 B조 이월' },
    { id: 'h-4', kind: 'pending', text: '수급업체 야간 반입 작업 안전교육 미이수자 3명 — 반입 전 확인 필요' },
    { id: 'h-5', kind: 'note', text: '품질보증팀 정하늘 책임 오후 현장 점검 예정' },
  ],
  /* 확인한 것은 둘뿐이다 — 미결 둘이 확인 없이 남아 있다 */
  acknowledged: ['h-1', 'h-2'],
}

export const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-1',
    docNo: 'HBP-보전-2026-102',
    title: 'PRS-C03 베어링 점검 및 교체',
    source: '예지보전 릴레이',
    owner: '설비보전팀 오세진',
    due: '2026-08-05',
    status: 'working',
    history: [
      { status: 'issued', at: '2026-07-30 09:12', by: 'AI 자동 발행' },
      { status: 'working', at: '2026-07-31 08:05', by: '오세진' },
    ],
  },
  {
    id: 'wo-2',
    docNo: 'HBP-품질-2026-088',
    title: '침탄 열처리 경도 재검사',
    source: '검사성적서 릴레이',
    owner: '품질보증팀 정하늘',
    /* 기한이 지났는데 안 끝났다 */
    due: '2026-07-29',
    status: 'issued',
    history: [{ status: 'issued', at: '2026-07-25 16:40', by: 'AI 자동 발행' }],
  },
  {
    id: 'wo-3',
    docNo: 'HBP-안전-2026-031',
    title: '프레스 3호기 정비 작업 위험성평가 조치',
    source: '위험성평가',
    owner: '안전보건팀',
    /* 기한이 아예 없다 — 늦은 것과는 다른 문제다 */
    due: null,
    status: 'done',
    history: [
      { status: 'issued', at: '2026-07-28 10:00', by: '오세진' },
      { status: 'working', at: '2026-07-28 13:20', by: '안전보건팀' },
      { status: 'done', at: '2026-07-29 17:40', by: '안전보건팀' },
    ],
  },
  {
    id: 'wo-4',
    docNo: 'HBP-보전-2026-097',
    title: '침탄로 2호기 존2 열전대 교체',
    source: '열처리 진단',
    owner: '설비보전팀 김도현',
    due: '2026-07-24',
    status: 'verified',
    history: [
      { status: 'issued', at: '2026-07-20 09:00', by: 'AI 자동 발행' },
      { status: 'working', at: '2026-07-21 08:30', by: '김도현' },
      { status: 'done', at: '2026-07-22 15:10', by: '김도현' },
      { status: 'verified', at: '2026-07-23 09:40', by: '오세진' },
    ],
  },
]
