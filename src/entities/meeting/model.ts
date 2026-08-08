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
  /**
   * 이 결정을 뒷받침하는 회의 자료. 자료를 첨부하지 않았으면 null —
   * 발언만 듣고 정리한 결정과 문서 근거가 있는 결정은 무게가 다르다.
   */
  basis: string | null
}

/** 사람이 채우는 칸. 비우면 녹음에서 추정하고, 추정했다고 표시한다 */
export type MeetingInputs = {
  title: string
  heldOn: string
  place: string
  /** 한 줄에 한 명. '이름' 또는 '이름,부서' */
  attendees: string
  /** 한 줄에 안건 하나 */
  agenda: string
}

/**
 * 명단과 발언을 대조한 결과.
 * 명단에 없는 발언자는 오인식이거나 기재되지 않은 참석자다 — 둘 다 확인해야 한다.
 */
export type AttendanceCheck = {
  spoke: string[]
  /** 명단에 있지만 발언 기록이 없는 사람 */
  silent: string[]
  /** 발언은 있는데 명단에 없는 사람 */
  unlisted: string[]
}

/** 안건별 논의 여부 — 논의되지 않은 안건을 드러내는 것이 회의록의 실무 가치다 */
export type AgendaCoverage = {
  no: number
  topic: string
  decisionIds: string[]
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
  /** 문서번호. 발번은 조직이 한다 — 화면이 만들면 문서대장과 갈라진다 */
  docNo: string
  title: string
  heldOn: string
  place: string
  /** 기본 정보를 사람이 넣었는지, 녹음에서 추정했는지 */
  headerSource: 'input' | 'estimated'
  /** 첨부한 회의 자료 이름 — 비면 발언에만 의존했다는 뜻이다 */
  references: string[]
  /** 참석자 명단을 넣지 않았으면 null */
  attendance: AttendanceCheck | null
  /** 안건을 넣지 않았으면 빈 배열 */
  agendaCoverage: AgendaCoverage[]
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
  /** 맥락으로 쓸 회의 자료 문서 id */
  referenceIds: string[]
  inputs: MeetingInputs
}

export const EMPTY_MEETING_INPUTS: MeetingInputs = {
  title: '',
  heldOn: '',
  place: '',
  attendees: '',
  agenda: '',
}

/** 논의 기록이 없는 안건 — 회의가 끝났는데 남은 것 */
export function uncoveredAgenda(items: AgendaCoverage[]): AgendaCoverage[] {
  return items.filter((a) => a.decisionIds.length === 0)
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
