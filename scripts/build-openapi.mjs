/**
 * OpenAPI 3.1 명세 생성 — `docs/API-PROPOSAL.md` §2 표 + TypeScript 타입.
 *
 * 왜 생성하나: 제안서는 사람이 읽는 문서다. 백엔드가 코드를 만들려면
 * **기계가 읽는 것**이 하나 더 있어야 한다(Swagger·Postman·코드 생성기).
 *
 * 왜 손으로 안 쓰나: 두 곳에 적으면 반드시 갈라진다. 스키마는 이미
 * 엔티티 모델 파일에 있고 그게 정본이다. 여기서는 옮겨 적는 게 아니라 **뽑는다**.
 * 한국어 주석도 그대로 `description`으로 따라간다.
 *
 * 실행: node scripts/build-openapi.mjs
 * 확인: scripts/api-contract.test.ts 가 결과물이 최신인지 본다.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { createGenerator } from 'ts-json-schema-generator'

const ROOT = process.cwd()
const DOC = join(ROOT, 'docs/API-PROPOSAL.md')
const OUT = join(ROOT, 'docs/api/openapi.yaml')
const ENTITIES = join(ROOT, 'src/entities')

/* ── 1. 제안서 표 읽기 ─────────────────────────────────────────── */

/** `| \`GET /x\` | \`fn\` | 설명 |` 한 줄을 뜯는다 */
function parseRows(md) {
  const rows = []
  for (const line of md.split('\n')) {
    const m = /^\| `([A-Z]+) ([^`]+?)` \| `([A-Za-z0-9_]+)` \| (.*?) \|$/.exec(line.trim())
    if (!m) continue
    const [, method, rawPath, fn, note] = m
    const multipart = rawPath.endsWith(' (multipart)')
    const withoutTag = multipart ? rawPath.slice(0, -' (multipart)'.length) : rawPath
    const [path, query] = withoutTag.split('?')
    rows.push({ method, path, query: query ?? '', fn, note, multipart })
  }
  return rows
}

/** 설명 칸에서 타입 이름과 파일 힌트를 뽑는다 */
function parseTypes(note) {
  const fileHint = /\(`(entities\/[^`]+\.ts)`\)/.exec(note)?.[1] ?? null
  const arrow = note.indexOf('→')
  const before = arrow < 0 ? '' : note.slice(0, arrow)
  const after = arrow < 0 ? note : note.slice(arrow + 1)
  const pick = (s) =>
    [...s.matchAll(/`([A-Z][A-Za-z0-9]*)(\[\])?`/g)].map((m) => ({
      name: m[1],
      array: m[2] === '[]',
    }))
  return { fileHint, request: pick(before)[0] ?? null, response: pick(after)[0] ?? null }
}

/* ── 2. 타입 → 파일 찾기 ───────────────────────────────────────── */

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('model.ts') ? [p] : []
  })
}

const MODEL_FILES = walk(ENTITIES)

/** 타입 이름 → 그 타입을 내보내는 파일들 */
const declaredIn = new Map()
for (const file of MODEL_FILES) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(/^export (?:type|interface) ([A-Z][A-Za-z0-9]*)\b/gm)) {
    const name = m[1]
    if (!declaredIn.has(name)) declaredIn.set(name, [])
    declaredIn.get(name).push(file)
  }
}

/** `entities/x/model.ts` → 모듈 이름 `x` */
const moduleOf = (file) => relative(ENTITIES, file).replaceAll('\\', '/').split('/')[0]

function resolveFile(typeName, hint) {
  if (hint) {
    const abs = join(ROOT, 'src', hint.replaceAll('/', join('a', 'b')[1]))
    const found = MODEL_FILES.find((f) => f.endsWith(join(...hint.split('/'))))
    if (found) return found
    void abs
  }
  const candidates = declaredIn.get(typeName) ?? []
  if (candidates.length === 1) return candidates[0]
  return null // 없거나 모호하다 — 부르는 쪽이 판단한다
}

/* ── 3. 스키마 뽑기 ────────────────────────────────────────────── */

