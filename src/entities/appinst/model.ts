/**
 * 앱 인스턴스 · RAG 파이프라인.
 *
 * **애플리케이션 화면과 나누는 기준**: 저기는 '묶음'(사용자 포털·관리자·모바일),
 * 여기는 사람들이 그 안에 만든 **개별 앱**이다. 묶음이 열려 있어도 개별 앱은
 * 꺼져 있을 수 있다.
 *
 * **지식 관리 화면과 나누는 기준**: 저기는 결과(못 찾는 문서가 몇 건),
 * 여기는 **어느 단계에서 떨어졌나**다. 결과만 보면 고칠 곳을 못 찾는다.
 */

export type AppKind = 'chat' | 'report' | 'analysis'

export const APP_KIND_LABEL: Record<AppKind, string> = {
  chat: '전용 채팅',
  report: '보고서 생성',
  analysis: '데이터 분석',
}

export const APP_KINDS: AppKind[] = ['chat', 'report', 'analysis']

export type AppInstance = {
  id: string
  title: string
  kind: AppKind
  /** 지금 사용자에게 열려 있는가 */
  live: boolean
  /** 내려간 이유. 열려 있으면 null */
  downReason: string | null
  owner: string
  group: string
  /** 최근 7일 사용 건수 */
  uses7d: number
  createdOn: string
  /** 이 앱이 기대는 지식영역 id */
  areaIds: string[]
}

/** 만들어 두고 아무도 안 쓰는 앱 — 0건을 '문제 없음'으로 읽으면 안 된다 */
export const unused = (list: AppInstance[]): AppInstance[] =>
  list.filter((a) => a.live && a.uses7d === 0)

/** 내려가 있는 앱 — 왜 내려갔는지 없으면 다시 올려도 되는지 모른다 */
export const down = (list: AppInstance[]): AppInstance[] => list.filter((a) => !a.live)

/** 색인 파이프라인 단계 */
export type PipelineStage = 'collect' | 'extract' | 'chunk' | 'embed' | 'index'

export const STAGE_LABEL: Record<PipelineStage, string> = {
  collect: '수집',
  extract: '본문 추출',
  chunk: '청킹',
  embed: '임베딩',
  index: '색인',
}

export const STAGES: PipelineStage[] = ['collect', 'extract', 'chunk', 'embed', 'index']

export type StageResult = {
  stage: PipelineStage
  /** 이 단계에 들어온 문서 수 */
  incoming: number
  /** 다음 단계로 넘어간 수 */
  out: number
  /** 여기서 떨어진 이유별 건수 */
  drops: { reason: string; count: number }[]
}

export const dropped = (s: StageResult): number => s.incoming - s.out

/** 가장 많이 떨어지는 단계 — 고칠 곳은 대개 여기다 */
export function worstStage(list: StageResult[]): StageResult | null {
  if (list.length === 0) return null
  return list.reduce((a, b) => (dropped(b) > dropped(a) ? b : a))
}

/** 마지막 단계까지 살아남은 수 */
export function survived(list: StageResult[]): number {
  return list.at(-1)?.out ?? 0
}

export type PipelineRun = {
  id: string
  areaId: string
  areaName: string
  startedAt: string
  finishedAt: string | null
  stages: StageResult[]
}
