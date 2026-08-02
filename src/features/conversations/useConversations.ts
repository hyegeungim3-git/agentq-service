import { useCallback, useMemo, useState } from 'react'
import type { ChatMessage } from '@entities/chat/model'

/**
 * 대화 목록 — 셸의 '최근 대화'가 실제로 동작하게 하는 상태.
 *
 * ⚠️ 이 세션 메모리에만 둔다. 새로고침하면 사라진다.
 * 브라우저에 저장할지는 데이터 정책 문제이고, 그건 아직 정해지지 않았다
 * (`docs/API-PROPOSAL.md` §3 — 파일 보관·감사 로그). 정해지기 전에 저장부터 하면
 * 지우는 방법도 없이 남는다. 대신 보안 탭이 이 사실을 그대로 말한다.
 */

export type Conversation = {
  id: string
  /** 첫 질문에서 만든다. 아직 질문이 없으면 null */
  title: string | null
  messages: ChatMessage[]
}

const newId = (n: number): string => `conv-${n}`

const titleOf = (messages: ChatMessage[]): string | null => {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return null
  const t = firstUser.text.trim()
  return t.length > 24 ? `${t.slice(0, 24)}…` : t
}

export function useConversations() {
  const [seq, setSeq] = useState(1)
  const [items, setItems] = useState<Conversation[]>([{ id: newId(1), title: null, messages: [] }])
  const [activeId, setActiveId] = useState(newId(1))

  const active = items.find((c) => c.id === activeId) ?? items[0]

  const setMessages = useCallback(
    (update: (prev: ChatMessage[]) => ChatMessage[]) => {
      setItems((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c
          const messages = update(c.messages)
          return { ...c, messages, title: titleOf(messages) }
        }),
      )
    },
    [activeId],
  )

  /** 새 대화 — 빈 대화가 이미 있으면 그걸 쓴다. 빈 껍데기를 쌓지 않는다 */
  const startNew = useCallback(() => {
    const empty = items.find((c) => c.messages.length === 0)
    if (empty) {
      setActiveId(empty.id)
      return
    }
    const id = newId(seq + 1)
    setSeq((n) => n + 1)
    setItems((prev) => [{ id, title: null, messages: [] }, ...prev])
    setActiveId(id)
  }, [items, seq])

  /** 목록에 보여 줄 것 — 아직 질문이 없는 대화는 목록에 올리지 않는다 */
  const listed = useMemo(() => items.filter((c) => c.title !== null), [items])

  const store = useMemo(
    () => ({ messages: active?.messages ?? [], setMessages }),
    [active, setMessages],
  )

  return { items, listed, activeId, select: setActiveId, startNew, store }
}
