import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * **이전 데모의 화면이 조용히 빠지지 않게.**
 *
 * 2026-08-08 전수 대조에서 드러난 것: 재구축본에 **이전 데모에 있는 화면 6개가 없다.**
 * 합치기로 정한 것도, 일부러 뺀 것도 아니고 **아무 데도 안 적힌 채 없었다.**
 *
 * 원인은 실측 대상이었다. 재구축 계획은 `qagent-platform` 배포본을 눌러 가며 쟀는데,
 * 사용자가 말하는 원본은 `reb-ai-platform-v3`다. 두 배포본은 같은 앱의 다른 시점이라
 * 대부분 겹치지만 같지 않다. **사람이 눌러 센 목록은 다시 셀 때마다 달라진다.**
 *
 * 그래서 이전 데모의 메뉴를 **파일로 떠서**(`docs/_v3-menu.json`) 저장소에 두고,
 * 리프 하나하나에 **처분**을 적게 한다. 처분이 없는 메뉴가 있으면 이 검사가 깨진다.
 *
 * 처분은 네 가지다.
 *  - `옮김`  — 같은 것을 만들었다(이름이 달라도 된다)
 *  - `합침`  — 여러 메뉴를 한 화면 + 필터로 만들었다. **왜 그래도 되는지**를 적는다
 *  - `축소`  — 일부만 옮겼다. **무엇을 안 옮겼는지**를 적는다
 *  - `미이관` — 아직 없다. 이유가 아니라 **언제 만들지**를 적는다
 *
 * ⚠️ 이 검사는 **이름과 처분만** 본다. 옮긴 화면이 실제로 같은 일을 하는지는 못 본다.
 */

type Kind = '옮김' | '합침' | '축소' | '미이관'
type Disposition = { kind: Kind; to?: string; note?: string }

/**
 * 이전 데모 리프 60개의 처분.
 *
 * `to`는 `entities/admin/nav.ts`의 메뉴 id다. 없는 id를 적으면 검사가 깨진다.
 */
const PLAN: Record<string, Disposition> = {
  /* ── 대시보드 ── */
  'dashboard.system': { kind: '옮김', to: 'system' },
  'dashboard.service': { kind: '옮김', to: 'service' },
  'dashboard.gpu': { kind: '옮김', to: 'gpu' },
  'dashboard.trainer': { kind: '옮김', to: 'trainer' },

  /* ── 인프라 · 개발 ── */
  'data.dataset': { kind: '옮김', to: 'data.sets' },
  'data.vectordb': {
    kind: '축소',
    to: 'data.vector',
    note: '검색 시뮬레이터는 안 만들었다 — 실제 벡터 DB에 질의해야 결과가 나온다(SCOPE-PLAN §6)',
  },
  'data.autoload': { kind: '옮김', to: 'data.ingest' },
  'data.catalog': { kind: '옮김', to: 'data.catalog' },
  'dev.codespace': {
    kind: '축소',
    to: 'devenv.workspace',
    note: '노는 GPU 회수 관점만 옮겼다. 이미지·시작/중지·환경 생성은 서버가 있어야 진짜 동작한다(D-009)',
  },
  'dev.volume': { kind: '옮김', to: 'devenv.volume' },
  'model.registry': { kind: '옮김', to: 'registry' },
  'trainer.llm': { kind: '합침', to: 'training', note: '학습 유형 4종 → 한 화면 + 유형 필터 + 유형별 설정' },
  'trainer.vlm': { kind: '합침', to: 'training', note: '표 모양이 같아 네 벌 만들 이유가 없다 — 유형 필터로' },
  'trainer.embedding': { kind: '합침', to: 'training', note: '유형마다 다른 설정을 화면 안에서 보여 준다' },
  'trainer.reranking': { kind: '합침', to: 'training', note: '설정이 없으면 같은 결과를 다시 만들 수 없다 — 유형별 설정 유지' },
  'eval.leaderboard': {
    kind: '합침',
    to: 'evaluation.benchmark',
    note: '순위표는 점수 나열이라 무엇을 재는지·업무 근접도를 앞에 두는 형태로 재구성(REBUILD-NOTES §4)',
  },
  'eval.metrics': { kind: '옮김', to: 'evaluation.benchmark' },
  'eval.predops': { kind: '옮김', to: 'evaluation.predops' },

  /* ── AI 서비스 ── */
  'guardrail.filter': {
    kind: '합침',
    to: 'llmops.reliability',
    note: '규칙 목록이 두 화면에 있으면 어느 쪽이 진짜인지 알 수 없다 — 설정은 신뢰성 관리로',
  },
  'guardrail.log': { kind: '옮김', to: 'guardrail' },
  'security.arch': { kind: '옮김', to: 'sysops.security' },
  aiact: { kind: '옮김', to: 'aiact' },
  safetyact: { kind: '옮김', to: 'safetyact' },
  repro: { kind: '옮김', to: 'repro' },
  packstudio: { kind: '옮김', to: 'packstudio' },
  'deploy.tools.mcp': { kind: '합침', to: 'deploy', note: '도구 등록과 배포를 한 화면에서 봐야 무엇이 안 나갔는지 보인다' },
  'deploy.tools.server': { kind: '합침', to: 'deploy', note: '서버 등록도 배포 화면에서 — 주소·토큰은 표시하지 않는다' },
  'deploy.tools.prompt': { kind: '합침', to: 'prompts', note: '프롬프트는 API·프롬프트 화면이 정본' },
  'deploy.serving': { kind: '합침', to: 'deploy', note: '배포 대상의 한 종류' },
  'agent.taskflow.builder': { kind: '옮김', to: 'agents.flow' },
  'agent.taskflow.deploy': { kind: '합침', to: 'deploy', note: "배포 대상에 '에이전트 정의'를 더했다" },
  'agent.workflow': { kind: '옮김', to: 'agents.workflow' },
  'agent.scenario': { kind: '옮김', to: 'agents.scenario' },
  'app.chat': { kind: '합침', to: 'apps.instance', note: '앱 유형 3종 → 한 화면 + 유형 필터' },
  'app.report': { kind: '합침', to: 'apps.instance', note: '표 모양이 같아 세 벌 만들 이유가 없다' },
  'app.analysis': { kind: '합침', to: 'apps.instance', note: '필터가 결과를 실제로 바꾸므로 기능은 그대로다' },

  /* ── 지식 · RAG ── */
  'admin.knowledge': { kind: '옮김', to: 'knowledge.areas' },
  'admin.rag': { kind: '옮김', to: 'knowledge.pipeline' },
  'admin.augment': { kind: '옮김', to: 'knowledge.augment' },

  /* ── 운영 · 관리 ── */
  'admin.users': { kind: '옮김', to: 'users.list' },
  'ops.approval': { kind: '옮김', to: 'users.approval' },
  'ops.quota': { kind: '옮김', to: 'users.quota' },
  'admin.logs': { kind: '옮김', to: 'users.log' },
  'admin.accesssec': { kind: '옮김', to: 'users.block' },
  'admin.hrsync': { kind: '옮김', to: 'hr' },
  'admin.llm': { kind: '옮김', to: 'llmops.models' },
  'admin.trust': { kind: '옮김', to: 'llmops.reliability' },
  'admin.quality': { kind: '옮김', to: 'llmops.quality' },
  'admin.history': { kind: '옮김', to: 'analytics.history' },
  'admin.satisfaction': { kind: '옮김', to: 'analytics.satisfaction' },
  'admin.stats': { kind: '옮김', to: 'analytics.stats' },
  'admin.infostats': { kind: '옮김', to: 'analytics.report' },
  'admin.worklog': { kind: '옮김', to: 'logs.integrated' },
  'admin.usagemon': { kind: '옮김', to: 'logs.usage' },
  'admin.content': { kind: '옮김', to: 'content' },
  'admin.apiprompt': { kind: '옮김', to: 'prompts' },
  'admin.manage': { kind: '옮김', to: 'sysops.home' },
  'admin.announce': { kind: '합침', to: 'content', note: '공지사항은 콘텐츠 관리와 같은 자원 — 관리 홈 카드가 진입점' },
  'admin.monitor': { kind: '합침', to: 'system', note: '대시보드 시스템 현황과 같은 화면이었다' },
  'admin.connectedmon': { kind: '옮김', to: 'sysops.integration' },
}

