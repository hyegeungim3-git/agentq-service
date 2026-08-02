import { useCallback, useState } from 'react'
import type { ChatMessage } from '@entities/chat/model'
import { makeUserMessage, sendMessage, type ChatApiOptions } from '@shared/api/chat'

/**
 * 챗봇은 '한 번 실행하고 결과를 본다'가 아니라 대화가 쌓이는 형태라
 * useAgentRun을 쓰지 않는다(DECISIONS D-006의 적용 범위 밖).
 */

export type ChatOptions = ChatApiOptions

export function useChat(opts: ChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const delayMs = opts.delayMs
  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || pending) return

    setMessages((prev) => [...prev, makeUserMessage(text)])
    setInput('')
    setPending(true)
    setError(null)

    const res = await sendMessage(text, { delayMs })
    setPending(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setMessages((prev) => [...prev, res.data])
  }, [input, pending, delayMs])

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, input, setInput, pending, error, send, reset, canSend: input.trim().length > 0 && !pending }
}
