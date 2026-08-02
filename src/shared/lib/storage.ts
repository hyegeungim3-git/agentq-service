/**
 * 브라우저 저장소 접근.
 *
 * 여기만 `localStorage`를 직접 만진다. 화면이 곳곳에서 만지면 지우는 곳도 흩어진다.
 *
 * 방어적으로 감싸는 이유는 '혹시 몰라서'가 아니다. 셋 다 실제로 일어난다.
 *  - 사생활 보호 모드·정책으로 접근 자체가 막힘 → 접근만 해도 예외
 *  - 이전 버전이 남긴 형태가 지금과 다름 → JSON은 통과하는데 모양이 틀림
 *  - 용량 초과 → 쓰기에서 예외
 * 이걸 감싸지 않으면 저장 실패가 화면 전체를 죽인다.
 */

export function readJson<T>(key: string, isValid: (v: unknown) => v is T): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** 저장에 성공했는지 돌려준다 — 실패를 조용히 삼키면 저장된 줄 안다 */
export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* 접근이 막힌 환경 — 지울 것도 없다 */
  }
}
