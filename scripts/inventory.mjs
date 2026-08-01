/**
 * inventory.mjs — 기존 배포본(qagent-platform)의 화면·기능을 실측해 이식 대상 목록을 만든다.
 *
 * 왜 필요한가: 새 프로젝트로 옮길 때 "무엇이 있었는지"를 기억이 아니라 실측으로 잡아야
 * 빠뜨리는 화면이 없다. agent-rules §12의 '화면 및 URL 목록'을 채우는 근거가 된다.
 *
 * 사용법: node scripts/inventory.mjs [baseUrl]
 */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = process.argv[2] || 'https://hyegeungim3-git.github.io/qagent-platform'

function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    (process.env.LOCALAPPDATA || '') + '\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean)
  return cands.find(p => { try { return fs.existsSync(p) } catch { return false } })
}
const sleep = ms => new Promise(r => setTimeout(r, ms))

const chrome = findChrome()
if (!chrome) { console.error('Chrome을 찾지 못함 — CHROME_PATH 지정'); process.exit(2) }

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

const report = { base: BASE, domains: [], adminMenus: [], agents: [], notes: [] }

// 1) 포털 화면에서 도메인(발주처) 목록
await page.goto(BASE + '/', { waitUntil: 'networkidle2' })
await sleep(2000)
report.domains = await page.evaluate(() =>
  [...document.querySelectorAll('button, a')]
    .map(e => e.innerText.replace(/\s+/g, ' ').trim())
    .filter(t => t.length > 1 && t.length < 40),
)

// 2) 관리자 사이드바 메뉴 전수
await page.goto(`${BASE}/#/reb/admin/dashboard.system`, { waitUntil: 'networkidle2' })
await sleep(2500)
report.adminMenus = await page.evaluate(() => {
  const side = document.querySelector('aside, nav') || document.body
  return [...side.querySelectorAll('button, a')]
    .map(e => e.innerText.replace(/\s+/g, ' ').trim())
    .filter(t => t && t.length < 30)
})

// 3) 에이전트 허브의 카드
await page.goto(`${BASE}/#/reb/user/agent`, { waitUntil: 'networkidle2' })
await sleep(2500)
report.agents = await page.evaluate(() =>
  [...document.querySelectorAll('[data-agent-id]')].map(e => ({
    id: e.getAttribute('data-agent-id'),
    name: e.getAttribute('data-agent-name'),
  })),
)

// 4) 사용자 탭 3종의 본문 규모(이식 분량 가늠)
for (const tab of ['general', 'agent', 'secure']) {
  await page.goto(`${BASE}/#/reb/user/${tab}`, { waitUntil: 'networkidle2' })
  await sleep(1800)
  const len = await page.evaluate(() => document.querySelector('main')?.innerText.trim().length || 0)
  report.notes.push(`user/${tab}: 본문 ${len}자`)
}

await browser.close()
fs.writeFileSync('docs/_inventory.json', JSON.stringify(report, null, 2))

console.log(`도메인 후보 ${report.domains.length}`)
console.log(`관리자 메뉴 항목 ${report.adminMenus.length}`)
console.log(`에이전트 ${report.agents.length}`)
report.agents.forEach(a => console.log(`  - ${a.id}: ${a.name}`))
report.notes.forEach(n => console.log('  ' + n))