const generatorCache = new Map()
function schemasOf(file) {
  if (generatorCache.has(file)) return generatorCache.get(file)
  const gen = createGenerator({
    path: file,
    tsconfig: join(ROOT, 'tsconfig.app.json'),
    type: '*',
    expose: 'export',
    topRef: true,
    skipTypeCheck: true,
    additionalProperties: false,
  })
  const schema = gen.createSchema('*')
  const defs = schema.definitions ?? {}
  generatorCache.set(file, defs)
  return defs
}

/* ── 4. 조립 ───────────────────────────────────────────────────── */

const md = readFileSync(DOC, 'utf8')
const rows = parseRows(md)
if (rows.length === 0) throw new Error('제안서 표를 못 읽었습니다')

const components = {} // 최종 이름 → 스키마
const owner = new Map() // 최종 이름 → 원본 파일 (충돌 판정용)
const problems = []

/** 이 타입(과 딸린 타입들)을 components에 넣고, 참조할 이름을 돌려준다 */
function register(typeName, file) {
  const defs = schemasOf(file)
  if (!defs[typeName]) {
    problems.push(`${typeName}: ${relative(ROOT, file)} 에서 스키마를 못 만들었습니다`)
    return null
  }
  const mod = moduleOf(file)
  const rename = new Map()

  // 이 파일이 주는 정의 전부를 이름 충돌만 피해서 담는다
  for (const [name, def] of Object.entries(defs)) {
    const body = JSON.stringify(def)
    if (!components[name]) {
      components[name] = def
      owner.set(name, file)
      continue
    }
    if (JSON.stringify(components[name]) === body) continue // 같은 것이면 그대로
    // 같은 이름 다른 내용 — 둘 다 모듈 이름을 붙여 가른다
    const prev = owner.get(name)
    const prevAlias = `${moduleOf(prev)}_${name}`
    if (!components[prevAlias]) {
      components[prevAlias] = components[name]
      owner.set(prevAlias, prev)
    }
    const alias = `${mod}_${name}`
    components[alias] = def
    owner.set(alias, file)
    rename.set(name, alias)
  }

  for (const [name, def] of Object.entries(components)) {
    void name
    void def
  }
  return rename.get(typeName) ?? typeName
}

/** `#/definitions/X` → `#/components/schemas/X` (별칭 적용) */
function rewriteRefs(node, aliasFor) {
  if (Array.isArray(node)) return node.map((n) => rewriteRefs(n, aliasFor))
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref' && typeof v === 'string' && v.startsWith('#/definitions/')) {
        const name = v.slice('#/definitions/'.length)
        out[k] = `#/components/schemas/${aliasFor(name)}`
      } else if (k === '$schema') {
        continue
      } else {
        out[k] = rewriteRefs(v, aliasFor)
      }
    }
    return out
  }
  return node
}

const paths = {}
const collisions = []

