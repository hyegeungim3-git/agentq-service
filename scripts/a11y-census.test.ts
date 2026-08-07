import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * **한 곳을 고치고 '전부 고쳤다'고 적는 것을 막는다.**
 *
 * 이 파일이 있는 이유는 실패 기록이다. 접근성 결함 15건을 고쳤다고 보고한 뒤
 * 반증 검수를 붙였더니 **세 건이 과장**이었고, 셋 다 같은 모양이었다.
 *
 *  - 결함 6 — 공용 셸만 고쳐 8/13화면. 셸을 안 쓰는 4화면은 옛 패턴 그대로
 *  - 결함 9 — 같은 파일 안의 다른 헤더는 `aria-label="돌아가기"` 그대로. 5화면이 그걸 씀
 *  - 결함 14 — 붙일 자리를 다 안 세서, 정작 언어 고르는 화면에 위반이 남음
 *
 * 원인은 하나다. **패턴을 고쳤다고 보고했지 자리를 세지 않았다.**
 * 그래서 여기서는 규칙마다 **전수를 세고 어긋난 자리를 전부 나열**한다.
 * 한 건이라도 남으면 목록째로 실패한다 — '몇 곳은 됐다'가 통과가 되지 않게.
 *
 * ⚠️ 소스를 읽는 검사다. 렌더된 결과가 아니라 **쓰여 있는 것**을 본다.
 * 그래서 놓치는 것이 있다(동적으로 만드는 속성 등). 그 몫은 e2e가 맡는다 —
 * 여기서 통과했다고 화면에서 됐다는 뜻은 아니다.
 */

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith('.tsx') && !p.endsWith('.test.tsx')) out.push(p)
  }
  return out
}

const FILES = walk(SRC).map((p) => ({ path: p, rel: relative(ROOT, p).replace(/\\/g, '/'), src: readFileSync(p, 'utf8') }))

/** 줄 번호 — 어긋난 자리를 바로 열 수 있게 */
const lineOf = (src: string, index: number): number => src.slice(0, index).split('\n').length

