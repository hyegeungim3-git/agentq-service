import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * 화면이 색을 직접 칠하지 않게 지킨다.
 *
 * 처음 만들 때는 지킨다. 문제는 **여섯 달 뒤에 화면 하나를 급하게 추가할 때**다.
 * `style={{ backgroundColor: '#0F766E' }}` 한 줄이면 그 화면은 잘 나오지만,
 * 발주처가 바뀌어도 그 자리만 안 따라온다. 그리고 아무도 모른다 —
 * 그 발주처를 열어 보는 사람이 없으면.
 *
 * 실제로 이런 자리가 있었다. 셸·포털·허브가 각자 `domain.brandColor`를 인라인으로
 * 칠하고 있었고, 새로 만든 화면들은 아예 회색이었다. 지금은 `--color-brand`
 * 하나만 꽂고 `bg-brand`로 부른다 — 그 규율을 여기서 기계로 지킨다.
 *
 * 로고(SVG)의 흰색은 예외다. 큐브 면의 밝기 대비라서 팔레트가 뒤집혀도
 * 그대로여야 한다 — 뒤집히면 브랜드 색 위에 어두운 큐브가 그려진다.
 */

const SRC = join(process.cwd(), 'src')
const ALLOW = ['shared/ui/Brand.tsx']

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : []
  })
}

const files = walk(SRC).map((p) => ({
  rel: p.slice(SRC.length + 1).replaceAll('\\', '/'),
  text: readFileSync(p, 'utf8'),
}))

describe('디자인 토큰', () => {
  /* 임의 색은 화면마다 다른 규칙을 만든다 */
  it('클래스에 임의 색 값을 쓰지 않는다', () => {
    const hits = files
      .filter((f) => /(?:bg|text|border|outline|fill|stroke)-\[#/.test(f.text))
      .map((f) => f.rel)
    expect(hits, '색은 토큰으로만 부른다 — index.css에 정의하고 클래스로 쓸 것').toEqual([])
  })

  /* 인라인 색은 팔레트도 브랜드 변수도 안 따라간다 */
  it('인라인 스타일로 색을 칠하지 않는다', () => {
    const hits = files
      .filter((f) => !ALLOW.includes(f.rel))
      .filter((f) => /(?:backgroundColor|borderColor|outlineColor):\s*['"`]?#/.test(f.text))
      .filter((f) => /brandColor/.test(f.text) || /#[0-9a-fA-F]{3,8}/.test(f.text))
      .map((f) => f.rel)
    expect(hits, '브랜드 색은 brandVars()로 꽂고 bg-brand로 부른다').toEqual([])
  })

  /* 발주처 색을 화면이 직접 읽으면, 새 화면은 그걸 빠뜨린다 */
  it('brandColor를 읽는 곳은 변수를 꽂는 한 곳뿐이다', () => {
    const hits = files.filter((f) => /domain\.brandColor|\.brandColor/.test(f.text)).map((f) => f.rel)
    expect(hits.sort(), 'brandColor는 셸과 포털 카드에서만 읽는다').toEqual([
      'pages/portal/PortalPage.tsx',
      'widgets/app-shell/AppShell.tsx',
    ])
  })
})
