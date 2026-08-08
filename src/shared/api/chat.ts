import type { ChatMessage, FaqItem } from '@entities/chat/model'
import type { ApiResult } from './domains'
import { currentPack, withPack } from './pack'

export type ChatApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

let seq = 0
const nextId = (): string => `m-${++seq}`

export async function sendMessage(
  text: string,
  opts: ChatApiOptions = {},
): Promise<ApiResult<ChatMessage>> {
  await wait(opts.delayMs ?? 1300)
  // TODO(api-미확정): POST /chat/messages 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  const q = text.trim()
  if (!q) return { ok: false, error: '질문을 입력하세요.' }

  const pack = await currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }

  const hit = pack.chat.find((e) => e.keywords.some((k) => q.includes(k)))
  const reply = hit ? hit.reply : pack.chatUnknown
  return { ok: true, data: { id: nextId(), role: 'assistant', ...reply } }
}

/** 자주 묻는 질문 목록 — 범주는 화면이 거른다 */
export function fetchFaq(): Promise<ApiResult<FaqItem[]>> {
  // TODO(api-미확정): GET /chat/faq 로 교체. 제거 조건 = API 명세 확정.
  return withPack((p) => p.faq)
}

export function makeUserMessage(text: string): ChatMessage {
  return { id: nextId(), role: 'user', text, sources: [], confidence: null, handoff: null, xai: null, map: null }
}
