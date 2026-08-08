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


/**
 * 사용자 포털의 처분.
 *
 * 관리자는 **메뉴**라는 눈에 보이는 목록이 있어 전수가 쉬웠다. 포털은 기능이
 * 버튼·모달·말풍선 안에 흩어져 있어 목록이 없다 — 그래서 처음 대조 때 id 집합만
 * 맞춰 보고 '같다'고 적었다. **셀 수 있는 것만 센 것**이었고, 열어 보니 9개가 없었다.
 *
 * 그래서 이전 데모의 **모듈 파일 자체**를 목록으로 삼는다(`docs/_v3-portal.json`).
 * 파일은 지어낼 수 없고, 기능이 생기면 파일이 늘어난다.
 *
 * 여기 적는 것은 **화면에 보이는 기능이 있는 모듈**뿐이다. 순수 유틸(`utils.jsx`)이나
 * 콘텐츠 데이터(`data/*.js`)는 옮기고 말고 할 '기능'이 아니라 제외한다.
 */
const PORTAL: Record<string, Disposition> = {
  /* ── 옮김 ── */
  'components/LiveMetricCard.jsx': { kind: '옮김' },
  'components/MapIntelCard.jsx': { kind: '옮김' },
  'components/XaiPanel.jsx': { kind: '옮김' },
  'components/Toast.jsx': { kind: '옮김' },
  'components/agents/AgentHub.jsx': { kind: '옮김' },
  'components/agents/OrchestrationScenario.jsx': { kind: '옮김' },
  'components/layout/ChatHeader.jsx': { kind: '옮김' },
  'components/layout/ChatMessages.jsx': { kind: '옮김' }, /* 답변 복사도 2026-08-08에 붙였다 */
  'components/layout/RightPanel.jsx': { kind: '옮김' },
  'components/layout/Sidebar.jsx': { kind: '옮김' },
  'components/modals/TutorialModal.jsx': { kind: '합침', note: '모달 대신 가이드 페이지 — 못 하는 것을 같은 비중으로 적었다' },
  'components/modals/QnaModal.jsx': { kind: '합침', note: '채팅 안 FAQ 섹션 — 물어볼 자리 옆에 있어야 고른다' },
  'components/modals/SatisfactionModal.jsx': { kind: '합침', note: '👍/👎 + 사유 칩. 3회 뒤 자동 팝업은 일부러 안 만들었다 — 하던 일을 끊는다' },
  'components/modals/ErrorReportModal.jsx': { kind: '합침', note: '👎의 사유 칩으로 받는다 — 같은 것을 두 곳에서 받으면 정본이 흐려진다' },
  'components/modals/LLMDropdownPortal.jsx': { kind: '합침', note: '모델 선택은 에이전트 화면에 있다 — 일반 채팅에는 고를 것이 하나뿐이다' },

  /* ── 축소 ── */
  'components/layout/ChatInput.jsx': {
    kind: '축소',
    note: '파일 첨부를 일반 채팅에도 뒀다(검사까지·전송은 실패). 음성 입력은 아직 없다',
  },
  'components/modals/DocPreviewModal.jsx': {
    kind: '축소',
    note: 'OCR 결과 미리보기만 있다. 공문서 인쇄 서식·내려받기는 아직 없다',
  },

  /* ── 미이관 ── */
  'components/SelfCheckModal.jsx': { kind: '미이관', note: 'P7 — 내보내기 전 항목별 자가점검(회의록·보고서·안전계획)' },
  'components/ApprovalModal.jsx': { kind: '미이관', note: 'P7 — 결과를 결재선에 올리기' },
  'components/ShiftHandoverModal.jsx': { kind: '미이관', note: 'P7 — 교대 인수인계' },
  'components/WorkOrderModal.jsx': { kind: '미이관', note: 'P7 — 작업지시가 조치·검증됐는지 닫기' },
  'components/ScanModal.jsx': { kind: '미이관', note: 'P7 — 설비·로트 코드 스캔(현장 입력)' },
  'components/modals/AgentBuilderModal.jsx': { kind: '미이관', note: 'P7 — 무엇을 거쳐 답했는지 사용자가 보는 화면' },
  'voiceInput.js': { kind: '미이관', note: 'P7 — 음성 입력. Web Speech API 사용 여부는 결정이 필요하다' },
  'shiftHandover.js': { kind: '미이관', note: 'P7 — 교대 인수인계 모델' },
  'workOrders.js': { kind: '미이관', note: 'P7 — 작업지시 모델' },
}

/** 화면 기능이 아닌 모듈 — 옮기고 말고 할 것이 없다 */
const PORTAL_NOT_A_FEATURE = [
  'utils.jsx',
  'i18n.js',
  'mdLite.jsx',
  'auditLog.js',
  'guardrails.js',
  'liveEngine.js',
  'mapIntel.js',
  'scenarios.js',
  'hooks/useAgentSimulation.js',
  'data/constants.js',
  'data/logos.js',
  'data/responses.js',
  'components/agents/AgentWorkflowPanel.jsx',
]

type PortalSnapshot = { 모듈: { file: string; lines: number }[] }

const portalSnap = JSON.parse(
  readFileSync(join(process.cwd(), 'docs/_v3-portal.json'), 'utf8'),
) as PortalSnapshot

/** 에이전트 13종 화면은 따로 대조했다 — 여기서는 셸 밖 기능만 본다 */
const portalModules = portalSnap.모듈
  .map((m) => m.file)
  .filter((f) => !f.startsWith('components/agents/') || f in PORTAL)
  .filter((f) => !PORTAL_NOT_A_FEATURE.includes(f))

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

  it('이전 데모의 포털 기능에 모두 처분이 있다', () => {
    expect(portalModules.length, '포털 스냅샷이 비었거나 형식이 바뀌었다').toBeGreaterThan(15)
    const missing = portalModules.filter((f) => !PORTAL[f])
    expect(missing, '처분을 안 적은 포털 모듈이 있다 — 열어 보고 옮김/합침/축소/미이관을 적을 것').toEqual([])
  })

  it('없어진 포털 모듈의 처분이 남아 있지 않다', () => {
    const files = new Set(portalSnap.모듈.map((m) => m.file))
    expect(
      [...Object.keys(PORTAL)].filter((f) => !files.has(f)),
      '이전 데모에 없는 모듈의 처분이다 — 지울 것',
    ).toEqual([])
    expect([...PORTAL_NOT_A_FEATURE].filter((f) => !files.has(f)), '없는 파일을 제외 목록에 두고 있다').toEqual([])
  })

  it('포털 미이관 건수를 대조 문서가 같은 수로 말한다', () => {
    const n = Object.values(PORTAL).filter((d) => d.kind === '미이관').length
    const stated = /\*\*미이관\*\* \| \*\*(\d+)\*\* \| 없다 \(이전 데모/.exec(AUDIT)
    expect(stated?.[1], 'PARITY-AUDIT.md 포털 절에서 미이관 건수를 못 찾았다').toBeDefined()
    expect(Number(stated?.[1]), '문서와 처분표가 다른 수를 말한다').toBe(n)
  })
})
