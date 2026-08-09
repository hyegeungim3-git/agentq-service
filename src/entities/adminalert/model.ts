/**
 * 관리자 알림 — 지금 확인이 필요한 것.
 *
 * 원본 관리자 상단바에 종 모양이 있었다. 그대로 아이콘만 옮기면 **누르면 아무 일도
 * 없는 장식**이 된다. 그래서 화면 여기저기 흩어져 있는 '이상한 것'을 모아 실제로
 * 세었다 — 죽은 파드, 끊긴 도구, 처리 못 한 인사 변동.
 *
 * ⚠️ **새로 만든 사실이 아니다.** 전부 이미 어느 화면엔가 있는 값이고, 여기서는
 * 그 화면으로 데려다 줄 뿐이다. 그래서 알림마다 갈 곳(`menuId`)이 반드시 있다 —
 * 없는 알림은 '어딘가 문제가 있다'까지만 말하고 끝나서 아무도 안 본다.
 *
 * 서버가 붙으면 이 계산이 서버로 간다. 화면은 안 바뀐다.
 *
 * ⚠️ **끊긴 도구는 여기서 안 센다.** 도구는 발주처마다 다른데 상단바는 발주처를
 * 고르지 않는다 — 아무 발주처의 도구를 세면, 다른 발주처 화면을 보면서 그 수를
 * 보게 된다. 도구 상태는 '도구 · 배포' 화면이 발주처를 고르고 나서 말한다.
 */

export type AlertLevel = 'action' | 'watch'

export type AdminAlert = {
  id: string
  level: AlertLevel
  /** 무엇이 몇 건인지 — 한 줄 */
  title: string
  /** 왜 봐야 하는지 */
  detail: string
  /** 눌렀을 때 갈 화면 */
  menuId: string
}

export type AlertSources = {
  /** 실패했거나 다시 시작한 파드 */
  pods: { name: string; phase: string; restarts: number }[]
  /** 처리하지 못한 인사 변동 */
  hrFailed: { name: string; failedReason: string | null }[]
}

/** 급한 것부터. 같은 급이면 넣은 순서를 지킨다 */
export function buildAlerts(s: AlertSources): AdminAlert[] {
  const out: AdminAlert[] = []

  const dead = s.pods.filter((p) => p.phase === 'Failed')
  if (dead.length > 0) {
    out.push({
      id: 'pods-failed',
      level: 'action',
      title: `실패한 파드 ${dead.length}건`,
      detail: dead.map((p) => p.name).join(', '),
      menuId: 'system',
    })
  }

  const flapping = s.pods.filter((p) => p.phase !== 'Failed' && p.restarts > 0)
  if (flapping.length > 0) {
    out.push({
      id: 'pods-restart',
      level: 'watch',
      title: `다시 시작한 파드 ${flapping.length}건`,
      detail: '돌고는 있지만 재시작이 있었습니다.',
      menuId: 'system',
    })
  }

  const hr = s.hrFailed.filter((c) => c.failedReason !== null)
  if (hr.length > 0) {
    out.push({
      id: 'hr-failed',
      level: 'action',
      title: `처리 못 한 인사 변동 ${hr.length}건`,
      detail: '계정 권한이 사람의 실제 소속과 어긋난 상태입니다.',
      menuId: 'hr',
    })
  }

  return out
}

export const actionCount = (list: AdminAlert[]): number =>
  list.filter((a) => a.level === 'action').length
