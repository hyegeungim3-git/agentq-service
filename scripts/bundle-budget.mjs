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

/** 첫 화면이 반드시 받는 것 — 진입 청크와 CSS */
const ENTRY_GZIP_LIMIT = 200 * 1024
/** 나눠 둔 덩어리가 실제로 따로 있는가 */
const MUST_SPLIT = ['AdminApp', 'AgentApp', 'AnalysisCharts']

let files
try {
  files = readdirSync(DIR)
} catch {
  console.error(`${DIR}가 없습니다. 먼저 npm run build 를 실행하십시오.`)
  process.exit(1)
}

const gz = (f) => gzipSync(readFileSync(join(DIR, f))).length
const kb = (n) => `${(n / 1024).toFixed(0)}KB`

/* 진입 청크는 index-*.js 하나다. 여러 개면 무엇이 첫 화면인지 알 수 없으므로 실패시킨다 */
const entries = files.filter((f) => /^index-.*\.js$/.test(f))
if (entries.length !== 1) {
  console.error(`진입 청크가 ${entries.length}개입니다 — 하나여야 합니다: ${entries.join(', ')}`)
  process.exit(1)
}

const css = files.filter((f) => f.endsWith('.css'))
const entryGzip = gz(entries[0]) + css.reduce((s, f) => s + gz(f), 0)

const missing = MUST_SPLIT.filter((name) => !files.some((f) => f.startsWith(`${name}-`)))

const rows = files
  .map((f) => [f, statSync(join(DIR, f)).size, gz(f)])
  .sort((a, b) => b[1] - a[1])
for (const [f, raw, g] of rows) {
  console.log(`  ${f.padEnd(34)} ${kb(raw).padStart(7)} ${kb(g).padStart(7)} gzip`)
}
console.log(`\n첫 화면이 받는 양(진입 + CSS): ${kb(entryGzip)} gzip / 상한 ${kb(ENTRY_GZIP_LIMIT)}`)

let failed = false
if (missing.length > 0) {
  console.error(`\n따로 내려받아야 할 덩어리가 첫 청크에 섞였습니다: ${missing.join(', ')}`)
  console.error("원인은 보통 App.tsx에 직접 import를 넣은 것입니다 — AdminApp/AgentApp 쪽에 넣으십시오.")
  failed = true
}
if (entryGzip > ENTRY_GZIP_LIMIT) {
  console.error(`\n첫 화면이 받는 양이 상한을 넘었습니다: ${kb(entryGzip)} > ${kb(ENTRY_GZIP_LIMIT)}`)
  failed = true
}

process.exit(failed ? 1 : 0)
