/**
 * 지금 어느 발주처를 보고 있는가.
 *
 * 화면은 이 값을 넘기지 않는다. 요청마다 발주처 id를 인자로 달면 98개 주소가
 * 전부 길어지고, 새 화면이 하나만 빠뜨려도 **다른 발주처의 문서가 나온다.**
 * 제안서 §3-2에서 백엔드에 헤더(`X-Domain-Id`)를 권한 것과 같은 이유다 —
 * 서버가 붙으면 이 값이 그 헤더가 된다. 바뀌는 곳은 여기 하나다.
 *
 * ⚠️ 기본값을 두지 않는다. 발주처를 고르기 전에 데이터를 요청하면
 * **조용히 아무 발주처의 것을 주는 대신** 없다고 답해야 한다.
 * 이전 데모의 사고가 정확히 그것이었다 — 공공을 골라도 제조 문서가 떴다.
 */

let active: string | null = null

export function setActiveDomain(id: string | null): void {
  active = id
}

export function activeDomain(): string | null {
  return active
}
