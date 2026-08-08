import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * **README가 코드와 다른 말을 하지 않게.**
 *
 * 2026-08-08 인수인계 준비 중에 드러난 것: README의 '현재 상태' 표가
 * **발주처 1종·관리자 미착수**라고 적고 있었다. 실제로는 발주처 4종에 관리자 45화면이었다.
 * 개발자가 **처음 여는 파일**이 거짓말을 하고 있었던 것이다.
 *
 * 문서가 낡는 것은 게으름이 아니라 구조 문제다 — 사람이 두 곳을 손으로 맞추게 두면
 * 반드시 갈라진다. 그래서 숫자만이라도 기계가 본다.
 *
 * ⚠️ 여기서 보는 것은 **숫자뿐**이다. 문장이 사실인지는 못 본다.
 * 상태를 크게 바꿨으면 표의 글도 같이 고칠 것.
 */

/**
 * 앱 모듈을 import하지 않고 **소스를 읽어** 센다.
 *
 * `scripts/`는 `tsconfig.node.json`이 따로 덮고 있고 경로 별칭이 없다. 별칭을 열어 봤지만
 * `module: "nodenext"` 해석과 부딪혔다. 이 저장소의 다른 검사 스크립트도 전부 파일을
 * 읽는 방식이라 그쪽에 맞춘다 — 어차피 **문서와 코드라는 두 산출물을 대조**하는 일이다.
 *
 * 세는 자리를 못 찾으면 0이 아니라 **실패**로 만든다. 조용히 0이 되면 검사가 아무것도
 * 안 보면서 통과한다.
 */
const src = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8')

function countIn(rel: string, pattern: RegExp, what: string): number {
  const n = (src(rel).match(pattern) ?? []).length
  if (n === 0) throw new Error(`${rel}에서 ${what}를 하나도 못 찾았다 — 검사가 헛돈다`)
  return n
}

const README = readFileSync(join(process.cwd(), 'README.md'), 'utf8')
const HANDOVER = readFileSync(join(process.cwd(), 'docs/HANDOVER.md'), 'utf8')

/** 경계 파일에서 export한 함수 수 — 이 수가 곧 '서버를 붙일 때 만질 자리'다 */
function boundaryFunctionCount(): number {
  const dir = join(process.cwd(), 'src/shared/api')
  let count = 0
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.ts') || f.includes('.test.')) continue
    count += (readFileSync(join(dir, f), 'utf8').match(/^export (?:async )?function /gm) ?? []).length
  }
  return count
}

/** README에서 `<라벨> ... <숫자><단위>` 꼴을 찾아 그 숫자를 돌려준다 */
function stated(pattern: RegExp): number | null {
  const m = pattern.exec(README)
  return m?.[1] ? Number(m[1]) : null
}

describe('README가 코드와 같은 말을 하는가', () => {
  it('에이전트 종수', () => {
    const n = stated(/에이전트 (\d+)종/)
    expect(n, 'README에서 에이전트 종수를 못 찾았다 — 문구가 바뀌었으면 이 검사도 고칠 것').not.toBeNull()
    expect(n).toBe(countIn('src/entities/agent/model.ts', /^ {2}\{ id: '/gm, '에이전트'))
  })

  it('발주처 종수', () => {
    const n = stated(/\*\*(\d+)종 전부 업무 데이터 보유\*\*/)
    expect(n, 'README에서 발주처 종수를 못 찾았다').not.toBeNull()
    const total = countIn('src/fixtures/domains.ts', /^ {4}id: '/gm, '발주처')
    expect(n).toBe(total)
    /* '전부'라고 적었으면 실제로 전부여야 한다 */
    expect(
      countIn('src/fixtures/domains.ts', /status: 'ready'/g, 'ready 발주처'),
      "README가 '전부 보유'라고 적었는데 준비 안 된 발주처가 있다",
    ).toBe(total)
  })

  it('관리자 메뉴 수와 준비 중 수', () => {
    const menus = stated(/메뉴 (\d+)개/)
    const planned = stated(/준비 중 (\d+)개/)
    expect(menus, 'README에서 관리자 메뉴 수를 못 찾았다').toBe(
      /* 메뉴는 한 줄짜리와 여러 줄짜리가 섞여 있다. 모든 메뉴가 정확히 한 번 갖는
         `phase:`를 센다 — `id:`는 다른 배열에도 있고 `parentId:`는 타입 정의에도 있다 */
      countIn('src/entities/admin/nav.ts', /phase: 'P/g, '관리자 메뉴'),
    )
    /* 준비 중은 0일 수 있으므로 countIn(0이면 실패)을 쓰지 않는다 */
    expect(planned, 'README에서 준비 중 수를 못 찾았다').toBe(
      (src('src/entities/admin/nav.ts').match(/status: 'planned'/g) ?? []).length,
    )
  })

  it('데이터 경계 함수 수', () => {
    const n = stated(/경계 함수 (\d+)개/)
    expect(n, 'README에서 경계 함수 수를 못 찾았다').not.toBeNull()
    expect(n).toBe(boundaryFunctionCount())
  })

  /**
   * 인수인계 문서도 같은 숫자를 말한다.
   *
   * 이어받는 개발자가 **가장 먼저 찾는 수**가 '어디를 만져야 서버가 붙나'이다.
   * 그 수가 틀리면 첫날부터 헤맨다.
   */
  it('HANDOVER의 경계 함수 수와 미확정 표시 수', () => {
    const funcs = /경계 함수 \*\*(\d+)개\*\*/.exec(HANDOVER)
    const todos = /`TODO\(api-미확정\)` 표시 \*\*(\d+)개\*\*/.exec(HANDOVER)
    expect(funcs?.[1], 'HANDOVER에서 경계 함수 수를 못 찾았다').toBeDefined()
    expect(Number(funcs?.[1])).toBe(boundaryFunctionCount())

    const dir = join(process.cwd(), 'src/shared/api')
    let marks = 0
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.ts') || f.includes('.test.')) continue
      marks += (readFileSync(join(dir, f), 'utf8').match(/TODO\(api-미확정\)/g) ?? []).length
    }
    expect(todos?.[1], 'HANDOVER에서 미확정 표시 수를 못 찾았다').toBeDefined()
    expect(Number(todos?.[1])).toBe(marks)
  })
})
