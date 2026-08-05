import { packOf, type DomainPackData } from '@fixtures/packs'
import { activeDomain } from './tenant'
import type { ApiResult } from './domains'

/**
 * 지금 발주처의 업무 데이터를 꺼낸다.
 *
 * 없으면 **다른 발주처 것으로 채우지 않고** 실패를 돌려준다.
 * 이전 데모의 사고가 정확히 그 지점이었다 — 공공을 골라도 제조 문서가 떴다.
 * 서버가 붙으면 이 함수는 사라지고, 같은 판정을 서버가 404로 한다.
 */
export function withPack<T>(read: (pack: DomainPackData) => T): Promise<ApiResult<T>> {
  const pack = packOf(activeDomain())
  if (!pack) {
    return Promise.resolve({
      ok: false,
      error: '이 발주처의 업무 데이터가 아직 없습니다. 다른 발주처를 선택하십시오.',
    })
  }
  return Promise.resolve({ ok: true, data: read(pack) })
}

/**
 * **발주처를 지정해서** 꺼낸다 — 관리자 전용.
 *
 * 관리자는 특정 발주처에 속하지 않는다(포털에서 들어올 때 `setActiveDomain(null)`).
 * 그래서 발주처 데이터를 보려면 어느 발주처인지 **화면이 골라서 말해야** 한다.
 * 제안서 §3-2의 헤더 방식으로 보면, 사용자 포털은 셸이 헤더를 달고 관리자는
 * 고른 발주처를 헤더에 담는 것이다 — 헤더가 사라지는 게 아니라 주체가 바뀐다.
 */
export function withPackOf<T>(
  domainId: string | null,
  read: (pack: DomainPackData) => T,
): Promise<ApiResult<T>> {
  const pack = packOf(domainId)
  if (!pack) {
    return Promise.resolve({
      ok: false,
      error: '이 발주처의 업무 데이터가 아직 없습니다. 다른 발주처를 선택하십시오.',
    })
  }
  return Promise.resolve({ ok: true, data: read(pack) })
}

/** 팩을 바로 꺼내야 하는 곳(동기 시뮬레이션)용. 없으면 null */
export function currentPack(): DomainPackData | null {
  return packOf(activeDomain())
}

/**
 * 화면이 미리 채워 두는 예시 입력.
 *
 * 예전에는 화면·훅이 fixture에서 직접 가져왔다(회의 참석자, 번역 원문, 주소 목록).
 * 그러면 발주처를 바꿔도 제조 사람 이름이 입력창에 남는다 — 지식 검색에서 이미
 * 밟은 함정이라 같은 방식으로 막는다.
 */
export function fetchSamples(): Promise<ApiResult<DomainPackData['samples']>> {
  // TODO(api-미확정): GET /samples 로 교체. 제거 조건 = 백엔드가 테넌시(§3-2)를 확정.
  return withPack((p) => p.samples)
}
