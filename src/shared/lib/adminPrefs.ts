/**
 * 관리자 화면 설정.
 *
 * 원본 상단바에 톱니가 있었다. 아무 일도 안 하는 톱니는 두지 않기로 하고,
 * **실제로 화면이 바뀌는 것 하나**만 넣었다 — 표 밀도.
 *
 * 관리자는 한 화면에서 수십 줄을 훑는다. 줄 간격을 줄이면 한 번에 보이는 줄이
 * 늘어나고, 대신 손가락으로 짚기는 어려워진다. 둘 중 무엇이 나은지는 쓰는 사람이
 * 안다 — 그래서 고르게 두고, 고른 것을 기억한다.
 *
 * ⚠️ 서버가 아니라 **이 브라우저에만** 저장한다. 사람마다 다른 설정을 서버에
 * 두려면 계정이 있어야 하고, 계정은 아직 정해지지 않았다(API-PROPOSAL §3).
 */

export type Density = 'comfortable' | 'compact'

const KEY = 'agentq.admin.density'

export function readDensity(): Density {
  try {
    return localStorage.getItem(KEY) === 'compact' ? 'compact' : 'comfortable'
  } catch {
    /* 사생활 보호 모드에서는 저장소를 못 읽는다 — 기본값으로 계속 쓴다 */
    return 'comfortable'
  }
}

export function writeDensity(d: Density): void {
  try {
    localStorage.setItem(KEY, d)
  } catch {
    /* 못 저장해도 이번 세션 동안은 화면이 바뀐다. 조용히 넘어가되 값은 안 잃는다 */
  }
}

export const DENSITY_LABEL: Record<Density, string> = {
  comfortable: '보통',
  compact: '좁게',
}
