/**
 * 업무 챗봇 모델.
 *
 * 챗봇의 위험은 **모르는 것을 그럴듯하게 답하는 것**이다. 규정 조회와 같은
 * 문제인데, 대화형이라 더 위험하다 — 사용자가 근거를 확인하지 않고 넘어가기 쉽다.
 *
 * 그래서 답변마다 근거와 신뢰도를 붙이고, 근거가 없으면 없다고 말한다.
 * 답변 텍스트만 있고 근거가 비어 있는 상태를 타입으로 허용하되,
 * 화면이 그 경우를 반드시 다르게 그리도록 한다.
 */

export type ChatRole = 'user' | 'assistant'

export type ChatSource = {
  title: string
  /** 인용 위치 — '제23조 제2항' 처럼 */
  locator: string
}

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  /** assistant 메시지에만 있다. 빈 배열이면 근거 없는 답변이다. */
  sources: ChatSource[]
  /** 0~1. 근거가 없으면 null */
  confidence: number | null
  /** 이 질문을 더 잘 다루는 에이전트가 있으면 안내한다 */
  handoff: { agentLabel: string; reason: string } | null
}

/** 근거 없는 답변 — 화면이 다르게 그려야 하는 경우 */
export function isUngrounded(m: ChatMessage): boolean {
  return m.role === 'assistant' && m.sources.length === 0
}

/** 사람이 확인해야 하는 답변 */
export const CHAT_REVIEW_THRESHOLD = 0.8

export function needsCheck(m: ChatMessage): boolean {
  return m.confidence !== null && m.confidence < CHAT_REVIEW_THRESHOLD
}
