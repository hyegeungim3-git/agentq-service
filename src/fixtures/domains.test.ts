import { describe, it, expect } from 'vitest'
import { DOMAIN_FIXTURES } from './domains'

/**
 * 발주처 브랜드 색 위의 **흰 글자가 읽히는가.**
 *
 * 브랜드 색은 `--color-brand` 하나로 전 화면에 퍼진다. 그 위에는 언제나
 * `--color-brand-fg`(흰색)를 얹는다 — 활성 탭, 주 버튼, 배지.
 * 발주처를 추가하는 사람이 밝은 색을 고르면 **그 발주처만 글자가 안 보인다.**
 * 화면을 열어 보기 전에는 모른다.
 *
 * 그래서 팩을 넣을 때가 아니라 색을 적을 때 걸리게 한다.
 * (규칙 엔진 검사는 배포된 화면을 보지만, 여기는 값 하나로 먼저 막는다)
 */

const hex = (v: string): [number, number, number] => {
  const m = /^#([0-9a-f]{6})$/i.exec(v.trim())
  if (!m || !m[1]) throw new Error(`브랜드 색은 #RRGGBB 형식이어야 한다: ${v}`)
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const luminance = (c: [number, number, number]): number => {
  const f = c.map((x) => {
    const v = x / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]
}

/** 흰 글자와의 명암비 */
const againstWhite = (v: string): number => (1.05) / (luminance(hex(v)) + 0.05)

describe('발주처 브랜드 색', () => {
  /* 활성 탭·주 버튼의 글자는 11px이라 작은 글씨 기준(4.5:1)을 넘어야 한다 */
  it('흰 글자를 얹어도 읽힌다', () => {
    const weak = DOMAIN_FIXTURES.filter((d) => againstWhite(d.brandColor) < 4.5).map(
      (d) => `${d.orgName} ${d.brandColor} — ${againstWhite(d.brandColor).toFixed(2)}:1`,
    )
    expect(weak, '이 색 위의 흰 글자는 읽히지 않는다').toEqual([])
  })

  it('브랜드 색은 #RRGGBB로 적는다', () => {
    /* `oklch()`나 이름 색을 쓰면 셸이 변수에 꽂을 때만 알 수 있다 */
    for (const d of DOMAIN_FIXTURES) {
      expect(() => hex(d.brandColor), d.orgName).not.toThrow()
    }
  })
})
