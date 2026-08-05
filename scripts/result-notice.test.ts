import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * AI가 만든 결과에는 그렇다고 적혀 있어야 한다.
 *
 * 규제(AI 기본법 제31조 생성물 표시)이자 이 제품의 원칙이다 —
 * 화면이 만든 것과 모델이 만든 것을 사용자가 구분할 수 있어야 한다.
 *
 * 예전에는 이 문구가 가장 흐린 회색 한 줄이었고, 새 결과 화면을 만들 때
 * **빠뜨려도 아무도 몰랐다.** 그래서 기계로 센다.
 *
 * 판정 기준: 결과 절(`ResultSection`)을 쓰는 화면에는 `notice`가 하나는 있어야 한다.
 * 절마다 요구하지는 않는다 — 한 화면에 결과 절이 둘일 때 같은 고지를 두 번 붙이면
 * 오히려 읽지 않게 된다(데이터 조회가 그렇다: 표 절과 근거 절).
 */

const PAGES = join(process.cwd(), 'src/pages')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) return walk(p)
    return p.endsWith('.tsx') && !p.endsWith('.test.tsx') ? [p] : []
  })
}

const files = walk(PAGES).map((p) => ({
  rel: p.slice(PAGES.length + 1).replaceAll('\\', '/'),
  text: readFileSync(p, 'utf8'),
}))

describe('AI 생성물 표시', () => {
  it('결과 절을 쓰는 화면에는 AI 고지가 있다', () => {
    const withResult = files.filter((f) => f.text.includes('<ResultSection'))
    expect(withResult.length, '결과 절을 쓰는 화면이 있어야 이 검사가 산다').toBeGreaterThan(5)
    const missing = withResult.filter((f) => !f.text.includes('notice=')).map((f) => f.rel)
    expect(missing, 'AI가 만든 결과라는 표시가 없는 화면').toEqual([])
  })

  /* '결과입니다'라고만 하면 누가 만든 것인지 모른다.
     `notice`는 조건식일 수도 있어 값을 정확히 뜯지 않는다 —
     그 화면 어딘가에 'AI가 …'로 시작하는 문구가 있는지만 본다 */
  it('고지 문구가 AI를 주어로 말한다', () => {
    const withNotice = files.filter((f) => f.text.includes('<ResultSection') && f.text.includes('notice='))
    expect(withNotice.length).toBeGreaterThan(5)
    const vague = withNotice.filter((f) => !/['"`]AI가 /.test(f.text)).map((f) => f.rel)
    expect(vague, "고지는 'AI가 …'로 시작한다").toEqual([])
  })
})
