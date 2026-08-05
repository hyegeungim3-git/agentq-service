import { describe, it, expect } from 'vitest'
import { AGENTS } from './model'

/**
 * **카탈로그는 어느 발주처의 말도 쓰지 않는다.**
 *
 * 네 번째 발주처를 라이브에서 확인하다 찾았다 — 병원의 에이전트 허브에
 * `수출 문서 번역`이 떠 있었다. 도입 전이라 못 누르지만, **이름 자체가
 * 제조의 말**이었다. 팩 데이터는 검사가 지키고 있었는데 13종의 이름·설명은
 * 코어에 박혀 있어 아무도 안 보고 있었다.
 *
 * 팩(`packs.test.ts`)이 '내 팩에 남의 말이 없나'를 보는 것과 짝이다.
 * 여기는 '모두가 보는 카탈로그에 특정 업종의 말이 없나'를 본다.
 *
 * ⚠️ 발주처마다 이름을 바꿔 부르게 하는 것(팩이 이름을 덮어쓰기)은 **안 넣었다.**
 * 허브 카드 이름과 화면 제목이 두 곳에 생겨 갈라지기 때문이다. 하려면 화면 제목까지
 * 한 곳에서 나오게 고친 뒤에 한다.
 */
const INDUSTRY_WORDS = [
  /* 제조 */ '수출',
  '공정',
  '설비',
  '도면',
  '금형',
  '프레스',
  /* 공공·행정 */ '공시지가',
  '표준지',
  '민원',
  '광고물',
  /* 의료 */ '병상',
  '진료',
  '급여',
]

describe('에이전트 카탈로그', () => {
  it('업종을 가리키는 말을 이름·설명에 쓰지 않는다', () => {
    const hits: string[] = []
    for (const a of AGENTS) {
      const text = `${a.name} ${a.desc}`
      for (const w of INDUSTRY_WORDS) {
        if (text.includes(w)) hits.push(`${a.id}: '${w}' (${text})`)
      }
    }
    expect(hits, '카탈로그가 한 업종의 말을 쓰면 다른 발주처 화면에 그대로 뜬다').toEqual([])
  })

  it('13종이 모두 이름과 설명을 갖는다', () => {
    for (const a of AGENTS) {
      expect(a.name.length, `${a.id}에 이름이 없다`).toBeGreaterThan(0)
      expect(a.desc.length, `${a.id}에 설명이 없다`).toBeGreaterThan(0)
    }
    expect(AGENTS).toHaveLength(13)
  })
})
