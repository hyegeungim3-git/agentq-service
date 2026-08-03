/**
 * 워크플로우 — 조건 분기가 있는 멀티 에이전트 흐름.
 *
 * 시나리오 빌더와 다르다. 시나리오는 **선형 릴레이**(1→2→3→4)이고,
 * 워크플로우는 **분기가 있는 그래프**다(조건에 따라 다른 길로 간다).
 *
 * ⚠️ 분기가 있으면 **어느 길로 갔는지 모른 채 결과만 보게 된다.** 같은 입력에
 * 다른 결과가 나와도 왜인지 알 수 없다. 그래서 실행 이력에 **탄 분기**를 남기고,
 * 한 번도 안 탄 분기를 드러낸다 — 안 타는 분기는 죽은 길이거나 조건이 틀린 것이다.
 */

export type NodeKind = 'trigger' | 'agent' | 'branch' | 'tool' | 'review' | 'action'

export const NODE_KIND_LABEL: Record<NodeKind, string> = {
  trigger: '트리거',
  agent: '에이전트',
  branch: '조건 분기',
  tool: '도구',
  review: '사람 검토',
  action: '실행',
}

export type WorkflowNode = {
  id: string
  kind: NodeKind
  label: string
  /** 분기 노드면 갈래 이름들. 아니면 빈 배열 */
  branches: string[]
}

export type BranchTaken = {
  nodeId: string
  branch: string
  count: number
}

export type Workflow = {
  id: string
  name: string
  purpose: string
  enabled: boolean
  owner: string
  nodes: WorkflowNode[]
  runs24h: number
  failed24h: number
  /** 실패한 실행이 어느 노드에서 멈췄는지 */
  failedAt: { nodeId: string; count: number; reason: string }[]
  /** 분기별로 몇 번 탔는지 */
  taken: BranchTaken[]
}

export const branchNodes = (w: Workflow): WorkflowNode[] => w.nodes.filter((n) => n.kind === 'branch')

/** 사람이 검토하는 노드 */
export const reviewNodes = (w: Workflow): WorkflowNode[] =>
  w.nodes.filter((n) => n.kind === 'review')

/** 실행하는데 사람 검토가 없는 워크플로우 — 결과가 그대로 나간다 */
export const actsWithoutReview = (list: Workflow[]): Workflow[] =>
  list.filter((w) => w.nodes.some((n) => n.kind === 'action') && reviewNodes(w).length === 0)

/** 한 번도 안 탄 분기 — 죽은 길이거나 조건이 틀렸다 */
export function untakenBranches(w: Workflow): { node: WorkflowNode; branch: string }[] {
  const out: { node: WorkflowNode; branch: string }[] = []
  for (const n of branchNodes(w)) {
    for (const b of n.branches) {
      const hit = w.taken.find((t) => t.nodeId === n.id && t.branch === b)
      if (!hit || hit.count === 0) out.push({ node: n, branch: b })
    }
  }
  return out
}

export const successRatio = (w: Workflow): number | null =>
  w.runs24h === 0 ? null : (w.runs24h - w.failed24h) / w.runs24h
