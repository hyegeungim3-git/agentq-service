import { useCallback, useMemo, useRef, useState } from 'react'
import type { ChatMessage } from '@entities/chat/model'
import { readJson, removeKey, writeJson } from '@shared/lib/storage'

/**
 * 대화 목록 — 셸의 '최근 대화'가 실제로 동작하게 하는 상태.
 *
 * 대화는 **워크스페이스에 속한다.** 워크스페이스를 바꾸면 그 방의 대화만 보인다 —
 * 이름만 나열하고 아무 일도 안 하면 기능이 있는 것처럼 보이기만 한다.
 *
 * 브라우저에 저장한다. 보관 기간 같은 정책은 아직 정해지지 않았으므로
 * (`docs/API-PROPOSAL.md` §3) **지우는 방법을 함께 제공**한다 —
 * 지우지 못하는 저장은 정책이 정해질 때 손댈 수 없는 데이터가 된다.
 * 보안 탭이 저장 사실과 지우는 방법을 그대로 말한다.
 */

export type Conversation = {
  id: string
  workspaceId: string
  /** 첫 질문에서 만든다. 아직 질문이 없으면 null */
  title: string | null
  messages: ChatMessage[]
  /**
   * 처음 물어본 때(에폭 밀리초).
   *
   * 원본처럼 '오늘 / 어제 / 이전'으로 묶으려면 시각이 있어야 한다. 예전에 저장해 둔
   * 대화에는 이 값이 없다 — 지우지 않고 '이전'으로 본다. 있던 대화를 없애는 것보다
   * 덜 정확한 자리에 두는 편이 낫다.
   */
  at?: number
}

const KEY = 'agentq.conversations.v1'

const titleOf = (messages: ChatMessage[]): string | null => {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return null
  const t = firstUser.text.trim()
  return t.length > 24 ? `${t.slice(0, 24)}…` : t
}

/** 저장된 값이 지금 쓰는 모양인지 — 예전 형태가 남아 있을 수 있다 */
function isConversations(v: unknown): v is Conversation[] {
  return (
    Array.isArray(v) &&
    v.every(
      (c) =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as Conversation).id === 'string' &&
        typeof (c as Conversation).workspaceId === 'string' &&
        Array.isArray((c as Conversation).messages),
    )
  )
}

export function useConversations(workspaceId: string) {
  const [items, setItems] = useState<Conversation[]>(() => readJson(KEY, isConversations) ?? [])
  /**
   * 방마다 어떤 대화를 보고 있는가.
   * `null`은 '새 대화를 기다리는 중'이고, 키가 없으면 '고른 적 없음'이다.
   * 빈 문자열 하나로 둘을 겸하면 '새 대화'가 목록 첫 항목으로 되돌아간다 — 실제로 그랬다.
   */
  const [activeByWorkspace, setActiveByWorkspace] = useState<Record<string, string | null>>({})
  /** 저장이 막힌 환경인지 — 막혔으면 화면이 그렇게 말해야 한다 */
  const [persisted, setPersisted] = useState(true)

  /**
   * 최신 상태를 ref로도 들고 있는다.
   *
   * 한 번의 대화에서 setMessages가 두 번 불린다 — 사용자 말 한 번, 답변 한 번.
   * 그 둘 사이에 렌더가 없으므로 두 번째 호출은 낡은 값을 본다.
   * 실제로 답변이 첫 메시지를 덮어써서 대화가 통째로 사라졌다.
   *
   * 그렇다고 setState 업데이터 안에서 저장하면 StrictMode가 업데이터를 두 번 불러
   * 저장도 두 번 일어나고, effect에서 저장하면 연쇄 렌더가 된다
   * (`react-hooks/set-state-in-effect`). 그래서 ref를 정본으로 두고
   * 바꾸는 자리에서 한 번에 처리한다.
   */
  const ref = useRef({ items, active: activeByWorkspace })
  const seq = useRef(0)

  /** 목록을 바꾸는 유일한 통로. 저장도 여기서 한다. */
  const commit = useCallback(
    (update: (prev: Conversation[]) => Conversation[], activeFor?: [string, string | null]) => {
      const next = update(ref.current.items)
      ref.current.items = next
      setItems(next)

      if (activeFor) {
        const nextActive = { ...ref.current.active, [activeFor[0]]: activeFor[1] }
        ref.current.active = nextActive
        setActiveByWorkspace(nextActive)
      }

      if (next.length === 0) {
        removeKey(KEY)
        setPersisted(true)
        return
      }
      setPersisted(writeJson(KEY, next))
    },
    [],
  )

  const inWorkspace = useMemo(
    () => items.filter((c) => c.workspaceId === workspaceId),
    [items, workspaceId],
  )

  const chosen = workspaceId in activeByWorkspace ? activeByWorkspace[workspaceId] : undefined
  const activeId =
    chosen === null
      ? ''
      : chosen && inWorkspace.some((c) => c.id === chosen)
        ? chosen
        : (inWorkspace[0]?.id ?? '')

  const active = inWorkspace.find((c) => c.id === activeId) ?? null

  const select = useCallback(
    (id: string) => {
      ref.current.active = { ...ref.current.active, [workspaceId]: id }
      setActiveByWorkspace(ref.current.active)
    },
    [workspaceId],
  )

  /** 지금 쓰고 있는 대화 id — 렌더 사이에도 정확해야 하므로 ref에서 푼다 */
  const currentId = useCallback(() => {
    const a = ref.current.active
    const mine = ref.current.items.filter((c) => c.workspaceId === workspaceId)
    const pick = workspaceId in a ? a[workspaceId] : undefined
    if (pick === null) return ''
    if (pick && mine.some((c) => c.id === pick)) return pick
    return mine[0]?.id ?? ''
  }, [workspaceId])

  const setMessages = useCallback(
    (update: (prev: ChatMessage[]) => ChatMessage[]) => {
      const id = currentId()
      if (id === '') {
        // 이 방의 새 대화 — 질문이 들어올 때 만든다. 빈 껍데기를 미리 쌓지 않는다
        seq.current += 1
        const newId = `conv-${workspaceId}-${seq.current}`
        const messages = update([])
        commit(
          (prev) => [{ id: newId, workspaceId, title: titleOf(messages), messages, at: Date.now() }, ...prev],
          [workspaceId, newId],
        )
        return
      }
      commit((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const messages = update(c.messages)
          return { ...c, messages, title: titleOf(messages) }
        }),
      )
    },
    [currentId, workspaceId, commit],
  )

  /** 새 대화 — 아직 아무 말도 안 한 대화가 있으면 그걸 쓴다 */
  const startNew = useCallback(() => {
    const empty = ref.current.items.find(
      (c) => c.workspaceId === workspaceId && c.messages.length === 0,
    )
    if (empty) {
      select(empty.id)
      return
    }
    ref.current.active = { ...ref.current.active, [workspaceId]: null }
    setActiveByWorkspace(ref.current.active)
  }, [select, workspaceId])

  const remove = useCallback((id: string) => commit((prev) => prev.filter((c) => c.id !== id)), [commit])

  /** 저장한 것을 되돌릴 방법 — 정책이 정해지기 전이라 반드시 있어야 한다 */
  const clearAll = useCallback(() => {
    ref.current.active = {}
    setActiveByWorkspace({})
    commit(() => [])
  }, [commit])

  const listed = useMemo(() => inWorkspace.filter((c) => c.title !== null), [inWorkspace])

  const store = useMemo(
    () => ({ messages: active?.messages ?? [], setMessages }),
    [active, setMessages],
  )

  return { items, listed, activeId, select, startNew, remove, clearAll, store, persisted }
}
