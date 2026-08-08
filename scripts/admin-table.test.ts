import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * 관리자 표 규약.
 *
 * 관리자 화면 51개 중 25개가 표를 그린다. 표는 손으로 그리면 **빠지는 것이 늘 같다** —
 * 이름, 비었을 때의 말. 실제로 그 상태였다: 표 28개 전부 `<caption>`이 없었고,
 * 가로 스크롤 영역 이름은 28곳이 **똑같은 문자열**이라 한 화면에 표가 둘이면
 * 목소리로 고를 수 없었다.
 *
 * 부품(`AdminTable`)으로 묶어 해결했고, 여기서 **다시 흩어지지 않게 고정한다.**
 * 규칙을 문서에만 적으면 다음 화면에서 또 손으로 그린다.
 */

const ADMIN = join(process.cwd(), 'src/pages/admin')

type File = { rel: string; src: string }

function walk(dir: string, out: File[] = []): File[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      walk(p, out)
      continue
    }
    if (!name.endsWith('.tsx') || name.includes('.test.')) continue
    out.push({ rel: p.replace(process.cwd() + '\\', '').replace(/\\/g, '/'), src: readFileSync(p, 'utf8') })
  }
  return out
}

const FILES = walk(ADMIN)

describe('관리자 표', () => {
  it('화면이 표를 손으로 그리지 않는다', () => {
    const raw = FILES.filter((f) => f.src.includes('<table')).map((f) => f.rel)
    expect(raw, 'AdminTable을 쓸 것 — 이름과 빈 목록이 매번 빠진다').toEqual([])
  })

  /* 부품을 쓰더라도 이름이 비면 아무 소용이 없다 */
  it('모든 표에 이름이 있다', () => {
    const bad: string[] = []
    let tables = 0
    for (const f of FILES) {
      for (const m of f.src.matchAll(/<AdminTable\s+label="([^"]*)"/g)) {
        tables += 1
        if ((m[1] ?? '').trim().length < 2) bad.push(f.rel)
      }
    }
    expect(tables, '표를 하나도 못 찾았다면 이 검사는 아무것도 보지 않았다').toBeGreaterThan(20)
    expect(bad, '이름 없는 표 — 낭독기가 무슨 표인지 못 말한다').toEqual([])
  })

  /* 한 화면 안에서 이름이 겹치면 둘을 구분해 부를 수 없다 */
  it('한 화면 안에서 표 이름이 겹치지 않는다', () => {
    const dup: string[] = []
    for (const f of FILES) {
      const names = [...f.src.matchAll(/<AdminTable\s+label="([^"]*)"/g)].map((m) => m[1])
      const seen = new Set<string>()
      for (const n of names) {
        if (n !== undefined && seen.has(n)) dup.push(`${f.rel} — ${n}`)
        if (n !== undefined) seen.add(n)
      }
    }
    expect(dup, '같은 화면에 같은 이름의 표가 둘 — 목소리로 고를 수 없다').toEqual([])
  })

  /**
   * 비었을 때 머리글만 남는 표가 없어야 한다.
   *
   * 지금은 팩이 늘 값을 들고 있어 빈 경우가 안 나온다. 서버가 붙는 날 비로소 나오는데,
   * 그때 머리글만 있는 표는 '아직 안 그려졌다'로 읽힌다.
   */
  it('표마다 비었을 때 할 말이 있다', () => {
    const bad: string[] = []
    for (const f of FILES) {
      if (!f.src.includes('<AdminTable')) continue
      const tables = (f.src.match(/<AdminTable\s+label="/g) ?? []).length
      const empties = (f.src.match(/<EmptyRow /g) ?? []).length
      /* 값이 늘 한 줄인 표(단일 대상 상세)는 빈 경우가 없다 —
         그런 표는 `.map(`을 안 쓴다 */
      const mapped = (f.src.match(/\.map\(/g) ?? []).length
      if (mapped > 0 && empties < 1 && tables > 0) bad.push(f.rel)
    }
    expect(bad, '비면 머리글만 남는 표 — 무엇이 없는지 말할 것').toEqual([])
  })
})
