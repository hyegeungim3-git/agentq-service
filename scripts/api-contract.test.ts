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
  /* 주소가 아니라 **경계 안에서만 쓰는 도우미**다. 서버가 붙으면 없어지거나
     테넌시 헤더 주입으로 바뀐다 — 백엔드에 요청할 것이 없으므로 표에 없다 */
  const NOT_ENDPOINTS = ['pack.ts', 'tenant.ts']

  it('fixture를 쓰는 경계 함수에는 교체 표시가 있다', () => {
    const missing = sources
      .filter((s) => !NOT_ENDPOINTS.includes(s.file))
      .filter((s) => s.text.includes('@fixtures/') && !s.text.includes('TODO(api-미확정)'))
      .map((s) => s.file)
    expect(missing).toEqual([])
  })

  /* 코드에만 있고 문서에 없는 엔드포인트 — 백엔드가 모르는 호출이 생긴 것이다 */
  /**
   * **'제거 조건'이 주인 없는 문장이 되지 않게.**
   *
   * `TODO(api-미확정)` 마다 '무엇이 정해지면 지울 수 있나'를 적어 뒀다. 그 문장을 세면
   * 어떤 결정이 얼마를 여는지 나오고, 그게 §6의 '붙이는 순서' 근거다.
   *
   * 그런데 문장을 자유롭게 쓰게 두면 **아무도 답할 사람이 없는 조건**이 생긴다.
   * 실제로 그랬다 — 2026-08-08에 세어 보니 `OCR 엔진·응답 형식 확정` 류가 13종류
   * 있었는데 **제안서 §3에는 그 질문이 없었다.** 백엔드가 8건을 다 답해도 에이전트
   * 13종은 못 붙는 상태였고, 아무도 그걸 몰랐다. (그리고 D-010 이전 문구
   * `API 명세 확정`이 6곳에 남아 있었다 — 이미 없어진 조건이다)
   *
   * 그래서 조건을 **목록으로 못박는다.** 새 조건을 쓰려면 여기에 추가해야 하고,
   * 추가하면서 '이건 누가 답하나'를 생각하게 된다.
   */
  it("교체 표시의 '제거 조건'이 알려진 것뿐이다", () => {
    /** 제안서 §3의 결정 또는 §3-9의 엔진 결정에 대응하는 것만 */
    const KNOWN = [
      '백엔드가 제안서를 확정',
      '백엔드가 테넌시(§3-2)를 확정',
      '백엔드가 인증·권한을 확정',
      '백엔드가 인증·검토 흐름을 확정',
      '백엔드가 인증·저장소를 확정',
      '백엔드가 인증·배포 경로를 확정',
      '백엔드가 인증·발송 경로를 확정',
      '백엔드가 인증·회수 정책을 확정',
      '백엔드가 인증·키 보관 방식을 확정',
      '백엔드가 인증·보관 정책을 확정',
      '백엔드가 보관 정책을 확정',
      '보안(§3-3)이 등급별 정책을 확정',
      '백엔드가 파일 생성 경로를 확정',
      '백엔드가 파일 생성·보관 경로를 확정',
      '백엔드가 감사 기록 범위를 확정',
      '백엔드가 요금 주기를 확정',
      /* §3-9 — AI 엔진과 응답 형식 */
      '요약 모델·응답 형식 확정',
      '번역 엔진·응답 형식 확정',
      '검토 모델·응답 형식 확정',
      '생성 모델·응답 형식 확정',
      'STT·생성 모델 응답 형식 확정',
      'OCR 엔진·응답 형식 확정',
      'Text-to-SQL 엔진·응답 형식 확정',
      '검색 엔진·응답 형식 확정',
      '규정 검색 엔진·응답 형식 확정',
      '분석 엔진·응답 형식 확정',
      '평가 모델·응답 형식 확정',
      '업로드 엔드포인트·최대 크기·파싱 응답 형식 확정',
      '업로드 엔드포인트·집계 응답 형식 확정',
    ]

    const unknown: string[] = []
    let seen = 0
    for (const f of sources) {
      for (const m of f.text.matchAll(/제거 조건 = ([^.]*)\./g)) {
        seen += 1
        const cond = (m[1] ?? '').trim()
        if (!KNOWN.includes(cond)) unknown.push(`${f.file}: ${cond}`)
      }
    }
    expect(seen, '교체 표시를 하나도 못 찾았다면 이 검사는 아무것도 보지 않았다').toBeGreaterThan(50)
    expect(
      [...new Set(unknown)],
      "누가 답해야 하는지 모르는 제거 조건 — 제안서 §3에 질문을 추가하고 여기 목록에도 넣을 것",
    ).toEqual([])
  })

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
    const CLIENT_ONLY = ['makeUserMessage', 'withPack', 'currentPack', 'setActiveDomain', 'activeDomain']
    const serverFns = sources
      .filter((s) => !NOT_ENDPOINTS.includes(s.file))
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
