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

/**
 * 생성한 OpenAPI 명세가 제안서와 같은 것을 말하는지.
 *
 * 명세는 `npm run api:spec`이 만든다. 여기서 다시 만들지는 않는다 —
 * 스키마 추출에 6초쯤 걸려서 단위 테스트를 그만큼 늦춘다.
 * **최신인지**는 CI가 재생성 후 `git diff --exit-code`로 본다.
 * 여기서는 파서 없이 볼 수 있는 것, 즉 **주소가 빠짐없이 들어갔는지**를 본다.
 */
const SPEC_TEXT = readFileSync(join(process.cwd(), 'docs/api/openapi.json'), 'utf8')
const SPEC = JSON.parse(SPEC_TEXT) as {
  paths: Record<string, Record<string, { operationId: string; 'x-clients'?: string[] }>>
  components: { schemas: Record<string, unknown> }
}

/** 제안서 표에서 (메서드, 경로)만 뽑는다. 쿼리·multipart 표기는 떼어 낸다 */
const docOps = [...DOC.matchAll(/^\| `([A-Z]+) ([^`]+?)` \| `([A-Za-z0-9_]+)` \|/gm)].map((m) => ({
  method: (m[1] ?? '').toLowerCase(),
  path: (m[2] ?? '').replace(' (multipart)', '').split('?')[0] ?? '',
  fn: m[3] ?? '',
}))

describe('OpenAPI 명세', () => {
  it('제안서의 모든 주소가 명세에 있다', () => {
    const missing = docOps
      .filter((o) => !SPEC.paths[o.path]?.[o.method])
      .map((o) => `${o.method.toUpperCase()} ${o.path}`)
    expect([...new Set(missing)], 'npm run api:spec 을 다시 돌려야 합니다').toEqual([])
  })

  it('명세의 모든 주소가 제안서에 있다', () => {
    const inDoc = new Set(docOps.map((o) => `${o.method} ${o.path}`))
    const extra: string[] = []
    for (const [path, methods] of Object.entries(SPEC.paths)) {
      for (const method of Object.keys(methods)) {
        if (!inDoc.has(`${method} ${path}`)) extra.push(`${method.toUpperCase()} ${path}`)
      }
    }
    expect(extra, '명세에만 있는 주소 — 제안서가 낡았습니다').toEqual([])
  })

  /* 같은 주소를 두 화면이 쓰면 둘 다 적혀 있어야 한다.
     하나만 남기면 백엔드는 고칠 때 영향 범위를 놓친다 */
  it('한 주소를 부르는 화면이 둘이면 둘 다 적는다', () => {
    const byOp = new Map<string, string[]>()
    for (const o of docOps) byOp.set(`${o.method} ${o.path}`, [...(byOp.get(`${o.method} ${o.path}`) ?? []), o.fn])
    const shared = [...byOp.entries()].filter(([, fns]) => fns.length > 1)
    expect(shared.length, '공유 자원이 하나는 있어야 이 경로가 산다').toBeGreaterThan(0)
    for (const [key, fns] of shared) {
      const [method, path] = key.split(' ') as [string, string]
      const op = SPEC.paths[path]?.[method]
      expect(op?.['x-clients'] ?? [op?.operationId], key).toEqual(fns)
    }
  })

  /* 참조가 끊긴 명세는 Swagger에서 열리지도 않는다 —
     받는 쪽에서 발견하기 전에 여기서 잡는다 */
  it('명세의 모든 $ref가 실제 스키마를 가리킨다', () => {
    const refs = [...SPEC_TEXT.matchAll(/"\$ref":\s*"#\/components\/schemas\/([^"]+)"/g)].map(
      (m) => m[1] ?? '',
    )
    expect(refs.length).toBeGreaterThan(100)
    const dangling = [...new Set(refs)].filter((r) => !(r in SPEC.components.schemas))
    expect(dangling, '없는 스키마를 가리키는 참조').toEqual([])
  })

  /* 안 쓰는 스키마가 쌓이면 백엔드가 안 만들어도 될 것을 만든다 */
  it('아무도 안 가리키는 스키마가 없다', () => {
    const refs = new Set(
      [...SPEC_TEXT.matchAll(/"\$ref":\s*"#\/components\/schemas\/([^"]+)"/g)].map(
        (m) => m[1] ?? '',
      ),
    )
    const orphans = Object.keys(SPEC.components.schemas).filter((n) => !refs.has(n))
    expect(orphans, '어디서도 참조하지 않는 스키마').toEqual([])
  })
})
