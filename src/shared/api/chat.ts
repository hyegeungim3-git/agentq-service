import type { ChatMessage } from '@entities/chat/model'
import { CHAT_ENTRIES, CHAT_UNKNOWN } from '@fixtures/chat'
import type { ApiResult } from './domains'

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
  const q = text.trim()
  if (!q) return { ok: false, error: '질문을 입력하세요.' }

  const hit = CHAT_ENTRIES.find((e) => e.keywords.some((k) => q.includes(k)))
  const reply = hit ? hit.reply : CHAT_UNKNOWN
  return { ok: true, data: { id: nextId(), role: 'assistant', ...reply } }
}

export function makeUserMessage(text: string): ChatMessage {
  return { id: nextId(), role: 'user', text, sources: [], confidence: null, handoff: null }
}
