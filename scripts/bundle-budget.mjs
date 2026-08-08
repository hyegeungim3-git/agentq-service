/**
 * 첫 화면이 받는 양에 **상한을 둔다.**
 *
 * 코드를 나눠 놓아도 누가 `App.tsx`에 관리자 화면 하나를 직접 import하면 그 순간
 * 다시 전부 딸려 온다. 그건 화면으로는 안 보이고 검사도 안 깨진다 — 숫자로만 드러난다.
 *
 * 실측 기록:
 *  - 나누기 전: 첫 청크 1021KB(gzip 262KB) 하나에 관리자 44화면 + 에이전트 13종
 *  - 나눈 뒤:   첫 청크 622KB(gzip 184KB), 관리자 58KB·에이전트 22KB는 고를 때 받음
 *
 * 상한은 **지금 값보다 조금 위**로 잡는다. 여유를 크게 두면 상한이 아니라 장식이 된다.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const DIR = 'dist/assets'
const HTML = 'dist/index.html'

/**
 * 첫 화면이 반드시 받는 것 — **index.html이 가리키는 것 전부.**
 *
 * ⚠️ 처음에는 `index-*.js` 하나와 CSS만 셌다. 그런데 청크를 더 나누자 번들러가
 * 공통 코드를 새 청크(`pack-*.js` 90KB gzip)로 빼면서 그것을 `modulepreload`로
 * 걸었다 — 첫 화면이 여전히 받는데 **계산에서는 빠졌다.** 194KB가 98KB로 줄어든
 * 것처럼 보였다. 숫자만 보이는 것을 지키라고 만든 검사가 숫자를 틀리게 낸 것이다.
 *
 * 그래서 이제 진입 HTML을 읽어 `<script src>`·`<link modulepreload>`·`<link stylesheet>`를
 * 전부 더한다. 번들러가 어떻게 쪼개든 '첫 화면이 받는 양'의 정의는 바뀌지 않는다.
 */
const ENTRY_GZIP_LIMIT = 200 * 1024
/** 나눠 둔 덩어리가 첫 화면에 딸려 오지 않는가 */
const MUST_STAY_OUT = ['AdminApp', 'AgentApp', 'AnalysisCharts']

let files
try {
  files = readdirSync(DIR)
} catch {
  console.error(`${DIR}가 없습니다. 먼저 npm run build 를 실행하십시오.`)
  process.exit(1)
}

const gz = (f) => gzipSync(readFileSync(join(DIR, f))).length
const kb = (n) => `${(n / 1024).toFixed(0)}KB`

const html = readFileSync(HTML, 'utf8')
/* assets/<파일> 형태를 전부 긁는다 — src·href를 가리지 않는다 */
const entryFiles = [...new Set([...html.matchAll(/assets\/([A-Za-z0-9._-]+)/g)].map((m) => m[1]))]
if (entryFiles.length === 0) {
  console.error(`${HTML}에서 자산 참조를 못 찾았습니다 — 검사가 아무것도 보지 않습니다.`)
  process.exit(1)
}

const entryGzip = entryFiles.reduce((s, f) => s + gz(f), 0)
const missing = MUST_STAY_OUT.filter((name) => entryFiles.some((f) => f.startsWith(`${name}-`)))

const rows = files
  .map((f) => [f, statSync(join(DIR, f)).size, gz(f)])
  .sort((a, b) => b[1] - a[1])
/* 첫 화면이 받는 것에 표시를 해 둔다 — 목록만 보면 무엇이 언제 오는지 알 수 없다 */
for (const [f, raw, g] of rows) {
  const mark = entryFiles.includes(f) ? '첫 화면' : '   나중'
  console.log(`  ${mark}  ${f.padEnd(30)} ${kb(raw).padStart(7)} ${kb(g).padStart(7)} gzip`)
}
console.log(`\n첫 화면이 받는 것 ${entryFiles.length}개 = ${kb(entryGzip)} gzip / 상한 ${kb(ENTRY_GZIP_LIMIT)}`)

let failed = false
if (missing.length > 0) {
  console.error(`\n따로 받아야 할 덩어리가 첫 화면에 딸려 옵니다: ${missing.join(', ')}`)
  console.error('원인은 보통 App.tsx에 직접 import를 넣은 것입니다 — AdminApp/AgentApp 쪽에 넣으십시오.')
  failed = true
}
if (entryGzip > ENTRY_GZIP_LIMIT) {
  console.error(`\n첫 화면이 받는 양이 상한을 넘었습니다: ${kb(entryGzip)} > ${kb(ENTRY_GZIP_LIMIT)}`)
  failed = true
}

process.exit(failed ? 1 : 0)
