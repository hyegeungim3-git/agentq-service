import { describe, it, expect } from 'vitest'
import { DOMAIN_FIXTURES } from './domains'
import { PACKED_DOMAIN_IDS, packOf } from './packs'

/**
 * 발주처를 골랐을 때 **다른 발주처의 데이터가 나오지 않는지.**
 *
 * 이전 데모의 사고가 정확히 이것이었다 — 공공을 골라도 제조 문서
 * (`프레스_작업표준서_SOP-PR-011.pdf`)가 그대로 떴다. 플래그만 바꿨기 때문이다.
 *
 * `scripts/`가 아니라 여기 있는 이유: 저장소 파일이 아니라 **앱 데이터**를 본다.
 *
 * 그래서 두 가지를 기계로 지킨다.
 *  ① 'ready'인 발주처는 팩이 반드시 있다
 *  ② 팩 안에 다른 발주처의 말이 한 글자도 없다
 */

/**
 * 그 발주처에만 있어야 하는 말 — 넘어가면 누수다.
 *
 * ⚠️ **업무 용어는 도메인 사이에 공유된다.** 네 번째 팩을 넣을 때 '청구'가 제조의
 * 여비 정산에도, '이의신청'이 공시와 심사 양쪽에 있어 오탐이 났다.
 * 마커는 그 발주처에서만 쓰는 **좁은 말**로 고른다 — 넓게 잡으면 검사가
 * '늑대야'를 외치고, 그러면 사람이 검사를 끄게 된다.
 */
const MARKERS: Record<string, string[]> = {
  manufacturing: ['프레스', '금형', '침탄로', '한빛정밀', 'SOP-PR-011', 'PRS-C03'],
  public: ['표준지', '공시지가', '한국부동산원', 'RTMS', '실거래', '괴리율'],
  civic: ['민원', '옥외광고', '행정동', '한성시', '강변동', '계고'],
  medical: ['삭감', '병상', '진료과', '요양급여', '응급의료센터', '새빛'],
}

const textOf = (id: string): string => JSON.stringify(packOf(id))

describe('발주처 팩 누수', () => {
  it("'ready'인 발주처에는 업무 데이터가 있다", () => {
    const ready = DOMAIN_FIXTURES.filter((d) => d.status === 'ready').map((d) => d.id)
    const missing = ready.filter((id) => !PACKED_DOMAIN_IDS.includes(id))
    expect(missing, '팩 없이 열려 있는 발주처 — 다른 발주처 데이터가 노출된다').toEqual([])
  })

  it('팩이 없는 발주처는 열려 있지 않다', () => {
    const opened = new Set(DOMAIN_FIXTURES.filter((d) => d.status === 'ready').map((d) => d.id))
    const dangling = PACKED_DOMAIN_IDS.filter((id) => !opened.has(id))
    expect(dangling, '팩은 있는데 못 고르는 발주처 — 만들어 두고 안 연 것이다').toEqual([])
  })

  it('한 발주처의 팩에 다른 발주처의 말이 없다', () => {
    const leaks: string[] = []
    for (const id of PACKED_DOMAIN_IDS) {
      const text = textOf(id)
      for (const [other, words] of Object.entries(MARKERS)) {
        if (other === id) continue
        for (const w of words) {
          if (text.includes(w)) leaks.push(`${id} 팩에 ${other}의 말 '${w}'`)
        }
      }
    }
    expect(leaks).toEqual([])
  })

  /* 표시만 있고 내용이 없으면 화면이 빈칸을 그린다 */
  it('팩마다 자기 말이 실제로 들어 있다', () => {
    for (const id of PACKED_DOMAIN_IDS) {
      const text = textOf(id)
      const own = MARKERS[id] ?? []
      expect(own.length, `${id}의 판정 기준이 없다`).toBeGreaterThan(0)
      const found = own.filter((w) => text.includes(w))
      expect(found.length, `${id} 팩이 자기 말을 안 쓴다`).toBeGreaterThan(own.length / 2)
    }
  })
})