type Snapshot = { 메뉴: { id: string; label: string; kind: '부모' | '화면'; routed: boolean }[] }

const snapshot = JSON.parse(
  readFileSync(join(process.cwd(), 'docs/_v3-menu.json'), 'utf8'),
) as Snapshot
const leaves = snapshot.메뉴.filter((m) => m.kind === '화면')

const navIds = new Set(
  [...readFileSync(join(process.cwd(), 'src/entities/admin/nav.ts'), 'utf8').matchAll(/id: '([\w.-]+)'/g)].map(
    (m) => m[1] ?? '',
  ),
)

const AUDIT = readFileSync(join(process.cwd(), 'docs/PARITY-AUDIT.md'), 'utf8')

describe('이전 데모와의 대조', () => {
  it('스냅샷이 비어 있지 않다', () => {
    /* 파일이 비거나 형식이 바뀌면 아래 검사들이 0건을 훑으며 통과한다 */
    expect(leaves.length).toBeGreaterThan(50)
    expect(navIds.size).toBeGreaterThan(50)
  })

  it('이전 데모의 모든 화면에 처분이 있다', () => {
    const missing = leaves.filter((m) => !PLAN[m.id]).map((m) => `${m.id} — ${m.label}`)
    expect(missing, '처분을 안 적은 메뉴가 있다 — 옮김/합침/축소/미이관 중 하나를 적을 것').toEqual([])
  })

  it('없어진 메뉴의 처분이 남아 있지 않다', () => {
    const ids = new Set(leaves.map((m) => m.id))
    expect([...Object.keys(PLAN)].filter((id) => !ids.has(id)), '이전 데모에 없는 메뉴의 처분이다 — 지울 것').toEqual([])
  })

  it('처분이 가리키는 화면이 실제로 있다', () => {
    const dangling = Object.entries(PLAN)
      .filter(([, d]) => d.to !== undefined && !navIds.has(d.to))
      .map(([id, d]) => `${id} → ${d.to}`)
    expect(dangling, 'nav.ts에 없는 메뉴 id를 가리킨다').toEqual([])
  })

  it('옮김이 아닌 처분은 이유를 적는다', () => {
    const bare = Object.entries(PLAN)
      .filter(([, d]) => d.kind !== '옮김' && (d.note ?? '').trim().length < 10)
      .map(([id]) => id)
    expect(bare, '합침·축소·미이관은 무엇을 어떻게 했는지 적어야 다음 사람이 판단할 수 있다').toEqual([])
  })

  it('미이관 건수를 대조 문서가 같은 수로 말한다', () => {
    const n = Object.values(PLAN).filter((d) => d.kind === '미이관').length
    const stated = /미이관 \*\*(\d+)개\*\*/.exec(AUDIT)
    expect(stated?.[1], 'PARITY-AUDIT.md에서 미이관 건수를 못 찾았다').toBeDefined()
    expect(Number(stated?.[1]), '문서와 처분표가 다른 수를 말한다').toBe(n)
  })
})
