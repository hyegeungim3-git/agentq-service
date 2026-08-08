/**
 * 답변 재현성.
 *
 * "왜 지난달과 답이 다르냐"에 답하려면 **그때의 구성**이 남아 있어야 한다.
 * 모델 버전, 지식베이스 리비전, 프롬프트 버전, 가드레일 버전, 생성 파라미터,
 * 그리고 그때 검색된 근거 문서의 **개정 버전**. 이 조합이 다 있어야 재현이 성립한다.
 *
 * ⚠️ **질의·답변 원문은 이 스냅샷에 없다.** 접근 로그·이용 이력 두 화면이 이미
 * '질문 본문은 남기지 않는다'는 전제로 통일돼 있다(`API-PROPOSAL.md` §3-7 권장).
 * 여기만 원문을 보관한다고 하면 세 화면이 서로 다른 말을 하게 된다.
 *
 * 그래서 이 화면이 답할 수 있는 것은 **'그때 구성 그대로 돌릴 수 있는가'까지**다.
 * '같은 답이 나오는가'는 원문 보관이 정해져야 답할 수 있고, 그 한계를 화면이 말한다.
 * 보관 여부를 정하는 것은 법무·백엔드다.
 *
 * 재현 가능 여부를 **따로 저장하지 않는다.** 저장하면 구성이 바뀐 뒤에도 '가능'이
 * 그대로 남는다 — 중대재해 화면에서 본 것과 같은 함정이다. 지금 구성과의 차이에서
 * 계산한다.
 */

/** 재현에 필요한 구성 조각 */
export type ConfigPart = 'model' | 'knowledge' | 'prompt' | 'guardrail' | 'params' | 'sources'

export const PART_LABEL: Record<ConfigPart, string> = {
  model: '모델',
  knowledge: '지식베이스',
  prompt: '프롬프트',
  guardrail: '가드레일',
  params: '생성 파라미터',
  sources: '근거 문서',
}

export const PARTS: ConfigPart[] = ['model', 'knowledge', 'prompt', 'guardrail', 'params', 'sources']

/** 그때와 지금이 어떻게 다른가 */
export type Drift = {
  part: ConfigPart
  /** 그때 값 */
  was: string
  /** 지금 값 */
  now: string
}

export type SourceRev = {
  name: string
  /** 그때 검색된 개정 버전 — 문서 이름만으로는 재현이 안 된다 */
  rev: string
}

export type Snapshot = {
  id: string
  at: string
  /**
   * 무엇에 대한 질의였는가 — **본문이 아니라 분류**다.
   * 본문 보관은 정해지지 않았고, 정해지기 전에 화면이 본문을 들고 있으면 안 된다.
   */
  topic: string
  agentLabel: string
  model: string
  modelVersion: string
  knowledgeRev: string
  promptVersion: string
  guardrailVersion: string
  temperature: number
  sources: SourceRev[]
  /** 지금 구성과의 차이. 비어 있으면 그때 그대로다 */
  drift: Drift[]
}

/** 그때 구성 그대로 돌릴 수 있는가 — 저장된 값이 아니라 차이에서 계산한다 */
export const canReproduce = (s: Snapshot): boolean => s.drift.length === 0

export const drifted = (list: Snapshot[]): Snapshot[] => list.filter((s) => !canReproduce(s))

/**
 * 어느 구성이 가장 자주 바뀌었는가.
 *
 * 재현 불가 자체는 결함이 아니다. 모델도 색인도 바뀌는 게 정상이다.
 * 다만 **무엇이 바뀌어서 못 하는지**는 말할 수 있어야 한다.
 */
export function driftCounts(list: Snapshot[]): { part: ConfigPart; count: number }[] {
  return PARTS.map((part) => ({
    part,
    count: list.filter((s) => s.drift.some((d) => d.part === part)).length,
  }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
}

/** 스냅샷에 근거 문서의 개정 버전이 빠진 것 — 이러면 같은 문서를 찾아도 내용이 다를 수 있다 */
export const missingSourceRev = (list: Snapshot[]): Snapshot[] =>
  list.filter((s) => s.sources.length === 0 || s.sources.some((x) => x.rev.trim() === ''))
