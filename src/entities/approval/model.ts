/**
 * 전자결재 상신.
 *
 * 결과를 만들고 끝내면 업무가 화면에서 끊긴다. 여기서는 **결재선이 어떻게 되는지**를
 * 보여 주고, 올리는 것은 서버가 한다.
 *
 * ⚠️ **올린 척하지 않는다.** 이전 데모는 진행 막대를 돌린 뒤 상신 완료를 띄웠다.
 * 그러면 결재가 올라간 줄 알고 화면을 닫는데 그룹웨어에는 아무것도 없다.
 * 계정 정지·업로드와 같은 처리다(D-009).
 *
 * 결재선은 **서버가 준다.** 화면이 만들면 조직개편 때마다 화면을 고쳐야 하고,
 * 실제 결재선과 갈라진 채로 상신된다.
 */

export type ApprovalRole = 'drafter' | 'reviewer' | 'approver'

export const ROLE_LABEL: Record<ApprovalRole, string> = {
  drafter: '기안',
  reviewer: '검토',
  approver: '승인',
}

export type ApprovalStep = {
  role: ApprovalRole
  name: string
  dept: string
  title: string
}

/** 순서대로 기안 → 검토 → 승인이어야 한다 */
export const ORDERED_ROLES: ApprovalRole[] = ['drafter', 'reviewer', 'approver']

/**
 * 결재선이 성립하는가.
 *
 * 승인자가 없으면 올려도 아무도 결재하지 않는다. 기안자가 없으면 누가 올린 건지 모른다.
 * 화면이 그것을 미리 말하지 않으면, 상신 버튼을 눌러 서버가 거절한 뒤에야 안다.
 */
export function missingRoles(line: ApprovalStep[]): ApprovalRole[] {
  return ORDERED_ROLES.filter((r) => !line.some((s) => s.role === r))
}

export const isComplete = (line: ApprovalStep[]): boolean => missingRoles(line).length === 0
