/**
 * 회의록 작성 모델.
 *
 * 회의록의 값어치는 '누가 무엇을 언제까지 하기로 했는가'다. 그래서 발언 기록보다
 * **결정 사항과 조치 항목**을 1급으로 둔다. 담당자나 기한이 비면 비었다고 드러낸다 —
 * 그 빈칸이 회의에서 안 정해진 것이기 때문이다.
 */

export type Speaker = {
  id: string
  name: string
  dept: string
}

export type Utterance = {
  speakerId: string
  /** 회의 시작 기준 초 — '00:03:12' 같은 표시 문자열로 굳히지 않는다 */
  atSeconds: number
  text: string
}

export type Decision = {
  id: string
  text: string
}

export type ActionItem = {
  id: string
  task: string
  /** 회의에서 정해지지 않았으면 null — 임의로 채우지 않는다 */
  ownerId: string | null
  /** ISO 날짜. 미정이면 null */
  due: string | null
}

export type MeetingResult = {
  documentId: string
  title: string
  heldOn: string
  speakers: Speaker[]
  utterances: Utterance[]
  decisions: Decision[]
  actionItems: ActionItem[]
  elapsedSeconds: number
}

export type MeetingRequest = {
  documentId: string
  /** 발언 기록까지 포함할지 — 끄면 결정·조치만 남는다 */
  includeUtterances: boolean
}

/** 초 → mm:ss. 표시 변환은 한 곳에서만 한다. */
export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** 담당자나 기한이 빠진 조치 — 회의 후 정해야 하는 것들 */
export function incompleteActions(items: ActionItem[]): ActionItem[] {
  return items.filter((a) => a.ownerId === null || a.due === null)
}

export function speakerName(speakers: Speaker[], id: string | null): string {
  if (!id) return '미정'
  return speakers.find((s) => s.id === id)?.name ?? '미상'
}
