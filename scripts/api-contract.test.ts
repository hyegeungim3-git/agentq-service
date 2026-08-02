import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * API 제안서와 코드가 갈라지지 않게 지킨다.
 *
 * 제안서(`docs/API-PROPOSAL.md`)는 백엔드에 보내는 문서이고, 코드의 TODO 표시는
 * 서버가 붙을 때 무엇을 바꿔야 하는지의 목록이다. 둘이 어긋나면 어느 쪽이 맞는지
 * 알 수 없고, 보통은 문서 쪽이 조용히 낡는다.
 *
 * 그래서 한쪽만 고치면 여기서 깨지게 했다.
 *
 * `src/`가 아니라 `scripts/`에 있는 이유: 이 테스트는 앱이 아니라 **저장소**를 읽는다.
 * 앱 프로젝트에 node 타입을 열어 주면 화면 코드에서도 fs를 쓸 수 있게 된다.
 */

const API_DIR = join(process.cwd(), 'src/shared/api')
const DOC = readFileSync(join(process.cwd(), 'docs/API-PROPOSAL.md'), 'utf8')

const apiFiles = readdirSync(API_DIR).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))

const sources = apiFiles.map((f) => ({ file: f, text: readFileSync(join(API_DIR, f), 'utf8') }))

/** 'TODO(api-미확정): POST /summaries 로 교체' 에서 엔드포인트만 */
const ENDPOINT = /TODO\(api-미확정\): ([A-Z]+ \/[^\s]*(?: \(multipart\))?) 로 교체/g

/** 'export function fetchDomains(' / 'export async function createReport(' */
const EXPORTED = /export (?:async )?function ([A-Za-z0-9_]+)\s*\(/g

const matchAll = (text: string, re: RegExp): string[] =>
  [...text.matchAll(new RegExp(re.source, 'g'))].map((m) => m[1] ?? '')

describe('API 제안서와 코드', () => {
  it('fixture를 쓰는 경계 함수에는 교체 표시가 있다', () => {
    const missing = sources
      .filter((s) => s.text.includes('@fixtures/') && !s.text.includes('TODO(api-미확정)'))
      .map((s) => s.file)
    expect(missing).toEqual([])
  })

  /* 코드에만 있고 문서에 없는 엔드포인트 — 백엔드가 모르는 호출이 생긴 것이다 */
  it('코드의 모든 엔드포인트가 제안서에 적혀 있다', () => {
    const inCode = sources.flatMap((s) => matchAll(s.text, ENDPOINT))
    expect(inCode.length).toBeGreaterThan(0)
    const undocumented = [...new Set(inCode)].filter((e) => !DOC.includes(e))
    expect(undocumented).toEqual([])
  })

  /* 문서에만 있고 코드에 없는 함수 — 제안서가 낡은 것이다 */
  it('제안서가 가리키는 클라이언트 함수가 코드에 있다', () => {
    const inCode = new Set(sources.flatMap((s) => matchAll(s.text, EXPORTED)))
    // 표의 두 번째 칸에 `함수명` 형태로 적어 둔 것만 본다
    const inDoc = [...DOC.matchAll(/\| `([a-z][A-Za-z0-9]+)` \|/g)].map((m) => m[1] ?? '')
    expect(inDoc.length).toBeGreaterThan(10)
    const dangling = inDoc.filter((fn) => !inCode.has(fn))
    expect(dangling).toEqual([])
  })

  /* 서버를 부르는 함수인데 표에서 빠지면 계약에서 누락된다 */
  it('서버를 부르는 함수가 제안서 표에 빠짐없이 있다', () => {
    // 서버를 부르지 않는 클라이언트 전용 함수는 제외한다
    const CLIENT_ONLY = ['makeUserMessage']
    const serverFns = sources
      .filter((s) => s.text.includes('@fixtures/'))
      .flatMap((s) => matchAll(s.text, EXPORTED))
      .filter((fn) => !CLIENT_ONLY.includes(fn))
    const missing = [...new Set(serverFns)].filter((fn) => !DOC.includes(`\`${fn}\``))
    expect(missing).toEqual([])
  })
})