for (const row of rows) {
  const { request, response, fileHint } = parseTypes(row.note)
  const entry = { fn: row.fn, note: row.note.replace(/\s+/g, ' ').trim() }

  const resolve = (t) => {
    if (!t) return null
    const file = resolveFile(t.name, fileHint)
    if (!file) {
      problems.push(`${row.method} ${row.path} (${row.fn}): 타입 \`${t.name}\` 을 못 찾았습니다`)
      return null
    }
    const name = register(t.name, file)
    return name ? { name, array: t.array, file } : null
  }

  const res = resolve(response)
  const req = row.multipart ? null : resolve(request)

  /* 요약은 타입 표기를 걷어낸 산문만 쓴다 — 설명을 그대로 자르면
     '→ `Domain[]` (`entities/domain/model' 처럼 문장 중간에서 끊긴다 */
  const prose = entry.note
    .replace(/`[^`]*`/g, '')
    .replace(/→/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s·]+/, '')
    .trim()
  const summary = prose.split('. ')[0]?.slice(0, 120) || `${row.method} ${row.path}`

  const op = {
    operationId: row.fn,
    summary,
    /** 설명은 제안서 문장을 그대로 옮긴다 — '왜 이 필드가 필요한가'가 거기 있다 */
    description: entry.note,
    tags: [row.path.split('/')[1] || 'root'],
    responses: {
      '200': {
        description: '성공',
        content: {
          'application/json': {
            schema: res
              ? res.array
                ? { type: 'array', items: { $ref: `#/components/schemas/${res.name}` } }
                : { $ref: `#/components/schemas/${res.name}` }
              : { description: '응답 형태 미정 — 제안서 본문 참조' },
          },
        },
      },
      default: {
        description: '오류',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
      },
    },
  }

  if (row.multipart) {
    op.requestBody = {
      required: true,
      content: {
        'multipart/form-data': {
          schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
        },
      },
    }
  } else if (req) {
    op.requestBody = {
      required: true,
      content: {
        'application/json': { schema: { $ref: `#/components/schemas/${req.name}` } },
      },
    }
  }

  const params = []
  for (const m of row.path.matchAll(/\{([a-zA-Z]+)\}/g)) {
    params.push({ name: m[1], in: 'path', required: true, schema: { type: 'string' } })
  }
  for (const q of row.query.split('&').filter(Boolean)) {
    const name = q.split('=')[0]
    if (name) params.push({ name, in: 'query', required: false, schema: { type: 'string' } })
  }
  if (params.length > 0) op.parameters = params

  const method = row.method.toLowerCase()
  paths[row.path] ??= {}
  if (paths[row.path][method]) {
    const before = paths[row.path][method]
    if (JSON.stringify(before.responses) !== JSON.stringify(op.responses)) {
      collisions.push(
        `${row.method} ${row.path} — \`${before.operationId}\` 와 \`${row.fn}\` 이 같은 주소에 서로 다른 응답을 씁니다`,
      )
      continue
    }
    /* 같은 자원을 부르는 화면이 둘 이상이다(포털·관리자). 뒤엣것을 버리면
       백엔드는 이 주소를 한 화면만 쓰는 줄 안다 — 고칠 때 영향 범위를 놓친다 */
    before['x-clients'] = [...new Set([...(before['x-clients'] ?? [before.operationId]), row.fn])]
    continue
  }
  paths[row.path][method] = op
}

/* 별칭이 붙은 이름을 참조도 따라가게 한다 */
const aliasFor = (name) => (components[name] ? name : name)
for (const [name, def] of Object.entries(components)) {
  components[name] = rewriteRefs(def, aliasFor)
}

components.ApiError = {
  type: 'object',
  required: ['code', 'message'],
  additionalProperties: false,
  description:
    '오류 본문. message는 사용자에게 그대로 보여 줄 수 있는 한국어 문장이어야 한다 — 화면이 다시 쓰지 않고 그대로 띄운다.',
  properties: {
    code: { type: 'string', description: '기계가 구분하는 코드. 목록은 백엔드가 정한다(§3-8)' },
    message: { type: 'string' },
  },
}

/* 파일 하나를 읽으면 그 파일이 내보내는 타입이 전부 딸려 온다.
   그대로 두면 아무도 안 가리키는 스키마가 쌓이고, 받는 쪽은
   **안 만들어도 될 것을 만든다.** 오퍼레이션에서 닿는 것만 남긴다. */
const refsIn = (node, out = new Set()) => {
  if (Array.isArray(node)) node.forEach((n) => refsIn(n, out))
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref' && typeof v === 'string' && v.startsWith('#/components/schemas/')) {
        out.add(v.slice('#/components/schemas/'.length))
      } else refsIn(v, out)
    }
  }
  return out
}

const reachable = refsIn(paths)
let frontier = [...reachable]
while (frontier.length > 0) {
  const next = []
  for (const name of frontier) {
    const def = components[name]
    if (!def) continue
    for (const r of refsIn(def)) {
      if (!reachable.has(r)) {
        reachable.add(r)
        next.push(r)
      }
    }
  }
  frontier = next
}
const droppedSchemas = Object.keys(components).filter((n) => !reachable.has(n))
for (const n of droppedSchemas) delete components[n]

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'AgentQ API (프론트 제안)',
    version: '0.1.0-proposal',
    description: [
      '이 명세는 **프론트가 제안한 것**이다. 백엔드가 다르게 정하면 그쪽을 따른다(DECISIONS.md D-010).',
      '',
      '- 스키마는 손으로 적지 않았다. `src/entities/*/model.ts`에서 뽑았고 그 파일이 정본이다.',
      '- 인증·테넌시·권한은 아직 비어 있다. 프론트가 정할 일이 아니라서다 — API-PROPOSAL.md §5 참조.',
      '- 재생성: `node scripts/build-openapi.mjs`',
    ].join('\n'),
  },
  servers: [{ url: '/api', description: '미정 — 백엔드가 정한다' }],
  paths,
  components: { schemas: Object.fromEntries(Object.entries(components).sort()) },
}

