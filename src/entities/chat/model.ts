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

import type { MapIntel } from '@entities/mapintel/model'

export type ChatRole = 'user' | 'assistant'

export type ChatSource = {
  title: string
  /** 인용 위치 — '제23조 제2항' 처럼 */
  locator: string
  /**
   * 인용 원문. 출처만 대고 원문을 못 보여 주면 사용자는 확인할 방법이 없다.
   * 찾지 못했으면 null — 못 찾았다는 사실을 감추지 않는다.
   */
  passage: string | null
  /** 규정이면 개정일. 문서면 null */
  revisedOn: string | null
}

/** 자주 묻는 질문의 범주 */
export type FaqCategory = 'standard' | 'labor' | 'quality' | 'security' | 'system'

export type FaqItem = {
  category: FaqCategory
  question: string
}

/* 업종 말을 쓰지 않는다 — '작업표준'은 공장의 말이라 병원 화면에도 떴다 */
const FAQ_CATEGORY_LABEL: Record<FaqCategory, string> = {
  standard: '업무기준',
  labor: '복무규정',
  quality: '품질',
  security: '보안',
  system: '시스템',
}

export const FAQ_CATEGORIES = Object.keys(FAQ_CATEGORY_LABEL) as FaqCategory[]
export const faqCategoryLabel = (c: FaqCategory): string => FAQ_CATEGORY_LABEL[c]

/**
 * 판단 근거 — '왜 이 답변인가'.
 *
 * 신뢰도 94%만 보여 주면 무엇을 보고 94%인지 알 수 없다. 무엇이 얼마나 기여했는지
 * 나누고, **이 답변으로 결정하기 전에 사람이 확인할 것**을 함께 적는다.
 */
export type XaiFactor = {
  label: string
  /** 0~1. 합이 1이 되게 쓴다 */
  weight: number
  detail: string
}

export type Xai = {
  factors: XaiFactor[]
  /** 이 답변만으로 결정하면 안 되는 이유 */
  caveat: string
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
  /** 판단 근거. 근거 없는 답변에는 없다 */
  xai: Xai | null
  /** 사업장별 지표를 묻는 질문이면 지도가 붙는다. 아니면 null */
  map: MapIntel | null
}

/** 근거 없는 답변 — 화면이 다르게 그려야 하는 경우 */
export function isUngrounded(m: ChatMessage): boolean {
  return m.role === 'assistant' && m.sources.length === 0
}

/** 사람이 확인해야 하는 답변 */
const CHAT_REVIEW_THRESHOLD = 0.8

export function needsCheck(m: ChatMessage): boolean {
  return m.confidence !== null && m.confidence < CHAT_REVIEW_THRESHOLD
}

/**
 * 답변을 다른 곳에 옮겨 붙일 수 있는 글로 만든다.
 *
 * ⚠️ **본문만 복사하지 않는다.** 근거를 떼고 나가면, 붙여 넣은 쪽에서는 사람이 쓴
 * 문장과 구분되지 않는다. 그 상태로 결재 문서에 들어가면 아무도 원문을 확인하지 않는다.
 * 그래서 근거 목록과 'AI가 만든 초안'이라는 사실을 함께 붙인다.
 *
 * 근거를 못 찾은 답변은 그 사실이 첫 줄에 온다 — 복사한 사람이 제일 먼저 봐야 한다.
 */
export function answerAsText(m: ChatMessage): string {
  const lines: string[] = []
  if (isUngrounded(m)) lines.push('[근거 문서 없음 · 담당 부서 확인 필요]')
  lines.push(m.text)
  if (m.sources.length > 0) {
    lines.push('')
    lines.push('근거')
    /* 화면에 보이는 것과 같은 모양으로 — 복사본과 화면이 다르면 어느 쪽이 맞는지 모른다 */
    for (const s of m.sources) lines.push(`- ${s.title} · ${s.locator}`)
  }
  if (m.confidence !== null) {
    lines.push('')
    lines.push(`신뢰도 ${Math.round(m.confidence * 100)}%${needsCheck(m) ? ' · 원문 확인 권장' : ''}`)
  }
  lines.push('')
  lines.push('※ AI가 만든 초안입니다. 결재·대외 제출 전에 원문과 대조하십시오.')
  return lines.join('\n')
}
