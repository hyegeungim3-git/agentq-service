import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * **의존 방향과 데이터 경계를 기계가 지킨다.**
 *
 * AGENTS.md §5(영역별 참조 범위)와 §9(데이터 접근은 `shared/api`를 통과한다)는
 * 문서로만 있었다. 2026-08-08 전수 대조에서 **둘 다 이미 새고 있었다.**
 *
 *  - `shared/api/packops.ts`가 `entities`에서 **값**을 가져와 표시용 이름을 만들고 있었다
 *    (경계가 라벨을 만들면 서버가 붙을 때 그 문자열까지 서버가 줘야 한다)
 *  - 관리자 화면 10곳이 `@fixtures`를 직접 읽고 있었다. 그중 태스크플로우 빌더는
 *    **도구 연결 상태**를 정적 import로 읽어, 서버가 붙어도 옛 상태를 보여 줄 참이었다
 *
 * 사람이 매번 대조하지 않아도 되게 여기로 옮긴다.
 */

const ROOT = process.cwd()

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if ((p.endsWith('.ts') || p.endsWith('.tsx')) && !p.includes('.test.')) out.push(p)
  }
  return out
}

const read = (dir: string) =>
  walk(join(ROOT, 'src', dir)).map((p) => ({
    rel: relative(ROOT, p).replace(/\\/g, '/'),
    src: readFileSync(p, 'utf8'),
  }))

const lineOf = (src: string, i: number) => src.slice(0, i).split('\n').length

describe('경계', () => {
  /**
   * §5 — `shared`는 상위를 참조하지 않는다.
   *
   * 예외 하나를 **명시적으로** 둔다: `entities`의 **타입**. 경계 함수가 도메인 타입을
   * 돌려주지 않으면 부르는 쪽이 전부 캐스팅해야 한다. 타입은 빌드 뒤 사라지므로
   * 런타임 의존이 아니다. **값을 가져오는 것은 금지** — 그때부터는 진짜 의존이고,
   * 실제로 그 자리에서 표시용 변환이 새어 나왔다.
   */
  it('shared는 상위에서 값을 가져오지 않는다', () => {
    const bad: string[] = []
    for (const f of read('shared')) {
      for (const m of f.src.matchAll(/^import\s+(?!type\s)\{([^}]*)\}\s+from\s+'(@entities|@pages|@widgets|@features)([^']*)'/gm)) {
        bad.push(`${f.rel}:${lineOf(f.src, m.index ?? 0)} — ${m[2]}${m[3]} 에서 ${m[1]?.trim()}`)
      }
    }
    expect(bad, 'shared가 상위에서 값을 가져오면 경계가 뒤집힌다 (타입은 허용)').toEqual([])
  })

  /** `shared`가 화면 계층을 아는 것은 타입이라도 안 된다 */
  it('shared는 화면 계층을 아예 모른다', () => {
    const bad: string[] = []
    for (const f of read('shared')) {
      for (const m of f.src.matchAll(/from\s+'(@pages|@widgets|@features)/g)) {
        bad.push(`${f.rel}:${lineOf(f.src, m.index ?? 0)}`)
      }
    }
    expect(bad, 'shared가 화면을 알면 재사용 기반이 아니라 그 화면의 일부다').toEqual([])
  })

  /**
   * §9 — 화면은 데이터를 `shared/api`로만 받는다.
   *
   * 남은 예외는 **여기 적힌 것뿐**이다. 목록에 있다는 것은 '괜찮다'가 아니라
   * **'아직 안 옮겼다'** 는 뜻이다 — 서버가 붙기 전에 없애야 할 빚이다.
   */
  it('화면이 fixture를 직접 읽지 않는다', () => {
    /**
     * 남은 빚 — 파일:심볼. **비어 있는 것이 정상이다.**
     *
     * 2026-08-08에 8곳을 전부 옮겨 비웠다. 두 종류였다.
     *  - id→이름 조회 5곳 → 이미 있던 경계 함수(`fetchAreas`·`fetchDatasets`)로
     *  - 기준 시각 3곳 → `fetchAsOf`·`fetchBillingMonth`를 새로 만들어 **서버가 줄 값**으로
     *
     * 뒤엣것이 더 위험했다. 화면이 `'2026-08-02'`를 박아 쓰는 셈이라 서버가 붙어도
     * 옛 날짜로 '며칠 대기'를 계산해 **조용히 틀린 수**를 자신 있게 보여 준다.
     *
     * 여기에 다시 채우려거든 왜 못 옮기는지도 같이 적을 것.
     */
    const DEBT = new Map<string, string>([])

    const found: string[] = []
    for (const f of [...read('pages'), ...read('widgets')]) {
      for (const m of f.src.matchAll(/^import\s+\{([^}]*)\}\s+from\s+'@fixtures[^']*'/gm)) {
        const symbols = (m[1] ?? '').trim()
        const allowed = DEBT.get(f.rel)
        if (allowed && symbols.includes(allowed)) continue
        found.push(`${f.rel}:${lineOf(f.src, m.index ?? 0)} — ${symbols}`)
      }
    }
    expect(
      found,
      '화면이 fixture를 직접 읽으면 서버가 붙어도 그 화면만 안 바뀐다 — shared/api를 거칠 것',
    ).toEqual([])

    /* 빚이 줄면 목록도 줄여야 한다 — 안 그러면 '없는 예외'가 남아 다음 위반을 덮는다 */
    const stale = [...DEBT.keys()].filter((rel) => {
      const f = [...read('pages'), ...read('widgets')].find((x) => x.rel === rel)
      return !f || !/from '@fixtures/.test(f.src)
    })
    expect(stale, '이미 고쳤는데 예외 목록에 남아 있다 — 지울 것').toEqual([])
  })

  /**
   * §9 — 경계는 **표시용 문자열을 만들지 않는다.**
   *
   * `sectorLabel(...)`·`AGENTS.find(...).name` 같은 변환이 경계 안에 있으면,
   * 서버가 붙을 때 그 라벨까지 서버가 줘야 하고 카탈로그와 갈라진다.
   */
  it('경계가 표시용 라벨을 만들지 않는다', () => {
    const LABELERS = /\b(sectorLabel|agentName|statusLabel|severityLabel)\s*\(/
    const bad: string[] = []
    for (const f of read('shared')) {
      const m = LABELERS.exec(f.src)
      if (m) bad.push(`${f.rel}:${lineOf(f.src, m.index)} — ${m[1]}`)
    }
    expect(bad, '경계는 코드·id를 돌려주고 이름은 화면이 붙인다').toEqual([])
  })
})