/* ── 5. YAML로 쓰기 (의존성 없이) ──────────────────────────────── */

const needsQuote = (s) =>
  s === '' ||
  /^[-?:,[\]{}#&*!|>'"%@`]/.test(s) ||
  /[:#]\s/.test(s) ||
  /[\n"']/.test(s) ||
  /^(true|false|null|~|yes|no|on|off)$/i.test(s) ||
  /^[\d.+-]/.test(s)

function yamlScalar(v) {
  if (v === null) return 'null'
  if (typeof v === 'boolean' || typeof v === 'number') return String(v)
  const s = String(v)
  if (s.includes('\n')) return null // 블록으로 따로 처리
  return needsQuote(s) ? JSON.stringify(s) : s
}

function toYaml(node, indent = 0) {
  const pad = ' '.repeat(indent)
  if (Array.isArray(node)) {
    if (node.length === 0) return `${pad}[]\n`
    return node
      .map((v) => {
        if (v !== null && typeof v === 'object') {
          const body = toYaml(v, indent + 2)
          return `${pad}-\n${body}`
        }
        return `${pad}- ${yamlScalar(v) ?? JSON.stringify(v)}\n`
      })
      .join('')
  }
  if (node !== null && typeof node === 'object') {
    const keys = Object.keys(node)
    if (keys.length === 0) return `${pad}{}\n`
    return keys
      .map((k) => {
        const v = node[k]
        const key = needsQuote(k) ? JSON.stringify(k) : k
        if (v !== null && typeof v === 'object') {
          const body = toYaml(v, indent + 2)
          if (body.trim() === '{}' || body.trim() === '[]') return `${pad}${key}: ${body.trim()}\n`
          return `${pad}${key}:\n${body}`
        }
        const scalar = yamlScalar(v)
        if (scalar === null) {
          const lines = String(v)
            .split('\n')
            .map((l) => `${pad}  ${l}`)
            .join('\n')
          return `${pad}${key}: |-\n${lines}\n`
        }
        return `${pad}${key}: ${scalar}\n`
      })
      .join('')
  }
  return `${pad}${yamlScalar(node)}\n`
}

mkdirSync(join(ROOT, 'docs/api'), { recursive: true })
const header = [
  '# 자동 생성물 — 손으로 고치지 마십시오.',
  '# 생성: node scripts/build-openapi.mjs',
  '# 원본: docs/API-PROPOSAL.md §2 표 + src/entities/*/model.ts',
  '',
].join('\n')
writeFileSync(OUT, header + toYaml(spec), 'utf8')
/* JSON도 함께 낸다. YAML은 사람이 읽고 **JSON은 검사가 읽는다** —
   파서 없이 비교할 수 있어야 '문서가 최신인가'를 기계로 판정할 수 있다 */
writeFileSync(OUT.replace(/\.yaml$/, '.json'), JSON.stringify(spec, null, 2) + '\n', 'utf8')

/* ── 6. 이 주소를 고치면 어디가 깨지나 ────────────────────────── */

/**
 * 경계 함수를 부르는 화면 목록.
 *
 * 백엔드가 응답을 바꿀 때 **누가 영향을 받는지**를 물어 온다. 그때마다 사람이
 * 찾으면 틀린다 — 코드에서 뽑는다.
 */
/* `src` 전체를 본다. 앱 뿌리 파일(`src/App.tsx`)만 빠뜨려도 '아무도 안 쓰는 주소'로
   잘못 적히고, 백엔드가 안 만들어도 되는 줄 안다 — 실제로 포털 워크스페이스가 그랬다 */
const CALLER_DIRS = ['src']
function walkTs(dir) {
  let out = []
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) out = out.concat(walkTs(p))
    else if (/\.tsx?$/.test(p) && !/\.test\./.test(p) && !p.includes(join('shared', 'api'))) out.push(p)
  }
  return out
}

/* 같은 이름의 함수가 두 모듈에 있다(`fetchWorkspaces`가 포털용·개발용 둘).
   이름만으로 묶으면 **엉뚱한 화면이 붙는다** — 실제로 포털 워크스페이스 자리에
   관리자 개발환경 화면이 찍혔다. 그래서 `모듈::함수`로 센다. */
const callers = new Map() // 'mod::fn' → Set(파일)
for (const dir of CALLER_DIRS) {
  let files = []
  try {
    files = walkTs(join(ROOT, dir))
  } catch {
    continue
  }
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    for (const m of text.matchAll(/import\s*\{([^}]+)\}\s*from\s*'@shared\/api\/([^']+)'/g)) {
      const mod = m[2] ?? ''
      for (const raw of (m[1] ?? '').split(',')) {
        const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]
        if (!name || !/^[a-z]/.test(name)) continue
        const key = `${mod}::${name}`
        if (!callers.has(key)) callers.set(key, new Set())
        callers.get(key).add(relative(ROOT, file).replaceAll('\\', '/'))
      }
    }
  }
}

