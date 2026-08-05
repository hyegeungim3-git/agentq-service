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

/** 팩을 바로 꺼내야 하는 곳(동기 시뮬레이션)용. 없으면 null */
export function currentPack(): DomainPackData | null {
  return packOf(activeDomain())
}
