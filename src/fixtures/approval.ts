/**
 * 결재선 fixture.
 *
 * 세계관은 한빛정밀이다. 이름은 다른 화면과 같은 사람들을 쓴다 —
 * 기안 박태윤(생산기술팀), 검토 오세진(설비보전팀 팀장), 승인 정하늘(품질보증팀).
 *
 * ⚠️ 서버가 붙으면 이 목록은 **조직도에서 온다.** 화면이 들고 있으면 조직개편 때마다
 * 화면을 고쳐야 하고, 실제 결재선과 갈라진 채로 상신된다.
 */
import type { ApprovalStep } from '@entities/approval/model'

export const APPROVAL_LINE: ApprovalStep[] = [
  { role: 'drafter', name: '박태윤', dept: '생산기술팀', title: '책임' },
  { role: 'reviewer', name: '오세진', dept: '설비보전팀', title: '팀장' },
  { role: 'approver', name: '정하늘', dept: '품질보증팀', title: '부장' },
]