/** `모듈::함수` → 그 함수가 교체될 주소. 코드의 TODO 표시에서 뽑는다 */
const fnEndpoint = new Map()
for (const f of readdirSync(join(ROOT, 'src/shared/api'))) {
  if (!f.endsWith('.ts') || f.endsWith('.test.ts')) continue
  const mod = f.replace(/\.ts$/, '')
  const text = readFileSync(join(ROOT, 'src/shared/api', f), 'utf8')
  const chunks = text.split(/^export (?:async )?function /m).slice(1)
  for (const chunk of chunks) {
    const fn = /^([A-Za-z0-9_]+)/.exec(chunk)?.[1]
    const ep = /TODO\(api-미확정\): ([A-Z]+ \/[^\s]*)/.exec(chunk)?.[1]
    if (fn && ep) fnEndpoint.set(`${mod}::${fn}`, ep)
  }
}

/** 이 표 행을 부르는 화면들 — 주소와 함수 이름이 **둘 다** 맞는 모듈만 센다 */
function callersOf(row) {
  const want = `${row.method} ${row.path}`
  const out = new Set()
  for (const [key, files] of callers) {
    const [, fn] = key.split('::')
    if (fn !== row.fn) continue
    const ep = fnEndpoint.get(key)
    if (ep && ep.split('?')[0] !== want) continue
    for (const f of files) out.add(f)
  }
  return [...out].sort()
}

const usageLines = ['# 주소별 사용처 (자동 생성)', '']
usageLines.push('> `node scripts/build-openapi.mjs` 가 코드에서 뽑는다. 손으로 고치지 마십시오.')
usageLines.push('>')
usageLines.push('> 응답을 바꾸기 전에 **여기 적힌 파일이 무엇을 그리는지** 보십시오.')
usageLines.push('> 비어 있는 줄은 아직 화면이 안 쓰는 것이다 — 지금 만들 필요가 없다는 뜻이기도 하다.')
usageLines.push('')
usageLines.push('| 주소 | 클라이언트 함수 | 쓰는 곳 |')
usageLines.push('|---|---|---|')
let unused = 0
for (const row of rows) {
  const used = callersOf(row)
  if (used.length === 0) unused += 1
  usageLines.push(
    `| \`${row.method} ${row.path}\` | \`${row.fn}\` | ${
      used.length === 0 ? '_아직 없음_' : used.map((u) => `\`${u}\``).join('<br>')
    } |`,
  )
}
usageLines.push('')
usageLines.push(`화면이 아직 안 부르는 주소 ${unused}개.`)
usageLines.push('')
writeFileSync(join(ROOT, 'docs/api/USAGE.md'), usageLines.join('\n'), 'utf8')

const pathCount = Object.keys(paths).length
const opCount = Object.values(paths).reduce((n, p) => n + Object.keys(p).length, 0)
console.log(
  `경로 ${pathCount}개 · 오퍼레이션 ${opCount}개 · 스키마 ${Object.keys(components).length}개` +
    (droppedSchemas.length > 0 ? ` (안 쓰는 ${droppedSchemas.length}개는 뺐다)` : ''),
)
if (collisions.length > 0) {
  console.log('\n[같은 주소 충돌]')
  for (const c of collisions) console.log(' -', c)
}
if (problems.length > 0) {
  console.log('\n[해결 못 한 것]')
  for (const p of problems) console.log(' -', p)
}
if (collisions.length > 0 || problems.length > 0) process.exitCode = 1
