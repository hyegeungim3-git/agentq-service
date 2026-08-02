import { useCallback, useEffect, useState } from 'react'
import type { ChatMessage, FaqCategory, FaqItem } from '@entities/chat/model'
import { fetchFaq, makeUserMessage, sendMessage, type ChatApiOptions } from '@shared/api/chat'

/**
 * 챗봇은 '한 번 실행하고 결과를 본다'가 아니라 대화가 쌓이는 형태라
 * useAgentRun을 쓰지 않는다(DECISIONS D-006의 적용 범위 밖).
 */

export type ChatOptions = ChatApiOptions

/**
 * 대화를 밖에서 보관할 수 있게 하는 자리.
 *
 * 셸의 '최근 대화'는 대화 여러 개를 오가야 하므로 메시지 소유자가 화면보다 위에 있어야 한다.
 * 주지 않으면 훅이 스스로 들고 있는다 — 챗봇 화면만 따로 띄우는 경우가 그렇다.
 */
export type ChatStore = {
  messages: ChatMessage[]
  setMessages: (update: (prev: ChatMessage[]) => ChatMessage[]) => void
}

export function useChat(opts: ChatOptions = {}, store?: ChatStore) {
  const [ownMessages, setOwnMessages] = useState<ChatMessage[]>([])
  const messages = store ? store.messages : ownMessages
  const setMessages = store ? store.setMessages : setOwnMessages
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
    [pending, delayMs, setMessages],
  )

  const send = useCallback(() => ask(input), [ask, input])

  const reset = useCallback(() => {
    setMessages(() => [])
    setError(null)
  }, [setMessages])

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