describe('접근성 전수 — 자리를 세어 본다', () => {
  /**
   * 결함 7. 표의 각 행 첫 칸이 행 머리글인가.
   *
   * 낭독기는 표 안을 셀 단위로 돌 때 열 이름과 **행 머리글**을 함께 읽는다.
   * 머리글이 없으면 "정상"만 들리고 그게 어느 노드의 값인지는 화면을 보는 사람만 안다.
   *
   * 27화면 29행을 바꿨다고 적었는데, 그 숫자가 **전부**인지는 세지 않았다. 여기서 센다.
   */
  it('tbody의 모든 행에 행 머리글이 있다', () => {
    const missing: string[] = []
    let rows = 0

    for (const f of FILES) {
      let i = 0
      while ((i = f.src.indexOf('<tbody', i)) >= 0) {
        const end = f.src.indexOf('</tbody>', i)
        if (end < 0) break
        const body = f.src.slice(i, end)
        let j = 0
        while ((j = body.indexOf('<tr', j)) >= 0) {
          const close = body.indexOf('</tr>', j)
          const row = body.slice(j, close < 0 ? body.length : close)
          rows += 1
          /* 칸을 반복해 그리는 표는 자리를 봐서 첫 칸만 머리글로 만든다
             (`ci === 0 ? <th scope="row"` 꼴) — 그래서 순서가 아니라 존재로 본다 */
          if (!row.includes('scope="row"')) {
            missing.push(`${f.rel}:${lineOf(f.src, i + j)}`)
          }
          if (close < 0) break
          j = close + 5
        }
        i = end + 8
      }
    }

    /* 센 자리가 0이면 규칙이 아무것도 안 지킨 것이다 — 통과로 두면 안 된다 */
    expect(rows, '표를 하나도 못 찾았다면 이 검사는 아무것도 보지 않았다').toBeGreaterThan(20)
    expect(missing, '행 머리글 없는 행 — 낭독기가 어느 줄의 값인지 못 읽는다').toEqual([])
  })

  /**
   * 결함 8. 가로로 스크롤되는 표 상자에 이름이 있는가.
   *
   * `tabIndex={0}`만 주면 Tab이 거기 멈추는데 이름이 없어, 낭독기가 아무 말 없이
   * 서거나 표 전체를 한 덩어리로 쏟는다.
   */
  it('가로 스크롤 정지점마다 역할과 이름이 있다', () => {
    const bad: string[] = []
    let stops = 0

    for (const f of FILES) {
      let i = 0
      while ((i = f.src.indexOf('overflow-x-auto', i)) >= 0) {
        /* 이 클래스를 들고 있는 여는 태그 하나를 떼어 낸다 */
        const open = f.src.lastIndexOf('<', i)
        const close = f.src.indexOf('>', i)
        const tag = f.src.slice(open, close + 1)
        i = close + 1
        /* 포커스를 받지 않는 상자는 정지점이 아니다 — 이름이 필요 없다 */
        if (!tag.includes('tabIndex={0}')) continue
        stops += 1
        if (!tag.includes('role="region"') || !/aria-label/.test(tag)) {
          bad.push(`${f.rel}:${lineOf(f.src, open)}`)
        }
      }
    }

    expect(stops, '정지점을 하나도 못 찾았다면 이 검사는 아무것도 보지 않았다').toBeGreaterThan(20)
    expect(bad, '이름 없는 정지점 — Tab이 멈추는데 무엇인지 안 들린다').toEqual([])
  })

  /**
   * 결함 9. 어디로 가는지 말하지 않는 이름.
   *
   * 공용 셸의 뒤로가기만 고치고 '전부 고쳤다'고 적었는데, 같은 파일의 다른 헤더는
   * `aria-label="돌아가기"` 그대로였고 5화면이 그걸 쓰고 있었다.
   * 목적지가 안 들리는 일반 문구를 아예 금칙으로 둔다.
   */
  it('어디로 가는지 말하지 않는 이름이 없다', () => {
    const VAGUE = ['돌아가기', '뒤로', '닫기', '열기', '이동', '보기']
    const bad: string[] = []

    for (const f of FILES) {
      for (const word of VAGUE) {
        const needle = `aria-label="${word}"`
        let i = 0
        while ((i = f.src.indexOf(needle, i)) >= 0) {
          bad.push(`${f.rel}:${lineOf(f.src, i)} — ${word}`)
          i += needle.length
        }
      }
    }

    expect(bad, '이름만 듣고 어디로 가는지 알 수 없다 — 무엇을 닫는지·어디로 가는지까지 적어야 한다').toEqual([])
  })

  /**
   * 결함 1·2·6. 실행 중·완료를 알리는 자리가 **처음부터 있는가.**
   *
   * 실행하는 순간 비로소 만들어지는 라이브 리전은 낭독기가 첫 변화를 놓치는 경우가 있다.
   * 실제로 이 저장소가 세 번 밟았고, 세 번째는 공용 셸만 고쳐 4화면이 남았다.
   *
   * 여기서 금지하는 것은 **`busy`/`running`/`pending` 조건 안에서 생겨나는 라이브 리전**이다.
   * 문서를 처음 불러오는 동안의 `loading` 리전은 화면과 함께 마운트되므로 대상이 아니다.
   */
  it('실행 상태에 따라 생겨나는 라이브 리전이 없다', () => {
    const bad: string[] = []
    let regions = 0

    for (const f of FILES) {
      let i = 0
      while ((i = f.src.indexOf('role="status"', i)) >= 0) {
        regions += 1
        const open = f.src.lastIndexOf('<', i)
        /* 이 요소를 감싸는 조건부 렌더가 바로 위에 있는가 —
           `{busy && (` / `{x.phase.kind === 'running' && (` / `{c.pending && (` 꼴 */
        const before = f.src.slice(Math.max(0, open - 400), open)
        const lastCond = before.lastIndexOf('&& (')
        if (lastCond >= 0) {
          const head = before.slice(Math.max(0, lastCond - 120), lastCond)
          /* 조건과 이 요소 사이에 다른 요소가 끼어 있으면 감싸는 조건이 아니다 */
          const between = before.slice(lastCond)
          const wraps = !/<[a-zA-Z]/.test(between)
          if (wraps && /\b(busy|running|pending)\b/.test(head)) {
            bad.push(`${f.rel}:${lineOf(f.src, open)}`)
          }
        }
        i += 13
      }
    }

    expect(regions, '라이브 리전을 하나도 못 찾았다면 이 검사는 아무것도 보지 않았다').toBeGreaterThan(10)
    expect(
      bad,
      '실행할 때 비로소 만들어지는 라이브 리전 — 자리는 늘 두고 내용만 채워야 첫 변화를 놓치지 않는다',
    ).toEqual([])
  })

  /**
   * 결함 14. 원문 그대로 두는 자리에 언어 표시가 있는가 — **셸 쪽 자리 세기.**
   *
   * 화면 틀만 영어로 바뀌고 업무 콘텐츠는 한국어 원문으로 남는다. 셸이 그리는
   * 발주처 고유 값(기관명·워크스페이스·대화 제목·사용자)이 그 대상이다.
   * 렌더 결과는 e2e가 훑고, 여기서는 **셸에 표시가 몇 자리 있는지**를 못박아
   * 새 항목을 추가하면서 빠뜨리는 것을 막는다.
   */
  it('사용자 셸에 언어 표시가 자리마다 붙어 있다', () => {
    const shell = FILES.find((f) => f.rel.endsWith('widgets/app-shell/AppShell.tsx'))
    expect(shell, 'AppShell을 못 찾았다').toBeTruthy()
    const marks = shell!.src.match(/lang="ko"/g) ?? []
    /* 기관명·워크스페이스 선택·워크스페이스 설명·대화 목록·대화 삭제·사용자 정보·본문·알림 */
    expect(marks.length, '셸에서 원문 그대로 두는 자리마다 lang이 붙어야 한다').toBeGreaterThanOrEqual(7)
  })
})
