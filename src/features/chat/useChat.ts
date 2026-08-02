import { useCallback, useEffect, useState } from 'react'
import type { ChatMessage, FaqCategory, FaqItem } from '@entities/chat/model'
import { fetchFaq, makeUserMessage, sendMessage, type ChatApiOptions } from '@shared/api/chat'

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
  const [faq, setFaq] = useState<FaqItem[]>([])
  const [faqCategory, setFaqCategory] = useState<FaqCategory | 'all'>('all')

  useEffect(() => {
    let alive = true
    void fetchFaq().then((res) => {
      if (alive && res.ok) setFaq(res.data)
    })
    return () => {
      alive = false
    }
  }, [])

  const delayMs = opts.delayMs

  /** 질문을 그대로 보낸다 — FAQ를 누르면 입력창을 거치지 않고 바로 묻는다 */
  const ask = useCallback(
    async (text: string) => {
      const q = text.trim()
      if (!q || pending) return

      setMessages((prev) => [...prev, makeUserMessage(q)])
      setInput('')
      setPending(true)
      setError(null)

      const res = await sendMessage(q, { delayMs })
      setPending(false)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setMessages((prev) => [...prev, res.data])
    },
    [pending, delayMs],
  )

  const send = useCallback(() => ask(input), [ask, input])

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const shownFaq = faqCategory === 'all' ? faq : faq.filter((f) => f.category === faqCategory)

  return {
    messages,
    input,
    setInput,
    pending,
    error,
    send,
    ask,
    reset,
    faq: shownFaq,
    faqCategory,
    setFaqCategory,
    canSend: input.trim().length > 0 && !pending,
  }
}
