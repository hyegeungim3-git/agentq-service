/**
 * 도메인 팩 · 도구/배포.
 *
 * **팩이 준비돼야 포털에서 고를 수 있다.** 애플리케이션 화면의 '발주처별 노출'과
 * 같은 사실을 반대쪽에서 본다 — 저기는 결과(0종), 여기는 이유(무엇이 비었나).
 *
 * ⚠️ 채움 비율만 보여 주면 안 된다. '40% 준비'는 무엇을 더 해야 하는지 알려 주지
 * 않는다. **비어 있는 항목을 이름으로** 말한다.
 *
 * 도구는 끊겨도 서비스가 죽지 않는다 — 그 도구를 쓰는 에이전트만 조용히 못 돈다.
 * 그래서 **끊기면 어떤 에이전트가 멈추는지**를 함께 둔다.
 */

export type PackItemKey =
  | 'documents'
  | 'agentContent'
  | 'scenarios'
  | 'mapIntel'
  | 'signals'
  | 'branding'

export const PACK_ITEM_LABEL: Record<PackItemKey, string> = {
  documents: '업무 문서',
  agentContent: '에이전트 콘텐츠',
  scenarios: '복합 업무 시나리오',
  mapIntel: '사업장 지표',
  signals: '알림·브리핑',
  branding: '조직 정보·브랜드',
}

export const PACK_ITEMS: PackItemKey[] = [
  'documents',
  'agentContent',
  'scenarios',
  'mapIntel',
  'signals',
  'branding',
]

export type DomainPack = {
  domainId: string
  orgName: string
  sector: string
  /** 채워진 항목 */
  filled: PackItemKey[]
  /** 이 팩으로 포털에 들어갈 수 있는가 */
  usable: boolean
}

export const packMissing = (p: DomainPack): PackItemKey[] =>
  PACK_ITEMS.filter((k) => !p.filled.includes(k))

export const packRatio = (p: DomainPack): number => p.filled.length / PACK_ITEMS.length

/**
 * 포털에서 고를 수 있으려면 무엇이 반드시 있어야 하는가.
 *
 * 문서와 조직 정보가 없으면 다른 발주처의 자료가 그대로 보인다 —
 * 포털이 막아 두는 이유가 이것이다.
 */
export const REQUIRED_ITEMS: PackItemKey[] = ['documents', 'branding']

export const meetsMinimum = (p: DomainPack): boolean =>
  REQUIRED_ITEMS.every((k) => p.filled.includes(k))

export type ToolKind = 'search' | 'db' | 'file' | 'external'

export const TOOL_KIND_LABEL: Record<ToolKind, string> = {
  search: '검색',
  db: '데이터 조회',
  file: '파일 처리',
  external: '외부 연동',
}

/**
 * 도구 자체 — **누가 쓰는지는 여기 없다.**
 *
 * 사용처를 손으로 적어 두었더니 실제와 어긋났다. 안전관리계획이 지식 검색을
 * 부르는데 그 도구의 사용처 목록에는 없었다 — 화면이 '끊기면 멈추는 에이전트'를
 * 실제보다 적게 말하고 있었다. 사용처는 **에이전트 정의에서 나온다.**
 */
export type ToolSpec = {
  id: string
  name: string
  kind: ToolKind
  /** 실제로 붙어 있는가. 정의만 있고 안 붙은 것과 구분한다 */
  connected: boolean
  /** 끊겼으면 왜인지 */
  downReason: string | null
  calls7d: number
}

export type ToolEntry = ToolSpec & {
  /** 이 도구를 쓰는 에이전트 이름 — 정의에서 유도한다 */
  usedBy: string[]
}

/** 끊긴 도구 때문에 못 도는 에이전트 */
export function blockedAgents(tools: ToolEntry[]): string[] {
  const names = tools.filter((t) => !t.connected).flatMap((t) => t.usedBy)
  return [...new Set(names)]
}

export type DeployStage = 'staging' | 'production'

export const STAGE_LABEL: Record<DeployStage, string> = {
  staging: '검증',
  production: '운영',
}

export type Deployment = {
  id: string
  target: string
  stage: DeployStage
  version: string
  deployedAt: string
  /** 검증과 운영의 버전이 다르면 그 사실을 드러내야 한다 */
  note: string | null
}

/** 검증에만 있고 운영에 안 올라간 버전 */
export function pendingPromotion(list: Deployment[]): { target: string; staging: string; production: string | null }[] {
  const targets = [...new Set(list.map((d) => d.target))]
  const out: { target: string; staging: string; production: string | null }[] = []
  for (const t of targets) {
    const s = list.find((d) => d.target === t && d.stage === 'staging')
    const p = list.find((d) => d.target === t && d.stage === 'production')
    if (s && s.version !== (p?.version ?? null)) {
      out.push({ target: t, staging: s.version, production: p?.version ?? null })
    }
  }
  return out
}
